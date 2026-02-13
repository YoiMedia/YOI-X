import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MagicLinkVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { authWithToken } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [error, setError] = useState("");
  const hasStarted = useRef(false);

  useEffect(() => {
    async function verify() {
      if (hasStarted.current) return;
      hasStarted.current = true;

      if (!token) {
        setStatus("error");
        setError("No verification token found.");
        return;
      }

      try {
        await authWithToken(token);
        setStatus("success");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Failed to verify magic link.");
      }
    }

    verify();
  }, [token, authWithToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "verifying" && (
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 p-3 rounded-full animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-destructive/10 p-3 rounded-full">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "verifying" && "Verifying Security Link"}
            {status === "success" && "Access Granted!"}
            {status === "error" && "Invalid Link"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            {status === "verifying" &&
              "We're validating your secure access token. One moment..."}
            {status === "success" &&
              "Your identity has been verified. Redirecting to your dashboard..."}
            {status === "error" &&
              (error || "This link may have expired or already been used.")}
          </p>

          {status === "error" && (
            <Button className="w-full" onClick={() => navigate("/login")}>
              Return to Login
            </Button>
          )}

          {status === "success" && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
              <span>Redirecting</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
