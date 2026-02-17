import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ConfigRoutes } from "./components/routing/RoutesConfig";
import { publicRoutes, routeConfig } from "./constants/routeConfig";
import { Toaster } from "react-hot-toast";
import { getUser } from "./services/auth.service";

function App() {
  const user = getUser();
  const userRole = user?.role?.toLowerCase() || null;

  // isAuthenticated is true if user exists and has a role
  const isAuthenticated = !!(user && user.role);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public routes - no Layout */}
        <Route
          path="/auth/*"
          element={<ConfigRoutes config={{ auth: publicRoutes.auth }} />}
        />

        {/* Protected routes - with Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <ConfigRoutes
                config={routeConfig}
                userRole={isAuthenticated ? userRole : null}
              />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
