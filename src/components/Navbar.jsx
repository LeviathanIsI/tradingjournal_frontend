// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-full px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand - pushed to the far left */}
          <div className="flex-shrink-0 pl-8">
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="Rivyl" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop menu - pushed to the far right */}
          <div className="hidden md:flex md:items-center pr-8">
            {user ? (
              <div className="flex items-center space-x-4">
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
              </div>
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
                <Link
                  to="/community"
                  className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base"
                >
                  Community
                </Link>
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
    </nav>
  );
};

export default Navbar;
