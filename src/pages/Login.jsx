import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";
import { Mail, Lock, AlertTriangle, ArrowRight, Info } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`.replace(
          /([^:]\/)\/+/g,
          "$1"
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            dailyExpiration: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Login without auto-redirect or welcome message
      await login(data.data, false, false);

      navigate("/logging-in", {
        state: {
          from: "/dashboard",
          referrer: "login",
        },
        replace: true,
      });
    } catch (err) {
      console.error("❌ [Login] Request Failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/80 p-6 sm:p-8 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sign in to access your trading dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 round-sm flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="block w-full pl-10 round-sm border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 shadow-sm 
                focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full pl-10 round-sm border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 shadow-sm 
                focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-blue-50/80 dark:bg-blue-900/20 p-3 round-sm border border-blue-100 dark:border-blue-800/40 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Your session will automatically expire at 2AM for security
              purposes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 round-sm 
            disabled:opacity-50 shadow transition-colors text-sm font-medium flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700/40"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/90 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div>
          <GoogleButton
            onClick={() => {
              const googleAuthUrl = `${
                import.meta.env.VITE_API_URL
              }/api/auth/google`.replace(/([^:]\/)\/+/g, "$1");
              try {
                window.location.assign(googleAuthUrl);
              } catch (error) {
                console.error("Error redirecting:", error);
                window.location.href = googleAuthUrl;
              }
            }}
            variant="signin"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/40">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-primary hover:text-primary/80 dark:hover:text-primary/90 font-medium transition-colors"
          >
            Create an account
          </button>
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-primary hover:text-primary/80 dark:hover:text-primary/90 font-medium transition-colors"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
