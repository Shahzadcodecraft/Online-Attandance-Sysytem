import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { registerUser } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, UserPlus, CheckCircle2, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const webcamRef = useRef<Webcam>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [captured, setCaptured] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCaptured(imageSrc);
  };

  const handleRegister = async () => {
    if (!name.trim() || !captured) return;

    setStatus("loading");
    const base64 = captured.replace(/^data:image\/\w+;base64,/, "");

    try {
      const res = await registerUser(name.trim(), base64, phone.trim() || undefined, employeeId.trim() || undefined);
      setStatus("success");
      setMessage(res.message || `User "${name}" registered successfully!`);
      setName("");
      setPhone("");
      setEmployeeId("");
      setCaptured(null);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Registration failed");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm text-muted-foreground">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter employee name"
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone Number</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          type="tel"
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeId" className="text-sm text-muted-foreground">Employee ID</Label>
        <Input
          id="employeeId"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Enter organization-assigned ID"
          className="bg-secondary border-border"
        />
      </div>

      <div className="rounded-xl overflow-hidden border border-border">
        {captured ? (
          <div className="relative">
            <img src={captured} alt="Captured" className="w-full" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCaptured(null)}
              className="absolute top-3 right-3 bg-background/80 backdrop-blur"
            >
              Retake
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ width: 480, height: 360, facingMode: "user" }}
              className="w-full block"
            />
            <Button
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 gap-2"
            >
              <Camera className="w-4 h-4" /> Capture Photo
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={handleRegister}
        disabled={!name.trim() || !captured || status === "loading"}
        className="w-full gap-2"
        size="lg"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
        ) : (
          <><UserPlus className="w-4 h-4" /> Register User</>
        )}
      </Button>

      {status === "success" && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <p className="text-sm text-success">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{message}</p>
        </div>
      )}
    </div>
  );
}
