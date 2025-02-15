import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const ResetPassword = ({ onSuccess, onError }) => {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      onError?.("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const resetToken = localStorage.getItem("resetToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      showToast(
        "Password reset successful! Redirecting to login...",
        "success"
      );
      onSuccess?.();

      setTimeout(() => {
        localStorage.removeItem("resetToken");
        navigate("/login");
      }, 4000);
    } catch (err) {
      showToast(err.message, "error");
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
            px-3 py-2.5 sm:py-2 text-gray-900 dark:text-gray-100 
            bg-white dark:bg-gray-700
            shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
            px-3 py-2.5 sm:py-2 text-gray-900 dark:text-gray-100 
            bg-white dark:bg-gray-700
            shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 sm:py-2 px-4 rounded-md 
          hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
