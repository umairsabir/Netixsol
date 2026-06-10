# 📋 Team & Project Management Portal — Documentation

---

## 📌 Project Overview

**Project Name:** Team & Project Management Portal  
**Tech Stack:** React + Express + MongoDB + MUI + GSAP  
**Type:** Full-Stack Web Application  
**Purpose:** Companies can showcase projects, manage team members, and present content with GSAP-powered UI animations.

---

## 🗂️ Folder Structure

```
New folder/
├── backend/                  → Express Server
│   ├── controllers/          → Business logic
│   ├── middleware/           → JWT auth middleware
│   ├── models/               → MongoDB schemas
│   ├── routes/               → API endpoints
│   ├── .env                  → Environment variables
│   └── server.js             → Entry point
│
├── frontend/
│   └── myapp/
│       └── src/
│           ├── components/   → Reusable UI components
│           │   └── animations/ → GSAP utility functions
│           ├── pages/        → Full page components
│           ├── services/     → API service (axios)
│           ├── App.jsx       → Root component + routing
│           └── main.jsx      → React entry point
│
└── package.json              → Root (concurrently)
```

---

## ⚙️ How to Run

### Prerequisites
- Node.js installed
- MongoDB running locally

### Install & Start
```bash
# Root folder
npm install
npm run dev
```

This starts both:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:5173

---

## 🔧 Environment Variables (backend/.env)

| Variable     | Value                                    | Purpose                        |
|--------------|------------------------------------------|--------------------------------|
| PORT         | 5000                                     | Backend server port            |
| MONGO_URI    | mongodb://localhost:27017/teamportal     | MongoDB connection string      |
| JWT_SECRET   | supersecretjwtkey123                     | JWT token signing secret       |

---

## 🗄️ Backend

### server.js
- Express app entry point
- Connects to MongoDB using Mongoose
- Registers all routes
- Uses `cors` and `express.json()` middleware

---

### 📁 Models

#### User.js
| Field     | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| name      | String | ✅       | User full name           |
| email     | String | ✅       | Unique email address     |
| password  | String | ✅       | Hashed password (bcrypt) |

#### Project.js
| Field       | Type       | Required | Description                        |
|-------------|------------|----------|------------------------------------|
| title       | String     | ✅       | Project title                      |
| description | String     | ✅       | Project description                |
| techStack   | [String]   | ❌       | Array of technologies used         |
| status      | String     | ❌       | "active" or "completed"            |
| members     | [ObjectId] | ❌       | References to Member documents     |

#### Member.js
| Field  | Type   | Required | Description          |
|--------|--------|----------|----------------------|
| name   | String | ✅       | Member full name     |
| role   | String | ✅       | Member role/position |
| email  | String | ✅       | Unique email         |
| avatar | String | ❌       | Avatar URL           |

#### Timeline.js
| Field   | Type       | Required | Description                    |
|---------|------------|----------|--------------------------------|
| project | ObjectId   | ✅       | Reference to Project           |
| steps   | [Object]   | ✅       | Array of timeline steps        |

**Step Object:**
| Field       | Type    | Description              |
|-------------|---------|--------------------------|
| label       | String  | Step title               |
| description | String  | Step description         |
| completed   | Boolean | Step completion status   |

---

### 📁 Controllers

#### authController.js
| Function | Description                                              |
|----------|----------------------------------------------------------|
| register | Creates new user, hashes password, returns JWT token     |
| login    | Validates credentials, returns JWT token                 |

#### projectController.js
| Function | Description                                              |
|----------|----------------------------------------------------------|
| getAll   | Returns all projects with populated member details       |
| create   | Creates new project                                      |
| update   | Updates project by ID                                    |
| remove   | Deletes project + its Timeline (cascade delete)          |

#### memberController.js
| Function | Description              |
|----------|--------------------------|
| getAll   | Returns all members      |
| create   | Creates new member       |
| update   | Updates member by ID     |
| remove   | Deletes member by ID     |

#### timelineController.js
| Function     | Description                                          |
|--------------|------------------------------------------------------|
| getByProject | Returns timeline for a specific project              |
| upsert       | Creates or updates timeline for a project            |
| updateStep   | Updates a single step (e.g. toggle completed status) |

---

### 📁 Middleware

#### auth.js
- Extracts JWT token from `Authorization: Bearer <token>` header
- Verifies token using `JWT_SECRET`
- Attaches `req.user` to request
- Returns 401 if token is missing or invalid

---

### 📁 Routes

