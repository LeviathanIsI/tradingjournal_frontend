// src/pages/Community.jsx
import { useState } from "react";
import PublicReviews from "../components/PublicReviews";

const Community = () => {
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-3 py-1 rounded-lg ${
              activeTab === "reviews"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Trade Reviews
          </button>
          {/* Add more tabs here as we add more community features */}
        </div>
      </div>

      {activeTab === "reviews" && <PublicReviews />}
      {/* Add more tab content here */}
    </div>
  );
};

export default Community;
