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
        className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {themeMode === THEME_MODES.LIGHT ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default ThemeSwitcher;
