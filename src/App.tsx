import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider as GlobalDataProvider } from "@/contexts/DataContext";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import Deals from "./pages/Deals";
import Proposals from "./pages/Proposals";
import Contracts from "./pages/Contracts";
import Tasks from "./pages/Tasks";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import AddClient from "./pages/AddClient";
import CreateProposal from "./pages/CreateProposal";
import OnboardingCall from "./pages/OnboardingCall";
import SendDocuments from "./pages/SendDocuments";
import RequirementsTimeline from "./pages/RequirementsTimeline";
import Requirements from "./pages/Requirements";
import AdminApproval from "./pages/AdminApproval";
import TaskSubtask from "./pages/TaskSubtask";
import ClientReview from "./pages/ClientReview";
import TaskAssignment from "./pages/TaskAssignment";
import ApprovalsQueue from "./pages/ApprovalsQueue";
import Submissions from "./pages/Submissions";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import MagicLinkVerify from "./pages/MagicLinkVerify";
import SuperadminLogin from "./pages/superadmin/Login";
import SuperadminDashboard from "./pages/superadmin/Dashboard";
import SuperadminCreateAccount from "./pages/superadmin/CreateAccount";
import SuperadminUsers from "./pages/superadmin/Users";
import MeetingDetails from "./pages/MeetingDetails";

import ProjectPage from "./pages/ProjectPage";
import DocumentsPage from "./pages/DocumentsPage";
import MeetingsPage from "./pages/MeetingsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import FeedbackPage from "./pages/FeedbackPage";
import SupportPage from "./pages/SupportPage";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const queryClient = new QueryClient();
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const App = () => {
  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <GlobalDataProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify" element={<MagicLinkVerify />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route
                    path="/clients/:clientId"
                    element={<ClientDetails />}
                  />
                  <Route path="/clients/add" element={<AddClient />} />
                  <Route path="/projects" element={<ProjectPage />} />
                  <Route path="/meetings" element={<MeetingsPage />} />
                  <Route path="/meetings/:id" element={<MeetingDetails />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/submissions" element={<SubmissionsPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  {/* Other Routes */}
                  <Route path="/calendar" element={<MeetingsPage />} />{" "}
                  {/* Redirect/Alias */}
                  <Route path="/meetings" element={<MeetingsPage />} />
                  {/* Keep existing admin/specific routes */}
                  <Route path="/requirements" element={<Requirements />} />
                  <Route
                    path="/projects/requirements"
                    element={<RequirementsTimeline />}
                  />
                  <Route path="/submissions" element={<Submissions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/admin/approvals" element={<AdminApproval />} />
                  <Route
                    path="/superadmin/login"
                    element={<SuperadminLogin />}
                  />
                  <Route
                    path="/superadmin/dashboard"
                    element={<SuperadminDashboard />}
                  />
                  <Route
                    path="/superadmin/create-account"
                    element={<SuperadminCreateAccount />}
                  />
                  <Route
                    path="/superadmin/users"
                    element={<SuperadminUsers />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </GlobalDataProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ConvexProvider>
  );
};

export default App;
