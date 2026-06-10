import React, { useEffect, useRef } from "react";
import "./ChatWindow.css";
import { useGetMessagesQuery, type Message } from "../store/chatApi";
import { useAppSelector } from "../hooks";
import MessageBubble from "./Message";
import MessageInput from "./MessageInput";

const TypingIndicator: React.FC<{ users: string[] }> = ({ users }) => {
  if (users.length === 0) return null;
  const label =
    users.length === 1
      ? `${users[0]} is typing`
      : `${users.slice(0, 2).join(", ")} are typing`;
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span />
        <span />
        <span />
      </div>
      <span className="typing-label">{label}...</span>
    </div>
  );
};

const ChatWindow: React.FC = () => {
  const { currentRoomId, liveMessages, typingUsers, username } = useAppSelector(
    (s) => s.chat
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data: historyMessages,
    isLoading,
    isFetching,
  } = useGetMessagesQuery(currentRoomId ?? "", { skip: !currentRoomId });

  // Combine history (from RTK Query) + live messages (from socket)
  const liveForRoom = liveMessages[currentRoomId ?? ""] ?? [];
  const historyIds = new Set((historyMessages ?? []).map((m: Message) => m.id));
  const uniqueLive = liveForRoom.filter((m) => !historyIds.has(m.id));
  const allMessagesRaw: Message[] = [...(historyMessages ?? []), ...uniqueLive];

  // Hide Alice's welcome message if there are other "real" messages
  const hasRealMessages = allMessagesRaw.some((m) => !m.id.startsWith("welcome-"));
  const allMessages = hasRealMessages
    ? allMessagesRaw.filter((m) => !m.id.startsWith("welcome-"))
    : allMessagesRaw;

  const typingForRoom = typingUsers[currentRoomId ?? ""] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, typingForRoom]);

  if (!currentRoomId) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">💬</div>
        <h2 className="chat-empty-title">Welcome to Chat App</h2>
        <p className="chat-empty-sub">Select a channel from the sidebar to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Messages */}
      <div className="chat-messages">
        {(isLoading || isFetching) && allMessages.length === 0 && (
          <div className="messages-loading">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`msg-skeleton ${i % 2 === 0 ? "msg-skeleton--left" : "msg-skeleton--right"}`}
              />
            ))}
          </div>
        )}

        {allMessages.length === 0 && !isLoading && !isFetching && (
          <div className="no-messages">
            <span>🌟</span>
            <p>No messages yet. Be the first to say something!</p>
          </div>
        )}

        {allMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isSelf={msg.username === username}
          />
        ))}

        <TypingIndicator users={typingForRoom} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow;
