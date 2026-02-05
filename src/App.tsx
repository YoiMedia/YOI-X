import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Deals from "./pages/Deals";
import Proposals from "./pages/Proposals";
import Contracts from "./pages/Contracts";
import Tasks from "./pages/Tasks";
import ClientPortal from "./pages/ClientPortal";
import Calendar from "./pages/Calendar";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import AddClient from "./pages/AddClient";
import CreateProposal from "./pages/CreateProposal";
import OnboardingCall from "./pages/OnboardingCall";
import SendDocuments from "./pages/SendDocuments";
import RequirementsTimeline from "./pages/RequirementsTimeline";
import AdminApproval from "./pages/AdminApproval";
import TaskSubtask from "./pages/TaskSubtask";
import ClientReview from "./pages/ClientReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/add" element={<AddClient />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/proposals/create" element={<CreateProposal />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/send" element={<SendDocuments />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/manage" element={<TaskSubtask />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/calendar/onboarding" element={<OnboardingCall />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/portal/review" element={<ClientReview />} />
            <Route path="/projects/requirements" element={<RequirementsTimeline />} />
            <Route path="/admin/approvals" element={<AdminApproval />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
