// src/components/ResetPassword.jsx
import { useState } from "react";

const ResetPassword = ({ onSuccess, onError }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      onError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const resetToken = localStorage.getItem("resetToken");
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
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

      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-black">New Password</label>
          <input
            type="password"
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-black">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </form>
  );
};

export default ResetPassword;
