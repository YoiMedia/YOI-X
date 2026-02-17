import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

export const ConfigRoutes = ({ config, userRole = null }) => {
    return (
        <Routes>
            {Object.entries(config).map(([key, section]) => (
                <Route
                    key={key}
                    path={`${section.basePath}/*`}
                    element={
                        <Routes>
                            {section.routes.map((route, idx) => (
                                <Route
                                    key={idx}
                                    path={route.path}
                                    element={
                                        section.allowedRoles && userRole ? (
                                            <ProtectedRoute
                                                component={route.component}
                                                allowedRoles={section.allowedRoles}
                                                userRole={userRole}
                                            />
                                        ) : section.allowedRoles ? (
                                            // If allowedRoles exist but no userRole, redirect
                                            <ProtectedRoute
                                                component={route.component}
                                                allowedRoles={section.allowedRoles}
                                                userRole={userRole}
                                            />
                                        ) : (
                                            <route.component />
                                        )
                                    }
                                    index={route.path === ""}
                                />
                            ))}
                        </Routes>
                    }
                />
            ))}
        </Routes>
    );
};
