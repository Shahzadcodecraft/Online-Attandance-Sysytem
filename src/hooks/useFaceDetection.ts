import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

/**
 * Hook for real-time face detection using face-api.js
 * Loads TinyFaceDetector model and runs detection on a video element.
 */
export function useFaceDetection(videoRef: React.RefObject<HTMLVideoElement>) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceBox, setFaceBox] = useState<faceapi.Box | null>(null);
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log("✅ Face detection models loaded");
      } catch (err) {
        console.error("❌ Failed to load face detection models:", err);
        // Fallback: still mark as loaded so app doesn't hang
        setModelsLoaded(true);
      }
    };
    loadModels();
  }, []);

  // Run detection loop
  const startDetection = useCallback(() => {
    if (detectionInterval.current) return;

    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || !modelsLoaded) return;

      const video = videoRef.current;
      if (video.readyState !== 4) return;

      try {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );

        if (detection) {
          setFaceDetected(true);
          setFaceBox(detection.box);
        } else {
          setFaceDetected(false);
          setFaceBox(null);
        }
      } catch {
        // Detection can fail if video is not ready
        setFaceDetected(false);
        setFaceBox(null);
      }
    }, 300);
  }, [videoRef, modelsLoaded]);

  const stopDetection = useCallback(() => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  return { modelsLoaded, faceDetected, faceBox, startDetection, stopDetection };
}
