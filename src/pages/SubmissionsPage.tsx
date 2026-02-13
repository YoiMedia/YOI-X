import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ClientSubmissions from "./client/ClientSubmissions";
import Submissions from "./Submissions";

export default function SubmissionsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  // Clients see ClientSubmissions (review), others see employee Submissions
  if (user.role === "client") {
    return <ClientSubmissions />;
  }

  return <Submissions />;
}
