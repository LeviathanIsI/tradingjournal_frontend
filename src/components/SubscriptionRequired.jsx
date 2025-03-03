import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SubscriptionRequired = ({ children }) => {
  const { user, isSubscriptionLoading } = useAuth();
  const location = useLocation();

  if (isSubscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-800/90">
        <div className="animate-pulse p-4 rounded-lg text-lg text-gray-700 dark:text-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  if (user?.specialAccess?.hasAccess) {
    if (
      !user.specialAccess.expiresAt ||
      new Date() < new Date(user.specialAccess.expiresAt)
    ) {
      return children;
    }
  }

  // Then check subscription
  if (!user?.subscription?.active) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return children;
};

export default SubscriptionRequired;