| Route                          | Method | Auth | Description                  |
|-------------------------------|--------|------|------------------------------|
| /auth/register                | POST   | ❌   | Register new user            |
| /auth/login                   | POST   | ❌   | Login user                   |
| /projects                     | GET    | ✅   | Get all projects             |
| /projects                     | POST   | ✅   | Create project               |
| /projects/:id                 | PUT    | ✅   | Update project               |
| /projects/:id                 | DELETE | ✅   | Delete project + timeline    |
| /members                      | GET    | ✅   | Get all members              |
| /members                      | POST   | ✅   | Create member                |
| /members/:id                  | PUT    | ✅   | Update member                |
| /members/:id                  | DELETE | ✅   | Delete member                |
| /timeline/:projectId          | GET    | ✅   | Get project timeline         |
| /timeline/:projectId          | POST   | ✅   | Create/update timeline       |
| /timeline/:projectId/step/:i  | PATCH  | ✅   | Update single timeline step  |

---

## 🎨 Frontend

### App.jsx
- Root component
- Sets up React Router with `BrowserRouter`
- Manages Dark/Light theme using MUI `createTheme`
- `ProtectedRoute` — redirects to `/login` if no token in `sessionStorage`
- `PageTransition` — GSAP `fromTo` animation on every route change

---

### services/api.js
- Axios instance with `baseURL: http://localhost:5000`
- Request interceptor — automatically attaches JWT token from `sessionStorage` to every request header

---

### 📁 Pages

#### Login.jsx
**Purpose:** Login and Register form on single page

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Toggle               | Switch between Login and Register form                   |
| GSAP Animation       | Card fadeIn + form fields stagger on load                |
| Validation           | Email format, password min 6 chars, name required        |
| Password Toggle      | Show/hide password with eye icon                         |
| Session              | Token saved in `sessionStorage` on login                 |
| Register Flow        | After register → auto switch to login form               |
| Responsive           | Card width: 100% mobile → 30% desktop                    |

#### Dashboard.jsx
**Purpose:** Home page with hero section and stats overview

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Hero Section         | Gradient background with title, subtitle, buttons        |
| SVG Animation        | 2 animated path lines + pulsing circles in background    |
| Floating Buttons     | "View Projects" and "Meet the Team" float up/down        |
| GSAP Timeline        | Hero elements animate in sequence on load                |
| Stats Cards          | Total Projects, Active, Completed, Team Members          |
| Count-Up Animation   | Numbers count from 0 to actual value                     |
| Stagger Animation    | Stats cards animate in one by one                        |
| Responsive           | Full responsive grid layout                              |

#### Projects.jsx
**Purpose:** Manage all projects — view, add, edit, delete, timeline

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Projects Grid        | Cards in responsive grid (xs:12, sm:6, md:4)             |
| Add Project          | Dialog form with gradient button                         |
| Edit Project         | Pre-filled dialog form                                   |
| Delete Project       | Confirm dialog + cascade delete timeline                 |
| GSAP Animation       | Cards slide up on load, dialog scale-in on open          |
| Validation           | Title and description required                           |
| Timeline Button      | Opens project timeline dialog                            |
| Assign Members       | Multi-select dropdown                                    |
| Responsive Dialog    | Full screen on mobile                                    |

#### Members.jsx
**Purpose:** Manage team members — view, add, edit, delete

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Members Grid         | Cards in responsive grid (xs:12, sm:6, md:3)             |
| Add Member           | Dialog form with gradient button                         |
| Edit Member          | Pre-filled dialog form                                   |
| Delete Member        | Confirm dialog                                           |
| GSAP Animation       | Cards slide in from left, dialog scale-in                |
| Snackbar             | Success notification on add/update/delete                |
| Validation           | Name, role, email required + email format check          |
| Responsive Dialog    | Full screen on mobile                                    |

---

### 📁 Components

#### Navbar.jsx
**Purpose:** Top navigation bar

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Logo                 | Dashboard icon + TeamPortal text                         |
| Nav Links            | Dashboard, Projects, Members                             |
| Dark/Light Toggle    | Sun/Moon icon button                                     |
| Logout Button        | Red button with hover scale effect, clears sessionStorage|
| Mobile Hamburger     | Menu icon opens right Drawer on mobile                   |
| Hidden on Login      | Navbar not shown on login page                           |

#### ProjectCard.jsx
**Purpose:** Display single project information

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Title                | 30px bold                                                |
| Status Chip          | Green = Active, Gray = Completed                         |
| Description          | 20px gray text                                           |
| Tech Stack Chips     | Outlined chips for each technology                       |
| Members              | 👥 assigned member names                                 |
| Edit Button          | Opens edit dialog                                        |
| Delete Button        | Red, confirms before delete                              |
| Timeline Button      | Opens project timeline                                   |
| Hover Animation      | GSAP float up + shadow on mouse enter                    |

#### MemberCard.jsx
**Purpose:** Display single member information

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Avatar               | Colored circle with first letter of name                 |
| Name                 | 30px bold                                                |
| Role Chip            | Primary color chip                                       |
| Email                | 20px gray text                                           |
| Edit/Delete Icons    | Icon buttons                                             |
| Hover Animation      | GSAP scale up on mouse enter                             |

#### ProjectTimeline.jsx
**Purpose:** Dynamic project timeline with steps

