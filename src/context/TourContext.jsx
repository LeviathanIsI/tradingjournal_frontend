import React, { createContext, useContext, useState } from "react";

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [activeTour, setActiveTour] = useState(null);

  const value = {
    activeTour,
    setActiveTour,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};

export default TourProvider;
