import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Shield, Save, RefreshCw, Calendar, Clock } from "lucide-react";

const Settings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "The site is currently undergoing scheduled maintenance. Please check back shortly.",
    allowNewRegistrations: true,
    defaultUserSubscriptionDays: 7,
    enabledFeatures: {
      aiAssistant: true,
      communityFeatures: true,
      tradingAnalytics: true,
      studyGroups: false
    }
  });

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        
        const data = await response.json();
        setSettings(data.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
        
        // For development, use the default state values
        if (import.meta.env.DEV) {
          // Settings are already initialized in the state
          console.log("Using default settings in development mode");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("enabledFeatures.")) {
      const feature = name.split(".")[1];
      setSettings({
        ...settings,
        enabledFeatures: {
          ...settings.enabledFeatures,
          [feature]: checked
        }
      });
    } else {
      setSettings({
        ...settings,
        [name]: type === "checkbox" ? checked : value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      
      showToast("Settings saved successfully", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings: " + error.message, "error");
      
      // Mock success in development
      if (import.meta.env.DEV) {
        showToast("Settings saved successfully (DEV MODE)", "success");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        System Settings
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Site Availability Section */}
          <div className="bg-white dark:bg-gray-700/60 shadow-sm rounded-sm border border-gray-200 dark:border-gray-600/50 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Site Availability
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Enable Maintenance Mode
                </label>
              </div>
              
              {settings.maintenanceMode && (
                <div>
                  <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maintenance Message
                  </label>
                  <textarea
                    id="maintenanceMessage"
                    name="maintenanceMessage"
                    value={settings.maintenanceMessage}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 
                               bg-white dark:bg-gray-700/40 py-2 px-3 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowNewRegistrations"
                  name="allowNewRegistrations"
                  checked={settings.allowNewRegistrations}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowNewRegistrations" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Allow New User Registrations
                </label>
              </div>
            </div>
          </div>
          
          {/* New User Settings */}
          <div className="bg-white dark:bg-gray-700/60 shadow-sm rounded-sm border border-gray-200 dark:border-gray-600/50 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-500" />
              New User Settings
            </h3>
            
            <div>
              <label htmlFor="defaultUserSubscriptionDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Free Trial Period (Days)
              </label>
              <input
                type="number"
                id="defaultUserSubscriptionDays"
                name="defaultUserSubscriptionDays"
                min="0"
                max="90"
                value={settings.defaultUserSubscriptionDays}
                onChange={handleChange}
                className="mt-1 block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 
                           bg-white dark:bg-gray-700/40 py-2 px-3 text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set to 0 to disable free trial
              </p>
            </div>
          </div>
          
          {/* Feature Toggles */}
          <div className="bg-white dark:bg-gray-700/60 shadow-sm rounded-sm border border-gray-200 dark:border-gray-600/50 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-purple-500" />
              Feature Toggles
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabledFeatures.aiAssistant"
                  name="enabledFeatures.aiAssistant"
                  checked={settings.enabledFeatures.aiAssistant}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabledFeatures.aiAssistant" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  AI Assistant Features
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabledFeatures.communityFeatures"
                  name="enabledFeatures.communityFeatures"
                  checked={settings.enabledFeatures.communityFeatures}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabledFeatures.communityFeatures" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Community Features
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabledFeatures.tradingAnalytics"
                  name="enabledFeatures.tradingAnalytics"
                  checked={settings.enabledFeatures.tradingAnalytics}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabledFeatures.tradingAnalytics" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Trading Analytics
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabledFeatures.studyGroups"
                  name="enabledFeatures.studyGroups"
                  checked={settings.enabledFeatures.studyGroups}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabledFeatures.studyGroups" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Study Groups
                </label>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                         rounded-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;