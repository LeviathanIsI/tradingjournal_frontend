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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteAnswers, setDeleteAnswers] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
  });

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: user.googleAuth ? null : deleteAnswers,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Clear local storage and log out
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to home
      window.location.href = "/";
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

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
        `${import.meta.env.VITE_API_URL}/api/auth/profile/update`,
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
        `${import.meta.env.VITE_API_URL}/api/auth/set-password`,
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
        `${import.meta.env.VITE_API_URL}/api/auth/settings`,
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
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-2 sm:gap-4 px-2 sm:px-6 min-w-max">
          <button
            onClick={() => setTab("general")}
            className={`px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap flex items-center justify-center ${
              tab === "general"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setTab("password")}
            className={`px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap flex items-center justify-center ${
              tab === "general"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setTab("account")}
            className={`px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap flex items-center justify-center ${
              tab === "general"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Account
          </button>
        </nav>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-sm">
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
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
                className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 
        dark:hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto"
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 
        dark:hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto"
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 
        dark:hover:bg-blue-500 disabled:opacity-50 w-full sm:w-auto"
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
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
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

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Warning: This action cannot be undone. This will permanently
                  delete your account and remove your access to the system.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 
    dark:hover:bg-red-500 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
                  <h3 className="text-base sm:text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                    Delete Account
                  </h3>

                  {!user.googleAuth ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Please verify your identity by answering your security
                        questions:
                      </p>
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {user.securityQuestions?.question1?.question}
                          </label>
                          <input
                            type="text"
                            value={deleteAnswers.answer1}
                            onChange={(e) =>
                              setDeleteAnswers((prev) => ({
                                ...prev,
                                answer1: e.target.value,
                              }))
                            }
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {user.securityQuestions?.question2?.question}
                          </label>
                          <input
                            type="text"
                            value={deleteAnswers.answer2}
                            onChange={(e) =>
                              setDeleteAnswers((prev) => ({
                                ...prev,
                                answer2: e.target.value,
                              }))
                            }
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {user.securityQuestions?.question3?.question}
                          </label>
                          <input
                            type="text"
                            value={deleteAnswers.answer3}
                            onChange={(e) =>
                              setDeleteAnswers((prev) => ({
                                ...prev,
                                answer3: e.target.value,
                              }))
                            }
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
        px-3 py-2 sm:py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
        focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      This action cannot be undone. Your account will be
                      permanently deleted.
                    </p>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteAnswers({
                          answer1: "",
                          answer2: "",
                          answer3: "",
                        });
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
    hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 
    hover:bg-red-700 rounded-md disabled:opacity-50"
                    >
                      {deleteLoading ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
