import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Edit,
  UserPlus,
  UserMinus,
  ChartLine,
  Users,
  Settings,
  PenLine,
} from "lucide-react";
import YourReviews from "./YourReviews";
import ProfileSettings from "./ProfileSettings";
import ProfileStats from "./ProfileStats";
import Network from "./Network";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("reviews");

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/profile/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile");
      }

      setProfile(data.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setProfile((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  };

  const handleSettingsUpdate = async () => {
    await fetchProfile();
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/follow/${profile.user._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchProfile();
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-gray-100">
        Loading profile...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-gray-100">
        Profile not found
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.user.username;
  const isFollowing = profile.user.followers?.includes(currentUser?._id);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.user.username}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.user.tradingStyle || "No trading style set"}
            </p>
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                {profile.user.bio || "No bio yet"}
              </p>
            </div>
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md w-full sm:w-auto ${
                isFollowing
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t dark:border-gray-700">
          <div className="text-center p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.stats?.totalTrades || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Trades
            </p>
          </div>
          <div className="text-center p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.stats?.winRate?.toFixed(1) || 0}%
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Win Rate
            </p>
          </div>
          <div className="text-center p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.user.followers?.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Followers
            </p>
          </div>
          <div className="text-center p-2 sm:p-0">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.user.following?.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Following
            </p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex gap-2 sm:gap-4 px-2 sm:px-6 min-w-max">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-2 sm:px-3 py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <PenLine className="h-4 w-4 inline mr-1 sm:mr-2" />
              Reviews
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-2 sm:px-3 py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "stats"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <ChartLine className="h-4 w-4 inline mr-1 sm:mr-2" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab("network")}
              className={`px-2 sm:px-3 py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === "network"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Users className="h-4 w-4 inline mr-1 sm:mr-2" />
              Network
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-2 sm:px-3 py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Settings className="h-4 w-4 inline mr-1 sm:mr-2" />
                Settings
              </button>
            )}
          </nav>
        </div>

        <div className="p-3 sm:p-6">
          {activeTab === "reviews" && <YourReviews userId={profile.user._id} />}
          {activeTab === "stats" && (
            <ProfileStats
              userId={profile.user._id}
              trades={profile.trades || []}
              stats={profile.stats}
            />
          )}
          {activeTab === "network" && <Network userId={profile.user._id} />}
          {activeTab === "settings" && isOwnProfile && (
            <ProfileSettings
              user={profile.user}
              onUpdate={handleUserUpdate}
              currentSettings={profile.user}
              onSettingsSubmit={handleSettingsUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
