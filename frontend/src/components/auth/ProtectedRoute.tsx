import { Navigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div
                className="card"
                style={{ textAlign: "center", padding: "50px" }}
            >
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
