const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { Queue, Job } = require('bullmq');
const IORedis = require('ioredis');
const { Storage } = require('@google-cloud/storage');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

// Setup Queue
const renderQueue = new Queue('render-queue', { connection });

// Setup Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCP_BUCKET_NAME || 'real_merge_app'; // Default fallback or error
console.log("Cred path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

app.get('/', (req, res) => {
  res.send('Onera API is running');
});

app.post('/api/assets/sign', async (req, res) => {
    try {
        const { filename, contentType } = req.body;

        if (!filename || !contentType) {
            return res.status(400).json({ error: 'Missing filename or contentType' });
        }

        const file = storage.bucket(bucketName).file(filename);

        const [uploadUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType,
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

        res.json({ uploadUrl, publicUrl });
    } catch (error) {
        console.error('Error signing URL:', error);
        res.status(500).json({ error: 'Failed to sign URL' });
    }
});

app.post('/api/render', async (req, res) => {
    try {
        const { layers } = req.body;

        if (!Array.isArray(layers)) {
            return res.status(400).json({ error: 'Invalid payload: "layers" must be an array.' });
        }

        // Add job to queue
        const job = await renderQueue.add('render-job', { layers });

        console.log(`Job added: ${job.id}`);

        res.json({
            status: 'queued',
            jobId: job.id
        });

    } catch (error) {
        console.error('Error queuing job:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.fromId(renderQueue, id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();

        if (state === 'completed') {
            return res.json({
                status: 'completed',
                result: job.returnvalue
            });
        }

        if (state === 'failed') {
            return res.json({
                status: 'failed',
                error: job.failedReason
            });
        }

        return res.json({
            status: 'pending',
            progress: job.progress
        });

    } catch (error) {
        console.error(`Error fetching job ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
