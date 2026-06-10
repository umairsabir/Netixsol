# 🚀 Task Manager API (v2) - Professional Documentation

Welcome to the comprehensive guide for the **Task Manager API (v2)**. This project is a production-ready backend application built with **Node.js, Express, and MongoDB**. It features secure authentication, data validation, and automated API documentation.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [Core Features Deep Dive](#-core-features-deep-dive)
    * [Database Integration](#1-database-integration-mongoose)
    * [Secure Authentication (JWT)](#2-secure-authentication-jwt--bcrypt)
    * [Request Validation](#3-request-validation)
    * [API Documentation (Swagger)](#4-api-documentation-swagger)
5. [Installation & Setup](#-installation--setup)
6. [Presentation & Testing Guide](#-presentation--testing-guide)

---

## 🌟 Project Overview
This API allows users to manage their personal tasks securely. Unlike basic CRUD apps, this version ensures that:
*   **Data is Persistent**: Stored in a cloud-based MongoDB database.
*   **Access is Private**: Users can only see and edit their own tasks.
*   **Input is Clean**: All incoming data is validated before touching the database.
*   **Documentation is Live**: Developers can test every route through a professional UI.

---

## 🛠️ Tech Stack
*   **Runtime**: Node.js
*   **Framework**: Express.js (Fast, unopinionated, minimalist)
*   **Database**: MongoDB Atlas (Cloud Database)
*   **ORM**: Mongoose (Elegant MongoDB object modeling)
*   **Auth**: JSON Web Tokens (JWT) & BcryptJS (Password hashing)
*   **Validation**: Express-Validator (Middleware-based validation)
*   **Docs**: Swagger (OpenAPI 3.0)

---

## 📂 Architecture & Folder Structure
We followed the **Controller-Service-Route** pattern to ensure the code is scalable and maintainable.

```text
src/
├── config/         # Database connection logic (Mongoose setup)
├── controllers/    # Business logic (handling requests and responses)
├── docs/           # Swagger UI configuration and instructions
├── middleware/     # Security (JWT) and Validation logic
├── models/         # Mongoose Schemas (User & Task blueprints)
├── routes/         # API Endpoints (linking URLs to controllers)
server.js           # Main Entry Point (integrating everything)
.env                # Secure Environment variables
```

---

## 🔍 Core Features Deep Dive

### 1. Database Integration (Mongoose)
We use **Mongoose** to define strict schemas for our data.
*   **Users**: Stores Name, Email, and Hashed Passwords.
*   **Tasks**: Stores Title, Description, Status, and a `Reference` to the User ID who created it.

### 2. Secure Authentication (JWT + Bcrypt)
*   **BcryptJS**: When a user registers, we never store the plain text password. We "hash" it so even if the DB is compromised, passwords stay safe.
*   **JWT**: After login, the server sends a digital "ticket" (Token). The user must send this ticket in the header of every request to prove who they are.

### 3. Request Validation
Using `express-validator`, we catch errors before they happen:
*   Email must be a real email format.
*   Passwords must be at least 6 characters.
*   Task titles cannot be empty.

### 4. API Documentation (Swagger)
We integrated **Swagger UI** with custom CSS for a premium look. This allows front-end developers to see exactly what data the API needs and what it returns.

---

## ⚙️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file and add:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

3. **Run the App**:
   ```bash
   npm run dev
   ```

---

## 🚀 Presentation & Testing Guide (A to Z)

To present this project effectively, follow these steps in order:

### Step 1: Show the Code Structure
Explain why we used the `src/` folder (Scalability). Point out the `middleware` for security.

### Step 2: Open Swagger UI
Go to `http://localhost:3000/api-docs`. Show the professional "Dark/Premium" theme.

### Step 3: Registration
*   Use `POST /api/users/register`.
*   Try registering with an invalid email to show the **Validation Error**.
*   Register correctly and show the user created in the DB.

### Step 4: Login & Authorization
*   Use `POST /api/users/login`.
*   **Copy the token**.
*   Click the **Authorize** button and paste the token. Explain that this is how "Private Routes" work.

### Step 5: Task Management
*   Create a task.
*   Get all tasks (Show that you can only see YOUR tasks).
*   Delete a task.

---

## 🏆 Advanced Touches Added
*   **Standard Connection String**: Bypassed SRV DNS issues for 100% reliability.
*   **Global Error Handling**: The app doesn't crash on errors; it returns clean JSON.
*   **Health Check Route**: A dedicated `GET /` route to check server status.
*   **Professional Swagger UI**: Custom CSS to hide topbars and style the Authorize button.

---

**Built with ❤️ for Task Management v2 Presentation.**
