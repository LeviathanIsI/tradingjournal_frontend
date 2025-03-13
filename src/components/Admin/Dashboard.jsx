import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  MessageSquare, 
  Activity 
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    paidSubscriptions: 0,
    messagesSent: 0,
    averageSessionTime: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch admin stats");
        }

        const data = await response.json();
        setStats({
          ...data.data,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        
        // For development - use mock data when API isn't ready
        if (import.meta.env.DEV) {
          setStats({
            totalUsers: 125,
            activeUsers: 87,
            paidSubscriptions: 42,
            messagesSent: 253,
            averageSessionTime: 24,
            loading: false,
            error: null
          });
        }
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-100 dark:bg-blue-800/20 text-blue-600 dark:text-blue-300",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "bg-green-100 dark:bg-green-800/20 text-green-600 dark:text-green-300",
    },
    {
      title: "Paid Subscriptions",
      value: stats.paidSubscriptions,
      icon: DollarSign,
      color: "bg-purple-100 dark:bg-purple-800/20 text-purple-600 dark:text-purple-300",
    },
    {
      title: "Messages Sent",
      value: stats.messagesSent,
      icon: MessageSquare,
      color: "bg-orange-100 dark:bg-orange-800/20 text-orange-600 dark:text-orange-300",
    },
    {
      title: "Avg. Session (min)",
      value: stats.averageSessionTime,
      icon: Activity,
      color: "bg-teal-100 dark:bg-teal-800/20 text-teal-600 dark:text-teal-300",
    },
  ];

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-400">Loading dashboard data...</div>
      </div>
    );
  }

  if (stats.error && !import.meta.env.DEV) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-sm border border-red-100 dark:border-red-800/20">
        <h3 className="text-red-800 dark:text-red-300 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{stats.error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Admin Dashboard
        </h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <div 
              key={stat.title} 
              className="bg-white dark:bg-gray-700/60 p-4 border border-gray-200 dark:border-gray-600/50 rounded-sm shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-sm ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Section - Placeholder for now */}
      <div className="bg-white dark:bg-gray-700/60 p-4 sm:p-6 border border-gray-200 dark:border-gray-600/50 rounded-sm shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          Activity tracking coming soon
        </div>
      </div>
    </div>
  );
};

export default Dashboard;