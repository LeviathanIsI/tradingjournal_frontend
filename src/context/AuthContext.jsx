import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setIsSubscriptionLoading(false); // Not even trying to load subscription
      return;
    }
    validateAuth(token);
  }, []);

  const validateAuth = async (token) => {
    try {
      checkTokenExpiry();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/validate`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Invalid token");

      // Read the response ONCE
      const responseData = await response.json();

      // Extract data from the already-parsed response
      const { data } = responseData;

      // Set the user data
      setUser(data);
      setLoading(false); // Auth loading complete

      // Now load subscription (kept separate)
      await loadSubscription(token);
    } catch (error) {
      console.error("❌ Auth validation failed:", error);
      setLoading(false);
      setIsSubscriptionLoading(false);
      logout();
    }
  };

  // Debounce function to prevent too many API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
      return timeout;
    };
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
        // Make sure we don't overwrite specialAccess
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
        console.log("Token expired, logging out");
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

  const login = (userData) => {
    localStorage.setItem("token", userData.token);
    setUser(userData);
    loadSubscription(userData.token);
    navigate("/dashboard");
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
