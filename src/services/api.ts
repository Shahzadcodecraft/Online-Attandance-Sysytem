/**
 * API Service Layer
 * 
 * Configure BASE_URL to point to your Node.js/Express backend.
 * All AWS Rekognition calls happen server-side — never expose keys here.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface AttendanceRecord {
  userId: string;
  userName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
}

export interface VerifyResponse {
  matched: boolean;
  userId?: string;
  userName?: string;
  action?: "check-in" | "check-out";
  message: string;
  attendance?: AttendanceRecord;
}

export interface RegisterResponse {
  success: boolean;
  userId: string;
  message: string;
}

export interface ImagePayload {
  imageBase64?: string;
  s3ObjectKey?: string;
  s3Bucket?: string;
}

/**
 * Register a new user's face with the backend.
 * Backend stores the face in AWS Rekognition collection.
 */
export async function registerUser(
  imageBase64: string,
  phoneNumber?: string,
  machineCode?: string
): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: imageBase64,
      phoneNumber,
      machineCode,
      // Keep legacy keys for older backend contracts.
      phone: phoneNumber,
      employeeId: machineCode,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Registration failed");
  }

  return response.json();
}

export async function registerUserFromS3(
  s3ObjectKey: string,
  phoneNumber?: string,
  machineCode?: string,
  s3Bucket?: string
): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      s3ObjectKey,
      s3Bucket,
      phoneNumber,
      machineCode,
      phone: phoneNumber,
      employeeId: machineCode,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Registration failed");
  }

  return response.json();
}

/**
 * Verify a face and mark attendance.
 * Backend matches against AWS Rekognition, then handles check-in/check-out logic.
 */
export async function verifyFace(imageBase64: string): Promise<VerifyResponse> {
  const response = await fetch(`${BASE_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Verification failed");
  }

  return response.json();
}

export async function verifyFaceFromS3(
  s3ObjectKey: string,
  s3Bucket?: string
): Promise<VerifyResponse> {
  const response = await fetch(`${BASE_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ s3ObjectKey, s3Bucket }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Verification failed");
  }

  return response.json();
}
