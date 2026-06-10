export interface Room {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Message {
  id: string;
  roomId: string;
  username: string;
  text: string;
  timestamp: string;
}
