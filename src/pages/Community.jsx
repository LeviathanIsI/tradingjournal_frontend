import { Routes, Route, Navigate } from "react-router-dom";
import CommunityNav from "../components/CommunityNav";
import PublicReviews from "../components/PublicReviews";
import FeaturedReviews from "../components/FeaturedReviews";
import Traders from "../components/Traders";
import Leaderboard from "../components/Leaderboard";
import Profile from "../components/Profile";

const Community = () => {
  return (
    <div className="flex flex-col">
      <CommunityNav />
      <div className="w-full p-6">
        <Routes>
          <Route
            path="reviews"
            element={
              <>
                <FeaturedReviews />
                <PublicReviews />
              </>
            }
          />
          <Route path="traders" element={<Traders />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="featured" element={<FeaturedReviews />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="/" element={<Navigate to="reviews" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Community;
