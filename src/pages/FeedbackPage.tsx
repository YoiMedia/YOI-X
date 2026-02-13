import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ClientFeedback from "./client/ClientFeedback";
import { AppLayout } from "@/components/layout/AppLayout";

export default function FeedbackPage() {
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

  // Only clients have feedback page for now
  if (user.role === "client") {
    return <ClientFeedback />;
  }

  // For other roles, show placeholder or redirect
  return (
    <AppLayout title="Feedback">
      <div className="text-center py-12 text-muted-foreground">
        Feedback page for {user.role} coming soon
      </div>
    </AppLayout>
  );
}
