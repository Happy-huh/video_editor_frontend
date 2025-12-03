const { Worker } = require('bullmq');
const { bundle } = require('@remotion/bundler');
const { selectComposition, renderMedia } = require('@remotion/renderer');
const path = require('path');
const os = require('os');
const IORedis = require('ioredis');

// Setup Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

console.log('Worker starting...');

const worker = new Worker('render-queue', async (job) => {
    console.log(`Processing job ${job.id}`);

    try {
        // Step A: Bundle the Remotion project
        // The entry point is the file that calls registerRoot
        const entryPoint = path.join(__dirname, 'remotion/index.jsx');
        console.log(`Bundling ${entryPoint}...`);

        const bundleLocation = await bundle({
            entryPoint,
            // Default webpack config is used
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

        // Step D: Mock Upload
        console.log(`Mock: Uploading ${outputLocation} to GCP...`);
        console.log(`Mock: Upload complete.`);

        return {
            videoUrl: `gs://mock-bucket/${job.id}.mp4`
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
