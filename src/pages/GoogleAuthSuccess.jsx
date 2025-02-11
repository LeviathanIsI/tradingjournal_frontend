import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

console.log("GoogleAuthSuccess component loaded");

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Initializing...");

  console.log("GoogleAuthSuccess rendered", {
    currentUrl: window.location.href,
    pathName: window.location.pathname,
    searchParams: Object.fromEntries(searchParams.entries()),
  });

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Token in URL:", token);

    if (!token) {
      setStatus("No token found");
      console.log("No token found, redirecting to login");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const handleGoogleSuccess = async () => {
      try {
        setStatus("Making request to server...");
        console.log("Making request to Google success endpoint");

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

        setStatus(`Server responded with status: ${response.status}`);
        console.log("Server response status:", response.status);

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.success) {
          setStatus("Logging in...");
          console.log("Calling login with data:", data.data);
          await login(data.data);
          navigate("/dashboard");
        } else {
          throw new Error(data.error || "Login failed");
        }
      } catch (error) {
        console.error("Error in Google success:", error);
        setStatus(`Error: ${error.message}`);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleGoogleSuccess();
  }, [searchParams, login, navigate]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Google Sign In</h2>
        <p className="mb-4">{status}</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <pre className="mt-4 text-sm text-gray-600">
          Current URL: {window.location.href}
        </pre>
        <pre className="mt-2 text-sm text-gray-600">
          Token: {searchParams.get("token") ? "Present" : "Missing"}
        </pre>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
