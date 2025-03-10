import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
const aiLimitsUpdateEvent = new EventTarget();

// Create context
const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Storage for persistent analysis data
  const analysisCache = useRef(new Map());

  // Function to check if an error message is related to credit limits
  const isCreditLimitError = (errorMsg) => {
    if (!errorMsg) return false;
    const lowerMsg = errorMsg.toLowerCase();
    return (
      lowerMsg.includes("credit") ||
      lowerMsg.includes("limit") ||
      lowerMsg.includes("quota") ||
      lowerMsg.includes("subscription") ||
      lowerMsg.includes("usage")
    );
  };

  // Helper function for making fetch requests with retry logic
  const fetchWithRetry = useCallback(async (url, options, maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, options);

        // If successful, return the response object (not parsed yet)
        if (response.ok) {
          return response;
        }

        // For 503 Service Unavailable, get retry information
        if (response.status === 503) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { retryAfter: (retries + 1) * 2 }; // Default to exponential backoff
          }

          const retryAfter = errorData.retryAfter || (retries + 1) * 2;

          // Wait for the suggested retry time
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );

          retries++;
          continue;
        }

        // For other errors, return the response to be handled by the caller
        return response;
      } catch (error) {
        // For network errors, retry with exponential backoff
        if (retries === maxRetries - 1) throw error;

        retries++;
        const backoffTime = Math.pow(2, retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }

    throw new Error(`Failed after ${maxRetries} retries`);
  }, []);

  // Function to format credit limit messages for better user experience
  const formatCreditLimitMessage = (error) => {
    if (!error) return "An unknown error occurred";

    const lowerMsg = error.toLowerCase();

    // Check for typical error messages related to credits
    if (
      lowerMsg.includes("credit limit reached") ||
      lowerMsg.includes("out of credits")
    ) {
      return "You've reached your daily AI credit limit. Credits will refresh next week on Monday.";
    }

    if (lowerMsg.includes("subscription") || lowerMsg.includes("plan")) {
      return "You've used all available AI credits. Please upgrade your plan for more.";
    }

    // If it's a credit error but doesn't match specific patterns, return a generic message
    if (isCreditLimitError(error)) {
      return "AI credit limit reached. Please check your plan or try again later.";
    }

    // Not a credit error, return original
    return error;
  };

  // Define updateAILimits function directly in this component
  const updateAILimits = useCallback(
    (aiLimits) => {
      if (!aiLimits) {
        console.warn(
          "⚠️ [updateAILimits] No AI limits provided, skipping update!"
        );
        return;
      }

      // Update user from AuthContext
      updateUser((prevUser) => ({
        ...prevUser,
        aiRequestLimits: aiLimits,
      }));

      // Dispatch an event to notify subscribers that AI limits have been updated
      aiLimitsUpdateEvent.dispatchEvent(
        new CustomEvent("ai-limits-updated", { detail: aiLimits })
      );
    },
    [updateUser]
  );

  // Make direct HTTP request (GET or POST) to AI endpoints
  const makeDirectRequest = useCallback(
    async (endpoint, method = "POST", data = {}) => {
      try {
        setIsProcessing(true);

        const token = localStorage.getItem("token");
        let response;

        const options = {
          method: method.toUpperCase(),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        if (method.toUpperCase() !== "GET") {
          options.body = JSON.stringify(data);
        }

        // Use fetchWithRetry to handle retries for 503 errors
        response = await fetchWithRetry(
          `${import.meta.env.VITE_API_URL}/api/ai/${endpoint}`,
          options
        );

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            // If we can't parse JSON, use the text
            const errorText = await response.text();
            errorData = { error: errorText };
          }

          // Check if this error is related to credit limits
          if (errorData.error && isCreditLimitError(errorData.error)) {
            const friendlyMessage = formatCreditLimitMessage(errorData.error);
            showToast(friendlyMessage, "error");

            return {
              success: false,
              error: friendlyMessage,
              isCreditsError: true,
            };
          }

          throw new Error(`Server error: ${JSON.stringify(errorData)}`);
        }

        const responseData = await response.json();

        // Check for credit errors in successful responses
        if (
          !responseData.success &&
          responseData.error &&
          isCreditLimitError(responseData.error)
        ) {
          const friendlyMessage = formatCreditLimitMessage(responseData.error);
          showToast(friendlyMessage, "error");
          responseData.isCreditsError = true;
        }

        // Update AI limits if provided
        if (responseData.aiLimits) {
          // Use a microtask to update limits after current execution completes
          setTimeout(() => {
            updateAILimits(responseData.aiLimits);
          }, 0);
        }

        return responseData;
      } catch (error) {
        console.error(`AI direct request error (${endpoint}):`, error);

        // Check if the error message is related to credits
        if (error.message && isCreditLimitError(error.message)) {
          const friendlyMessage = formatCreditLimitMessage(error.message);
          showToast(friendlyMessage, "error");

          return {
            success: false,
            error: friendlyMessage,
            isCreditsError: true,
          };
        }

        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [updateAILimits, showToast, fetchWithRetry]
  );

  // Handle API requests for AI features in a centralized way
  const makeAIRequest = useCallback(
    async (endpoint, data, cacheKey = null, options = {}) => {
      try {
        setIsProcessing(true);

        // Check if we should use GET for this endpoint
        const getEndpoints = []; // Empty since we're now using POST
        const useGetMethod = getEndpoints.includes(endpoint);

        // Check for cached data first
        if (cacheKey) {
          const cachedData = analysisCache.current.get(cacheKey);
          if (cachedData) {
            return cachedData;
          }
        }

        // If it's a GET request endpoint, use makeDirectRequest
        if (useGetMethod) {
          return await makeDirectRequest(endpoint, "GET");
        }

        // Regular POST request using fetchWithRetry
        const token = localStorage.getItem("token");
        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        };

        // Use fetchWithRetry to handle retries for 503 errors
        const response = await fetchWithRetry(
          `${import.meta.env.VITE_API_URL}/api/ai/${endpoint}`,
          fetchOptions
        );

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            // If we can't parse JSON, use the text
            const errorText = await response.text();
            errorData = { error: errorText };
          }

          // Check if this is a credit limit error
          if (errorData.error && isCreditLimitError(errorData.error)) {
            const friendlyMessage = formatCreditLimitMessage(errorData.error);

            // Only show toast if not suppressed
            if (!options.suppressToast) {
              showToast(friendlyMessage, "error");
            }

            return {
              success: false,
              error: friendlyMessage,
              isCreditsError: true,
            };
          }

          throw new Error(`Server error: ${JSON.stringify(errorData)}`);
        }

        const responseData = await response.json();

        // Check for credit errors in successful responses
        if (
          !responseData.success &&
          responseData.error &&
          isCreditLimitError(responseData.error)
        ) {
          const friendlyMessage = formatCreditLimitMessage(responseData.error);

          // Only show toast if not suppressed
          if (!options.suppressToast) {
            showToast(friendlyMessage, "error");
          }

          responseData.isCreditsError = true;
        }

        // Store in cache if a cache key is provided and request was successful
        if (cacheKey && responseData.success) {
          analysisCache.current.set(cacheKey, responseData);

          // Persist to localStorage for session recovery
          try {
            localStorage.setItem(
              "ai-analysis-cache",
              JSON.stringify(Array.from(analysisCache.current.entries()))
            );
          } catch (e) {
            console.warn("Failed to save analysis to localStorage:", e);
          }
        }

        // Update AI limits separately from the main response
        if (responseData.aiLimits) {
          // Use a microtask to update limits after current execution completes
          // This prevents state update conflicts
          setTimeout(() => {
            updateAILimits(responseData.aiLimits);
          }, 0);
        }

        return responseData;
      } catch (error) {
        console.error(`AI request error (${endpoint}):`, error);

        // Check if the error message is related to credits
        if (error.message && isCreditLimitError(error.message)) {
          const friendlyMessage = formatCreditLimitMessage(error.message);

          // Only show toast if not suppressed
          if (!options.suppressToast) {
            showToast(friendlyMessage, "error");
          }

          return {
            success: false,
            error: friendlyMessage,
            isCreditsError: true,
          };
        }

        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [updateAILimits, makeDirectRequest, showToast, fetchWithRetry]
  );

  // Add fetchAILimits function
  const fetchAILimits = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("🚫 [fetchAILimits] No auth token found!");
        return null;
      }

      // Use fetchWithRetry for fetching AI limits
      const response = await fetchWithRetry(
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

      // Update AI limits
      updateAILimits(data.aiRequestLimits);

      return data.aiRequestLimits;
    } catch (error) {
      console.error("❌ [fetchAILimits] Error fetching AI limits:", error);
      return null;
    }
  }, [updateAILimits, fetchWithRetry]);

  // Check if we have cached analysis for the given key
  const getCachedAnalysis = useCallback((cacheKey) => {
    return analysisCache.current.get(cacheKey) || null;
  }, []);

  // Clear a specific analysis from cache
  const clearCachedAnalysis = useCallback((cacheKey) => {
    try {
      if (analysisCache.current.has(cacheKey)) {
        analysisCache.current.delete(cacheKey);

        // Update localStorage
        localStorage.setItem(
          "ai-analysis-cache",
          JSON.stringify(Array.from(analysisCache.current.entries()))
        );

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }, []);

  // Clear all caches with a certain prefix
  const clearCacheWithPrefix = useCallback((prefix) => {
    try {
      let keysToRemove = [];

      // Find all keys that match the prefix
      analysisCache.current.forEach((_, key) => {
        if (key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      });

      // Remove the matched keys
      keysToRemove.forEach((key) => {
        analysisCache.current.delete(key);
      });

      // Update localStorage
      localStorage.setItem(
        "ai-analysis-cache",
        JSON.stringify(Array.from(analysisCache.current.entries()))
      );

      return keysToRemove.length;
    } catch (error) {
      console.error("Error clearing cache with prefix:", error);
      return 0;
    }
  }, []);

  // Load cache from localStorage on initialization
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem("ai-analysis-cache");
      if (cachedData) {
        analysisCache.current = new Map(JSON.parse(cachedData));
      }
    } catch (e) {
      console.warn("Failed to load analysis cache:", e);
    }
  }, []);

  return (
    <AIContext.Provider
      value={{
        makeAIRequest,
        makeDirectRequest,
        isProcessing,
        getCachedAnalysis,
        clearCachedAnalysis,
        clearCacheWithPrefix,
        fetchAILimits,
        updateAILimits,
        aiLimitsUpdateEvent,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};

export default AIProvider;
