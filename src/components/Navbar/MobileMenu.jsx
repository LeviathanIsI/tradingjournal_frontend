// src/components/Navbar/MobileMenu.jsx
import React from "react";
import { Link } from "react-router-dom";
import ThemeSwitcher from "../ThemeSwitcher";
import NavLink from "./NavLink";

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

export default React.memo(MobileMenu);
