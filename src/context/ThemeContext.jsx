import React, { createContext, useContext, useState, useEffect } from "react";
// Remove the import of useAuth here to break the circular dependency

const ThemeContext = createContext(null);

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
};

export const ThemeProvider = ({ children }) => {
  // Instead of using useAuth, handle auth-related functionality more directly
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

  // Listen for user data changes to sync theme
  useEffect(() => {
    const checkUserPreference = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Get user data directly when needed
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch user data");
          return response.json();
        })
        .then((data) => {
          if (data.data?.preferences?.darkMode !== undefined) {
            const userPreferredTheme = data.data.preferences.darkMode
              ? THEME_MODES.DARK
              : THEME_MODES.LIGHT;
            if (userPreferredTheme !== themeMode) {
              setThemeMode(userPreferredTheme);
              localStorage.setItem("theme-mode", userPreferredTheme);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user theme preference:", error);
        });
    };

    // Check once on mount
    checkUserPreference();

    // We could also set up an interval or event listener if needed
  }, [themeMode]);

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
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // First get current user data
        const userResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        const currentPreferences = userData.data?.preferences || {};

        // Then update settings
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/settings`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              preferences: {
                ...currentPreferences,
                darkMode: newTheme === THEME_MODES.DARK,
              },
            }),
          }
        );

        if (!response.ok) {
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
