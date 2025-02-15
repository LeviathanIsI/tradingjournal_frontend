import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
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
            rememberMe: formData.rememberMe,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.data, formData.rememberMe);
      navigate("/dashboard");
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
          Sign in to your account
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded relative mb-4">
            <span className="block text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1 text-black">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded-md text-sm sm:text-base"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-black">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded-md text-sm sm:text-base"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-black">Remember me for 5 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4">
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
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mt-6">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Create an account
          </button>
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