| Feature              | Description                                              |
|----------------------|----------------------------------------------------------|
| Fetch Timeline       | Loads timeline from backend for specific project         |
| Create Timeline      | Dialog to add steps with title and description           |
| Edit Timeline        | Update existing steps                                    |
| Add/Remove Steps     | Dynamic step management in dialog                        |
| Toggle Complete      | Checkbox to mark step as done                            |
| Progress Chip        | Shows "2/5 completed"                                    |
| Success Message      | 🎉 shown when all steps complete                         |
| GSAP Animation       | Steps slide in from left with stagger                    |

#### animations/gsapUtils.js
**Purpose:** Reusable GSAP animation functions

| Function   | Parameters              | Description                              |
|------------|-------------------------|------------------------------------------|
| fadeIn     | target, delay           | Fade element from opacity 0 to 1         |
| slideUp    | target, delay           | Slide element up from y:50 to y:0        |
| staggerIn  | targets, delay          | Stagger multiple elements slide up       |
| scaleIn    | target, delay           | Scale element from 0.85 to 1             |
| countUp    | target, endVal, duration| Animate number from 0 to endVal          |

---

## 🔐 Authentication Flow

```
User fills Login form
        ↓
Frontend validates (email format, password length)
        ↓
POST /auth/login → backend
        ↓
bcrypt compares password
        ↓
JWT token generated (expires in 7 days)
        ↓
Token saved in sessionStorage
        ↓
User redirected to Dashboard
        ↓
Every API request → token attached in header
        ↓
Backend middleware verifies token
        ↓
Browser/tab close → sessionStorage cleared → must login again
```

---

## 🎭 GSAP Animations Used

| Location              | Animation Type          | Description                          |
|-----------------------|-------------------------|--------------------------------------|
| Login page            | fadeIn + stagger        | Card slides up, fields stagger in    |
| Dashboard hero        | Timeline sequence       | Title, subtitle, buttons animate in  |
| Dashboard SVG         | stroke-dashoffset       | Path lines draw themselves           |
| Dashboard buttons     | CSS keyframes float     | Buttons float up and down            |
| Dashboard stats       | stagger + countUp       | Cards animate in, numbers count up   |
| Projects grid         | stagger slideUp         | Cards slide up one by one            |
| Members grid          | stagger slideLeft       | Cards slide in from left             |
| Dialogs               | scaleIn                 | Dialog scales from 0.9 to 1          |
| ProjectCard hover     | y translate + shadow    | Card floats up on hover              |
| MemberCard hover      | scale                   | Card scales up on hover              |
| Timeline steps        | stagger slideLeft       | Steps slide in from left             |
| Page transitions      | fadeIn + slideUp        | Every page change animates in        |

---

## 📦 NPM Packages Used

### Backend
| Package    | Version | Purpose                          |
|------------|---------|----------------------------------|
| express    | ^5.2.1  | Web framework                    |
| mongoose   | ^9.6.1  | MongoDB ODM                      |
| bcryptjs   | ^3.0.3  | Password hashing                 |
| jsonwebtoken| ^9.0.3 | JWT token generation/verification|
| cors       | ^2.8.6  | Cross-origin requests            |
| dotenv     | ^17.4.2 | Environment variables            |

### Frontend
| Package              | Purpose                              |
|----------------------|--------------------------------------|
| react                | UI library                           |
| react-router-dom     | Client-side routing                  |
| @mui/material        | UI component library                 |
| @mui/icons-material  | Material icons                       |
| @mui/x-data-grid     | Advanced data grid                   |
| @emotion/react       | CSS-in-JS (MUI dependency)           |
| @emotion/styled      | Styled components (MUI dependency)   |
| gsap                 | Animation library                    |
| axios                | HTTP client for API calls            |

### Root
| Package      | Purpose                                    |
|--------------|--------------------------------------------|
| concurrently | Run backend and frontend simultaneously    |

---

## ✅ Features Checklist

| Feature                          | Status |
|----------------------------------|--------|
| User Registration                | ✅     |
| User Login                       | ✅     |
| JWT Authentication               | ✅     |
| Session Control (sessionStorage) | ✅     |
| Password Show/Hide               | ✅     |
| Frontend Validation              | ✅     |
| Dashboard Hero Section           | ✅     |
| SVG Path Animations              | ✅     |
| Floating Button Animation        | ✅     |
| Stats Count-Up Animation         | ✅     |
| Projects CRUD                    | ✅     |
| Members CRUD                     | ✅     |
| Assign Members to Projects       | ✅     |
| Dynamic Project Timeline         | ✅     |
| Timeline Step Toggle             | ✅     |
| Cascade Delete (Project+Timeline)| ✅     |
| Dark / Light Mode                | ✅     |
| Fully Responsive                 | ✅     |
| Mobile Hamburger Menu            | ✅     |
| GSAP Page Transitions            | ✅     |
| GSAP Card Hover Animations       | ✅     |
| GSAP Dialog Animations           | ✅     |
| Success Notifications (Snackbar) | ✅     |
