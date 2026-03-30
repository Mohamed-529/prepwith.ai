# PrepAI – AI Interview Preparation Platform

A full-stack MERN application for practicing technical interviews with AI-generated feedback.

---

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js (CommonJS)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs

---

## Prerequisites

Make sure you have installed:
- Node.js (v18 or higher)
- MongoDB (running locally on port 27017)
- npm (v9 or higher)

---

## Project Structure

```
prepai/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionsController.js
│   │   └── progressController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Progress.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   └── progressRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── Timer.jsx
    │   │   └── ProgressBar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Interview.jsx
    │   │   └── Result.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Setup & Installation

### Step 1 – Start MongoDB
Make sure MongoDB is running:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Step 2 – Install & run Backend
```bash
cd prepai/backend
npm install
npm run dev
```
Backend starts at: http://localhost:5000

### Step 3 – Install & run Frontend
Open a NEW terminal:
```bash
cd prepai/frontend
npm install
npm run dev
```
Frontend starts at: http://localhost:5173

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/prepai
JWT_SECRET=prepai_super_secret_jwt_key_2024
NODE_ENV=development
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/questions | Yes | Get all questions |
| POST | /api/submit | Yes | Submit answers |
| GET | /api/progress | Yes | Get progress history |

---

## Features

- JWT-based authentication (register/login)
- 8 curated mock interview questions (JS, React, Node, DB, CS)
- 60-second per-question countdown timer with visual ring
- Answer input with character count
- Keyword-based AI feedback on each answer
- Score calculation and grade (Excellent/Good/Fair/Needs Work)
- Progress history saved to MongoDB
- Dashboard with stats (total sessions, avg score, best score)
- Fully responsive dark UI

---

## Troubleshooting

**MongoDB connection error**: Make sure MongoDB is running and MONGO_URI is correct.

**CORS error**: Ensure frontend runs on port 5173 (the only origin whitelisted).

**Module not found**: Run `npm install` in both `/backend` and `/frontend` folders.

**Port in use**: Kill existing processes on ports 5000 or 5173.
