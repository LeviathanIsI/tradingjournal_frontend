import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const token = searchParams.get("token"); // 🔹 Ensure we're fetching the correct token
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
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Google Sign-In</h2>
        <p className="mb-4">{status}</p>
        <pre className="mt-4 text-sm text-gray-600">
          Token: {searchParams.get("token") ? "✅ Present" : "❌ Missing"}
        </pre>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
