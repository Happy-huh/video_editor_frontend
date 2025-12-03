const { Worker } = require('bullmq');
const { bundle } = require('@remotion/bundler');
const { selectComposition, renderMedia } = require('@remotion/renderer');
const path = require('path');
const os = require('os');
const IORedis = require('ioredis');
const { Storage } = require('@google-cloud/storage');

// Setup Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

// Setup GCS
const storage = new Storage();
const bucketName = process.env.GCP_BUCKET_NAME || 'onera-assets';

console.log('Worker starting...');

const worker = new Worker('render-queue', async (job) => {
    console.log(`Processing job ${job.id}`);

    try {
        // Step A: Bundle the Remotion project
        const entryPoint = path.join(__dirname, 'remotion/index.jsx');
        console.log(`Bundling ${entryPoint}...`);

        const bundleLocation = await bundle({
            entryPoint,
        });

        // Step B: Select the composition
        const compositionId = 'MainSequence';
        console.log(`Selecting composition ${compositionId}...`);

        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId,
            inputProps: {
                layers: job.data.layers
            },
        });

        // Step C: Render the video
        const outputLocation = path.join(os.tmpdir(), `${job.id}.mp4`);
        console.log(`Rendering to ${outputLocation}...`);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: 'h264',
            outputLocation,
            inputProps: {
                layers: job.data.layers
            },
        });

        console.log(`Render complete: ${outputLocation}`);

        // Step D: Real Upload
        const destination = `renders/${job.id}.mp4`;
        console.log(`Uploading to gs://${bucketName}/${destination}...`);

        await storage.bucket(bucketName).upload(outputLocation, {
            destination,
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
        console.log(`Upload complete: ${publicUrl}`);

        return {
            videoUrl: publicUrl
        };

    } catch (err) {
        console.error(`Job ${job.id} failed:`, err);
        throw err;
    }

}, {
    connection,
    concurrency: 1
});

worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} has failed with ${err.message}`);
});

console.log('Worker listening for jobs on "render-queue"');
