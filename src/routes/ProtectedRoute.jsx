import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUser } from "../services/auth.service";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const user = getUser();
    const location = useLocation();

    if (!user) {
        // If the user is trying to access a superadmin-only route or something specific,
        // we might want to redirect them to the appropriate login.
        // For now, let's redirect to the generic login unless they are on a superadmin route.
        const isSuperadminPath = location.pathname.startsWith("/users") || location.pathname === "/auth/login-superadmin";

        if (isSuperadminPath) {
            return <Navigate to="/auth/login-superadmin" replace />;
        }
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
