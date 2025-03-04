import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateWelcomeMessage } from "../utils/welcomeMessages";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const lastSubscriptionCheckRef = useRef(0);
  const pendingSubscriptionCheckRef = useRef(null);
  const { showToast } = useToast();

  const validateAuth = async (token) => {
    if (!token) {
      console.warn("❌ No token found in localStorage!");
      setLoading(false);
      setIsSubscriptionLoading(false);
      return;
    }

    try {
      checkTokenExpiry();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/validate`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Invalid token");

      const responseData = await response.json();

      // Store user data
      setUser(responseData.data);
      setLoading(false);

      // Load subscription data
      await loadSubscription(token);
    } catch (error) {
      console.error("❌ Auth validation failed:", error);
      setLoading(false);
      setIsSubscriptionLoading(false);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      setIsSubscriptionLoading(false);
      return;
    }
    validateAuth(token);
  }, []);

  // Add updateUser function to allow updating user data
  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  const loadSubscription = async (token) => {
    try {
      setIsSubscriptionLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/subscription`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch subscription");

      const { data } = await response.json();
      setSubscription(data);

      // Update user with subscription data but preserve other fields
      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        return {
          ...prevUser,
          subscription: data,
        };
      });
    } catch (error) {
      console.error("❌ Subscription fetch failed:", error);
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  // Add the checkSubscriptionStatus function with rate limiting
  const checkSubscriptionStatus = async () => {
    // Check if we've called this too recently (at least 5 seconds between calls)
    const now = Date.now();
    const timeSinceLastCheck = now - lastSubscriptionCheckRef.current;

    if (timeSinceLastCheck < 5000) {
      // If we have a pending check, just use that one instead of creating a new one
      if (pendingSubscriptionCheckRef.current) {
        return pendingSubscriptionCheckRef.current;
      }

      // Create a new pending check that will execute after the throttle period
      const pendingPromise = new Promise((resolve, reject) => {
        const delay = 5000 - timeSinceLastCheck;
        setTimeout(async () => {
          try {
            const result = await actualCheckSubscription();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingSubscriptionCheckRef.current = null;
          }
        }, delay);
      });

      pendingSubscriptionCheckRef.current = pendingPromise;
      return pendingPromise;
    }

    return actualCheckSubscription();
  };

  const actualCheckSubscription = async () => {
    try {
      setIsSubscriptionLoading(true);
      lastSubscriptionCheckRef.current = Date.now();

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/subscription`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch subscription");

      const { data } = await response.json();
      setSubscription(data);

      // Update user with subscription data
      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        return { ...prevUser, subscription: data };
      });

      return data;
    } catch (error) {
      console.error("❌ Subscription status check failed:", error);
      throw error;
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  // Token expiry check
  const checkTokenExpiry = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = decoded.exp * 1000;

      if (Date.now() >= expirationTime) {
        logout();
      }
    } catch (error) {
      console.error("Error checking token expiry:", error);
      logout();
    }
  }, []);

  // Check token expiry regularly
  useEffect(() => {
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000);
    return () => clearInterval(interval);
  }, [checkTokenExpiry]);

  const login = async (userData, expireAt2AM = true) => {
    // Store token, optionally setting it to expire at 2 AM
    localStorage.setItem("token", userData.token);

    // Store the user data
    setUser(userData);

    // Display personalized welcome message
    try {
      // Get user's timezone from preferences or use UTC as fallback
      const timezone = userData.preferences?.timeZone || "UTC";

      // Generate personalized welcome message
      const welcomeMessage = generateWelcomeMessage(
        userData.username,
        timezone
      );

      // Show welcome toast that requires manual dismissal
      showToast(welcomeMessage, "welcome", false);
    } catch (error) {
      console.error("Error showing welcome message:", error);
      // Continue with login even if welcome message fails
    }

    // Navigate after state update
    setTimeout(() => {
      navigate("/dashboard");
    }, 100);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSubscription(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        subscription,
        isSubscriptionLoading,
        login,
        logout,
        updateUser,
        checkSubscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthProvider;
