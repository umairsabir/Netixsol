# Project Documentation: Real-time Chat Application

This project is a modern, real-time chat application built using a **MERN-like architecture** (using an in-memory store for messages) and **Ably** for high-performance real-time communication.

---

## 1. System Architecture
The application follows a **Client-Server-Realtime** model:
- **Client (Frontend)**: Handles UI/UX and user interactions.
- **Server (Backend)**: Handles authentication, room management, and message history.
- **Ably**: Acts as the real-time message broker for instant delivery and features like typing indicators.

---

## 2. Technology Stack

### Frontend (`/frontend`)
- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Real-time Engine**: `@ably/chat` SDK
- **Styling**: Vanilla CSS with a dynamic Theme System
- **HTTP Client**: Redux Toolkit Query

### Backend (`/backend`)
- **Framework**: [Express.js](https://expressjs.com/) (Node.js)
- **Language**: TypeScript
- **Real-time SDK**: `ably` (standard realtime SDK for token generation)
- **Environment Management**: `dotenv`

---

## 3. Core Features & Implementation

| Feature | Implementation Detail |
| :--- | :--- |
| **Real-time Messaging** | Uses Ably Channels. When a user sends a message, it's published to a room-specific channel and received instantly by others. |
| **Typing Indicators** | Powered by Ably's Presence/Typing feature. It tracks which users are currently active in a channel's typing set. |
| **Room Management** | Users can switch between predefined rooms (General, Tech, Gaming, Music). Each room has its own message history. |
| **Persistence** | The `username` and `theme` are persisted in the browser's `localStorage` so they remain after a page refresh. |
| **Authentication** | The backend provides a `/api/ably-auth` endpoint that generates Ably Token Requests, ensuring the frontend never exposes the secret API key. |

---

## 4. Directory Structure & Key Files

### Backend
- `src/index.ts`: Entry point. Configures Express, CORS, and the Ably Auth endpoint.
- `src/store.ts`: In-memory Database for rooms and message history.
- `src/routes/`: API routes for fetching/posting messages and rooms.

### Frontend
- `src/App.tsx`: Main component. Initializes Ably and manages room subscriptions.
- `src/store/chatSlice.ts`: Manages global UI state (active room, typing users, theme).
- `src/socket/ably.ts`: Singleton instance of the Ably Chat client.
- `src/components/`: 
    - `RoomList.tsx`: Sidebar for switching channels.
    - `ChatWindow.tsx`: Message display and input field.
    - `ChatHeader.tsx`: Room info and theme toggle.

---

## 5. Data Flow (Message Life Cycle)
1. **User Action**: User types a message and hits Enter.
2. **Persistence**: The message is sent to the **Backend API** (`POST /api/messages/:roomId`) to be saved.
3. **Broadcasting**: Simultaneously, the message is published via **Ably Chat SDK** to the specific room channel.
4. **Synchronization**: All users subscribed to that channel receive the message via a WebSocket event and update their Redux store.

---

## 6. Setup & Configuration
- **Ably**: Requires an `ABLY_API_KEY` in the backend `.env` file.
- **API URL**: Frontend uses `VITE_API_URL` to connect to the backend server.
