import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Pin,
  Reply,
  Smile,
  ChevronDown,
  PlusCircle,
  BarChart2,
  X,
  AtSign,
  PlusCircle as AddReaction,
  Loader,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

// Common emoji reactions, similar to Discord defaults
const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "👎", "🎉", "🔥", "👀"];

const GroupChat = ({
  groupId,
  currentUser,
  initialMessages = [],
  groupCreatorId,
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState({});
  const [showEmojiPickerForInput, setShowEmojiPickerForInput] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [hoveredMessage, setHoveredMessage] = useState(null);

  // References
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const emojiPickerRefs = useRef({});
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

  // Close emoji pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close message emoji pickers
      Object.keys(emojiPickerRefs.current).forEach((messageId) => {
        if (
          emojiPickerRefs.current[messageId] &&
          !emojiPickerRefs.current[messageId].contains(event.target) &&
          showEmojiPicker[messageId]
        ) {
          setShowEmojiPicker((prev) => ({ ...prev, [messageId]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      const token = localStorage.getItem("token");

      const messageData = {
        content: newMessage,
        ...(replyingTo ? { replyTo: replyingTo._id } : {}),
      };

      const response = await axios.post(
        `${API_URL}/api/study-groups/${groupId}/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update messages array locally with the new message from the response
      const newMessageData = response.data.data;

      // Add the reply mention at the beginning if replying
      if (replyingTo) {
        // Format the message with an @mention if replying
        const mentionText = `@${replyingTo.sender?.username || "Unknown"} `;
        newMessageData.content = mentionText + newMessageData.content;
        newMessageData.mentionedUser = replyingTo.sender;
        setReplyingTo(null); // Clear reply state
      }

      // Add to messages
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

  const handleAddReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem("token");

      // This would be the actual API call
      // await axios.post(
      //   `${API_URL}/api/study-groups/${groupId}/messages/${messageId}/reactions`,
      //   { emoji },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      // For now, update the UI optimistically
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg._id === messageId) {
            const existingReactions = msg.reactions || [];
            const userReactionIndex = existingReactions.findIndex(
              (r) => r.type === emoji && r.user === currentUser._id
            );

            if (userReactionIndex >= 0) {
              // User already reacted with this emoji, remove it
              const newReactions = [...existingReactions];
              newReactions.splice(userReactionIndex, 1);
              return { ...msg, reactions: newReactions };
            } else {
              // Add new reaction
              return {
                ...msg,
                reactions: [
                  ...existingReactions,
                  { type: emoji, user: currentUser._id },
                ],
              };
            }
          }
          return msg;
        })
      );

      // Hide emoji picker after selecting
      setShowEmojiPicker((prev) => ({ ...prev, [messageId]: false }));
    } catch (error) {
      console.error("Failed to add reaction:", error);
      showToast("Failed to add reaction", "error");
    }
  };

  const handleAddInputEmoji = (emojiData) => {
    // Insert emoji at current cursor position
    const cursorPosition = messageInputRef.current.selectionStart;
    const textBeforeCursor = newMessage.slice(0, cursorPosition);
    const textAfterCursor = newMessage.slice(cursorPosition);
    setNewMessage(textBeforeCursor + emojiData.emoji + textAfterCursor);

    // Set focus back to input field
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        messageInputRef.current.selectionStart =
          cursorPosition + emojiData.emoji.length;
        messageInputRef.current.selectionEnd =
          cursorPosition + emojiData.emoji.length;
      }
    }, 0);
  };

  const handlePinMessage = async (messageId) => {
    try {
      // Check if user is creator before pinning
      if (currentUser._id !== groupCreatorId) {
        showToast("Only the group creator can pin messages", "error");
        return;
      }

      const token = localStorage.getItem("token");

      // This would be the actual API call
      // await axios.post(
      //   `${API_URL}/api/study-groups/${groupId}/messages/${messageId}/pin`,
      //   {},
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      // For now, update the UI optimistically
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
        )
      );
    } catch (error) {
      console.error("Failed to pin message:", error);
      showToast("Failed to pin message", "error");
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();

    if (!pollQuestion.trim() || pollOptions.some((opt) => !opt.trim())) {
      showToast("Please fill out all poll fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // This would be the actual API call to create a poll
      // const response = await axios.post(
      //   `${API_URL}/api/study-groups/${groupId}/polls`,
      //   {
      //     question: pollQuestion,
      //     options: pollOptions.filter(opt => opt.trim())
      //   },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      // Mock response for now
      const newPoll = {
        _id: `poll-${Date.now()}`,
        sender: currentUser,
        content: `Poll: ${pollQuestion}`,
        timestamp: new Date().toISOString(),
        isPoll: true,
        pollData: {
          question: pollQuestion,
          options: pollOptions
            .filter((opt) => opt.trim())
            .map((text) => ({
              text,
              voters: [],
            })),
        },
      };

      // Add the poll to messages
      setMessages((prev) => [...prev, newPoll]);

      // Reset form
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowPollForm(false);
    } catch (error) {
      console.error("Failed to create poll:", error);
      showToast("Failed to create poll", "error");
    }
  };

  const handleVote = async (messageId, optionIndex) => {
    try {
      const token = localStorage.getItem("token");

      // This would be the actual API call
      // await axios.post(
      //   `${API_URL}/api/study-groups/${groupId}/polls/${messageId}/vote`,
      //   { optionIndex },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      // Update UI optimistically
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg._id === messageId && msg.isPoll) {
            const updatedOptions = [...msg.pollData.options];

            // Remove user from any previous votes
            updatedOptions.forEach((option) => {
              const voterIndex = option.voters.indexOf(currentUser._id);
              if (voterIndex !== -1) {
                option.voters.splice(voterIndex, 1);
              }
            });

            // Add user to new vote
            updatedOptions[optionIndex].voters.push(currentUser._id);

            return {
              ...msg,
              pollData: {
                ...msg.pollData,
                options: updatedOptions,
              },
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error("Failed to vote in poll:", error);
      showToast("Failed to vote", "error");
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

  // Group messages with pinned messages at the top
  const groupedMessages = () => {
    const pinned = messages.filter((m) => m.isPinned);
    const regular = messages.filter((m) => !m.isPinned);
    return [...pinned, ...regular];
  };

  const handleMessageHover = (messageId) => {
    setHoveredMessage(messageId);
  };

  const handleMessageLeave = () => {
    setHoveredMessage(null);
  };

  // Function to prepopulate reply with @mention
  const handleReplyClick = (message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  // Function to get message class based on type
  const getMessageClass = (message) => {
    if (message.isSystem) {
      return "bg-gray-100/70 dark:bg-gray-800/40 text-center py-2";
    }
    if (message.isPinned) {
      return "hover:bg-gray-100/80 dark:hover:bg-gray-700/40 rounded-lg px-3 py-3 mb-2 bg-amber-50/60 dark:bg-amber-900/10 border-l-2 border-amber-400 dark:border-amber-500/50";
    }
    return "hover:bg-gray-100/80 dark:hover:bg-gray-700/40 rounded-lg px-3 py-3 mb-2";
  };

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b dark:border-gray-700/40 bg-gray-50/80 dark:bg-gray-700/50">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <MessageSquare
              size={18}
              className="mr-2 text-primary dark:text-primary-light"
            />
            Group Chat
          </h2>
        </div>
      </div>

      {/* Pinned messages indicator */}
      {messages.some((m) => m.isPinned) && (
        <div className="bg-amber-50/80 dark:bg-amber-900/20 p-2 text-sm text-amber-700 dark:text-amber-300 flex items-center">
          <Pin size={14} className="mr-1.5" />
          <span>
            {messages.filter((m) => m.isPinned).length} pinned message
            {messages.filter((m) => m.isPinned).length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Messages area with scrolling */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-gray-50/50 dark:bg-gray-800/30 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {groupedMessages().length > 0 ? (
          groupedMessages().map((message, index) => {
            const isCurrentUser =
              String(message.sender?._id) === String(currentUser?._id);
            const isHovered = hoveredMessage === message._id;
            const isSystemMessage = message.isSystem;
            const messageClasses = getMessageClass(message);

            // Count reactions - Discord style grouping of same emojis
            const reactionCounts = {};
            const userReactedEmojis = {};

            // Process reactions to group by emoji type
            (message.reactions || []).forEach((reaction) => {
              if (!reactionCounts[reaction.type]) {
                reactionCounts[reaction.type] = {
                  count: 0,
                  users: [],
                };
              }

              reactionCounts[reaction.type].count += 1;
              reactionCounts[reaction.type].users.push(reaction.user);

              // Track if current user reacted with this emoji
              if (reaction.user === currentUser._id) {
                userReactedEmojis[reaction.type] = true;
              }
            });

            // For system messages
            if (isSystemMessage) {
              return (
                <div
                  key={message._id || index}
                  className="flex justify-center my-2 text-xs"
                >
                  <div className="py-1 px-3 rounded-full bg-gray-100/80 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 flex items-center">
                    {message.content}
                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                      • {formatDate(message.timestamp)}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message._id || index}
                className={`group relative ${messageClasses} transition-colors`}
                onMouseEnter={() => handleMessageHover(message._id)}
                onMouseLeave={handleMessageLeave}
              >
                <div className="flex items-start">
                  {/* User avatar */}
                  <div className="mr-3 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-light dark:bg-primary flex items-center justify-center text-white shadow-sm">
                      {message.sender?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  </div>

                  {/* Message content and metadata */}
                  <div className="flex-grow overflow-hidden">
                    {/* Username and timestamp */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {message.sender?.username || "Unknown User"}
                        {isCurrentUser && " (You)"}
                      </span>

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(message.timestamp)}
                      </span>

                      {message.isPinned && (
                        <span className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                          <Pin size={12} className="mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Message body */}
                    <div className="mt-0.5">
                      {message.isPoll ? (
                        <div className="poll-container">
                          <div className="text-lg font-medium mb-2">
                            {message.pollData.question}
                          </div>
                          <div className="space-y-2 mt-3">
                            {message.pollData.options.map((option, idx) => {
                              // Calculate percentage
                              const totalVotes =
                                message.pollData.options.reduce(
                                  (sum, opt) => sum + (opt.voters?.length || 0),
                                  0
                                );
                              const voteCount = option.voters?.length || 0;
                              const percentage =
                                totalVotes === 0
                                  ? 0
                                  : Math.round((voteCount / totalVotes) * 100);

                              // Check if current user voted for this option
                              const userVoted = option.voters?.includes(
                                currentUser._id
                              );

                              return (
                                <div key={idx} className="poll-option">
                                  <button
                                    onClick={() => handleVote(message._id, idx)}
                                    className={`w-full p-2 rounded-md text-left relative overflow-hidden transition-all ${
                                      userVoted
                                        ? "border-2 border-primary dark:border-primary-light"
                                        : "border border-gray-300 dark:border-gray-600"
                                    }`}
                                  >
                                    {/* Progress bar background */}
                                    <div
                                      className="absolute inset-0 bg-primary/10 dark:bg-primary/20 z-0 transition-all"
                                      style={{ width: `${percentage}%` }}
                                    ></div>

                                    {/* Option text and vote count */}
                                    <div className="flex justify-between items-center relative z-10">
                                      <span>{option.text}</span>
                                      <span className="text-sm font-medium">
                                        {voteCount}{" "}
                                        {voteCount === 1 ? "vote" : "votes"} (
                                        {percentage}%)
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-xs mt-2 text-right text-gray-500 dark:text-gray-400">
                            Total votes:{" "}
                            {message.pollData.options.reduce(
                              (sum, opt) => sum + (opt.voters?.length || 0),
                              0
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* Check if message has a mentioned user (is a reply) */}
                          {message.mentionedUser || message.replyTo ? (
                            <div className="text-sm mb-1">
                              <span className="text-primary dark:text-primary-light font-medium">
                                {message.content.startsWith("@")
                                  ? message.content.split(" ")[0] // Extract the @mention
                                  : `@${
                                      message.replyTo?.sender?.username ||
                                      "Unknown"
                                    }`}
                              </span>
                              {/* Rest of the message content without the mention */}
                              <span className="text-gray-900 dark:text-gray-100">
                                {message.content.startsWith("@")
                                  ? " " +
                                    message.content
                                      .split(" ")
                                      .slice(1)
                                      .join(" ")
                                  : " " + message.content}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {message.content}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Discord-style reactions with counters */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {/* Show existing reactions */}
                      {Object.entries(reactionCounts).map(([emoji, data]) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(message._id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                            userReactedEmojis[emoji]
                              ? "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-light border border-primary/20 dark:border-primary/30"
                              : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50 hover:bg-gray-200 dark:hover:bg-gray-600/70"
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="font-medium text-xs">
                            {data.count}
                          </span>
                        </button>
                      ))}

                      {/* Add reaction button */}
                      <button
                        onClick={() =>
                          setShowEmojiPicker({
                            ...showEmojiPicker,
                            [message._id]: !showEmojiPicker[message._id],
                          })
                        }
                        className="px-2 py-0.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50 flex items-center hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors"
                      >
                        <AddReaction size={14} className="mr-1" />
                      </button>
                    </div>
                  </div>

                  {/* Message action buttons that appear on hover */}
                  {isHovered && (
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleReplyClick(message)}
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600/70 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Reply"
                      >
                        <Reply size={16} />
                      </button>

                      {/* Only show Pin option to creator */}
                      {currentUser._id === groupCreatorId && (
                        <button
                          onClick={() => handlePinMessage(message._id)}
                          className={`p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors ${
                            message.isPinned
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                          title={
                            message.isPinned ? "Unpin Message" : "Pin Message"
                          }
                        >
                          <Pin size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Emoji picker */}
                {showEmojiPicker[message._id] && (
                  <div
                    ref={(el) => (emojiPickerRefs.current[message._id] = el)}
                    className="mt-1 ml-11 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/80 rounded-lg shadow-lg absolute z-20"
                  >
                    <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-600/80">
                      <div className="text-sm font-medium">Add Reaction</div>
                      <button
                        onClick={() =>
                          setShowEmojiPicker({
                            ...showEmojiPicker,
                            [message._id]: false,
                          })
                        }
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600/70 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() =>
                              handleAddReaction(message._id, emoji)
                            }
                            className="text-lg hover:bg-gray-100 dark:hover:bg-gray-600/70 p-2 rounded-md transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          handleAddReaction(message._id, emojiData.emoji);
                        }}
                        width="100%"
                        height={350}
                        previewConfig={{ showPreview: false }}
                        searchDisabled={false}
                        skinTonesDisabled
                        theme={
                          document.documentElement.classList.contains("dark")
                            ? "dark"
                            : "light"
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center p-6 bg-white/80 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-600/50 shadow-sm">
              <MessageSquare
                size={40}
                className="mx-auto mb-3 text-gray-400 dark:text-gray-500"
              />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                No messages yet
              </p>
              <p className="text-sm">Start the conversation with this group!</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="bg-gray-100/90 dark:bg-gray-700/90 p-2 flex items-center justify-between border-t dark:border-gray-600/50">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Reply size={14} className="mr-1.5" />
            <span>
              Replying to <b>{replyingTo.sender?.username}</b>
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t dark:border-gray-700/40 bg-white/90 dark:bg-gray-800/90">
        {showPollForm ? (
          <form onSubmit={handleCreatePoll} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Poll Question
              </label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600/70 dark:bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900 dark:text-gray-100 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Options
              </label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-grow px-3 py-2.5 border border-gray-300 dark:border-gray-600/70 dark:bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900 dark:text-gray-100 transition-colors"
                    required
                  />
                  {index > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...pollOptions];
                        newOptions.splice(index, 1);
                        setPollOptions(newOptions);
                      }}
                      className="ml-2 p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              {pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-sm text-primary dark:text-primary-light flex items-center mt-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <PlusCircle size={14} className="mr-1.5" />
                  Add Option
                </button>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700/40">
              <button
                type="button"
                onClick={() => {
                  setShowPollForm(false);
                  setPollQuestion("");
                  setPollOptions(["", ""]);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600/70 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm transition-colors"
              >
                Create Poll
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendMessage} className="flex flex-col">
            <div className="relative">
              {showEmojiPickerForInput && (
                <div className="absolute bottom-full mb-2 right-0 z-10">
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/80 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-600/80">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Choose an emoji
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPickerForInput(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600/70 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <EmojiPicker
                      onEmojiClick={handleAddInputEmoji}
                      width={300}
                      height={400}
                      previewConfig={{ showPreview: false }}
                      searchDisabled={false}
                      skinTonesDisabled
                      theme={
                        document.documentElement.classList.contains("dark")
                          ? "dark"
                          : "light"
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 mb-2">
                {/* Poll button */}
                <button
                  type="button"
                  onClick={() => setShowPollForm(true)}
                  className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  title="Create Poll"
                >
                  <BarChart2 size={20} />
                </button>

                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPickerForInput(!showEmojiPickerForInput)
                  }
                  className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  title="Add Emoji"
                >
                  <Smile size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-grow relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      replyingTo
                        ? `Reply to ${replyingTo.sender?.username}...`
                        : "Type a message..."
                    }
                    className={`w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600/70 dark:bg-gray-700/50 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-colors ${
                      replyingTo ? "pl-8" : "pl-4" // Add padding-left when replying to make space for the @ icon
                    }`}
                    disabled={isSendingMessage}
                  />
                  {replyingTo && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary dark:text-primary-light">
                      <AtSign size={16} />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSendingMessage || !newMessage.trim()}
                  className={`p-2.5 rounded-full ${
                    isSendingMessage || !newMessage.trim()
                      ? "bg-gray-200 text-gray-400 dark:bg-gray-700/70 dark:text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary-dark shadow-sm"
                  } transition-colors`}
                >
                  {isSendingMessage ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
