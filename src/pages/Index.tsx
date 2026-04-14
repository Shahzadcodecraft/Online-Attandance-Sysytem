import { Link } from "react-router-dom";
import WebcamScanner from "@/components/WebcamScanner";
import { UserPlus, Shield, Activity } from "lucide-react";

export default function Index() {
  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden">
      {/* Fullscreen Camera */}
      <div className="absolute inset-0">
        <WebcamScanner fullscreen />
      </div>

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 backdrop-blur flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">FaceGuard</h1>
              <p className="text-xs text-white/70">AI Attendance System</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Activity className="w-3.5 h-3.5 text-green-400" />
            <span>System Active</span>
          </div>
        </div>
      </header>

      {/* Floating Register Button */}
      <Link
        to="/register"
        className="absolute bottom-8 right-8 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
      >
        <UserPlus className="w-5 h-5" />
        <span>Register User</span>
      </Link>
    </div>
  );
}
