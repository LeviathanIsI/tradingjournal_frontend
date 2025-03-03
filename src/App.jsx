import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AIProvider } from "./context/AIContext"; // Import AIProvider
import { ToastProvider } from "./context/ToastContext";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard";
import TradePlanning from "./pages/TradePlanning";
import Community from "./pages/Community";
import Traders from "./components/Traders";
import ForgotPassword from "./pages/ForgotPassword";
import WeeklyReview from "./components/WeeklyReview.jsx";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import Pricing from "./components/Pricing";
import Profile from "./components/Profile";
import AIInsights from "./pages/AIInsights";
import { PrivacyPolicy, TermsOfService } from "./pages/PrivacyPolicy.jsx";

const SubscriptionRoute = ({ children }) => {
  const { user, loading, subscription, isSubscriptionLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasSpecialAccess, setHasSpecialAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  // Check special access whenever user changes
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;

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
  }, [user]);

  // Show loading state while loading
  if (loading || isSubscriptionLoading || accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has special access, show protected content
  if (hasSpecialAccess) {
    return children;
  }

  // Check subscription
  if (!subscription?.active) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Update the PublicRoute component
const PublicRoute = ({ children }) => {
  const { user, subscription, loading, isSubscriptionLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isSubscriptionLoading && user) {
      if (subscription?.active && window.location.pathname !== "/dashboard") {
        navigate("/dashboard", { replace: true });
      } else if (
        !subscription?.active &&
        window.location.pathname !== `/profile/${user.username}`
      ) {
        navigate(`/profile/${user.username}`, { replace: true });
      }
    }
  }, [user, subscription, loading, isSubscriptionLoading, navigate]);

  return !user && !loading ? children : null;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
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
            <Navigate to={`/profile/${user?.username}`} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <SubscriptionRoute>
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      <Route path="/auth/google/callback" element={<GoogleAuthSuccess />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AIProvider>
              {" "}
              {/* Added AIProvider here */}
              <div className="min-h-screen min-w-[320px] bg-white dark:bg-gray-800/70 text-gray-900 dark:text-gray-100">
                <Navbar />
                <div className="pt-16">
                  <AppRoutes />
                </div>
              </div>
            </AIProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
export default App;
