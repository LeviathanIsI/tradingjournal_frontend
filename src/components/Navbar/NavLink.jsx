// src/components/Navbar/NavLink.jsx
import { Link } from "react-router-dom";
import React from "react";

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

export default React.memo(NavLink);
