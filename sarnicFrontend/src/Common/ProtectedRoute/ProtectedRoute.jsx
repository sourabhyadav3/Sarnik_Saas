import { Navigate } from "react-router-dom";
import {
  getDashboardPathByRole,
  getStoredUser,
} from "../../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role_name;

  if (
    allowedRoles &&
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to={getDashboardPathByRole(userRole)} replace />;
  }

  return children;
};

export default ProtectedRoute;
