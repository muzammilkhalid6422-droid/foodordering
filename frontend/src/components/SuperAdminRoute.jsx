import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SuperAdminRoute({ children }) {
  const { user } = useAuth();
  return user?.isSuperAdmin ? children : <Navigate to="/admin-dashboard" replace />;
}
