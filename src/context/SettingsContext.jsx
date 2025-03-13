import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    maintenanceMode: {
      enabled: false,
      message:
        "The site is currently undergoing scheduled maintenance. Please check back shortly.",
    },
    enabledFeatures: {
      aiAssistant: true,
      communityFeatures: true,
      tradingAnalytics: true,
      studyGroups: false,
    },
    isLoading: true,
  });

  // Function to check if a feature is enabled
  const isFeatureEnabled = (featureName) => {
    // Admins bypass feature flags
    if (
      user?.specialAccess?.hasAccess &&
      user?.specialAccess?.reason === "Admin"
    ) {
      return true;
    }
    return settings.enabledFeatures?.[featureName] || false;
  };

  // Fetch appropriate settings based on user role
  useEffect(() => {
    const isAdmin =
      user?.specialAccess?.hasAccess && user?.specialAccess?.reason === "Admin";

    const fetchSettings = async () => {
      try {
        setSettings((prev) => ({ ...prev, isLoading: true }));
        const token = localStorage.getItem("token");

        // Use different endpoints based on user role
        const endpoint = isAdmin
          ? `${import.meta.env.VITE_API_URL}/api/admin/settings`
          : `${import.meta.env.VITE_API_URL}/api/auth/public-settings`;

        console.log("[SettingsContext] Fetching settings from:", endpoint);

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        const data = await response.json();
        console.log("[SettingsContext] Fetched settings:", data);

        if (data.success && data.data) {
          // For regular users, merge with defaults for fields they don't receive
          if (!isAdmin) {
            setSettings((prev) => ({
              ...prev,
              maintenanceMode:
                data.data.maintenanceMode || prev.maintenanceMode,
              isLoading: false,
            }));
          } else {
            // For admins, use the complete data but ensure proper structure
            const newSettings = {
              ...data.data,
              // Ensure maintenanceMode is properly structured
              maintenanceMode: {
                enabled: data.data.maintenanceMode?.enabled || false,
                message:
                  data.data.maintenanceMode?.message ||
                  "The site is currently undergoing scheduled maintenance. Please check back shortly.",
              },
              // Ensure enabledFeatures is properly structured
              enabledFeatures: {
                aiAssistant:
                  data.data.enabledFeatures?.aiAssistant !== undefined
                    ? data.data.enabledFeatures.aiAssistant
                    : true,
                communityFeatures:
                  data.data.enabledFeatures?.communityFeatures !== undefined
                    ? data.data.enabledFeatures.communityFeatures
                    : true,
                tradingAnalytics:
                  data.data.enabledFeatures?.tradingAnalytics !== undefined
                    ? data.data.enabledFeatures.tradingAnalytics
                    : true,
                studyGroups:
                  data.data.enabledFeatures?.studyGroups !== undefined
                    ? data.data.enabledFeatures.studyGroups
                    : false,
              },
              isLoading: false,
            };
            setSettings(newSettings);
          }
        } else {
          // Use defaults if data structure is invalid
          setSettings((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("[SettingsContext] Error fetching settings:", error);
        setSettings((prev) => ({ ...prev, isLoading: false }));
      }
    };

    // Only fetch settings if user authentication state is resolved
    if (user !== undefined) {
      fetchSettings();
    }
  }, [user?.id, user?.specialAccess?.hasAccess, user?.specialAccess?.reason]);

  // Function to update settings (admin only)
  const updateSettings = async (newSettings) => {
    console.log("[SettingsContext] Updating settings:", newSettings);

    if (
      !user?.specialAccess?.hasAccess ||
      user?.specialAccess?.reason !== "Admin"
    ) {
      return { success: false, error: "Not authorized" };
    }

    try {
      const token = localStorage.getItem("token");

      // Ensure we're sending well-formed data
      const settingsToSend = {
        ...newSettings,
        // Ensure maintenanceMode is well-formed
        maintenanceMode: {
          enabled: newSettings.maintenanceMode?.enabled || false,
          message:
            newSettings.maintenanceMode?.message ||
            "The site is currently undergoing scheduled maintenance. Please check back shortly.",
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/settings`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settingsToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed with status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Update local settings immediately
        setSettings((prev) => ({
          ...prev,
          ...data.data,
          // Ensure maintenanceMode structure is preserved
          maintenanceMode: {
            enabled: data.data.maintenanceMode?.enabled || false,
            message:
              data.data.maintenanceMode?.message ||
              prev.maintenanceMode.message,
          },
        }));

        return { success: true };
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("[SettingsContext] Error in updateSettings:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    settings,
    isFeatureEnabled,
    updateSettings,
    isMaintenanceMode: settings.maintenanceMode?.enabled || false,
    maintenanceMessage: settings.maintenanceMode?.message,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
