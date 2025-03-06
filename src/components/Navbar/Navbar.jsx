// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeSwitcher from "../ThemeSwitcher";
import logo from "../../assets/logo.svg";

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
