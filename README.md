# 🍔 Smart Campus Canteen – Zero Queue Food Ordering System

A production-ready, full-stack college canteen food ordering and live token management platform designed to eliminate waiting lines during short campus lecture breaks.

Built with **React.js, Tailwind CSS, Node.js, Express.js, MongoDB, and Socket.IO**.

---

## 🌟 Key Highlights & Features

### 1. 🚀 Zero-Queue Experience
- **Pre-Order Before Campus Breaks:** Students can pre-order food from classrooms or the library for specific campus break times:
  - `⚡ ASAP (Immediate ~8-12m)`
  - `🔔 11:15 AM - Morning Recess Break`
  - `🍱 1:00 PM - Afternoon Lunch Break`
  - `☕ 3:30 PM - Evening Tea Break`
  - `🎒 5:15 PM - End of Lectures`
- **Dynamic Digital Token Generation:** Every order receives a unique sequential token (e.g., `#TK-101`, `#TK-102`).
- **Scannable Verification QR Code:** Generates a secure QR boarding pass for contactless handover at canteen counters.

### 2. 📺 Public Live Token Display TV Screen (`/live-tokens`)
- High-contrast, large-screen kiosk mode suitable for hanging monitors inside the canteen.
- **Split Board:**
  - **Ready for Pickup (Now Serving):** Glowing green token numbers with counter badges.
  - **Now Preparing:** Amber cards showing real-time kitchen progress & countdown.
- **Synthesized Voice Announcements:** Built-in Web Speech API announces *"Token 101, please collect at Counter 2"*.
- **Live Clock & Rush Metrics:** Displays active kitchen counters and average prep wait time.

### 3. 🍱 Rich Student Dining Experience
- **Filter by 6 Categories:** Breakfast, Lunch, Fast Food, Snacks, Beverages, Combos.
- **Dietary Badges:** Instant toggles for **Veg Only** (Green mark) and **Non-Veg** (Red mark).
- **Dish Customization Modal:** Add special cooking requests (*"Less spicy"*, *"No onion"*, *"Extra ice"*).
- **Interactive Tray Drawer:** Real-time quantity adjustments, coupon validation (`CAMPUS50`, `STUDENT10`), and multi-counter breakdown.
- **Favorites & 1-Click Reorder:** Save favorite dishes and re-order previous orders with a single tap.

### 4. 🛡️ Real-Time Admin Operations Portal (`/admin`)
- **Live Dispatch Board:** Orders appear instantly via Socket.IO with sound alerts.
- **Stage Progression:** `Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Completed`.
- **Rapid Pickup Token Scanner:** Staff can scan QR code or type token number to mark an order handed over immediately.
- **Menu & Stock CRUD:** Add, edit, or delete items. Toggle **In Stock / Out of Stock** in real-time (immediately syncs to students' menus).
- **Rush-Hour Mode:** Adds +10m prep time buffer and alerts students during peak rush.
- **Sales Analytics:** Hourly rush distribution bar chart, top-selling campus dishes, and today's total revenue.

---

## 🔑 Demo Accounts (Quick 1-Click Login Available)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Student** | `student@campus.edu` | `password123` | Browsing, ordering, token tracking, favorites |
| **Admin / Staff** | `admin@campus.edu` | `admin123` | Order dispatch, menu management, analytics |

*(On the login screen, you can also click the **"Demo Student"** or **"Demo Admin"** 1-click buttons to sign in instantly without typing!)*

---

## 📁 Project Architecture

```
Smart Canteen/
├── package.json              # Root runner with concurrently
├── README.md                 # Documentation
├── .gitignore
├── .vscode/
│   ├── launch.json           # VS Code Node debugger
│   └── tasks.json            # VS Code default build tasks
├── server/                   # Backend API & Real-time Server
│   ├── index.js              # Express + Socket.IO server
│   ├── seed.js               # Database seeder (21 campus dishes + demo users)
│   ├── config/db.js          # MongoDB connection with auto-mongod spawn
│   ├── middleware/auth.js    # JWT Authentication & Admin protection
│   ├── models/               # Mongoose Schemas (User, FoodItem, Order)
│   └── routes/               # API endpoints (auth, food, orders, analytics, payment)
└── client/                   # Frontend SPA (React + Vite + Tailwind CSS)
    ├── vite.config.js        # Vite config with API & Socket proxy
    ├── tailwind.config.js    # Brand theme (Orange, Dark Navy, Slate)
    └── src/
        ├── context/          # AuthContext, CartContext, SocketContext
        ├── components/       # Navbar, Footer, FoodCard, CartDrawer, CheckoutModal, TokenPickupPass, OrderStatusStepper
        └── pages/            # HomePage, MenuPage, StudentDashboard, MyOrdersPage, LiveTokenDisplay, AdminDashboard, LoginPage, RegisterPage, AboutPage
```

---

## ⚡ How to Run in Visual Studio Code

### Step 1: Open the Folder
Open `Smart Canteen` folder in **VS Code**.

### Step 2: Start Full Application
Open the VS Code Terminal (`Ctrl + ~`) and run:

```bash
npm run dev
```

This single command starts both the **Backend Server** on port `5000` and the **Frontend React App** on port `5173` simultaneously using `concurrently`.

### Step 3: Access the Application
- **Student Food Ordering:** [http://localhost:5173](http://localhost:5173)
- **Canteen Live TV Screen:** [http://localhost:5173/live-tokens](http://localhost:5173/live-tokens)
- **Admin Operations Center:** [http://localhost:5173/admin](http://localhost:5173/admin)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 Reseeding the Database

To reset or re-populate the 21 realistic food items and initial orders at any time, run:

```bash
npm run seed
```

---

## 🎨 Color Palette Reference
- **Brand Primary:** `#FF6B00` (Vibrant Campus Orange)
- **Brand Accent:** `#F59E0B` (Warm Amber)
- **Dark Navy:** `#0B132B` / `#1C2541` (Deep Campus Blue)
- **Light Grey / Neutral:** `#F8FAFC` / `#FFFFFF`
- **Ready State:** `#10B981` (Emerald Green)
