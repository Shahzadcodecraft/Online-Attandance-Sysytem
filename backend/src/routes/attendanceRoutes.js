import { Router } from "express";
import {
  IndexFacesCommand,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";
import { v4 as uuidv4 } from "uuid";
import { rekognitionClient } from "../config/awsClients.js";
import { env } from "../config/env.js";
import { markAttendance } from "../services/attendanceService.js";
import { uploadBase64ImageToS3 } from "../utils/image.js";
import { UserModel } from "../models/User.js";
import { FaceMapModel } from "../models/FaceMap.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { image, s3ObjectKey, s3Bucket, phoneNumber, machineCode } = req.body;
    const userId = machineCode || uuidv4();
    const bucket = s3Bucket || env.s3Bucket;

    let objectKey = s3ObjectKey;
    if (!objectKey && image) {
      objectKey = await uploadBase64ImageToS3(image, `registrations/${userId}`);
    }

    if (!objectKey) {
      return res.status(400).json({ message: "Provide either image (base64) or s3ObjectKey" });
    }

    const indexResponse = await rekognitionClient.send(
      new IndexFacesCommand({
        CollectionId: env.rekognitionCollectionId,
        Image: { S3Object: { Bucket: bucket, Name: objectKey } },
        ExternalImageId: userId,
        MaxFaces: 1,
        QualityFilter: "AUTO",
        DetectionAttributes: [],
      }),
    );

    const faceRecord = indexResponse.FaceRecords?.[0];
    const faceId = faceRecord?.Face?.FaceId;
    if (!faceId) {
      return res.status(422).json({ message: "No valid face detected in registration image" });
    }

    await UserModel.findOneAndUpdate(
      { userId },
      {
        userId,
        phoneNumber: phoneNumber || null,
        machineCode: machineCode || null,
        faceId,
        imageBucket: bucket,
        imageKey: objectKey,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await FaceMapModel.findOneAndUpdate(
      { faceId },
      { faceId, userId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.json({
      success: true,
      userId,
      message: `User ${userId} registered successfully`,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { image, s3ObjectKey, s3Bucket } = req.body;
    const bucket = s3Bucket || env.s3Bucket;

    let objectKey = s3ObjectKey;
    if (!objectKey && image) {
      objectKey = await uploadBase64ImageToS3(image, "verifications");
    }

    if (!objectKey) {
      return res.status(400).json({ message: "Provide either image (base64) or s3ObjectKey" });
    }

    const searchResult = await rekognitionClient.send(
      new SearchFacesByImageCommand({
        CollectionId: env.rekognitionCollectionId,
        Image: { S3Object: { Bucket: bucket, Name: objectKey } },
        FaceMatchThreshold: 90,
        MaxFaces: 1,
      }),
    );

    const topMatch = searchResult.FaceMatches?.[0];
    const matchedFaceId = topMatch?.Face?.FaceId;
    if (!matchedFaceId) {
      return res.status(404).json({
        matched: false,
        message: "Face not recognized",
      });
    }

    const faceMapRecord = await FaceMapModel.findOne({ faceId: matchedFaceId }).lean();
    const userId = faceMapRecord?.userId;
    if (!userId) {
      return res.status(404).json({
        matched: false,
        message: "Matched face has no linked user",
      });
    }

    const userRecord = await UserModel.findOne({ userId }).lean();
    if (!userRecord) {
      return res.status(404).json({
        matched: false,
        message: "User profile not found for recognized face",
      });
    }

    const attendanceResult = await markAttendance(userRecord.Item);

    return res.json({
      matched: true,
      userId: userRecord.userId,
      userName: userRecord.userId,
      action: attendanceResult.action,
      message: attendanceResult.message,
      attendance: attendanceResult.attendance,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
