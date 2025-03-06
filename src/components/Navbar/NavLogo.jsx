// src/components/Navbar/NavLogo.jsx
import { Link } from "react-router-dom";
import React from "react";

const NavLogo = ({ logo }) => (
  <div className="flex-shrink-0">
    <Link to="/" className="flex-shrink-0">
      <img src={logo} alt="Rivyl" className="h-8 sm:h-12 w-auto" />
    </Link>
  </div>
);

export default React.memo(NavLogo);
