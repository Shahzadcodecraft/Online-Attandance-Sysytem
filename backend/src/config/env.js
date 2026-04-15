import "dotenv/config";

const requiredVars = [
  "AWS_REGION",
  "AWS_S3_BUCKET",
  "AWS_REKOGNITION_COLLECTION_ID",
  "MONGODB_URI",
];

function getMissingVars() {
  return requiredVars.filter((key) => !process.env[key]);
}

const missing = getMissingVars();
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  awsRegion: process.env.AWS_REGION,
  s3Bucket: process.env.AWS_S3_BUCKET,
  rekognitionCollectionId: process.env.AWS_REKOGNITION_COLLECTION_ID,
  mongoUri: process.env.MONGODB_URI,
};
