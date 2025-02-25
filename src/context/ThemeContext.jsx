import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
};

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [themeMode, setThemeMode] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData?.preferences?.darkMode) {
          return THEME_MODES.DARK;
        }
      } catch (e) {}
    }
    return localStorage.getItem("theme-mode") || THEME_MODES.LIGHT;
  });

  // Sync theme with user preferences when they log in
  useEffect(() => {
    if (user?.preferences?.darkMode && themeMode === THEME_MODES.LIGHT) {
      setThemeMode(THEME_MODES.DARK);
      localStorage.setItem("theme-mode", THEME_MODES.DARK);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      themeMode === THEME_MODES.DARK
    );
  }, [themeMode]);

  const toggleTheme = async () => {
    const newTheme =
      themeMode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    setThemeMode(newTheme);
    localStorage.setItem("theme-mode", newTheme);
    document.documentElement.classList.toggle("dark");

    // Update user preferences if logged in
    if (user) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/settings`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              preferences: {
                ...user.preferences,
                darkMode: newTheme === THEME_MODES.DARK,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server response error:", errorData);
          throw new Error(errorData.error || "Failed to update theme");
        }
      } catch (error) {
        console.error("Error updating theme preference:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        toggleTheme,
        isDark: themeMode === THEME_MODES.DARK,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
