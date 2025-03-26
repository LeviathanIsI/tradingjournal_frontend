import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTradingStats } from "../../context/TradingStatsContext";
import {
  Edit,
  UserPlus,
  UserMinus,
  LineChart,
  Users,
  Settings,
  PenLine,
} from "lucide-react";
import YourReviews from "../YourReviews";
import ProfileSettings from "../ProfileSettings";
import ProfileStats from "../ProfileStats";
import Network from "./Network";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { stats: contextStats, formatters } = useTradingStats();
  const { formatPercent } = formatters;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("reviews");

  const fetchProfile = useCallback(async (targetUsername) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/profile/${targetUsername}`,
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
  }, []); // Memoize fetchProfile

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!isMounted) return;

      const targetUsername = username || currentUser?.username;
      if (targetUsername) {
        await fetchProfile(targetUsername);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [username, currentUser?.username, fetchProfile]);

  const handleUserUpdate = useCallback((updatedUser) => {
    setProfile((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  }, []);

  const handleSettingsUpdate = useCallback(async () => {
    const targetUsername = username || currentUser?.username;
    if (targetUsername) {
      await fetchProfile(targetUsername);
    }
  }, [username, currentUser?.username, fetchProfile]);

  const handleFollow = useCallback(async () => {
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
        fetchProfile(username);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  }, [profile?.user?._id, username, fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-lg text-gray-700 dark:text-gray-200">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[50vh] py-6 px-3 sm:px-6 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 round-sm border border-red-100 dark:border-red-800/50 shadow-sm text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full min-h-[50vh] py-6 px-3 sm:px-6 flex items-center justify-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 round-sm border border-yellow-100 dark:border-yellow-800/50 shadow-sm text-yellow-700 dark:text-yellow-400">
          Profile not found
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.user.username;
  const isFollowing = profile.user.followers?.includes(currentUser?._id);

  // Use the correct stats source based on whether this is the current user's profile
  const stats = isOwnProfile ? contextStats : profile.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {profile.user.username}
            </h1>
            <p className="text-sm text-primary dark:text-primary-light mt-1">
              {profile.user.tradingStyle || "No trading style set"}
            </p>
            <div className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              {profile.user.bio || "No bio yet"}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="w-full sm:w-auto">
              <button
                onClick={handleFollow}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 round-sm font-medium shadow transition-colors w-full ${
                  isFollowing
                    ? "bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    : "bg-primary hover:bg-primary/90 text-white"
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
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/40">
          <div className="bg-white dark:bg-gray-800 round-sm p-4 border border-gray-100 dark:border-gray-700/40 shadow-sm hover:shadow transition-shadow">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats?.totalTrades || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <LineChart className="h-3.5 w-3.5 mr-1 text-primary dark:text-primary-light opacity-70" />
              Total Trades
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 round-sm p-4 border border-gray-100 dark:border-gray-700/40 shadow-sm hover:shadow transition-shadow">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatPercent(stats?.winRate || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <LineChart className="h-3.5 w-3.5 mr-1 text-primary dark:text-primary-light opacity-70" />
              Win Rate
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-1.5">
              <div
                className="bg-primary dark:bg-primary-light h-1.5 rounded-full"
                style={{ width: `${stats?.winRate || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 round-sm p-4 border border-gray-100 dark:border-gray-700/40 shadow-sm hover:shadow transition-shadow">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.user.followers?.length || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <Users className="h-3.5 w-3.5 mr-1 text-primary dark:text-primary-light opacity-70" />
              Followers
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 round-sm p-4 border border-gray-100 dark:border-gray-700/40 shadow-sm hover:shadow transition-shadow">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.user.following?.length || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <Users className="h-3.5 w-3.5 mr-1 text-primary dark:text-primary-light opacity-70" />
              Following
            </p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white dark:bg-gray-800/80 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700/50 overflow-x-auto">
          <nav className="flex px-4 sm:px-6 min-w-max">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center ${
                activeTab === "reviews"
                  ? "border-primary text-primary dark:text-primary-light"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Reviews
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center ${
                activeTab === "stats"
                  ? "border-primary text-primary dark:text-primary-light"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <LineChart className="h-4 w-4 mr-2" />
              Statistics
            </button>

            <button
              onClick={() => setActiveTab("network")}
              className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center ${
                activeTab === "network"
                  ? "border-primary text-primary dark:text-primary-light"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Network
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center ${
                  activeTab === "settings"
                    ? "border-primary text-primary dark:text-primary-light"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
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
