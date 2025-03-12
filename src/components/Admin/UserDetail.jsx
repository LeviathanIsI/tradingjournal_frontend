import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Edit, Save, Shield, Calendar, Trash2, Clock } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const UserDetail = ({ users, setUsers }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    subscriptionType: "",
    isAdmin: false,
    specialAccessExpiry: "",
  });

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      // First check if we already have the user in our list
      const cachedUser = users.find(u => u._id === userId);
      
      if (cachedUser) {
        setUser(cachedUser);
        setFormData({
          username: cachedUser.username,
          email: cachedUser.email,
          subscriptionType: cachedUser.subscription?.type || "none",
          isAdmin: cachedUser.specialAccess?.hasAccess && cachedUser.specialAccess.reason === "Admin",
          specialAccessExpiry: cachedUser.specialAccess?.expiresAt || "",
        });
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        
        const data = await response.json();
        setUser(data.data);
        setFormData({
          username: data.data.username,
          email: data.data.email,
          subscriptionType: data.data.subscription?.type || "none",
          isAdmin: data.data.specialAccess?.hasAccess && data.data.specialAccess.reason === "Admin",
          specialAccessExpiry: data.data.specialAccess?.expiresAt || "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId, users]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            subscription: {
              type: formData.subscriptionType === "none" ? null : formData.subscriptionType,
              active: formData.subscriptionType !== "none",
            },
            specialAccess: {
              hasAccess: formData.isAdmin,
              reason: formData.isAdmin ? "Admin" : null,
              expiresAt: formData.specialAccessExpiry || null,
            },
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      
      const data = await response.json();
      
      // Update local user data
      setUser(data.data);
      
      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? data.data : u
        )
      );
      
      showToast("User updated successfully", "success");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
      showToast("Failed to update user: " + error.message, "error");
    }
  };

  // Mock update for development
  const handleDevUpdate = (e) => {
    e.preventDefault();
    
    if (import.meta.env.DEV) {
      const updatedUser = {
        ...user,
        username: formData.username,
        email: formData.email,
        subscription: {
          ...user.subscription,
          type: formData.subscriptionType === "none" ? null : formData.subscriptionType,
          active: formData.subscriptionType !== "none",
        },
        specialAccess: {
          hasAccess: formData.isAdmin,
          reason: formData.isAdmin ? "Admin" : null,
          expiresAt: formData.specialAccessExpiry || null,
        },
      };
      
      setUser(updatedUser);
      
      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId ? updatedUser : u
        )
      );
      
      showToast("User updated successfully (DEV MODE)", "success");
      setEditMode(false);
    } else {
      handleSubmit(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-400">Loading user details...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-sm border border-red-100 dark:border-red-800/20">
        <h3 className="text-red-800 dark:text-red-300 font-medium">Error loading user</h3>
        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error || "User not found"}</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-red-600 hover:bg-red-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/admin/users")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            User Details
          </h2>
        </div>
        <div>
          {editMode ? (
            <button
              onClick={import.meta.env.DEV ? handleDevUpdate : handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </button>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-white dark:bg-gray-700/60 overflow-hidden shadow-sm rounded-sm border border-gray-200 dark:border-gray-600/50 mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-600/50">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300">
              <User className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {user.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        
        {editMode ? (
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={import.meta.env.DEV ? handleDevUpdate : handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-700/40 py-2 px-3 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-700/40 py-2 px-3 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="subscriptionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subscription Type
                  </label>
                  <select
                    name="subscriptionType"
                    id="subscriptionType"
                    value={formData.subscriptionType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-700/40 py-2 px-3 text-gray-900 dark:text-gray-100"
                  >
                    <option value="none">No Subscription</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center h-full mt-6">
                    <input
                      type="checkbox"
                      name="isAdmin"
                      id="isAdmin"
                      checked={formData.isAdmin}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      Admin Access
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Username
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.username}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(user.created).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Subscription Status
                </dt>
                <dd className="mt-1 text-sm">
                  {user.subscription?.active ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-800/20 text-green-800 dark:text-green-300">
                      {user.subscription.type || "Active"}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Inactive
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Status</dt>
                <dd className="mt-1 text-sm">
                  {user.specialAccess?.hasAccess && user.specialAccess.reason === "Admin" ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-800/20 text-purple-800 dark:text-purple-300">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Regular User
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
        <button
          onClick={() => {
            // Delete user functionality would go here
            showToast("Delete functionality will be implemented soon", "info");
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-red-600 hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </button>
        
        <button
          onClick={() => {
            // Send message functionality would go here
            navigate("/admin/announcements", { state: { recipient: user.email } });
          }}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600/70 text-sm font-medium rounded-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Message User
        </button>
      </div>
    </div>
  );
};

export default UserDetail;