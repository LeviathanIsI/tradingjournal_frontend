import { Routes, Route, Navigate } from "react-router-dom";
import CommunityNav from "../components/CommunityNav";
import PublicReviews from "../components/PublicReviews";
import FeaturedReviews from "../components/FeaturedReviews";
import Traders from "../components/Traders";
import Leaderboard from "../components/Leaderboard";
import Profile from "../components/Profile";
import CommunityNavTour from "../components/CommunityNavTour";
import Network from "../components/Network";

const Community = () => {
  return (
    <div className="flex flex-col">
      <CommunityNavTour />
      <CommunityNav />
      <div className="w-full p-6">
        <Routes>
          <Route
            path="reviews"
            element={
              <div data-tour="community-reviews">
                <PublicReviews />
              </div>
            }
          />
          <Route
            path="traders"
            element={
              <div data-tour="community-traders">
                <Traders />
              </div>
            }
          />
          <Route
            path="leaderboard"
            element={
              <div data-tour="community-leaderboard">
                <Leaderboard />
              </div>
            }
          />
          <Route
            path="featured"
            element={
              <div data-tour="community-featured">
                <FeaturedReviews />
              </div>
            }
          />
          <Route
            path="profile/:username"
            element={
              <div data-tour="community-profile">
                <Profile />
              </div>
            }
          />
          <Route
            path="network"
            element={
              <div data-tour="community-network">
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
