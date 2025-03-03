import React from "react";
import { useTheme, THEME_MODES } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center">
      <button
        onClick={toggleTheme}
        className="p-2 sm:p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/80 
        active:bg-gray-600/80 transition-colors dark:text-gray-200 dark:hover:bg-gray-600/60"
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
