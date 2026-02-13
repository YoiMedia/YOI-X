import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ClientDocuments from "./client/ClientDocuments";
import Documents from "./Documents";

export default function DocumentsPage() {
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

  // Clients see ClientDocuments, others see admin Documents
  if (user.role === "client") {
    return <ClientDocuments />;
  }

  return <Documents />;
}
