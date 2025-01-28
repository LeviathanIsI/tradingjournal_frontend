// src/pages/Tools.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ToolsNav from "../components/ToolsNav";
import InsiderDashboard from "../components/tools/InsiderDashboard";

const Tools = () => {
  return (
    <div className="flex flex-col">
      <ToolsNav />
      <div className="w-full p-6">
        <Routes>
          <Route path="insider" element={<InsiderDashboard />} />
          <Route path="/" element={<Navigate to="insider" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Tools;
