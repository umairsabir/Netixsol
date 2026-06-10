# 🍵 Tea E-commerce Project Documentation

Ye documentation is project ki architecture, features, aur technical stack ki mukammal tafseel faraham karti hai.

---

## 🚀 1. Tech Stack (Istemaal ki gayi Technologies)

### Backend
*   **Node.js & Express:** Server-side logic aur API routes ke liye.
*   **MongoDB & Mongoose:** Database management aur data modeling ke liye.
*   **JWT (JSON Web Token):** Secure authentication aur user sessions ke liye.
*   **BcryptJS:** Passwords ko encrypt (hash) karny ke liye.
*   **Cors:** Cross-origin requests ko handle karny ke liye.
*   **Dotenv:** Environment variables (secrets) ko manage karny ke liye.

### Frontend
*   **React (Vite):** Fast aur modern UI development ke liye.
*   **Tailwind CSS:** Responsive aur modern styling ke liye.
*   **Material UI (MUI):** Premium components (Modals, Buttons, etc.) ke liye.
*   **Framer Motion:** Smooth animations aur transitions ke liye.
*   **Lucide React:** Modern icons ke liye.
*   **React Router DOM:** Client-side routing aur navigation ke liye.
*   **Axios:** Backend API ke sath communication karny ke liye.

---

## 📂 2. Project Structure (File Layout)

### Backend (`/backend`)
*   `src/index.js`: Server ka entry point.
*   `src/models/`: Database schemas (User, Product, Order).
*   `src/routes/`: API endpoints ki definition.
*   `src/controllers/`: Business logic aur functions.
*   `src/middlewares/`: Auth aur validation checks.

### Frontend (`/frontend`)
*   `src/App.jsx`: Main application wrapper aur routes.
*   `src/pages/`: Mukhtalif screens (Home, Admin, Cart, etc.).
*   `src/components/`: Reusable UI elements (Navbar, Footer, Modal).
*   `src/context/`: Global state management (Auth aur Cart).
*   `src/api/`: Backend calls ke liye axios configurations.

---

## 🛠️ 3. Key Features (Main Functions)

### A. Authentication & Security
*   **User Roles:** Teen (3) roles hain: `user`, `admin`, aur `superadmin`.
*   **Superadmin Powers:** Sirf `superadmin` hi accounts ko block/unblock kar sakta hai aur doosron ke roles change kar sakta hai.
*   **Admin Key:** Admin ya Superadmin register karny ke liye ek secret key (`SR_TEA_2026`) chahiye hoti hai.
*   **Protected Routes:** Admin dashboard sirf authorized admins/superadmins hi dekh sakty hain.

### B. Product Management
*   **Variants:** Ek product ke mukhtalif sizes (50g, 100g, etc.) ho sakty hain.
*   **Stock Management:** Har variant ka apna stock hota hai. Agar stock khatam ho jaye to "Out of Stock" ka banner show hota hai.

### C. Shopping Cart
*   **Global Cart:** User kisi bhi page se products cart mein add kar sakta hai.
*   **Local Storage:** Cart ka data refresh par bhi save rehta hai.

### D. Admin Dashboard
*   **Stats:** Total revenue, weekly revenue, orders, aur users ka live data.
*   **User Management:** Sirf **Superadmin** kisi bhi user/admin ko block/unblock kar sakta hai. Admins users ki list dekh sakty hain lekin unhein block nahi kar sakty.
*   **Inventory Control:** Stock update karny ki saholat aur low-stock indicators.
*   **Order Control:** Order status update karny ka system. **Cancelled** orders ka status dobara change nahi kiya ja sakta (Security check).

---

## 🔐 4. Important Credentials
*   **Default Admin Secret:** `SR_TEA_2026` (Registration ke waqt zaroori hai).
*   **Environment Variables:** `.env` file mein DB connection string aur JWT Secret save hain.

---

## 📈 5. Future Enhancements (Tajaweez)
*   **Payment Integration:** Stripe ya PayPal add kiya ja sakta hai.
*   **Email Notifications:** Order place hony par user ko email bheji ja sakti hai.
*   **Search & Filters:** Products ko mazeed behtar filter karny ka option.

---
*Documentation Created on: 2026-05-11*
