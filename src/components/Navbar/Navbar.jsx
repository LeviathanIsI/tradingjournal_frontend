// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, Check, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import ThemeSwitcher from "../ThemeSwitcher";
import logo from "../../assets/logo.svg";

// NotificationBell component directly in Navbar
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format the notification time
  const formatTime = (date) => {
    try {
      const messageDate = new Date(date);
      const now = new Date();
      const diffMinutes = Math.floor((now - messageDate) / (1000 * 60));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return messageDate.toLocaleDateString();
    } catch (error) {
      return "some time ago";
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell icon with notification badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gray-700">
            <h3 className="text-sm font-medium text-gray-100">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="px-4 py-2 border-b border-gray-700 flex justify-between bg-gray-750">
            <div className="flex items-center">
              <button className="text-xs text-gray-300 hover:text-gray-100 flex items-center bg-gray-700 px-3 py-1 rounded-md mr-2">
                Filter
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gray-300 hover:text-gray-100 flex items-center bg-gray-700 px-3 py-1 rounded-md"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="h-5 w-5 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-400">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-gray-400 mb-2">
                  You don't have any notifications
                </p>
                <p className="text-gray-500 text-sm">
                  When you receive notifications, they will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`relative px-4 py-3 hover:bg-gray-700 transition-colors ${
                      !notification.read ? "bg-gray-750" : ""
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1 cursor-pointer">
                        <p className="text-sm font-medium text-gray-200">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-start space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-600"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-700 flex justify-between">
            <button
              className="text-xs text-gray-300 hover:text-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
            <Link
              to="/notifications"
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={() => setIsOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal components
const NavLogo = () => (
  <div className="flex-shrink-0">
    <Link to="/" className="flex-shrink-0">
      <img src={logo} alt="Rivyl" className="h-8 sm:h-12 w-auto" />
    </Link>
  </div>
);

const NavLink = ({ to, className, children, onClick }) => {
  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};

const DesktopMenu = ({ user, hasAccessToFeature, handleLogout }) => {
  const linkStyle =
    "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm";
  const signUpStyle =
    "bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm";

  return (
    <div className="hidden md:flex md:items-center pr-8">
      {!user ? (
        <>
          <ThemeSwitcher />
          <div className="border-l border-gray-700 h-6 mx-2"></div>
          <NavLink to="/pricing" className={linkStyle}>
            Pricing
          </NavLink>
          <NavLink to="/login" className={linkStyle}>
            Login
          </NavLink>
          <NavLink to="/signup" className={signUpStyle}>
            Sign Up
          </NavLink>
        </>
      ) : (
        <div className="flex items-center space-x-4">
          <NavLink to="/dashboard" className={linkStyle}>
            Dashboard
          </NavLink>

          {hasAccessToFeature("premium") && (
            <>
              <NavLink to="/trade-planning" className={linkStyle}>
                Trade Planning
              </NavLink>
              <NavLink to="/community" className={linkStyle}>
                Community
              </NavLink>
            </>
          )}

          <ThemeSwitcher />
          <NotificationBell />
          <div className="border-l border-gray-700 h-6 mx-2"></div>
          <span className="text-gray-300 px-3 py-2 text-sm">
            Welcome, {user.username}
          </span>
          <NavLink to="/profile" className={linkStyle}>
            Profile
          </NavLink>
          <NavLink to="/pricing" className={linkStyle}>
            Pricing
          </NavLink>
          <NavLink onClick={handleLogout} className={linkStyle}>
            Logout
          </NavLink>
        </div>
      )}
    </div>
  );
};

const MobileMenu = ({
  isOpen,
  setIsOpen,
  user,
  hasAccessToFeature,
  handleLogout,
}) => {
  const linkStyle =
    "block px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors";
  const { unreadCount } = useNotifications();

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setIsOpen(false)}
    >
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 ${
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
            <div className="px-2 py-4 space-y-1">
              {!user ? (
                <>
                  <NavLink to="/pricing" className={linkStyle}>
                    Pricing
                  </NavLink>
                  <NavLink to="/login" className={linkStyle}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className={linkStyle}>
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" className={linkStyle}>
                    Dashboard
                  </NavLink>

                  {hasAccessToFeature("premium") && (
                    <>
                      <NavLink to="/trade-planning" className={linkStyle}>
                        Trade Planning
                      </NavLink>
                      <NavLink to="/community" className={linkStyle}>
                        Community
                      </NavLink>
                    </>
                  )}

                  {/* Notifications Link for Mobile */}
                  <Link
                    to="/notifications"
                    className={`${linkStyle} flex items-center justify-between`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  <NavLink to="/profile" className={linkStyle}>
                    Profile
                  </NavLink>
                  <NavLink to="/pricing" className={linkStyle}>
                    Pricing
                  </NavLink>
                </>
              )}
            </div>
          </div>
          {/* Footer Actions */}
          <div className="border-t border-gray-700">
            <div className="px-4 py-4 space-y-4">
              <ThemeSwitcher />
              {user && (
                <NavLink onClick={handleLogout} className={linkStyle}>
                  Logout
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Navbar component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasAccessToFeature } = useAuth() || {
    user: null,
    logout: null,
  };

  // Close menu if route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
            <NavLogo />

            {/* Desktop Menu */}
            <DesktopMenu
              user={user}
              hasAccessToFeature={hasAccessToFeature}
              handleLogout={handleLogout}
            />

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-white"
                aria-label={isOpen ? "Close menu" : "Open menu"}
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
      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        hasAccessToFeature={hasAccessToFeature}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
