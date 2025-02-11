import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

  // Update last activity timestamp on any user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keypress", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keypress", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

  // Check for session timeout
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");
      const isRemembered = localStorage.getItem("rememberMe") === "true";
      const tokenExpiry = localStorage.getItem("tokenExpiry");

      if (!token || !tokenExpiry) return;

      const now = Date.now();
      const expiryTime = parseInt(tokenExpiry);
      const inactiveTime = now - lastActivity;

      // Check if token has expired
      if (now >= expiryTime) {
        logout();
        return;
      }

      // If not "Remember Me" and inactive for 2 hours (7200000 ms)
      if (!isRemembered && inactiveTime >= 7200000) {
        logout();
        return;
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity]);

  const updateUser = (userData) => {
    const updatedUser = {
      ...userData,
      googleAuth: !!userData.googleAuth,
      preferences: {
        ...(userData.preferences || {}),
      },
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const validateAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const { data } = await response.json();
      updateUser(data);
    } catch (error) {
      console.error("Auth validation error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (
      token &&
      storedUser &&
      tokenExpiry &&
      parseInt(tokenExpiry) > Date.now()
    ) {
      try {
        const parsedUser = JSON.parse(storedUser);
        updateUser(parsedUser);
        validateAuth();
      } catch (error) {
        console.error("Error parsing stored user:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (userData, rememberMe = false) => {
    const expiryTime = rememberMe
      ? Date.now() + 5 * 24 * 60 * 60 * 1000 // 5 days
      : Date.now() + 2 * 60 * 60 * 1000; // 2 hours

    localStorage.setItem("token", userData.token);
    localStorage.setItem("tokenExpiry", expiryTime.toString());
    localStorage.setItem("rememberMe", rememberMe.toString());
    localStorage.setItem("user", JSON.stringify(userData));

    const userDataToStore = {
      ...userData,
    };
    localStorage.setItem("user", JSON.stringify(userDataToStore));
    setUser(userDataToStore);
    setLastActivity(Date.now());

    const from = location.state?.from || "/dashboard";
    navigate(from);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("rememberMe");
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
