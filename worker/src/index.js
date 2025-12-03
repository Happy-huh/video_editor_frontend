const path = require('path');
const { Worker } = require('bullmq');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { Storage } = require('@google-cloud/storage');

// CONFIGURATION
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const BUCKET_NAME = process.env.GCP_BUCKET_NAME;

// Initialize GCP Storage (Only if bucket is provided)
const storage = BUCKET_NAME ? new Storage() : null;

console.log("🎬 Worker starting...");

// 1. DEFINE THE PROCESSOR
// This function runs every time a new job arrives in the queue
const processJob = async (job) => {
  const { id, data } = job;
  console.log(`Processing Job ${id}...`);

  // Data extraction
  const { layers, canvasSettings, durationInFrames } = data;

  try {
    // A. BUNDLE
    // Locate the React entry point
    const entryPoint = path.join(__dirname, 'remotion', 'index.jsx');
    console.log(`Bundling: ${entryPoint}`);

    // Create a webpack bundle of the React code
    const bundled = await bundle({
      entryPoint,
      // You can optimize webpack config here if needed
      onProgress: (p) => console.log(`Bundling progress: ${p}%`),
    });

    // B. COMPOSITION SELECTION
    // Fetch the composition we defined in Root.jsx
    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'MainSequence',
      inputProps: {
        layers,
        canvasSettings
      },
    });

    // C. RENDER
    const outputLocation = `/tmp/${id}.mp4`;
    console.log(`Rendering ${durationInFrames} frames to ${outputLocation}...`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputLocation,
      inputProps: {
        layers,
        canvasSettings
      },
      // Override duration from the JSON payload
      durationInFrames: durationInFrames || 300,
      fps: 30, // Enforce 30fps
      onProgress: ({ progress }) => {
        // In a real app, update job progress in Redis here
        if (Math.round(progress * 100) % 10 === 0) {
            console.log(`Render Job ${id}: ${Math.round(progress * 100)}%`);
        }
      },
    });

    // D. UPLOAD (Optional: if GCP is configured)
    if (storage) {
        console.log(`Uploading to gs://${BUCKET_NAME}/renders/${id}.mp4`);
        await storage.bucket(BUCKET_NAME).upload(outputLocation, {
            destination: `renders/${id}.mp4`,
        });
        return { url: `https://storage.googleapis.com/${BUCKET_NAME}/renders/${id}.mp4` };
    } else {
        console.log(`⚠️ No GCP Bucket configured. File saved locally at ${outputLocation}`);
        return { path: outputLocation };
    }

  } catch (err) {
    console.error(`❌ Job ${id} Failed:`, err);
    throw err; // Signals BullMQ that the job failed
  }
};

// 2. START THE WORKER
const worker = new Worker('render-queue', processJob, {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  // Concurrency: How many videos to render at once?
  // 1 is safe for a small VPS. Increase if you have more RAM.
  concurrency: 1
});

worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed! Result:`, result);
});

worker.on('failed', (job, err) => {
  console.log(`❌ Job ${job.id} failed with ${err.message}`);
});
