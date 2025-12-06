const { Worker } = require('bullmq');
const { bundle } = require('@remotion/bundler');
const { selectComposition, renderMedia } = require('@remotion/renderer');
const path = require('path');
require('dotenv').config()
const os = require('os');
const IORedis = require('ioredis');
const { Storage } = require('@google-cloud/storage');

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

const storage = new Storage();
const bucketName = process.env.GCP_BUCKET_NAME || 'onera-assets';

console.log('Worker starting...');
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)

const worker = new Worker('render-queue', async (job) => {
    console.log(`Processing job ${job.id}`);

    try {
        // 1. Bundle
        const entryPoint = path.join(__dirname, 'remotion/index.jsx');
        const bundleLocation = await bundle({
            entryPoint,
            webpackOverride: (config) => config,
        });

        // 2. CALCULATE DURATION
        const maxDurationSeconds = job.data.layers.reduce((max, layer) => Math.max(max, layer.end || 0), 0);
        const fps = 30;
        const durationInFrames = Math.max(fps, Math.ceil(maxDurationSeconds * fps));

        console.log(`Job Layers Count: ${job.data.layers.length}`);
        console.log(`Max End Time: ${maxDurationSeconds}s`);
        console.log(`Target Duration: ${durationInFrames} frames`);

        // 3. Select & Render
        const compositionId = 'MainSequence';
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps: {
                layers: job.data.layers,
                durationInFrames: durationInFrames 
            },
        });

        const outputLocation = path.join(os.tmpdir(), `${job.id}.mp4`);
        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps: {
                layers: job.data.layers,
                durationInFrames: durationInFrames
            },
            durationInFrames: durationInFrames, // Explicit Override
        });

        // 4. Upload
        const destination = `renders/${job.id}.mp4`;
        await storage.bucket(bucketName).upload(outputLocation, { destination });
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
        
        return { videoUrl: publicUrl };

    } catch (err) {
        console.error(`Job ${job.id} failed:`, err);
        throw err;
    }

}, {
    connection,
    concurrency: 1
});

console.log('Worker listening for jobs on "render-queue"');