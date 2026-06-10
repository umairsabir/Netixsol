import React from "react";
import "./RoomList.css";
import { useGetRoomsQuery } from "../store/chatApi";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setCurrentRoom, clearLiveMessages, toggleTheme } from "../store/chatSlice";

interface RoomListProps {
  isOpen: boolean;
  onToggle: () => void;
}

const RoomList: React.FC<RoomListProps> = ({ isOpen, onToggle }) => {
  const dispatch = useAppDispatch();
  const { currentRoomId, username, theme } = useAppSelector((s) => s.chat);
  const { data: rooms, isLoading, isError } = useGetRoomsQuery();

  const handleRoomClick = (roomId: string) => {
    if (roomId === currentRoomId) return;
    dispatch(clearLiveMessages(currentRoomId ?? ""));
    dispatch(setCurrentRoom(roomId));
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      {/* Mobile close button */}
      <button className="sidebar-close-btn" onClick={onToggle}>
        ✕
      </button>

      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">💬</div>
        <div style={{ flex: 1 }}>
          <h2 className="sidebar-title">Chat App</h2>
          <p className="sidebar-subtitle">Real-time rooms</p>
        </div>
        <button 
          className="theme-toggle-sidebar" 
          onClick={() => dispatch(toggleTheme())}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      {/* User badge */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {username ? username[0].toUpperCase() : "?"}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-username">{username || "Anonymous"}</span>
          <span className="sidebar-status">
            <span className="sidebar-dot" />
            Online
          </span>
        </div>
      </div>

      <p className="sidebar-label">CHANNELS</p>

      {/* Room list from RTK Query */}
      <nav className="sidebar-rooms">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="room-skeleton" />
          ))}
        {isError && (
          <p className="sidebar-error">Failed to load rooms. Is the backend running?</p>
        )}
        {rooms?.map((room) => (
          <button
            key={room.id}
            className={`room-item ${currentRoomId === room.id ? "room-item--active" : ""}`}
            onClick={() => handleRoomClick(room.id)}
            title={room.description}
          >
            <span className="room-icon">{room.icon}</span>
            <div className="room-info">
              <span className="room-name">{room.name}</span>
              <span className="room-desc">{room.description}</span>
            </div>
            {currentRoomId === room.id && <span className="room-active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>RTK Query + Ably Realtime</span>
      </div>
    </aside>
  );
};

export default RoomList;
