// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.svg";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, subscription } = useAuth() || {
    user: null,
    logout: null,
    subscription: null,
  };
  const [hasSpecialAccess, setHasSpecialAccess] = useState(false);

  // Check special access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me/special-access`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHasSpecialAccess(data.hasSpecialAccess);
        }
      } catch (error) {
        console.error("Error checking special access:", error);
      }
    };

    checkAccess();
  }, [user]);

  // Close menu if route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Combined access check - user has access if they have subscription OR special access
  const hasAccess = subscription?.active || hasSpecialAccess;

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      <nav className="bg-gray-700 dark:bg-gray-700 shadow-lg fixed top-0 w-full z-40">
        <div className="max-w-full px-3 sm:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex-shrink-0">
                <img src={logo} alt="Rivyl" className="h-8 sm:h-12 w-auto" />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center pr-8">
              {!user ? (
                <>
                  {/* Theme Switcher available for non-logged in users */}
                  <ThemeSwitcher />
                  <div className="border-l border-gray-700 h-6 mx-2"></div>
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
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Show subscription routes if user has subscription OR special access */}
                  {user && hasAccess && (
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
                      <Link
                        to="/community"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm"
                      >
                        Community
                      </Link>
                    </>
                  )}
                  <ThemeSwitcher />
                  <div className="border-l border-gray-700 h-6 mx-2"></div>
                  <span className="text-gray-300 px-3 py-2 text-sm">
                    Welcome, {user.username}
                  </span>
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-white"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-gray-800/90 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Content */}
          <div className="flex flex-col h-full pt-16">
            {/* User Welcome */}
            {user && (
              <div className="px-4 py-3 text-sm text-gray-300 border-b border-gray-700">
                Welcome, {user.username}
              </div>
            )}
            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex-1 overflow-y-auto">
                <div className="px-2 py-4 space-y-1">
                  {!user ? (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Updated to show subscription routes if user has subscription OR special access */}
                      {hasAccess && (
                        <>
                          <Link
                            to="/dashboard"
                            className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/trade-planning"
                            className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                          >
                            Trade Planning
                          </Link>
                          <Link
                            to="/community"
                            className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                          >
                            Community
                          </Link>
                        </>
                      )}
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        Profile
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Footer Actions - Theme Switcher for ALL users */}
            <div className="border-t border-gray-700">
              <div className="px-4 py-4 space-y-4">
                <ThemeSwitcher />
                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Navbar;
