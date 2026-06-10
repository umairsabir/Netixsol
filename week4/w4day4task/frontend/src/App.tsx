import { useEffect, useState } from "react";
import "./App.css";
import RoomList from "./components/RoomList";
import ChatWindow from "./components/ChatWindow";
import ChatHeader from "./components/ChatHeader";
import UsernameModal from "./components/UsernameModal";
import { useAppDispatch, useAppSelector } from "./hooks";
import { addLiveMessage, setTypingUsers } from "./store/chatSlice";
import { initAbly, getAbly } from "./socket/ably";
import type { Message } from "./store/chatApi";
import type { ChatMessageEvent, TypingSetEvent } from "@ably/chat";

function App() {
  const dispatch = useAppDispatch();
  const { username, currentRoomId, theme } = useAppSelector((s) => s.chat);
  const [showModal, setShowModal] = useState(!username);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!currentRoomId);

  // Auto-close sidebar on mobile when a room is selected
  useEffect(() => {
    if (currentRoomId && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [currentRoomId]);

  // Sync theme with document element for global styles
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (username) {
      initAbly(username);
    }
  }, [username]);

  useEffect(() => {
    if (!currentRoomId || !username) return;

    let cleanup: (() => void) | undefined;

    const setupRoom = async () => {
      try {
        const chatClient = getAbly();
        const room = await chatClient.rooms.get(currentRoomId);
        await room.attach();

      // Subscribe to messages
      const { unsubscribe: unsubMsgs } = room.messages.subscribe((event: ChatMessageEvent) => {
        const msg: Message = {
          id: event.message.serial,
          roomId: currentRoomId,
          username: event.message.clientId,
          text: event.message.text,
          timestamp: new Date(event.message.timestamp).toISOString(),
        };
        dispatch(addLiveMessage(msg));
      });

      // Subscribe to typing indicators
      const { unsubscribe: unsubTyping } = room.typing.subscribe((event: TypingSetEvent) => {
        const typingArray = Array.from(event.currentlyTyping).map(String);
        // Filter out our own username
        const othersTyping = typingArray.filter((u) => u !== username);
        dispatch(setTypingUsers({ roomId: currentRoomId, users: othersTyping }));
      });

      cleanup = () => {
        unsubMsgs();
        unsubTyping();
      };
      } catch (e) {
        console.error("Failed to setup Ably for room:", e);
      }
    };

    setupRoom();
    return () => cleanup?.();
  }, [currentRoomId, username, dispatch]);

  return (
    <div className="app" data-theme={theme}>
      {showModal && <UsernameModal onSubmit={() => setShowModal(false)} />}
      <RoomList isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="main-area">
        <ChatHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;
