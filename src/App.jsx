// src/App.jsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
  useRef,
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
// import { StudyGroupProvider } from "./context/StudyGroupContext";
import Navbar from "./components/Navbar";

// Eagerly loaded components (critical UI)
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import Pricing from "./pages/Pricing.jsx";
import { PrivacyPolicy, TermsOfService } from "./pages/PrivacyPolicy.jsx";
import LoggingIn from "./components/Dashboard/LoggingIn";

const AuthLoader = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading your account...</div>
      </div>
    );
  }

  return children;
};

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
// const StudyGroups = React.lazy(() =>
//   import("./components/StudyGroup/StudyGroups")
// );
// const CreateStudyGroup = React.lazy(() =>
//   import("./components/StudyGroup/CreateStudyGroup")
// );
// const StudyGroupDetail = React.lazy(() =>
//   import("./components/StudyGroup/StudyGroupDetail")
// );

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
  const accessCheckAttempted = useRef(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Skip if we've already attempted this check and user is null/undefined
      if (accessCheckAttempted.current && !user) {
        setAccessLoading(false);
        return;
      }

      accessCheckAttempted.current = true;

      if (!user) {
        setAccessLoading(false);
        return;
      }

      try {
        setAccessLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setHasSpecialAccess(false);
          setAccessLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me/special-access`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHasSpecialAccess(data.hasSpecialAccess);
        } else {
          setHasSpecialAccess(false);
        }
      } catch (error) {
        console.error("Error checking special access:", error);
        setHasSpecialAccess(false);
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
  const { user, subscription } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasSpecialAccess = user.specialAccess?.hasAccess;
  const hasActiveSubscription = subscription?.active;

  if (hasSpecialAccess || allowFree || hasActiveSubscription) {
    return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
  }

  return <Navigate to="/pricing" state={{ from: location }} replace />;
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname === "/logging-in") {
    return children;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
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

      {/* Study Group Routes */}
      {/* <Route
        path="/study-groups"
        element={
          <SubscriptionRoute>
            <StudyGroups />
          </SubscriptionRoute>
        }
      /> */}
      {/* <Route
        path="/study-groups/create"
        element={
          <SubscriptionRoute>
            <CreateStudyGroup />
          </SubscriptionRoute>
        }
      /> */}
      {/* <Route
        path="/study-groups/:id"
        element={
          <SubscriptionRoute>
            <StudyGroupDetail />
          </SubscriptionRoute>
        }
      /> */}
    </Routes>
  );
}

// Memoized App to prevent unnecessary re-renders of the entire application
const App = React.memo(() => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <AIProvider>
              {/* <StudyGroupProvider> */}
              <div className="min-h-screen min-w-[320px] bg-white dark:bg-gray-800/70 text-gray-900 dark:text-gray-100">
                <Navbar />
                <div className="pt-16">
                  <AuthLoader>
                    <AppRoutes />
                  </AuthLoader>
                </div>
              </div>
            </AIProvider>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
});

export default App;
