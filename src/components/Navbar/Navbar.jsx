import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NavLogo from "./NavLogo";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import logo from "../../assets/logo.svg";

// Material UI imports
import {
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasAccessToFeature } = useAuth() || {
    user: null,
    logout: null,
  };

  // MUI theme
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    <AppBar
      position="fixed"
      sx={{
        zIndex: 40,
        backgroundColor: "#0f172a", // Always use dark blue regardless of theme mode
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)", // Always use dark mode border
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)", // Always use dark mode shadow
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1.5, sm: 4 } }}>
        {/* Logo */}
        <NavLogo logo={logo} />

        {/* Desktop Menu */}
        <DesktopMenu
          user={user}
          hasAccessToFeature={hasAccessToFeature}
          handleLogout={handleLogout}
        />

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            edge="end"
            color="inherit"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              color: "grey.300", // Always use dark mode color
              "&:hover": {
                color: "white", // Always use dark mode hover color
              },
            }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Menu Slide-in */}
      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        hasAccessToFeature={hasAccessToFeature}
        handleLogout={handleLogout}
      />
    </AppBar>
  );
};

export default Navbar;
