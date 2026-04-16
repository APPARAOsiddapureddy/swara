const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Check if AWS credentials are configured
const hasAwsConfig = () =>
  Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_BUCKET_NAME
  );

let s3Client = null;

const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

/**
 * Upload a file to S3 (or local filesystem as dev fallback).
 * @param {Buffer} buffer - File data
 * @param {string} key - S3 key / relative file path
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadFile = async (buffer, key, contentType) => {
  if (hasAwsConfig()) {
    return uploadToS3(buffer, key, contentType);
  } else {
    return saveLocally(buffer, key);
  }
};

const uploadToS3 = async (buffer, key, contentType) => {
  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'ap-south-1';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await getS3Client().send(command);

  // Return the public S3 URL
  // If using CloudFlare R2 with custom domain, set AWS_PUBLIC_URL env var
  if (process.env.AWS_PUBLIC_URL) {
    return `${process.env.AWS_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const saveLocally = async (buffer, key) => {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const filePath = path.join(uploadsDir, key.replace(/\//g, '_'));

  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);

  // Return a local URL
  const fileName = key.replace(/\//g, '_');
  const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
  return `${baseUrl}/uploads/${fileName}`;
};

/**
 * Generate a pre-signed URL for a given S3 key (useful for private buckets).
 * Falls back to the plain URL if AWS is not configured.
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Seconds until the URL expires (default: 3600)
 * @returns {Promise<string>}
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  if (!hasAwsConfig()) {
    const fileName = key.replace(/\//g, '_');
    return `http://localhost:${process.env.PORT || 3000}/uploads/${fileName}`;
  }

  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
  const { GetObjectCommand } = require('@aws-sdk/client-s3');

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(getS3Client(), command, { expiresIn });
};

module.exports = { uploadFile, getPresignedUrl };
