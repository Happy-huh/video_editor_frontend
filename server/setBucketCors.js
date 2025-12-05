const { Storage } = require('@google-cloud/storage');
require("dotenv").config();

async function setCors() {
  const storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  const bucketName = process.env.GCP_BUCKET_NAME;

  const corsConfig = [
    {
      origin: ["http://localhost:5173"],
      method: ["GET", "PUT", "POST"],
      responseHeader: ["Content-Type", "x-goog-*"],
      maxAgeSeconds: 3600,
    },
  ];

  await storage.bucket(bucketName).setCorsConfiguration(corsConfig);

  console.log("CORS updated successfully!");
}

setCors().catch(console.error);
