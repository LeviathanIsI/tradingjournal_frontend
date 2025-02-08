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

  useEffect(() => {}, [currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Get the token from localStorage
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/auth/profile/${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add this
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

  const handleSettingsUpdate = async (newSettings) => {
    await fetchProfile();
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/auth/follow/${profile.user._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchProfile(); // Refresh profile data
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading profile...</div>;
  }
  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">Error: {error}</div>
    );
  }
  if (!profile) {
    return <div className="flex justify-center p-8">Profile not found</div>;
  }

  const isOwnProfile = currentUser?.username === profile.user.username;
  const isFollowing = profile.user.followers?.includes(currentUser?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div
        className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.user.username}
            </h1>
            <p className="text-sm text-gray-500">
              {profile.user.tradingStyle || "No trading style set"}
            </p>
            {/* Move bio here, under the username and trading style */}
            <div className="mt-4">
              <p className="text-gray-600">
                {profile.user.bio || "No bio yet"}
              </p>
            </div>
          </div>
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                isFollowing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
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
        <div
          className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.stats?.totalTrades || 0}
            </p>
            <p className="text-sm text-gray-500">Trades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.stats?.winRate?.toFixed(1) || 0}%
            </p>
            <p className="text-sm text-gray-500">Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.user.followers?.length || 0}
            </p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {profile.user.following?.length || 0}
            </p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3 py-4 text-sm font-medium border-b-2 ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300"
              }`}
            >
              <PenLine className="h-4 w-4 inline mr-2" />
              Reviews
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-3 py-4 text-sm font-medium border-b-2 ${
                activeTab === "stats"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300"
              }`}
            >
              <ChartLine className="h-4 w-4 inline mr-2" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab("network")}
              className={`px-3 py-4 text-sm font-medium border-b-2 ${
                activeTab === "network"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Network
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300"
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
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
            <>
              {activeTab === "settings" && isOwnProfile && (
                <>
                  <ProfileSettings
                    user={profile.user}
                    onUpdate={handleUserUpdate}
                    currentSettings={profile.user}
                    onSettingsSubmit={handleSettingsUpdate}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
