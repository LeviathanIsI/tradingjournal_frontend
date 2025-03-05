import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const GroupChat = ({ groupId, currentUser, initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  // Scroll to bottom of messages when they update
  useEffect(() => {
    if (messages.length && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Update local messages when props change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/study-groups/${groupId}/messages`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update messages array locally with the new message from the response
      const newMessageData = response.data.data;
      setMessages((prevMessages) => [...prevMessages, newMessageData]);

      // Clear the input field
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsSendingMessage(false);

      // Focus back on the input after sending
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b dark:border-gray-600/50 bg-gray-50 dark:bg-gray-600/40">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <MessageSquare
            size={18}
            className="mr-2 text-blue-500 dark:text-blue-400"
          />
          Group Chat
        </h2>
      </div>

      {/* Messages area with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/30">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isCurrentUser =
              String(message.sender?._id) === String(currentUser?._id);
            return (
              <div
                key={index}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {/* Always show username, for both current user and others */}
                  <div className="font-medium text-sm mb-1 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs mr-2">
                      {message.sender?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    {message.sender?.username || "Unknown User"}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs opacity-75 mt-1 text-right">
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageSquare
                size={40}
                className="mx-auto mb-2 text-gray-400 dark:text-gray-500"
              />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t dark:border-gray-600/50 bg-white dark:bg-gray-700">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600/70 dark:bg-gray-600/50 rounded-l-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={isSendingMessage || !newMessage.trim()}
            className="px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-r-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {isSendingMessage ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
