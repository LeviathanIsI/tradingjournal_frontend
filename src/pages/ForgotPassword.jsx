// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SecurityQuestions from "../components/SecurityQuestions";
import ResetPassword from "../components/ResetPassword";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState(null);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/init`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to find account");
      }

      setSecurityData(data.data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 bg-white flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-black">
          Reset Password
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-4">
            <span className="block text-sm sm:text-base">{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm mb-1 text-black">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Checking..." : "Continue"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
            >
              Back to login
            </button>
          </form>
        )}

        {step === 2 && (
          <SecurityQuestions
            securityData={securityData}
            onSuccess={(resetToken) => {
              localStorage.setItem("resetToken", resetToken);
              setStep(3);
            }}
            onError={setError}
          />
        )}

        {step === 3 && (
          <ResetPassword
            onSuccess={() => {
              localStorage.removeItem("resetToken");
              navigate("/login");
            }}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
