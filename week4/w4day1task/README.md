# TypeScript Full-Stack Todo App

A premium, responsive Todo application built with React, Express, and TypeScript.

## 🚀 Features

- **Backend (Express + TS)**:
  - Strongly typed API with `Task` interface.
  - In-memory data storage.
  - CRUD operations (GET, POST, PUT, DELETE).
  - CORS enabled for frontend connection.

- **Frontend (React + TS)**:
  - Clean, modern UI with a Dark/Slate aesthetic.
  - Fully responsive design (mobile-friendly).
  - Real-time stats (Completed vs Pending).
  - Validation for task titles.
  - Axios for API communication.
  - Lucide-React icons for a premium feel.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Axios, Lucide-React, Vanilla CSS.
- **Backend**: Node.js, Express, TypeScript, ts-node-dev.
- **Management**: Concurrently (to run both at once).

## 🏃 How to Run

1. **Install Dependencies** (if not already done):
   ```bash
   npm run install-all
   ```

2. **Start the Application**:
   ```bash
   npm run dev
   ```
   - Frontend will run at: `http://localhost:5173`
   - Backend will run at: `http://localhost:5000`

## 📁 Project Structure

```
.
├── client/          # React Frontend
│   ├── src/
│   │   ├── App.tsx  # Main Logic
│   │   └── index.css # Premium Styles
├── server/          # Express Backend
│   ├── src/
│   │   └── index.ts # API Implementation
└── package.json     # Root scripts
```
