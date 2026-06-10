# Project Documentation: TypeScript Full-Stack Todo App

## 📝 Overview
This project is a high-performance, full-stack Task Management application built to demonstrate the power of **TypeScript** in both Frontend (React) and Backend (Express) environments. It features a premium "Midnight" UI, real-time statistics, and persistent data storage.

---

## 🛠️ Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Axios, Lucide-React, Vanilla CSS |
| **Backend** | Node.js, Express, TypeScript, File System (FS) |
| **Persistence** | `tasks.json` (Server-side) & `localStorage` (Client-side) |
| **Dev Tools** | Concurrently, ts-node-dev |

---

## ✨ Features

### 1. Advanced Task Management
- **Add Tasks**: Strongly typed input with validation.
- **Categorization**: Tasks are organized into lists (Personal, Work, Shopping, etc.).
- **Filtering**: View tasks specifically by the active category.
- **Toggle Status**: Instantly mark tasks as complete or pending.

### 2. Multi-List Support (Sidebar)
- **Create Lists**: Add custom lists via the sidebar with a premium inline input.
- **Delete Lists**: Remove custom lists (default lists are protected).
- **Persistence**: Lists are saved in the browser's `localStorage`.

### 3. Real-Time Dashboard
- **Stats Grid**: View total Completed vs. Pending tasks.
- **Progress Bar**: A dynamic progress bar showing the completion percentage of the active list.
- **Animated Indicators**: Custom orbital spinners for "Pending" tasks and pulse effects.

### 4. Data Persistence
- **JSON File Storage**: Tasks are saved to `server/src/tasks.json`, ensuring data is preserved even if the server restarts.
- **No-Database Approach**: Efficient file-based storage for lightweight deployment.

---

## 📁 Project Structure
```text
.
├── client/                 # React Frontend
│   ├── src/
│   │   ├── App.tsx         # Main Logic & State Management
│   │   └── index.css       # Premium Design System
├── server/                 # Express Backend
│   ├── src/
│   │   ├── index.ts        # API Implementation
│   │   └── tasks.json      # Persistent Data Store
└── package.json            # Root configuration
```

---

## 🌐 API Documentation
The backend exposes a RESTful API at `http://localhost:5000/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/tasks` | Returns all tasks. |
| **POST** | `/tasks` | Adds a new task (Requires `title` and `category`). |
| **PUT** | `/tasks/:id` | Updates task title, completion, or category. |
| **DELETE** | `/tasks/:id` | Deletes a task by ID. |

---

## 🎨 UI & UX Design
- **Theme**: Premium Dark/Slate aesthetic with purple primary accents.
- **Responsiveness**: Fully optimized for Desktop and Tablet views.
- **Animations**: CSS transitions for hover effects, list additions, and progress bars.
- **Icons**: Intuitive Lucide-React icon set.

---

## 📈 Learning Outcomes Fulfuilled
- [x] **Strong Typing**: 100% TypeScript coverage in both frontend and backend.
- [x] **State Management**: Complex React state using `useState` and `useEffect`.
- [x] **API Integration**: Seamless Axios connection with error handling.
- [x] **Input Validation**: Double-layered validation (Client + Server).
