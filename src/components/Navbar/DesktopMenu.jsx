import React from "react";
import { Link } from "react-router-dom";
import ThemeSwitcher from "../ThemeSwitcher";
import NavLink from "./NavLink";
import NotificationBell from "./NotificationBell";

const DesktopMenu = ({ user, hasAccessToFeature, handleLogout }) => {
  // Styles for links
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

export default React.memo(DesktopMenu);
