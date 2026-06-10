import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "./chatApi";

interface ChatState {
  currentRoomId: string | null;
  username: string;
  theme: "light" | "dark";
  liveMessages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
}

const initialState: ChatState = {
  currentRoomId: null,
  username: localStorage.getItem("chat-username") ?? "",
  theme: (localStorage.getItem("chat-theme") as "light" | "dark") ?? "dark",
  liveMessages: {},
  typingUsers: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoom(state, action: PayloadAction<string>) {
      state.currentRoomId = action.payload;
    },
    setUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
      localStorage.setItem("chat-username", action.payload);
    },
    addLiveMessage(state, action: PayloadAction<Message>) {
      const { roomId } = action.payload;
      if (!state.liveMessages[roomId]) {
        state.liveMessages[roomId] = [];
      }
      // Avoid duplicates
      const exists = state.liveMessages[roomId].some(
        (m) => m.id === action.payload.id
      );
      if (!exists) {
        state.liveMessages[roomId].push(action.payload);
      }
    },
    clearLiveMessages(state, action: PayloadAction<string>) {
      state.liveMessages[action.payload] = [];
    },
    addTypingUser(state, action: PayloadAction<{ roomId: string; username: string }>) {
      const { roomId, username } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      if (!state.typingUsers[roomId].includes(username)) {
        state.typingUsers[roomId].push(username);
      }
    },
    removeTypingUser(state, action: PayloadAction<{ roomId: string; username: string }>) {
      const { roomId, username } = action.payload;
      if (state.typingUsers[roomId]) {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(
          (u) => u !== username
        );
      }
    },
    setTypingUsers(state, action: PayloadAction<{ roomId: string; users: string[] }>) {
      const { roomId, users } = action.payload;
      state.typingUsers[roomId] = users;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("chat-theme", state.theme);
    },
  },
});

export const {
  setCurrentRoom,
  setUsername,
  addLiveMessage,
  clearLiveMessages,
  addTypingUser,
  removeTypingUser,
  setTypingUsers,
  toggleTheme,
} = chatSlice.actions;
export default chatSlice.reducer;
