import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ConfigRoutes } from "./components/routing/RoutesConfig";
import { publicRoutes, routeConfig } from "./constants/routeConfig";
import { Toaster } from "react-hot-toast";
import { getUser } from "./services/auth.service";
import LandingPage from "./pages/LandingPage";

function App() {
  const user = getUser();
  const userRole = user?.role?.toLowerCase() || null;
  const isAuthenticated = !!(user && user.role);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Landing page — public, no Layout */}
        <Route
          path="/landing"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <LandingPage />
          }
        />

        {/* Public auth routes - no Layout */}
        <Route
          path="/auth/*"
          element={<ConfigRoutes config={{ auth: publicRoutes.auth }} />}
        />

        {/* Protected routes - restricted to authenticated users */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <ConfigRoutes
                  config={routeConfig}
                  userRole={userRole}
                />
              </Layout>
            ) : (
              <Navigate to="/landing" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
