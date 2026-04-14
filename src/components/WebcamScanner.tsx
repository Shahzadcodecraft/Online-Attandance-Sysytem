import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { verifyFace, type VerifyResponse } from "@/services/api";
import { Camera, Scan, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

type ScanState = "idle" | "detecting" | "countdown" | "processing" | "success" | "error" | "cooldown";

const COUNTDOWN_SECONDS = 3;
const COOLDOWN_SECONDS = 10;

export default function WebcamScanner({ fullscreen = false }: { fullscreen?: boolean }) {
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { modelsLoaded, faceDetected, startDetection } = useFaceDetection(videoRef);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync webcam video element to face detection hook
  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef.current?.video) {
        videoRef.current = webcamRef.current.video;
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Start detection once models are loaded
  useEffect(() => {
    if (modelsLoaded) startDetection();
  }, [modelsLoaded, startDetection]);

  // Face detected → start countdown
  useEffect(() => {
    if (faceDetected && scanState === "idle") {
      setScanState("countdown");
      setCountdown(COUNTDOWN_SECONDS);
    } else if (!faceDetected && scanState === "countdown") {
      setScanState("idle");
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [faceDetected, scanState]);

  // Countdown timer
  useEffect(() => {
    if (scanState !== "countdown") return;

    if (countdown <= 0) {
      captureAndVerify();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [scanState, countdown]);

  // Cooldown timer
  useEffect(() => {
    if (scanState !== "cooldown") return;

    if (cooldown <= 0) {
      setScanState("idle");
      return;
    }

    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [scanState, cooldown]);

  const captureAndVerify = useCallback(async () => {
    setScanState("processing");

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setErrorMsg("Failed to capture image");
      setScanState("error");
      startCooldown();
      return;
    }

    // Remove data URI prefix to get pure base64
    const base64 = imageSrc.replace(/^data:image\/\w+;base64,/, "");

    try {
      const response = await verifyFace(base64);
      setResult(response);
      setScanState(response.matched ? "success" : "error");
      if (!response.matched) setErrorMsg(response.message);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed");
      setScanState("error");
    }

    startCooldown();
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    setTimeout(() => setScanState("cooldown"), 3000);
  };

  const getBorderColor = () => {
    switch (scanState) {
      case "countdown": return "border-warning";
      case "processing": return "border-accent";
      case "success": return "border-success";
      case "error": return "border-destructive";
      default: return faceDetected ? "border-primary" : "border-border";
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${fullscreen ? "h-full w-full relative" : ""}`}>
      {/* Camera viewport */}
      <div className={`relative overflow-hidden transition-colors duration-500 ${fullscreen ? "h-full w-full" : "rounded-2xl border-2 " + getBorderColor()}`}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: fullscreen ? 1920 : 640, height: fullscreen ? 1080 : 480, facingMode: "user" }}
          className={`block ${fullscreen ? "h-full w-full object-cover" : "w-full max-w-[640px]"}`}
        />

        {/* Scan overlay */}
        {scanState === "countdown" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="scan-line absolute inset-0" />
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary rounded-br-lg" />
          </div>
        )}

        {/* Processing overlay */}
        {scanState === "processing" && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge state={scanState} faceDetected={faceDetected} modelsLoaded={modelsLoaded} />
        </div>

        {/* Countdown display */}
        {scanState === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-background/80 backdrop-blur flex items-center justify-center border-2 border-primary glow-primary">
              <span className="text-4xl font-bold text-primary font-mono">{countdown}</span>
            </div>
          </div>
        )}

        {/* Result display - inside camera for fullscreen */}
        {fullscreen && (
          <ResultPanel scanState={scanState} result={result} errorMsg={errorMsg} cooldown={cooldown} fullscreen={fullscreen} />
        )}
      </div>

      {/* Result display - outside camera for non-fullscreen */}
      {!fullscreen && (
        <ResultPanel scanState={scanState} result={result} errorMsg={errorMsg} cooldown={cooldown} fullscreen={fullscreen} />
      )}
    </div>
  );
}

function StatusBadge({ state, faceDetected, modelsLoaded }: { state: ScanState; faceDetected: boolean; modelsLoaded: boolean }) {
  if (!modelsLoaded) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading models...
      </span>
    );
  }

  if (state === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
        <Scan className="w-3 h-3" /> Verifying...
      </span>
    );
  }

  if (state === "countdown") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/20 text-warning text-xs font-medium">
        <Clock className="w-3 h-3" /> Capturing...
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      faceDetected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
    }`}>
      <Camera className="w-3 h-3" />
      {faceDetected ? "Face Detected" : "No Face"}
    </span>
  );
}

function ResultPanel({ scanState, result, errorMsg, cooldown, fullscreen }: {
  scanState: ScanState;
  result: VerifyResponse | null;
  errorMsg: string;
  cooldown: number;
  fullscreen?: boolean;
}) {
  if (scanState === "success" && result) {
    return (
      <div className={`w-full max-w-md rounded-xl border border-success/30 bg-success/10 p-5 ${fullscreen ? "absolute bottom-24 left-1/2 -translate-x-1/2 z-40" : ""}`}>
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-6 h-6 text-success" />
          <h3 className="text-lg font-semibold text-success">Attendance Marked</h3>
        </div>
        <div className="space-y-1 text-sm text-foreground/80">
          <p><span className="text-muted-foreground">Name:</span> {result.userName}</p>
          <p><span className="text-muted-foreground">Action:</span> {result.action === "check-in" ? "Check In" : "Check Out"}</p>
          <p><span className="text-muted-foreground">Time:</span> {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    );
  }

  if (scanState === "error") {
    return (
      <div className={`w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-5 ${fullscreen ? "absolute bottom-24 left-1/2 -translate-x-1/2 z-40" : ""}`}>
        <div className="flex items-center gap-3">
          <XCircle className="w-6 h-6 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-destructive">Face Not Recognized</h3>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  if (scanState === "cooldown") {
    return (
      <div className={`w-full max-w-md rounded-xl border border-border bg-secondary p-4 text-center ${fullscreen ? "absolute bottom-24 left-1/2 -translate-x-1/2 z-40" : ""}`}>
        <p className="text-sm text-muted-foreground">
          Next scan in <span className="font-mono text-foreground font-semibold">{cooldown}s</span>
        </p>
      </div>
    );
  }

  if (fullscreen) return null;

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-sm text-muted-foreground">
        Position your face in the camera. Attendance will be marked automatically.
      </p>
    </div>
  );
}
