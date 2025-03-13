import { Routes, Route, Navigate } from "react-router-dom";
import {
  Traders,
  Leaderboard,
  CommunityNav,
  PublicReviews,
  FeaturedReviews,
  Profile,
  Network,
  ReviewInteractions,
  TraderCard,
  ReviewCard,
} from "../components/Community";
import { useAuth } from "../context/AuthContext";
import { Users, BarChart2, BookOpen, Trophy } from "lucide-react";

const Community = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white/90 dark:bg-gray-800/80 p-5 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm backdrop-blur-sm">
          <div className="animate-pulse flex flex-col items-center space-y-3">
            <div className="h-8 w-8 bg-primary/40 dark:bg-primary/30 rounded-full"></div>
            <div className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <CommunityNav />

      {/* Info Section with improved styling */}
      <div className="px-3 sm:px-6 py-4 sm:py-6 bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-800/70 dark:to-gray-900/60 border-b border-gray-200 dark:border-gray-700/40 backdrop-blur-sm">
        <div className="bg-white/90 dark:bg-gray-800/80 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Community Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-4 rounded-md border border-blue-100 dark:border-blue-800/30 flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-md">
                <Users className="h-5 w-5 text-primary dark:text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Connect
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Connect with traders who match your style
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-4 rounded-md border border-purple-100 dark:border-purple-800/30 flex items-start space-x-3">
              <div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-md">
                <BookOpen className="h-5 w-5 text-accent dark:text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Learn
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Share and learn from other traders' experiences
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-4 rounded-md border border-green-100 dark:border-green-800/30 flex items-start space-x-3">
              <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-md">
                <BarChart2 className="h-5 w-5 text-secondary dark:text-secondary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Track
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Track your rankings and performance
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 p-4 rounded-md border border-amber-100 dark:border-amber-800/30 flex items-start space-x-3">
              <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-md">
                <Trophy className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Featured
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Access featured content from top traders
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700/40">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic flex items-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/80 mr-2"></span>
              Pro tip: Engage with the community to accelerate your learning
              journey
            </p>
          </div>
        </div>
      </div>

      {/* Routes Section with improved container styling */}
      <div className="flex-1 w-full px-3 sm:px-6 py-5 sm:py-6 bg-gray-50/80 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="bg-white/90 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md overflow-hidden">
          <Routes>
            {[
              {
                path: "reviews",
                Component: PublicReviews,
                label: "Public Reviews",
              },
              { path: "traders", Component: Traders, label: "Traders" },
              {
                path: "leaderboard",
                Component: Leaderboard,
                label: "Leaderboard",
              },
              {
                path: "featured",
                Component: FeaturedReviews,
                label: "Featured",
              },
              {
                path: "profile/:username",
                Component: Profile,
                label: "Profile",
              },
              { path: "network", Component: Network, label: "Your Network" },
            ].map(({ path, Component, label }) => (
              <Route
                key={path}
                path={path}
                element={
                  <div className="max-w-full overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/30">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {label}
                      </h2>
                    </div>
                    <div className="p-4 sm:p-6">
                      <Component />
                    </div>
                  </div>
                }
              />
            ))}
            <Route path="/" element={<Navigate to="reviews" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Community;
