# Competitive Exam Tracker 🎯
**Full-Stack Web Application — React.js, TypeScript, Node.js, Express.js, MongoDB**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A high-performance, full-stack web application designed for competitive exam aspirants (e.g. UPSC CSE, JEE Advanced/Main, GATE, CAT, NEET, State PSCs) to track preparation milestones, manage comprehensive syllabi, schedule study sessions, organize resources (PYQs, formula sheets, notes), and analyze mock test score trajectories.

---

## 🌐 Live Demo & Repository
- **GitHub Repository**: [https://github.com/Sanjaykumars1722/Competitive-Exam-Tracker](https://github.com/Sanjaykumars1722/Competitive-Exam-Tracker)
- **Live Demo App**: *(Deploying on Render / Vercel — paste your live URL here)*

---

## ✨ Key Features

1. **Competitive Exam Management & Live Countdowns**:
   - Track multiple competitive exams simultaneously with live countdown timers (`d:h:m:s`) down to the exact examination day.
   - 1-Click Import of popular competitive exams with pre-loaded, granular syllabi (UPSC CSE, JEE Advanced, GATE CSE, CAT).
   - Multi-stage selection pipeline tracking (e.g., Prelims, Mains, Interview / CBT).

2. **Micro-Topic Syllabus Tracker & Spaced Repetition**:
   - Hierarchical Subject ➔ Chapter ➔ Topic roadmap.
   - Interactive status progression: `Not Started` ➔ `In Progress` ➔ `Revised 1x` ➔ `Revised 2x` ➔ `Mastered`.
   - Real-time syllabus completion % and readiness scoring.
   - Priority categorization (High Yield / Medium / Low).

3. **Integrated Pomodoro Focus Timer & Calendar Planner**:
   - Focus blocks (25m), short breaks (5m), and long breaks (15m) with browser audio chime synthesizer.
   - Instant 1-click session logging directly to the preparation diary.
   - 7-Day study discipline strip and daily target tracker.
   - Daily study streak flame counter 🔥.

4. **Study Materials & PYQs Repository**:
   - Categorized directory for Previous Year Question Papers (PYQs), Hand-written Notes, Formula Sheets, Video Playlists, and E-Books.
   - Search by keyword, tag, or subject.
   - Star favorite high-yield resources.

5. **Mock Test Analytics & Weak-Area Detection**:
   - Log mock test attempts with total marks, marks scored, accuracy rate (%), and percentile rank.
   - Visual trend graphs of score and accuracy progression across tests.
   - Automatic identification of recurring weak topics to eliminate negative marking.

6. **In-App Notifications & Spaced Repetition Alerts**:
   - Deadline alerts for exams within 30, 15, and 7 days.
   - Spaced repetition triggers for topics revised > 5 days ago.

7. **Dual-Mode Zero-Setup Database**:
   - Connects to any local or Atlas MongoDB URI in `.env`.
   - Automatically spins up an embedded in-memory MongoDB (`mongodb-memory-server`) if no local database is running, pre-seeding rich demo data for instant evaluation.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6, Axios
- **Backend**: Node.js, Express.js, TypeScript, Mongoose (MongoDB / In-Memory MongoDB)
- **Security**: JWT Authentication, Bcrypt password hashing, CORS protection

---

## 🚀 Getting Started

### 1. Install All Dependencies
From the root directory:
```bash
npm run install-all
```
*(or run `npm install` inside both `/server` and `/client` directories)*

### 2. Start the Development Servers
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000` (Health check at `http://localhost:5000/api/health`)
- **Frontend App**: `http://localhost:5173`

### 3. Instant Demo Login
Click the **"⚡ 1-Click Demo Login"** button on the login screen to immediately explore pre-loaded exams, study streaks, and mock test analytics!
