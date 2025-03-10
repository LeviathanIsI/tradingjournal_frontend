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
import {
  fillMissingFields,
  validateUserProfile,
} from "../services/UserProfileService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
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

      // Apply default values for any missing fields
      const completeUserData = fillMissingFields(responseData.data);

      // Store user data
      setUser(completeUserData);
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

  // Enhanced updateUser function to ensure data integrity
  const updateUser = (userData) => {
    // Ensure we don't lose existing data by merging with current state
    setUser((prevUser) => {
      if (!prevUser) return userData;

      const updatedUser = {
        ...prevUser,
        ...userData,
      };

      // Handle nested objects like subscription
      if (userData.subscription) {
        updatedUser.subscription = {
          ...prevUser.subscription,
          ...userData.subscription,
        };
      }

      // Handle nested objects like specialAccess
      if (userData.specialAccess) {
        updatedUser.specialAccess = {
          ...prevUser.specialAccess,
          ...userData.specialAccess,
        };
      }

      // Handle nested objects like preferences
      if (userData.preferences) {
        updatedUser.preferences = {
          ...prevUser.preferences,
          ...userData.preferences,
        };
      }

      return updatedUser;
    });

    // If updating subscription data, also update subscription state
    if (userData.subscription) {
      setSubscription(userData.subscription);
    }
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
      updateUser({ subscription: data });
    } catch (error) {
      console.error("❌ Subscription fetch failed:", error);
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  // Enhanced checkSubscriptionStatus function
  const checkSubscriptionStatus = async () => {
    // Check if user is logged in first (token exists)
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

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
            console.error("❌ Delayed subscription check failed:", error);
            resolve(null); // Resolve with null instead of rejecting to prevent unhandled promise rejections
          } finally {
            pendingSubscriptionCheckRef.current = null;
          }
        }, delay);
      });

      pendingSubscriptionCheckRef.current = pendingPromise;
      return pendingPromise;
    }

    try {
      return await actualCheckSubscription();
    } catch (error) {
      console.error("❌ Subscription check failed:", error);
      return null; // Return null instead of rethrowing to prevent crashes
    }
  };

  const actualCheckSubscription = async () => {
    try {
      setIsSubscriptionLoading(true);
      lastSubscriptionCheckRef.current = Date.now();

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // First load subscription data
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/subscription`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch subscription");

      const { data } = await response.json();
      setSubscription(data);

      // Check if we also need to load special access data
      const { isValid, missingFields } = validateUserProfile(user);

      if (!isValid && missingFields.includes("specialAccess")) {
        // Load full profile if special access is missing
        const profileResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!profileResponse.ok)
          throw new Error("Failed to fetch complete profile");

        const profileData = await profileResponse.json();

        // Update with both new profile data and subscription
        const completeUser = {
          ...profileData.data,
          subscription: data,
        };

        updateUser(completeUser);
        return data;
      } else {
        // Just update subscription data
        updateUser({ subscription: data });
        return data;
      }
    } catch (error) {
      console.error("❌ Subscription status check failed:", error);
      throw error;
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  // Function to set user to free tier
  const setUserToFreeTier = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/set-free-tier`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to set free tier");

      // Refresh subscription status after setting free tier
      await checkSubscriptionStatus();

      return true;
    } catch (error) {
      console.error("❌ Error setting free tier:", error);
      return false;
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

  const login = async (userData, shouldRedirect = true, showWelcome = true) => {
    // Store token first
    localStorage.setItem("token", userData.token);

    // Apply default values for any missing fields
    const completeUserData = fillMissingFields(userData);

    // Store the complete user data
    setUser(completeUserData);

    // Set subscription data if available
    if (completeUserData.subscription) {
      setSubscription(completeUserData.subscription);
    }

    // Load special access data immediately
    try {
      const token = userData.token;
      const specialAccessResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/me/special-access`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (specialAccessResponse.ok) {
        const data = await specialAccessResponse.json();
        const specialAccess = {
          hasAccess: data.hasSpecialAccess,
          expiresAt: null,
          reason: data.reason || "other",
        };

        // Update user with special access data
        updateUser({ specialAccess });
      }
    } catch (error) {
      console.error("Error loading special access during login:", error);
      // Continue login flow even if special access fails
    }

    if (showWelcome) {
      try {
        // Get user's timezone from preferences or use UTC as fallback
        const timezone = completeUserData.preferences?.timeZone || "UTC";

        // Generate personalized welcome message
        const welcomeMessage = generateWelcomeMessage(
          completeUserData.username,
          timezone
        );

        // Show welcome toast that requires manual dismissal
        showToast(welcomeMessage, "welcome", false);
      } catch (error) {
        console.error("Error showing welcome message:", error);
        // Continue with login even if welcome message fails
      }
    }

    // For new users, set free tier and navigate directly to dashboard
    if (userData.isNewUser) {
      // Update immediately to prevent auto-navigation elsewhere
      const freeTierSet = await setUserToFreeTier();

      if (shouldRedirect) {
        // Navigate directly to dashboard/overview instead of pricing
        navigate("/dashboard/overview");
      }

      return completeUserData;
    }

    // Only for regular logins, not new users
    if (shouldRedirect && !userData.isNewUser) {
      navigate("/dashboard");
    }

    return completeUserData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSubscription(null);
    navigate("/login");
  };

  // Function to check if user has active subscription
  const hasActiveSubscription = () => {
    return (
      user?.subscription?.active ||
      (user?.specialAccess?.hasAccess &&
        (!user.specialAccess.expiresAt ||
          new Date() < new Date(user.specialAccess.expiresAt)))
    );
  };

  // Function to check if user has access to a feature
  const hasAccessToFeature = (featureName) => {
    // Special access users get access to everything
    if (
      user?.specialAccess?.hasAccess &&
      (!user.specialAccess.expiresAt ||
        new Date() < new Date(user.specialAccess.expiresAt))
    ) {
      return true;
    }

    // For premium-only features
    if (featureName === "premium") {
      return user?.subscription?.active;
    }

    // For specific features that might have different access levels in the future
    // (You can expand this as needed)

    // Default case - basic features available to everyone
    return true;
  };

  // Function to check if user is on free tier
  const isFreeTier = () => {
    return user?.subscription?.type === "free";
  };

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
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
        setUserToFreeTier,
        hasActiveSubscription,
        hasAccessToFeature,
        isFreeTier,
        isAuthenticated,
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
