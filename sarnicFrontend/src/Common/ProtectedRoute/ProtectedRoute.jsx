import { Navigate } from "react-router-dom";
import {
  getDashboardPathByRole,
  getStoredUser,
} from "../../utils/auth";
import { checkTrialStatus } from "../../utils/trial";
import { ROLES } from "../../utils/roles";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role_name;

  // Check trial status (only for non-superadmin users)
  if (userRole !== ROLES.SUPERADMIN) {
    const { expired } = checkTrialStatus();
    if (expired) {
      return <Navigate to="/subscription-required" replace />;
    }
  }

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
