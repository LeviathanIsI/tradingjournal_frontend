import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  AlertCircle,
  CheckCircle,
  User,
  Lock,
  Settings,
  CreditCard,
} from "lucide-react";
import SubscriptionManagement from "./SubscriptionManagement";

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
  // Add state for deletion warning step
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    billingAcknowledged: false,
    signature: "",
  });

  const handleDeleteAccount = async () => {
    // If on first step (warning), move to verification step
    if (deleteStep === 1) {
      // Make sure we're validating the subscription acknowledgment if needed
      if (hasActiveSubscription && !deleteConfirmation.billingAcknowledged) {
        setError(
          "Please acknowledge the subscription notice before proceeding"
        );
        return;
      }

      if (!deleteConfirmation.signature) {
        setError("Please type your full name to confirm");
        return;
      }

      // If validation passes, proceed to step 2
      setDeleteStep(2);
      setError(null);
      return;
    }

    // Add validation for security questions if needed
    if (!user.googleAuth) {
      // Check if security question answers are filled
      if (
        !deleteAnswers.answer1 ||
        !deleteAnswers.answer2 ||
        !deleteAnswers.answer3
      ) {
        setError("Please answer all security questions");
        return;
      }
    }

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
            billingAcknowledged: deleteConfirmation.billingAcknowledged,
            signature: deleteConfirmation.signature,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // On successful deletion
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Account deletion error:", error);
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

      // Update user state properly and force re-render
      updateUser((prevUser) => ({
        ...prevUser,
        googleAuth: false, // Now user has a password
      }));

      // Also update local storage immediately
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
              startingCapital: Number(accountForm.startingCapital),
              defaultCurrency: accountForm.defaultCurrency,
              timeZone: accountForm.timeZone,
              experienceLevel: accountForm.experienceLevel,
              // Keep any existing preferences from the user object
              ...(user.preferences?.darkMode !== undefined
                ? { darkMode: user.preferences.darkMode }
                : {}),
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }

      const data = await response.json();

      // Update local user state first
      const updatedUser = {
        ...user,
        preferences: data.data,
      };

      // Update user state in context if updateUser is available
      if (updateUser) {
        updateUser(updatedUser);
      }

      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(updatedUser);
      }

      setSuccess("Account settings updated successfully");
    } catch (error) {
      console.error("Settings update error:", error);
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

  // Reset delete confirmation state when dialog is closed
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteStep(1);
    setDeleteAnswers({
      answer1: "",
      answer2: "",
      answer3: "",
    });
    setDeleteConfirmation({
      billingAcknowledged: false,
      signature: "",
    });
  };

  // Get subscription details
  const hasActiveSubscription = user?.subscription?.status === "active";
  const subscriptionTier = user?.subscription?.tier || "Free";
  const nextBillingDate = user?.subscription?.nextBillingDate
    ? new Date(user.subscription.nextBillingDate).toLocaleDateString()
    : "N/A";

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "account", label: "Account", icon: Settings },
    { id: "subscription", label: "Subscription", icon: CreditCard },
  ];

  return (
    <div className="bg-white/90 dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden backdrop-blur-sm">
      <div className="border-b border-gray-200 dark:border-gray-700/60 overflow-x-auto">
        <nav className="flex gap-2 sm:gap-4 px-2 sm:px-6 min-w-max">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center justify-center transition-colors ${
                  tab === item.id
                    ? "border-primary text-primary dark:text-primary-light"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600/70 hover:text-gray-800 dark:hover:text-gray-100"
                }`}
              >
                <Icon
                  className={`h-4 w-4 mr-2 ${
                    tab === item.id
                      ? "text-primary dark:text-primary-light"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-5 sm:p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-700/30 text-red-700 dark:text-red-300 round-sm border border-red-100 dark:border-red-600/50 flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-700/30 text-green-700 dark:text-green-300 round-sm border border-green-100 dark:border-green-600/50 flex items-center gap-2 text-sm">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {tab === "general" && (
          <form onSubmit={handleGeneralSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={generalForm.email}
                onChange={(e) =>
                  setGeneralForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              >
                <option value="">Select a style</option>
                <option value="Day Trader">Day Trader</option>
                <option value="Swing Trader">Swing Trader</option>
                <option value="Position Trader">Position Trader</option>
                <option value="Scalper">Scalper</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={generalForm.bio}
                onChange={(e) =>
                  setGeneralForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={4}
                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium round-sm
                shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition
                dark:hover:bg-primary/80 disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {user.googleAuth ? (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 round-sm text-sm text-blue-800 dark:text-blue-300">
                  You signed up using Google. Set a password below to enable
                  regular login.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                    px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                    px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium round-sm
                    shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition
                    dark:hover:bg-primary/80 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {loading ? "Setting..." : "Set Password"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                    px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                    px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                    px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium round-sm
                    shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition
                    dark:hover:bg-primary/80 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {tab === "account" && (
          <form onSubmit={handleAccountSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Starting Capital
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  name="startingCapital"
                  step="0.01"
                  min="0"
                  value={accountForm.startingCapital}
                  onChange={handleAccountChange}
                  placeholder="Enter your starting capital"
                  className="block w-full pl-8 round-sm border border-gray-300 dark:border-gray-600/70 
                  px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Currency
              </label>
              <select
                name="defaultCurrency"
                value={accountForm.defaultCurrency}
                onChange={handleAccountChange}
                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Zone
              </label>
              <select
                name="timeZone"
                value={accountForm.timeZone}
                onChange={handleAccountChange}
                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              >
                {timeZones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={accountForm.experienceLevel}
                onChange={handleAccountChange}
                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              >
                <option value="auto">Auto-calculate from trades</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {accountForm.experienceLevel === "auto"
                  ? "Experience level will be calculated automatically based on your last 90 days of trading performance (requires at least 10 trades)"
                  : "Manually set experience level will override automatic calculation"}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/40">
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 flex items-center">
                  <div className="h-5 w-1 bg-red-500 rounded-full mr-2"></div>
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Warning: This action cannot be undone. This will permanently
                  delete your account and remove your access to the system.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-500 
                  hover:bg-red-600 round-sm shadow dark:bg-red-500/90 dark:hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800/90 rounded-sm w-full max-w-md p-6 shadow-xl border border-gray-200 dark:border-gray-700/60">
                  {deleteStep === 1 ? (
                    <>
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                        Delete Account
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        This action cannot be undone. Your account will be
                        permanently deleted.
                      </p>

                      {/* Data deletion warning */}
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-700/50 round-sm">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                          Data Deletion
                        </p>
                        <ul className="text-xs text-red-700 dark:text-red-300 space-y-1.5 list-disc pl-4">
                          <li>
                            All your personal data will be permanently deleted
                          </li>
                          <li>
                            Your trade history and reviews will no longer be
                            accessible
                          </li>
                          <li>Your network connections will be removed</li>
                          <li>
                            Your profile will be removed from the community
                          </li>
                          <li>
                            If you have an active subscription, you won't
                            receive a partial refund for any unused time
                          </li>
                          <li>
                            It would be best to cancel your subscription and
                            continue using the app until your subscription
                            expires
                          </li>
                        </ul>

                        <p className="text-xs text-red-700 dark:text-red-300 mt-3 pt-2 border-t border-red-100 dark:border-red-600/30">
                          You can manage your subscription from the{" "}
                          <button
                            type="button"
                            className="text-red-600 dark:text-red-400 underline font-medium"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setTab("subscription");
                            }}
                          >
                            Subscription tab
                          </button>{" "}
                          in your settings.
                        </p>
                      </div>

                      {/* Username confirmation */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                          Enter your username to confirm deletion
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                          {user.username}
                        </p>
                        <input
                          type="text"
                          value={deleteConfirmation.signature}
                          onChange={(e) => {
                            const currentValue = deleteConfirmation.signature;
                            const nextChar = user.username[currentValue.length];
                            const typedChar =
                              e.target.value[e.target.value.length - 1];

                            // Only accept input if it matches the next character in username
                            if (
                              e.target.value.length > currentValue.length &&
                              typedChar === nextChar
                            ) {
                              setDeleteConfirmation((prev) => ({
                                ...prev,
                                signature: prev.signature + nextChar,
                              }));
                            }
                          }}
                          onPaste={(e) => e.preventDefault()}
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          placeholder="Type your username"
                          className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                          px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-red-400/50 focus:border-red-600/60"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Type your username exactly as shown above. Copy and
                          paste is disabled.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={cancelDelete}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                          hover:bg-gray-100 dark:hover:bg-gray-700 round-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-500/90
                          hover:bg-red-600 dark:hover:bg-red-600/90 round-sm shadow transition-colors"
                        >
                          Continue
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                        Confirm Account Deletion
                      </h3>

                      {!user.googleAuth ? (
                        <>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Please verify your identity by answering your
                            security questions:
                          </p>
                          <div className="space-y-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                                focus:ring-2 focus:ring-red-400/50 focus:border-red-600/60"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                                focus:ring-2 focus:ring-red-400/50 focus:border-red-600/60"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                className="block w-full round-sm border border-gray-300 dark:border-gray-600/70 
                                px-3 py-2 bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100
                                focus:ring-2 focus:ring-red-400/50 focus:border-red-600/60"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                          Please confirm that you want to permanently delete
                          your account. This action cannot be undone.
                        </p>
                      )}

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={cancelDelete}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                          hover:bg-gray-100 dark:hover:bg-gray-700 round-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-500/90
                          hover:bg-red-600 dark:hover:bg-red-600/90 round-sm shadow transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading ? "Deleting..." : "Delete Account"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium round-sm
                shadow focus:outline-none focus:ring-2 focus:ring-primary/50 transition
                dark:hover:bg-primary/80 disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
        {tab === "subscription" && <SubscriptionManagement />}
      </div>
    </div>
  );
};

export default ProfileSettings;
