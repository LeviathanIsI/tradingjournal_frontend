import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("initializing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("No authentication token found");
      console.warn("⚠️ No token found, redirecting...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const apiUrl = `${
      import.meta.env.VITE_API_URL
    }/api/auth/google/success?token=${token}`;

    const handleGoogleSuccess = async () => {
      try {
        setStatus("verifying");

        const response = await fetch(apiUrl, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Authentication failed (${response.status})`);
        }

        const data = await response.json();

        if (data.success) {
          setStatus("success");

          // Pass false for both shouldRedirect and showWelcome
          // We'll show the welcome message after loading the complete profile
          await login(data.data, false, false);

          // IMPORTANT: Navigate to logging-in component
          navigate("/logging-in", {
            state: { from: "/dashboard", referrer: "login" },
            replace: true,
          });
        } else {
          throw new Error(data.error || "Authentication failed");
        }
      } catch (error) {
        console.error("❌ Error in Google success:", error);
        setStatus("error");
        setErrorMessage(error.message);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleGoogleSuccess();
  }, [searchParams, login, navigate]);

  const renderStatusContent = () => {
    switch (status) {
      case "initializing":
        return (
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 text-gray-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Initializing authentication process...
            </p>
          </div>
        );
      case "verifying":
        return (
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-gray-700 dark:text-gray-300">
              Verifying your Google account...
            </p>
            <div className="w-full mt-6">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-gray-700 dark:text-gray-300">
              Authentication successful!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Redirecting to your dashboard...
            </p>
            <div className="w-full mt-6">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-[progress_2s_linear]"></div>
              </div>
            </div>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-700 dark:text-gray-200 font-medium">
              Authentication failed
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errorMessage}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Redirecting to login page...
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 p-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(115,115,115,0.075)_1px,transparent_1px),linear-gradient(to_bottom,rgba(115,115,115,0.075)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none rounded-lg dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              {/* Google logo */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Google Sign In
              </h2>
            </div>

            <div className="py-6">{renderStatusContent()}</div>

            <div className="mt-6 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-700/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Authentication Token
                </span>
                <span
                  className={`text-sm font-medium rounded-full px-2.5 py-0.5 ${
                    searchParams.get("token")
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {searchParams.get("token") ? "Present" : "Missing"}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Return to login
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
