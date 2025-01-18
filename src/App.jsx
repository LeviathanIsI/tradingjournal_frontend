// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import TradePlanning from "./pages/TradePlanning";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return children;
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
        path="/dashboard"
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
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="w-screen min-h-screen bg-white">
          <Navbar />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
