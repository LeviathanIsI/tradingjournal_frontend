import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

const defaultTourStatus = {
  dashboardTourCompleted: false,
  communityNavTourCompleted: false,
  tradePlanningTourCompleted: false,
  profileTourCompleted: false,
  featuredTourCompleted: false,
  leaderboardTourCompleted: false,
  reviewsTourCompleted: false,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const updateUser = (userData) => {
    const updatedUser = {
      ...userData,
      tourStatus: {
        ...defaultTourStatus,
        ...(userData.tourStatus || {}),
      },
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const validateAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const { data } = await response.json();
      updateUser(data);
    } catch (error) {
      console.error("Auth validation error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        updateUser(parsedUser); // Use updateUser to ensure proper tour status
        validateAuth();
      } catch (error) {
        console.error("Error parsing stored user:", error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (userData) => {
    localStorage.setItem("token", userData.token);
    // Ensure proper tour status initialization during login
    const userDataToStore = {
      ...userData,
      tourStatus: {
        ...defaultTourStatus,
        ...(userData.tourStatus || {}),
      },
    };
    localStorage.setItem("user", JSON.stringify(userDataToStore));
    setUser(userDataToStore);
    const from = location.state?.from || "/dashboard";
    navigate(from);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
