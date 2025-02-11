import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

const ProfileSettings = ({
  user,
  onUpdate,
  currentSettings,
  onSettingsSubmit,
}) => {
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { updateUser } = useAuth();

  const [generalForm, setGeneralForm] = useState({
    username: user.username || "",
    bio: user.bio || "",
    tradingStyle: user.tradingStyle || "Select a style",
    email: user.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [accountForm, setAccountForm] = useState({
    startingCapital: currentSettings?.preferences?.startingCapital || "",
    defaultCurrency: currentSettings?.preferences?.defaultCurrency || "USD",
    timeZone: currentSettings?.preferences?.timeZone || "UTC",
    experienceLevel: currentSettings?.preferences?.experienceLevel || "",
  });

  const timeZones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
  ];

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Ensure tradingStyle is selected
    if (!generalForm.tradingStyle || generalForm.tradingStyle.trim() === "") {
      setError("Please select a valid trading style.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/auth/profile/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(generalForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      updateUser(data.data);
      onUpdate && onUpdate(data.data);
      setSuccess("Profile updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/auth/set-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: user.googleAuth
              ? null
              : passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess(
        user.googleAuth
          ? "Password set successfully"
          : "Password updated successfully"
      );

      // ✅ Update user state properly and force re-render
      updateUser((prevUser) => ({
        ...prevUser,
        googleAuth: false, // Now user has a password
      }));

      // ✅ Also update local storage immediately
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, googleAuth: false })
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/auth/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            preferences: {
              ...user.preferences,
              startingCapital: Number(accountForm.startingCapital),
              defaultCurrency: accountForm.defaultCurrency,
              timeZone: accountForm.timeZone,
              experienceLevel: accountForm.experienceLevel,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const data = await response.json();

      updateUser({
        ...user,
        preferences: data.data,
      });

      setSuccess("Account settings updated successfully");
    } catch (error) {
      setError("Error saving settings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    if (name === "startingCapital" && value !== "") {
      const num = parseFloat(value);
      if (num >= 0) {
        setAccountForm((prev) => ({
          ...prev,
          [name]: num,
        }));
      }
    } else {
      setAccountForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 px-6">
          <button
            onClick={() => setTab("general")}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${
              tab === "general"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setTab("password")}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${
              tab === "password"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setTab("account")}
            className={`px-3 py-4 text-sm font-medium border-b-2 ${
              tab === "account"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Account
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md">
            {success}
          </div>
        )}

        {tab === "general" && (
          <form onSubmit={handleGeneralSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={generalForm.username}
                onChange={(e) =>
                  setGeneralForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={generalForm.email}
                onChange={(e) =>
                  setGeneralForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trading Style
              </label>
              <select
                value={generalForm.tradingStyle}
                onChange={(e) =>
                  setGeneralForm((prev) => ({
                    ...prev,
                    tradingStyle: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a style</option>
                <option value="Day Trader">Day Trader</option>
                <option value="Swing Trader">Swing Trader</option>
                <option value="Position Trader">Position Trader</option>
                <option value="Scalper">Scalper</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                value={generalForm.bio}
                onChange={(e) =>
                  setGeneralForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                  dark:hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {user.googleAuth ? (
              <>
                <p className="text-gray-600 dark:text-gray-400">
                  You signed up using Google. Set a password below to enable
                  regular login.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
              dark:hover:bg-blue-500 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Set Password"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
              dark:hover:bg-blue-500 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {tab === "account" && (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Starting Capital
              </label>
              <input
                type="number"
                name="startingCapital"
                step="0.01"
                min="0"
                value={accountForm.startingCapital}
                onChange={handleAccountChange}
                placeholder="Enter your starting capital"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Currency
              </label>
              <select
                name="defaultCurrency"
                value={accountForm.defaultCurrency}
                onChange={handleAccountChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Zone
              </label>
              <select
                name="timeZone"
                value={accountForm.timeZone}
                onChange={handleAccountChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {timeZones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={accountForm.experienceLevel}
                onChange={handleAccountChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                  focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="auto">Auto-calculate from trades</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {accountForm.experienceLevel === "auto"
                  ? "Experience level will be calculated automatically based on your last 90 days of trading performance (requires at least 10 trades)"
                  : "Manually set experience level will override automatic calculation"}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                  dark:hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
