import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
};

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useAuth() || { user: null, updateUser: null };
  const [themeMode, setThemeMode] = useState(() => {
    // First check localStorage for theme preference
    const savedTheme = localStorage.getItem("theme-mode");
    if (savedTheme) {
      return savedTheme;
    }

    // Then check for user preferences if available
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData?.preferences?.darkMode) {
          return THEME_MODES.DARK;
        }
      } catch (e) {
        console.error("Error parsing stored user data:", e);
      }
    }

    // Finally, check for system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return THEME_MODES.DARK;
    }

    // Default to light mode
    return THEME_MODES.LIGHT;
  });

  // Sync theme with user preferences when they log in
  useEffect(() => {
    if (user?.preferences?.darkMode !== undefined) {
      const userPreferredTheme = user.preferences.darkMode
        ? THEME_MODES.DARK
        : THEME_MODES.LIGHT;
      if (userPreferredTheme !== themeMode) {
        setThemeMode(userPreferredTheme);
        localStorage.setItem("theme-mode", userPreferredTheme);
      }
    }
  }, [user, themeMode]);

  // Apply theme class to document
  useEffect(() => {
    if (themeMode === THEME_MODES.DARK) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  const toggleTheme = async () => {
    const newTheme =
      themeMode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;

    // Update state and localStorage
    setThemeMode(newTheme);
    localStorage.setItem("theme-mode", newTheme);

    // Update user preferences if logged in
    if (user && updateUser) {
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

        if (response.ok) {
          // Update local user state with new preference
          updateUser({
            preferences: {
              ...user.preferences,
              darkMode: newTheme === THEME_MODES.DARK,
            },
          });
        } else {
          const errorData = await response.json();
          console.error("Server response error:", errorData);
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
