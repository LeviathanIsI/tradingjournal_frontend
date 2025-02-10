// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme-mode");
    return savedTheme || THEME_MODES.LIGHT;
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      themeMode === THEME_MODES.DARK
    );
  }, [themeMode]);

  const toggleTheme = () => {
    const newTheme =
      themeMode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    setThemeMode(newTheme);
    localStorage.setItem("theme-mode", newTheme);
    document.documentElement.classList.toggle("dark");
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
