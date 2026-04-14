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

/**
 * Register a new user's face with the backend.
 * Backend stores the face in AWS Rekognition collection.
 */
export async function registerUser(
  name: string,
  imageBase64: string,
  phone?: string,
  employeeId?: string
): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, image: imageBase64, phone, employeeId }),
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
