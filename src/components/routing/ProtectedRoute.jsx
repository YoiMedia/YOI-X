import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ component: Component, allowedRoles, userRole }) => {
    // Not logged in → always land on the landing page
    if (!userRole) {
        return <Navigate to="/landing" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return <Component />;
};

export default ProtectedRoute;
