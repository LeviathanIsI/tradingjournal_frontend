// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SecurityQuestions from "../components/SecurityQuestions";
import ResetPassword from "../components/ResetPassword";
import { ArrowLeft, Mail, Loader } from "lucide-react";

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

  // Function to show step progress
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center w-full max-w-xs">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex-1 relative">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${
                  stepNumber <= step
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {stepNumber}
              </div>
              <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                {stepNumber === 1
                  ? "Email"
                  : stepNumber === 2
                  ? "Verify"
                  : "Reset"}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`absolute top-3 left-1/2 w-full h-0.5 ${
                    stepNumber < step
                      ? "bg-primary"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-6 sm:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(115,115,115,0.075)_1px,transparent_1px),linear-gradient(to_bottom,rgba(115,115,115,0.075)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none rounded-lg dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]"></div>

          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Reset Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {step === 1
                  ? "Enter your email to begin the password reset process"
                  : step === 2
                  ? "Answer your security questions to verify your identity"
                  : "Create a new secure password for your account"}
              </p>
            </div>

            {renderStepIndicator()}

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <form
                onSubmit={handleEmailSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder-gray-400 dark:placeholder-gray-500 text-sm transition-colors"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-md shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center mt-4 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
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

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Need help?{" "}
          <a
            href="/contact"
            className="text-primary hover:text-primary/80 hover:underline"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
