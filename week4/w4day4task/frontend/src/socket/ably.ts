import * as Ably from "ably";
import { ChatClient } from "@ably/chat";

let chatClientInstance: ChatClient | null = null;

export const initAbly = (username: string) => {
  if (chatClientInstance) return chatClientInstance;

  const realtime = new Ably.Realtime({
    authUrl: `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/ably-auth?clientId=${encodeURIComponent(username)}`,
    autoConnect: true,
  });

  chatClientInstance = new ChatClient(realtime);
  return chatClientInstance;
};

export const getAbly = () => {
  if (!chatClientInstance) throw new Error("Ably not initialized. Call initAbly first.");
  return chatClientInstance;
};

export default getAbly;
