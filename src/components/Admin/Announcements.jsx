import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, Users, User, Info, Bell, Clock } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const Announcements = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [previousMessages, setPreviousMessages] = useState([]);
  const [loadingPrevious, setLoadingPrevious] = useState(true);

  // Initialize form with recipient from navigation state if provided
  const [formData, setFormData] = useState({
    recipients: location.state?.recipient ? "specific" : "all",
    specificRecipients: location.state?.recipient || "",
    subject: "",
    message: "",
    messageType: "announcement",
    priority: "normal",
  });

  // Fetch previous messages
  useEffect(() => {
    const fetchPreviousMessages = async () => {
      try {
        setLoadingPrevious(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch previous messages");
        }

        const data = await response.json();
        setPreviousMessages(data.data);
      } catch (error) {
        console.error("Error fetching previous messages:", error);

        // Mock data for development
        if (import.meta.env.DEV) {
          setPreviousMessages([
            {
              _id: "1",
              subject: "New Feature Announcement",
              message:
                "We've just launched our new feature that allows you to track your trades more efficiently!",
              sentTo: "all",
              sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              messageType: "announcement",
              priority: "normal",
              readCount: 45,
              totalCount: 120,
            },
            {
              _id: "2",
              subject: "Important Security Update",
              message: "Please update your password for enhanced security.",
              sentTo: "specific",
              sentAt: new Date(Date.now() - 86400000 * 5).toISOString(),
              messageType: "alert",
              priority: "high",
              readCount: 15,
              totalCount: 20,
            },
          ]);
        }
      } finally {
        setLoadingPrevious(false);
      }
    };

    fetchPreviousMessages();
  }, [messageSent]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.subject.trim()) {
      showToast("Subject is required", "error");
      return;
    }

    if (!formData.message.trim()) {
      showToast("Message content is required", "error");
      return;
    }

    if (
      formData.recipients === "specific" &&
      !formData.specificRecipients.trim()
    ) {
      showToast("Please specify at least one recipient", "error");
      return;
    }

    try {
      setLoading(true);

      const messageData = {
        subject: formData.subject,
        message: formData.message,
        recipients:
          formData.recipients === "all"
            ? "all"
            : formData.specificRecipients.split(",").map((r) => r.trim()),
        messageType: formData.messageType,
        priority: formData.priority,
      };

      // API request
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Reset form and show success message
      setFormData({
        recipients: "all",
        specificRecipients: "",
        subject: "",
        message: "",
        messageType: "announcement",
        priority: "normal",
      });

      showToast("Message sent successfully", "success");
      setMessageSent(true);
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message: " + error.message, "error");

      // Mock success in development environment
      if (import.meta.env.DEV) {
        setFormData({
          recipients: "all",
          specificRecipients: "",
          subject: "",
          message: "",
          messageType: "announcement",
          priority: "normal",
        });

        showToast("Message sent successfully (DEV MODE)", "success");
        setMessageSent((prev) => !prev); // Toggle to trigger useEffect
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Compose Message Form */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800/80 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700/60 p-6">
        <div className="flex items-center mb-6">
          <Bell className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Send Announcement
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Send to
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="recipients"
                    value="all"
                    checked={formData.recipients === "all"}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary/50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    All Users
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="recipients"
                    value="specific"
                    checked={formData.recipients === "specific"}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary/50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Specific Users
                  </span>
                </label>
              </div>

              {formData.recipients === "specific" && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="specificRecipients"
                    value={formData.specificRecipients}
                    onChange={handleChange}
                    placeholder="Enter email addresses, separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                               bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Separate multiple email addresses with commas
                  </p>
                </div>
              )}
            </div>

            {/* Message Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message Type
                </label>
                <select
                  name="messageType"
                  value={formData.messageType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                             bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="announcement">Announcement</option>
                  <option value="alert">Alert</option>
                  <option value="update">Update</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                             bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                           bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Enter message subject"
              />
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 round-sm 
                           bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Enter your message here"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                           round-sm text-white bg-primary hover:bg-primary/90 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-primary/50 shadow
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Previous Messages */}
      <div className="bg-white dark:bg-gray-800/80 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700/60 p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Recent Messages
          </h3>
        </div>

        {loadingPrevious ? (
          <div className="animate-pulse text-gray-400 text-center py-8">
            Loading messages...
          </div>
        ) : previousMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-center py-8">
            <Info className="h-8 w-8 mb-2 opacity-50" />
            <p>No messages sent yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {previousMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-4 border border-gray-200 dark:border-gray-700/40 round-sm
                           hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {msg.subject}
                  </h4>
                  <div
                    className={`px-2 py-0.5 text-xs rounded-full 
                    ${
                      msg.priority === "high"
                        ? "bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300"
                        : msg.priority === "normal"
                        ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {msg.priority.charAt(0).toUpperCase() +
                      msg.priority.slice(1)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {msg.message}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center">
                    {msg.sentTo === "all" ? (
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <User className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    <span>
                      {msg.sentTo === "all" ? "All Users" : "Specific Users"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>
                      {new Date(msg.sentAt).toLocaleDateString()} at{" "}
                      {new Date(msg.sentAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary dark:bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(msg.readCount / msg.totalCount) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {msg.readCount}/{msg.totalCount} read
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
