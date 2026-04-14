import { Link } from "react-router-dom";
import RegisterForm from "@/components/RegisterForm";
import { ArrowLeft, Shield } from "lucide-react";

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight">Register User</h1>
              <p className="text-xs text-muted-foreground">Add new employee</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">FaceGuard</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <RegisterForm />
      </main>
    </div>
  );
}
