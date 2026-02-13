import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ClientMeetings from "./client/ClientMeetings";
import Calendar from "./Calendar";

export default function MeetingsPage() {
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

  // Clients see ClientMeetings, others see Calendar
  if (user.role === "client") {
    return <ClientMeetings />;
  }

  return <Calendar />;
}
