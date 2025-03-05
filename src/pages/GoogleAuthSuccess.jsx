import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("❌ No token found, redirecting to login...");
      console.warn("⚠️ No token found, redirecting...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const apiUrl = `${
      import.meta.env.VITE_API_URL
    }/api/auth/google/success?token=${token}`;

    const handleGoogleSuccess = async () => {
      try {
        setStatus("🔄 Verifying token...");

        const response = await fetch(apiUrl, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setStatus("✅ Logging in...");

          // Pass false for both shouldRedirect and showWelcome
          // We'll show the welcome message after loading the complete profile
          await login(data.data, false, false);

          // IMPORTANT: Navigate to logging-in component
          navigate("/logging-in", {
            state: { from: "/dashboard", referrer: "login" },
            replace: true,
          });
        } else {
          throw new Error(data.error || "Login failed");
        }
      } catch (error) {
        console.error("❌ Error in Google success:", error);
        setStatus(`❌ Error: ${error.message}`);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleGoogleSuccess();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 flex items-center justify-center bg-white dark:bg-gray-700/60">
      <div className="text-center w-full max-w-sm mx-auto border border-gray-200 dark:border-gray-600/50 p-6 rounded-sm shadow-sm bg-white dark:bg-gray-700/60">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
          Google Sign-In
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          {status}
        </p>
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-600/30 rounded-sm border border-gray-200 dark:border-gray-600/50">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Token: {searchParams.get("token") ? "✅ Present" : "❌ Missing"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
