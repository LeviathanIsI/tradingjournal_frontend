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
    console.log("✅ Token in URL:", token);

    if (!token) {
      setStatus("❌ No token found, redirecting to login...");
      console.log("❌ No token found, redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const handleGoogleSuccess = async () => {
      try {
        setStatus("🔄 Verifying token...");
        console.log("🔄 Verifying token with backend...");

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/auth/google/success?token=${token}`,
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Token verification successful:", data);

        if (data.success) {
          setStatus("✅ Logging in...");
          await login(data.data);
          navigate("/dashboard");
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
    <div className="min-h-screen pt-16 px-4 sm:px-6 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center w-full max-w-sm mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
          Google Sign-In
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          {status}
        </p>
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Token: {searchParams.get("token") ? "✅ Present" : "❌ Missing"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
