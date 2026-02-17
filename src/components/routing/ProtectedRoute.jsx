import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ component: Component, allowedRoles, userRole }) => {
    const location = useLocation();

    if (!userRole) {
        // Determine where to redirect based on path
        const isSuperadminPath = location.pathname.startsWith("/users") || location.pathname.includes("superadmin");
        return <Navigate to={isSuperadminPath ? "/auth/login-superadmin" : "/auth/login"} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return <Component />;
};

export default ProtectedRoute;
