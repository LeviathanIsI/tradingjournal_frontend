import { Routes, Route, Navigate } from "react-router-dom";
import CommunityNav from "../components/CommunityNav";
import PublicReviews from "../components/PublicReviews";
import FeaturedReviews from "../components/FeaturedReviews";
import Traders from "../components/Traders";
import Leaderboard from "../components/Leaderboard";
import Profile from "../components/Profile";
import Network from "../components/Network";

const Community = () => {
  return (
    <div className="flex flex-col">
      <CommunityNav />
      <div className="p-6 bg-gray-50">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">Community Features:</p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• Share and learn from other traders' experiences</li>
            <li>• Connect with traders who match your style</li>
            <li>• Track your rankings and performance</li>
            <li>• Access featured content from top traders</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2 italic">
            Pro tip: Engage with the community to accelerate your learning
          </p>
        </div>
      </div>
      <div className="w-full p-6">
        <Routes>
          <Route
            path="reviews"
            element={
              <div>
                <PublicReviews />
              </div>
            }
          />
          <Route
            path="traders"
            element={
              <div>
                <Traders />
              </div>
            }
          />
          <Route
            path="leaderboard"
            element={
              <div>
                <Leaderboard />
              </div>
            }
          />
          <Route
            path="featured"
            element={
              <div>
                <FeaturedReviews />
              </div>
            }
          />
          <Route
            path="profile/:username"
            element={
              <div>
                <Profile />
              </div>
            }
          />
          <Route
            path="network"
            element={
              <div>
                <Network />
              </div>
            }
          />
          <Route path="/" element={<Navigate to="reviews" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Community;
