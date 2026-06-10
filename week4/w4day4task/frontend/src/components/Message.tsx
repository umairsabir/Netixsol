import React from "react";
import "./Message.css";
import type { Message as MessageType } from "../store/chatApi";

interface Props {
  message: MessageType;
  isSelf: boolean;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MessageBubble: React.FC<Props> = ({ message, isSelf }) => {
  return (
    <div className={`msg-wrapper ${isSelf ? "msg-wrapper--self" : "msg-wrapper--other"}`}>
      {!isSelf && (
        <div className="msg-avatar">
          {message.username[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="msg-content">
        {!isSelf && <span className="msg-author">{message.username}</span>}
        <div className={`msg-bubble ${isSelf ? "msg-bubble--self" : "msg-bubble--other"}`}>
          <p className="msg-text">{message.text}</p>
        </div>
        <span className="msg-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
