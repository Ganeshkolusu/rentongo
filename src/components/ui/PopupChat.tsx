import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import io, { Socket } from "socket.io-client";
import { Send, X, Minimize2, Image } from "lucide-react";
import { ApiService, ChatMessage } from "../../services/api.service";
import CallPanel from "./call";

interface PopupChatProps {
  isOpen: boolean;
  onClose: () => void;
  pageRole: "ownerView" | "customerView";
  currentUserId: string;
  currentUserName?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  bookingId: string;
  vehicleId?: string;
  apiUrl: string;
  socketUrl?: string;
  useRealtime?: boolean;
}

const PopupChat: React.FC<PopupChatProps> = ({
  isOpen,
  onClose,
  pageRole,
  currentUserId,
  currentUserName,
  ownerId,
  ownerName,
  ownerAvatar,
  customerId,
  customerName,
  customerAvatar,
  bookingId,
  vehicleId,
  apiUrl,
  socketUrl,
  useRealtime = true,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const isOwner = currentUserId === ownerId;
  const otherUserId = isOwner ? customerId : ownerId;
  const otherUserName = isOwner ? customerName : ownerName;
  const otherUserAvatar = isOwner ? customerAvatar : ownerAvatar;
  const myAvatar = isOwner ? ownerAvatar : customerAvatar;

  const defaultOtherAvatar =
    otherUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserName}`;
  const defaultMyAvatar =
    myAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserName || "You"}`;

  // Debug logging
  useEffect(() => {
    if (isOpen && useRealtime) {
      console.log("🔍 ========= POPUP CHAT INITIALIZED =========");
      console.log("📄 Page Role:", pageRole);
      console.log("👤 Current User ID:", currentUserId);
      console.log("🎭 Is Owner?:", isOwner);
      console.log("🏢 Owner ID:", ownerId, "| Name:", ownerName);
      console.log("👥 Customer ID:", customerId, "| Name:", customerName);
      console.log("💬 Other User ID:", otherUserId, "| Name:", otherUserName);
      console.log("💬 Booking ID:", bookingId);
      console.log("🚗 Vehicle ID:", vehicleId);
      console.log("===========================================");
    }
  }, [isOpen, pageRole, currentUserId, ownerId, customerId, bookingId, vehicleId, useRealtime, isOwner, otherUserId, otherUserName, ownerName, customerName]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ COMBINED: Fetch messages + Initialize Socket.IO (fixes race condition)
  useEffect(() => {
    if (!isOpen) return;

    let socket: Socket | null = null;
    let isMounted = true;

    const initialize = async () => {
      // 1️⃣ FIRST: Fetch existing messages
      try {
        setIsLoading(true);
        console.log("📥 Fetching messages for bookingId:", bookingId);
        const api = new ApiService(apiUrl);
        const data = await api.getMessages(bookingId);

        if (isMounted) {
          console.log(`✅ Loaded ${data.length} messages`);
          setMessages(data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch messages:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // 2️⃣ THEN: Connect Socket.IO (if realtime is enabled)
      if (!useRealtime || !isMounted) return;

      try {
        const connectionUrl = socketUrl || apiUrl;
        console.log("🔌 Connecting to Socket.IO...", connectionUrl);

        socket = io(connectionUrl, {
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          auth: { userId: currentUserId },
          
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("✅ Socket connected, ID:", socket?.id);
          if (isMounted) {
            setIsConnected(true);
          }

          // Join room with userId
          socket?.emit("join", currentUserId);
          console.log("👋 Joined room with userId:", currentUserId);
        });

        socket.on("disconnect", () => {
          console.log("❌ Socket disconnected");
          if (isMounted) {
            setIsConnected(false);
          }
        });

        // ✅ IMPROVED: Listen for incoming messages with deduplication
        socket.on("receiveMessage", (msg: ChatMessage) => {
          console.log("📨 Received message via Socket:", msg);

          if (!isMounted) return;

          setMessages((prev) => {
            // Check for duplicates by _id or by content+timestamp
            const exists = prev.some(m => {
              if (m._id && msg._id && m._id === msg._id) return true;

              // Fallback: check if same message from same sender within 1 second
              if (m.message === msg.message && m.senderId === msg.senderId) {
                const timeDiff = Math.abs(
                  new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()
                );
                return timeDiff < 1000;
              }

              return false;
            });

            if (exists) {
              console.log("⚠️ Duplicate message ignored");
              return prev;
            }

            console.log("✅ New message added to state");
            return [...prev, msg];
          });
        });

        socket.on("error", (error: any) => {
          console.error("❌ Socket error:", error);
        });

      } catch (err) {
        console.error("❌ Socket connection error:", err);
      }
    };

    initialize();

    // ✅ CLEANUP
    return () => {
      isMounted = false;

      if (socket) {
        console.log("🔌 Disconnecting socket...");
        socket.disconnect();
        socket = null;
      }

      if (socketRef.current) {
        socketRef.current = null;
      }

      setIsConnected(false);
    };
  }, [isOpen, bookingId, apiUrl, socketUrl, useRealtime, currentUserId]);

  // Handle file input
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      console.log("📸 Selected files:", selectedFiles.map(f => f.name));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ IMPROVED: Send message with better error handling
  const handleSendMessage = async () => {
    if (!inputValue.trim() && files.length === 0) {
      console.warn("⚠️ Empty message, not sending");
      return;
    }

    if (!currentUserId || !otherUserId || !bookingId) {
      console.error("❌ Missing required IDs:", { currentUserId, otherUserId, bookingId });
      alert("Error: Cannot send message. Missing user or booking information.");
      return;
    }

    console.log("📤 ========= SENDING MESSAGE =========");
    console.log("  Message:", inputValue);
    console.log("  From (senderId):", currentUserId);
    console.log("  To (receiverId):", otherUserId);
    console.log("  Booking ID:", bookingId);
    console.log("  Files:", files.length);
    console.log("=====================================");

    // Optimistic UI update
    const optimisticMessage: ChatMessage = {
      _id: `temp-${Date.now()}-${Math.random()}`,
      senderId: currentUserId,
      receiverId: otherUserId,
      message: inputValue,
      files: files.map(f => URL.createObjectURL(f)),
      timestamp: new Date().toISOString(),
      seen: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const messageToSend = inputValue;
    const filesToSend = [...files];

    setInputValue("");
    setFiles([]);

    try {
      // Persist via REST API. The backend's sendMessage handler already
      // broadcasts "receiveMessage" to the receiver over the socket as part
      // of this call, so also emitting "sendMessage" here would save the
      // same message twice (both paths call the same backend function).
      console.log("📦 Sending to /sendMessage endpoint");
      const api = new ApiService(apiUrl);
      const sentMessage = await api.sendMessage(
        bookingId,
        currentUserId,
        otherUserId,
        messageToSend,
        filesToSend
      );

      console.log("✅ Message saved to database:", sentMessage);

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMessage._id ? sentMessage : m))
      );

    } catch (err: any) {
      console.error("❌ Failed to send message:", err);

      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));

      alert(`Failed to send message: ${err.message || 'Unknown error'}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isMyMessage = (msg: ChatMessage): boolean => {
    const senderId = typeof msg.senderId === "string"
      ? msg.senderId
      : (msg.senderId as any)?._id;

    return senderId === currentUserId;
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Chat Window */}
      <div
        className={`fixed right-6 bottom-6 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? "h-16" : "h-[70vh] sm:h-[75vh] md:h-[600px] lg:h-[500px] xl:h-[400px]"}`}
        style={{ width: "95vw", maxWidth: 400, minWidth: 280 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
          <img
            src={defaultOtherAvatar}
            alt={otherUserName}
            className="w-10 h-10 rounded-full ring-2 ring-blue-100"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
            <p className="text-xs flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${useRealtime
                  ? isConnected
                    ? "bg-green-500"
                    : "bg-gray-400"
                  : "bg-blue-500"
                  }`}
              ></span>
              <span
                className={
                  useRealtime
                    ? isConnected
                      ? "text-green-600"
                      : "text-gray-500"
                    : "text-blue-600"
                }
              >
                {useRealtime
                  ? isConnected
                    ? "Online"
                    : "Connecting..."
                  : "Chat Mode"}
              </span>
            </p>
          </div>
          <CallPanel
            isOpen={isOpen}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={defaultMyAvatar}
            otherUserId={otherUserId}
            otherUserName={otherUserName}
            otherUserAvatar={defaultOtherAvatar}
          />
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const mine = isMyMessage(msg);
                  return (
                    <div 
                      key={msg._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[75%] ${mine ? "flex-row-reverse" : "flex-row"
                          }`}
                      >
                        <img
                          src={mine ? defaultMyAvatar : defaultOtherAvatar}
                          alt={mine ? "You" : otherUserName}
                          className="w-7 h-7 rounded-full flex-shrink-0 self-end"
                        />
                        <div
                          className={`flex flex-col ${mine ? "items-end" : "items-start"
                            }`}
                        >
                          {!mine && (
                            <p className="text-xs text-gray-600 mb-1 px-2">
                              {otherUserName}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm ${mine
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                              : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                              }`}
                          >
                            {msg.message && (
                              <p className="text-sm break-words whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            )}
                            {msg.files &&
                              msg.files.map((file, i) => (
                                <img
                                  key={i}
                                  src={file}
                                  alt="attachment"
                                  className={`max-w-full h-auto rounded-lg max-h-64 cursor-pointer ${msg.message ? "mt-2" : ""
                                    }`}
                                  onClick={() => window.open(file, "_blank")}
                                  onError={(e) =>
                                    (e.currentTarget.style.display = "none")
                                  }
                                />
                              ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 px-2">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
              {files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all shadow-sm hover:shadow-md flex-shrink-0"
                  aria-label="Attach image"
                >
                  <Image className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write your message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && files.length === 0}
                  className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PopupChat;