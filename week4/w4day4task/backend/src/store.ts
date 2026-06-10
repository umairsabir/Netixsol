import { Room, Message } from "./types";

export const rooms: Room[] = [
  {
    id: "general",
    name: "General",
    description: "Talk about anything and everything",
    icon: "💬",
  },
  {
    id: "tech",
    name: "Tech Talk",
    description: "Discuss the latest in technology",
    icon: "⚡",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "All things gaming",
    icon: "🎮",
  },
  {
    id: "music",
    name: "Music",
    description: "Share your favorite tunes",
    icon: "🎵",
  },
];

const createWelcomeMessage = (roomId: string): Message => ({
  id: `welcome-${roomId}`,
  roomId,
  username: "Alice",
  text: "Hey everyone! Welcome to the chat 👋",
  timestamp: new Date().toISOString(),
});

// roomId -> Message[]
export const messages: Map<string, Message[]> = new Map([
  ["general", [createWelcomeMessage("general")]],
  [
    "tech",
    [
      createWelcomeMessage("tech"),
    ],
  ],
  ["gaming", [createWelcomeMessage("gaming")]],
  ["music", [createWelcomeMessage("music")]],

]);
