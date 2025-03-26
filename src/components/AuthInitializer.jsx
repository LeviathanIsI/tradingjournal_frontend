// src/components/AuthInitializer.jsx
import { useEffect } from "react";
import useAuthStore from "../infrastructure/state/authStore";

const AuthInitializer = () => {
  const { validateAuth, checkTokenExpiry, isInitializing } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    console.log("AuthInitializer: Starting auth validation");

    // Immediately validate auth when component mounts
    validateAuth();

    // Immediately check token expiry
    checkTokenExpiry();

    // Set up token expiry check interval
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => {
      console.log("AuthInitializer: Cleaning up");
      clearInterval(interval);
    };
  }, [validateAuth, checkTokenExpiry]); // Add dependencies to prevent stale closures

  // Add a way to see the current initialization state in dev tools
  useEffect(() => {
    console.log(
      `AuthInitializer: Auth initialization state: ${
        isInitializing ? "initializing" : "completed"
      }`
    );
  }, [isInitializing]);

  // This is a pure logic component, doesn't render anything
  return null;
};

export default AuthInitializer;
