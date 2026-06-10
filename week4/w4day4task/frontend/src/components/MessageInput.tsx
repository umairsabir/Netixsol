import React, { useState, type KeyboardEvent } from "react";
import "./MessageInput.css";
import { useAppSelector } from "../hooks";
import { getAbly } from "../socket/ably";
import { useSendMessageMutation, useGetRoomsQuery } from "../store/chatApi";


const MessageInput: React.FC = () => {
  const { currentRoomId, username } = useAppSelector((s) => s.chat);
  const { data: rooms } = useGetRoomsQuery();
  const [text, setText] = useState("");
  const [sendMessage] = useSendMessageMutation();

  const currentRoom = rooms?.find((r) => r.id === currentRoomId);


  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!currentRoomId || !username) return;
    try {
      const chatClient = getAbly();
      const room = await chatClient.rooms.get(currentRoomId);
      
      if (e.target.value === "") {
        room.typing.stop();
      } else {
        room.typing.keystroke();
      }
    } catch(e) { /* ignore */ }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !currentRoomId || !username) return;

    try {
      const chatClient = getAbly();
      const room = await chatClient.rooms.get(currentRoomId);
      const sentMsgEvent = await room.messages.send({ text: trimmed });
      room.typing.stop();
      setText("");
      
      // Update backend mock store so history fetching is accurate
      sendMessage({
        id: sentMsgEvent.serial,
        roomId: currentRoomId,
        username,
        text: trimmed,
        timestamp: new Date().toISOString()
      });
    } catch(e) { console.error("Failed to send msg:", e); }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-bar">
      <input
        className="input-field"
        type="text"
        placeholder={
          currentRoom
            ? `Message ${currentRoom.name}...`
            : "Select a room to chat"
        }

        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={!currentRoomId}
        maxLength={500}
      />
      <button
        className="input-send"
        onClick={handleSend}
        disabled={!text.trim() || !currentRoomId}
        title="Send message (Enter)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;
