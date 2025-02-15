// src/components/ThemeSwitcher.jsx
import React from "react";
import { useTheme, THEME_MODES } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center">
      <button
        onClick={toggleTheme}
        className="p-2 sm:p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 
        active:bg-gray-600 transition-colors"
        aria-label={`Switch to ${
          themeMode === THEME_MODES.LIGHT ? "dark" : "light"
        } mode`}
      >
        {themeMode === THEME_MODES.LIGHT ? (
          <Moon className="w-5 h-5 sm:w-4 sm:h-4" />
        ) : (
          <Sun className="w-5 h-5 sm:w-4 sm:h-4" />
        )}
      </button>
    </div>
  );
};

export default ThemeSwitcher;
