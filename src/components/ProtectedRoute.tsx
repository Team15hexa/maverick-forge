import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "fresher";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "fresher") {
        navigate("/fresher-dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [navigate, requiredRole]);

  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;