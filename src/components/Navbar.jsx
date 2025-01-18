// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SettingsModal from "./SettingsModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSettingsSubmit = async (settingsData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startingCapital: settingsData.startingCapital,
          defaultCurrency: settingsData.defaultCurrency,
          timeZone: "UTC", // Keep the default timezone
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const data = await response.json();
      // Update the user context with new preferences
      const updatedUser = {
        ...user,
        preferences: data.data,
      };
      // You'll need to add an updateUser function to your AuthContext
      updateUser(updatedUser);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-white text-lg font-bold">
                TradingJournal
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/trade-planning"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm"
                >
                  Trade Planning
                </Link>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm flex items-center gap-2"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <div className="border-l border-gray-700 h-6 mx-2"></div>
                <span className="text-gray-300 px-3 py-2 text-sm">
                  Welcome, {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base"
                >
                  Dashboard
                </Link>
                <Link
                  to="/trade-planning"
                  className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base"
                >
                  Trade Planning
                </Link>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="block w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base flex items-center gap-2"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <span className="block text-gray-300 px-3 py-2 text-base">
                  Welcome, {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSubmit={handleSettingsSubmit}
        currentSettings={user?.preferences}
      />
    </nav>
  );
};

export default Navbar;
