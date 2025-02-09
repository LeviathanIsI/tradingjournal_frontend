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
        "http://localhost:5000/api/auth/forgot-password/init",
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
    <div className="w-screen h-[calc(100vh-64px)] bg-white flex items-center justify-center">
      <div className="w-96">
        <h2 className="text-2xl font-semibold mb-6 text-black">
          Reset Password
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block">{error}</span>
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
                className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Continue"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to login
            </button>
          </form>
        )}

        {step === 2 && (
          <SecurityQuestions
            securityData={securityData}
            onSuccess={(resetToken) => {
              // Store token and move to reset password step
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
