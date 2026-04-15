import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import { s3Client } from "../config/awsClients.js";

export function base64ToBuffer(base64Image) {
  return Buffer.from(base64Image, "base64");
}

export async function uploadBase64ImageToS3(base64Image, prefix = "uploads") {
  const key = `${prefix}/${Date.now()}-${uuidv4()}.jpg`;
  const body = base64ToBuffer(base64Image);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
    }),
  );

  return key;
}

export function resolveImageSource(imageBase64, s3ObjectKey, s3Bucket) {
  if (s3ObjectKey) {
    return {
      S3Object: {
        Bucket: s3Bucket || env.s3Bucket,
        Name: s3ObjectKey,
      },
      uploadedKey: null,
    };
  }

  if (!imageBase64) {
    throw new Error("Provide either image (base64) or s3ObjectKey");
  }

  return { S3Object: null, uploadedKey: null };
}
