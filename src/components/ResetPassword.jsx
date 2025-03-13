import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { Lock } from "lucide-react";

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
      <div className="bg-white/90 dark:bg-gray-800/80 p-5 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-md backdrop-blur-sm">
        <div className="mb-5 flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-5">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600/70 
              px-3 py-2 text-gray-900 dark:text-gray-100 
              bg-white dark:bg-gray-700/40
              focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600/70 
              px-3 py-2 text-gray-900 dark:text-gray-100 
              bg-white dark:bg-gray-700/40
              focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-md 
            shadow hover:shadow-md dark:hover:bg-primary/80 disabled:opacity-50 
            font-medium transition-all"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
