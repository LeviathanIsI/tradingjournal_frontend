import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  UserPlus, 
  ArrowUpDown, 
  Check, 
  X 
} from "lucide-react";
import UserDetail from "./UserDetail";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const navigate = useNavigate();

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        
        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message);
        
        // For development - mock data when API isn't ready
        if (import.meta.env.DEV) {
          setUsers([
            {
              _id: "1",
              username: "johndoe",
              email: "john@example.com",
              created: new Date(2024, 0, 15).toISOString(),
              subscription: { active: true, type: "yearly" },
              specialAccess: { hasAccess: false }
            },
            {
              _id: "2",
              username: "janedoe",
              email: "jane@example.com",
              created: new Date(2024, 1, 20).toISOString(),
              subscription: { active: true, type: "monthly" },
              specialAccess: { hasAccess: false }
            },
            {
              _id: "3",
              username: "bobsmith",
              email: "bob@example.com",
              created: new Date(2024, 2, 5).toISOString(),
              subscription: { active: false, type: null },
              specialAccess: { hasAccess: false }
            },
            {
              _id: "4",
              username: "adminuser",
              email: "admin@example.com",
              created: new Date(2023, 11, 1).toISOString(),
              subscription: { active: true, type: "yearly" },
              specialAccess: { hasAccess: true, reason: "Admin" }
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      // Apply search filter
      const searchMatch = 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      let statusMatch = true;
      if (statusFilter === "active") {
        statusMatch = user.subscription?.active === true;
      } else if (statusFilter === "inactive") {
        statusMatch = user.subscription?.active !== true;
      } else if (statusFilter === "admin") {
        statusMatch = user.specialAccess?.hasAccess && user.specialAccess.reason === "Admin";
      }
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Apply sorting
      let aValue, bValue;
      
      switch (sortField) {
        case "created":
          aValue = new Date(a.created);
          bValue = new Date(b.created);
          break;
        case "status":
          aValue = a.subscription?.active ? 1 : 0;
          bValue = b.subscription?.active ? 1 : 0;
          break;
        default:
          aValue = a[sortField]?.toLowerCase();
          bValue = b[sortField]?.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Render user list
  const renderUserList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-400">Loading users...</div>
        </div>
      );
    }

    if (error && !import.meta.env.DEV && users.length === 0) {
      return (
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-sm border border-red-100 dark:border-red-800/20">
          <h3 className="text-red-800 dark:text-red-300 font-medium">Error loading users</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700/40 p-8 rounded-sm text-center">
          <p className="text-gray-500 dark:text-gray-400">No users found matching your criteria</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600/50">
          <thead className="bg-gray-50 dark:bg-gray-700/40">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("username")}
              >
                <div className="flex items-center">
                  Username
                  {sortField === "username" && (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email
                  {sortField === "email" && (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("created")}
              >
                <div className="flex items-center">
                  Joined
                  {sortField === "created" && (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {sortField === "status" && (
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700/60 divide-y divide-gray-200 dark:divide-gray-600/50">
            {filteredUsers.map((user) => (
              <tr 
                key={user._id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700/90 cursor-pointer"
                onClick={() => navigate(`/admin/users/${user._id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.username}
                      </div>
                      {user.specialAccess?.hasAccess && user.specialAccess.reason === "Admin" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 dark:bg-purple-800/20 text-purple-800 dark:text-purple-300">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.subscription?.active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800/20 text-green-800 dark:text-green-300">
                      {user.subscription.type || "Active"}
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/users/${user._id}`);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                User Management
              </h2>
            </div>
            
            {/* Filters and Search */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600/70 rounded-sm 
                             bg-white dark:bg-gray-700/40 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600/70 bg-white dark:bg-gray-700/40 
                           rounded-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Subscriptions</option>
                  <option value="inactive">Inactive</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
            
            {/* User Table */}
            <div className="bg-white dark:bg-gray-700/60 overflow-hidden shadow-sm rounded-sm border border-gray-200 dark:border-gray-600/50">
              {renderUserList()}
            </div>
          </div>
        } 
      />
      <Route path=":userId" element={<UserDetail users={users} setUsers={setUsers} />} />
    </Routes>
  );
};

export default UserManagement;