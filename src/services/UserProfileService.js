/**
 * UserProfileService.js
 *
 * A dedicated service for handling user profile loading and validation
 * Uses the existing validate endpoint to ensure all required fields are present
 */

// List of essential fields that must be present in the user profile
const REQUIRED_USER_FIELDS = [
  "username",
  "email",
  "subscription",
  "specialAccess",
  "preferences",
  "aiRequestLimits",
];

// List of subscription fields that must be present
const REQUIRED_SUBSCRIPTION_FIELDS = ["active", "type", "cancelAtPeriodEnd"];

/**
 * Validates that the user profile contains all required fields
 * @param {Object} user - The user object to validate
 * @returns {Object} - Validation result with status and missing fields
 */
export const validateUserProfile = (user) => {
  if (!user) {
    return { isValid: false, missingFields: ["user"] };
  }

  const missingFields = [];

  // Check top-level required fields
  REQUIRED_USER_FIELDS.forEach((field) => {
    if (user[field] === undefined) {
      missingFields.push(field);
    }
  });

  // Check subscription fields if subscription exists
  if (user.subscription) {
    REQUIRED_SUBSCRIPTION_FIELDS.forEach((field) => {
      if (user.subscription[field] === undefined) {
        missingFields.push(`subscription.${field}`);
      }
    });
  }

  // Validate special access if it exists
  if (user.specialAccess === undefined) {
    missingFields.push("specialAccess");
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Loads the complete user profile from the API
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Complete user profile
 */
export const loadCompleteUserProfile = async (token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    // We'll use the existing validate endpoint which now returns complete user data
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/validate`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load user profile: ${response.status}`);
    }

    const data = await response.json();

    // Validate the profile data
    const validation = validateUserProfile(data.data);

    if (!validation.isValid) {
      console.warn("Incomplete user profile:", validation.missingFields);

      // Try to fill in missing fields with default values
      const completeProfile = fillMissingFields(data.data);
      return completeProfile;
    }

    return data.data;
  } catch (error) {
    console.error("Error loading user profile:", error);
    throw error;
  }
};

/**
 * Fills missing fields in the user profile with default values
 * @param {Object} user - The user object with potential missing fields
 * @returns {Object} - User object with missing fields filled with defaults
 */
export const fillMissingFields = (user) => {
  if (!user) return null;

  const completeProfile = { ...user };

  // Ensure subscription is present
  if (!completeProfile.subscription) {
    completeProfile.subscription = {
      active: false,
      type: null,
      cancelAtPeriodEnd: false,
      paymentStatus: "active",
      failedPaymentAttempts: 0,
    };
  }

  // Ensure specialAccess is present
  if (!completeProfile.specialAccess) {
    completeProfile.specialAccess = {
      hasAccess: false,
      expiresAt: null,
      reason: "other",
    };
  }

  // Ensure preferences is present
  if (!completeProfile.preferences) {
    completeProfile.preferences = {
      defaultCurrency: "USD",
      timeZone: "UTC",
      startingCapital: 0,
      experienceLevel: "auto",
      darkMode: false,
    };
  }

  // Ensure AI request limits is present
  if (!completeProfile.aiRequestLimits) {
    completeProfile.aiRequestLimits = {
      weeklyLimit: 5,
      remainingRequests: 5,
      totalRequestsUsed: 0,
    };
  }

  return completeProfile;
};

/**
 * Determines if a user has premium access
 * @param {Object} user - User object
 * @returns {boolean} - Whether the user has premium access
 */
export const hasUserPremiumAccess = (user) => {
  if (!user) return false;

  // Check subscription status
  const hasActiveSubscription = user.subscription && user.subscription.active;

  // Check special access
  const hasSpecialAccess =
    user.specialAccess &&
    user.specialAccess.hasAccess &&
    (!user.specialAccess.expiresAt ||
      new Date() < new Date(user.specialAccess.expiresAt));

  return hasActiveSubscription || hasSpecialAccess;
};

export default {
  validateUserProfile,
  loadCompleteUserProfile,
  fillMissingFields,
  hasUserPremiumAccess,
};
