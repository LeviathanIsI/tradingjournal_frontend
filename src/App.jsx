// src/App.jsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AIProvider } from "./context/AIContext";
import { ToastProvider } from "./context/ToastContext";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TradingStatsProvider } from "./context/TradingStatsContext";
import { StudyGroupProvider } from "./context/StudyGroupContext";
import { NotificationProvider } from "./context/NotificationsContext";
import MUIThemeProvider from "./components/MUIThemeProvider";
import { StyledEngineProvider } from "@mui/material/styles";
import Navbar from "./components/Navbar";

// Eagerly loaded components (critical UI)
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import Pricing from "./pages/Pricing.jsx";
import { PrivacyPolicy, TermsOfService } from "./pages/PrivacyPolicy.jsx";
import LoggingIn from "./components/Dashboard/LoggingIn";

// Lazy loaded components (code splitting)
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const TradePlanning = React.lazy(() => import("./pages/TradePlanning"));
const Community = React.lazy(() => import("./pages/Community"));
const Traders = React.lazy(() => import("./components/Community/Traders.jsx"));
const WeeklyReview = React.lazy(() =>
  import("./components/Dashboard/WeeklyReview")
);
const GoogleAuthSuccess = React.lazy(() => import("./pages/GoogleAuthSuccess"));
const Profile = React.lazy(() => import("./components/Community/Profile.jsx"));
const AIInsights = React.lazy(() => import("./pages/AIInsights"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const Admin = React.lazy(() => import("./pages/Admin"));

// Lazy loaded study group components - individual imports
const StudyGroups = React.lazy(() =>
  import("./components/StudyGroup/StudyGroups.jsx")
);
const CreateStudyGroup = React.lazy(() =>
  import("./components/StudyGroup/CreateStudyGroup.jsx")
);
const StudyGroupDetail = React.lazy(() =>
  import("./components/StudyGroup/StudyGroupDetail.jsx")
);

// Loading fallback for suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-lg">Loading...</div>
  </div>
);

// Custom hook for access control
const useAccessControl = () => {
  const { user, loading, subscription, isSubscriptionLoading } = useAuth();
  const [hasSpecialAccess, setHasSpecialAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setAccessLoading(false);
        return;
      }

      try {
        setAccessLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me/special-access`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHasSpecialAccess(data.hasSpecialAccess);
        }
      } catch (error) {
        console.error("Error checking special access:", error);
      } finally {
        setAccessLoading(false);
      }
    };

    checkAccess();
  }, [user?.id]); // Only recheck if user ID changes

  return {
    isAuthenticated: !!user,
    hasActiveSubscription: subscription?.active,
    hasSpecialAccess,
    isLoading: loading || isSubscriptionLoading || accessLoading,
    user,
  };
};

// Enhanced route protection components
const SubscriptionRoute = ({ children, allowFree = false }) => {
  const {
    isAuthenticated,
    hasActiveSubscription,
    hasSpecialAccess,
    isLoading,
  } = useAccessControl();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (hasSpecialAccess || allowFree || hasActiveSubscription) {
    return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
  }

  return <Navigate to="/pricing" state={{ from: location }} replace />;
};

// New Admin Route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAccessControl();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin access
  if (
    user?.specialAccess?.hasAccess &&
    user?.specialAccess?.reason === "Admin"
  ) {
    return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
  }

  return <Navigate to="/dashboard" state={{ from: location }} replace />;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAccessControl();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Skip redirect for logging-in path
  const isLoggingInPath = location.pathname === "/logging-in";

  if (isLoggingInPath) {
    return children;
  }

  return !user && !loading ? children : null;
};

function AppRoutes() {
  const { user } = useAuth();

  // Memoize the route to user's profile to prevent unnecessary recalculations
  const userProfilePath = useMemo(
    () => (user?.username ? `/profile/${user.username}` : "/profile"),
    [user?.username]
  );

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Authentication routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* IMPORTANT: LoggingIn route outside of any route guard wrapper */}
      <Route path="/logging-in" element={<LoggingIn />} />

      {/* Auth callback routes */}
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      <Route path="/auth/google/callback" element={<GoogleAuthSuccess />} />

      {/* Protected routes */}
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Navigate to={userProfilePath} replace />
          </ProtectedRoute>
        }
      />

      {/* Notifications page */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Subscription routes */}
      <Route
        path="/dashboard/*"
        element={
          <SubscriptionRoute allowFree={true}>
            <Dashboard />
          </SubscriptionRoute>
        }
      />
      <Route
        path="/trade-planning"
        element={
          <SubscriptionRoute>
            <TradePlanning />
          </SubscriptionRoute>
        }
      />
      <Route
        path="/community/*"
        element={
          <SubscriptionRoute>
            <Community />
          </SubscriptionRoute>
        }
      />
      <Route
        path="/traders"
        element={
          <SubscriptionRoute>
            <Traders />
          </SubscriptionRoute>
        }
      />

      {/* Study Group Routes - Still only accessible to admin users, but placed with community features */}
      <Route
        path="/study-groups/create"
        element={
          <AdminRoute>
            <CreateStudyGroup />
          </AdminRoute>
        }
      />
      <Route
        path="/study-groups"
        element={
          <AdminRoute>
            <StudyGroups />
          </AdminRoute>
        }
      />
      <Route
        path="/study-groups/:id"
        element={
          <AdminRoute>
            <StudyGroupDetail />
          </AdminRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

// Memoized App to prevent unnecessary re-renders of the entire application
const App = React.memo(() => {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <StyledEngineProvider injectFirst>
              <MUIThemeProvider>
                <AIProvider>
                  <TradingStatsProvider>
                    <StudyGroupProvider>
                      <NotificationProvider>
                        <div className="min-h-screen min-w-[320px] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                          <Navbar />
                          <div className="pt-16">
                            <AppRoutes />
                          </div>
                        </div>
                      </NotificationProvider>
                    </StudyGroupProvider>
                  </TradingStatsProvider>
                </AIProvider>
              </MUIThemeProvider>
            </StyledEngineProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
});

export default App;
