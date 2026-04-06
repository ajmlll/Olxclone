import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { token, user } = useAuth();

    if (!token) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.some((r) => user?.roles?.includes(r))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
