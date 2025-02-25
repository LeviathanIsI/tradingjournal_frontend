import { Routes, Route, Navigate } from "react-router-dom";
import CommunityNav from "../components/CommunityNav";
import PublicReviews from "../components/PublicReviews";
import FeaturedReviews from "../components/FeaturedReviews";
import Traders from "../components/Traders";
import Leaderboard from "../components/Leaderboard";
import Profile from "../components/Profile";
import Network from "../components/Network";
import { useAuth } from "../context/AuthContext";

const Community = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {" "}
      {/* Added pt-16 for fixed navbar */}
      <CommunityNav />
      {/* Info Section */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-6 rounded-lg">
          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
            Community Features:
          </p>
          <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-2">
            <li className="flex items-start">
              <span className="mr-2 flex-shrink-0 text-gray-400">•</span>
              <span>Share and learn from other traders' experiences</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 flex-shrink-0 text-gray-400">•</span>
              <span>Connect with traders who match your style</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 flex-shrink-0 text-gray-400">•</span>
              <span>Track your rankings and performance</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 flex-shrink-0 text-gray-400">•</span>
              <span>Access featured content from top traders</span>
            </li>
          </ul>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 italic">
            Pro tip: Engage with the community to accelerate your learning
          </p>
        </div>
      </div>
      {/* Routes Section */}
      <div className="flex-1 w-full px-3 sm:px-6 py-3 sm:py-4 dark:bg-gray-900">
        <Routes>
          {/* Route components with consistent padding/margin handling */}
          {[
            { path: "reviews", Component: PublicReviews },
            { path: "traders", Component: Traders },
            { path: "leaderboard", Component: Leaderboard },
            { path: "featured", Component: FeaturedReviews },
            { path: "profile/:username", Component: Profile },
            { path: "network", Component: Network },
          ].map(({ path, Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <div className="max-w-full -mx-3 sm:mx-0 overflow-hidden">
                  <Component />
                </div>
              }
            />
          ))}
          <Route path="/" element={<Navigate to="reviews" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Community;
