# Task Management Dashboard & Admin Panel

A modern, responsive, and real-time task management system featuring a **Read-Only Dashboard** for users and a **Full-Access Admin Panel** for managers.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Mock API Server
This project uses `json-server` to simulate a backend database (`db.json`).
```bash
npm run server
```
*Runs on http://localhost:3001*

### 3. Start the Frontend
```bash
npm run dev
```
*Runs on http://localhost:5173*

---

## 🔗 Access Links

- **User Dashboard (Read-Only):** [http://localhost:5173](http://localhost:5173)
- **Admin Panel (Full CRUD):** [http://localhost:5173/admin/](http://localhost:5173/admin/)

---

## ✨ Features

### 📋 Read-Only Dashboard (React)
- **Auto-Sorting:** Tasks are automatically ordered by deadline (ascending) and then priority.
- **Priority Highlighting:** Visual color-coding (Red/Orange/Green) based on task urgency.
- **Overdue Alerts:** Automatic detection and visual flagging of tasks past their deadline.
- **Real-Time Polling:** Automatically fetches updates from the server every 10 seconds.
- **Search & Filter:** Instant client-side search by task name or assigned person.

### ⚙️ Admin Panel (Vanilla JS)
- **Full CRUD:** Add, Edit, and Delete tasks directly in the browser.
- **Dynamic Form:** Validated inputs for dates, priorities, and attachments.
- **Persisted Data:** Saves all changes to `db.json` via the mock server.
- **User-Friendly UI:** Toast notifications and confirmation modals for critical actions.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Vanilla CSS
- **Admin:** HTML5, CSS3, Pure JavaScript
- **Backend Simulation:** `json-server`, Axios (for API requests)
- **Design:** Modern dark-mode aesthetic with glassmorphism and animated skeletons.

---

## 📦 Deployment Note

This project is configured for local development. To deploy to a production environment (Vercel, Netlify):
1. Replace the `json-server` with a real database/API (e.g., Firebase, Supabase, or a Node/Express backend).
2. Update the `API_URL` in `src/App.jsx` and `public/admin/admin.js` to point to your production API.
3. Run `npm run build` to generate the production-ready `dist` folder.
