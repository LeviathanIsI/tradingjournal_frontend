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
  const [forceRender, setForceRender] = useState(0);

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

      // Ensure AI limits exist before setting user
      const updatedUser = {
        ...responseData.data,
        aiRequestLimits: responseData.data.aiRequestLimits || {
          nextResetDate: null,
          remainingRequests: 0,
          totalRequestsUsed: 0,
          weeklyLimit: 0,
        },
      };

      setUser(updatedUser);
      setLoading(false);
      await loadSubscription(token);

      // Immediately fetch AI limits after validating authentication
      const aiLimits = await fetchAILimits(token);
      if (aiLimits) {
        updateAILimits(aiLimits);
      }
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

  // Updated updateAILimits function
  const updateAILimits = (aiLimits) => {
    if (!aiLimits) {
      console.warn(
        "⚠️ [updateAILimits] No AI limits provided, skipping update!"
      );
      return;
    }

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        aiRequestLimits: aiLimits,
      };
    });

    setForceRender((prev) => prev + 1);
  };

  // Add updateUser function to allow updating user data
  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
      aiRequestLimits: userData.aiRequestLimits ||
        prevUser?.aiRequestLimits || {
          nextResetDate: null,
          remainingRequests: 0,
          totalRequestsUsed: 0,
          weeklyLimit: 0,
        },
    }));
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

  const login = async (userData) => {
    localStorage.setItem("token", userData.token);

    const updatedUser = {
      ...userData,
      aiRequestLimits: userData.aiRequestLimits || {
        nextResetDate: null,
        remainingRequests: 0,
        totalRequestsUsed: 0,
        weeklyLimit: 0,
      },
    };

    setUser(updatedUser);

    // Fetch AI limits immediately after login
    try {
      const aiLimits = await fetchAILimits(userData.token);
      if (aiLimits) {
        updateAILimits(aiLimits);
      }
    } catch (error) {
      console.error("Error fetching AI limits after login:", error);
    }

    // Navigate after state update and API calls are complete
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

  // Updated fetchAILimits to accept token parameter
  const fetchAILimits = async (providedToken = null) => {
    try {
      const token = providedToken || localStorage.getItem("token");
      if (!token) {
        console.warn("🚫 [fetchAILimits] No auth token found!");
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/ai-limits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [fetchAILimits] API Request Failed:", errorText);
        throw new Error("API request failed!");
      }

      const { data } = await response.json();

      if (!data || !data.aiRequestLimits) {
        console.warn("⚠️ [fetchAILimits] API response missing AI limits data!");
        return null;
      }

      return data.aiRequestLimits;
    } catch (error) {
      console.error("❌ [fetchAILimits] Error fetching AI limits:", error);
      return null;
    }
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
        fetchAILimits,
        updateAILimits,
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
