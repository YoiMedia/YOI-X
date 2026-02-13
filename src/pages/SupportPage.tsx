import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ClientSupport from "./client/ClientSupport";
import { AppLayout } from "@/components/layout/AppLayout";

export default function SupportPage() {
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

  // Only clients have support page for now
  if (user.role === "client") {
    return <ClientSupport />;
  }

  // For other roles, show placeholder
  return (
    <AppLayout title="Support">
      <div className="text-center py-12 text-muted-foreground">
        Support page for {user.role} coming soon
      </div>
    </AppLayout>
  );
}
