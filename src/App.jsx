// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, location, navigate]);

  return !user ? children : null;
};

function AppRoutes() {
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
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trade-planning"
        element={
          <ProtectedRoute>
            <TradePlanning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community/*"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/traders"
        element={
          <ProtectedRoute>
            <Traders />
          </ProtectedRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      <Route path="/auth/google/callback" element={<GoogleAuthSuccess />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-screen min-w-[320px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Navbar />
              <div className="pt-16">
                <AppRoutes />
              </div>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
export default App;
