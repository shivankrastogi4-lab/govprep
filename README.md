# 🏛️ GovPrep India — Government Exam Preparation Platform

A complete, production-ready web app for students preparing for Indian government exams (SSC, Banking, Railways, UPSC/State Exams).

---

## 🚀 Quick Start

### 1. Install Python dependencies
```bash
pip install flask
```
Or using the requirements file:
```bash
pip install -r requirements.txt
```

### 2. Run the server
```bash
cd backend
python app.py
```

### 3. Open in browser
Visit: **http://127.0.0.1:5000**

---

## 📁 Project Structure

```
govprep/
├── backend/
│   └── app.py              ← Flask server & API routes
├── templates/
│   ├── base.html           ← Shared layout (navbar, footer)
│   ├── index.html          ← Homepage with hero, updates, exam cards
│   ├── exams.html          ← All exams listing with filter
│   ├── exam_detail.html    ← Individual exam: syllabus, pattern, PYQ
│   ├── notes.html          ← Notes with search & subject filter
│   ├── quiz.html           ← Daily quiz with leaderboard
│   ├── videos.html         ← YouTube video library
│   └── progress.html       ← Progress tracker dashboard
├── static/
│   ├── css/
│   │   └── style.css       ← Complete responsive stylesheet
│   └── js/
│       └── app.js          ← Quiz engine, Notes, Videos, Tracker
├── data/
│   ├── exams.json          ← Exam data (syllabus, pattern, strategy, PYQ)
│   ├── quiz.json           ← Daily quiz questions + leaderboard
│   ├── notes.json          ← Subject notes
│   └── videos.json         ← YouTube video metadata
└── requirements.txt
```

---

## 🎯 Features

| Feature | Description |
|---|---|
| **Homepage** | Hero section, exam cards, daily quiz CTA, updates |
| **Exams Section** | SSC, Banking, Railways, UPSC with full syllabus & pattern |
| **Study Notes** | 10+ topic notes with search, filter, modal reading view |
| **Daily Quiz** | 10 MCQs with score tracking, explanations, leaderboard |
| **Progress Tracker** | localStorage-based: streak, avg score, quiz history |
| **Video Library** | Curated YouTube embeds by subject/exam |
| **Dark/Light Mode** | Toggle with localStorage persistence |
| **Mobile Responsive** | Works perfectly on phones and tablets |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Homepage |
| GET | `/exams` | All exams listing |
| GET | `/exam/<id>` | Exam detail (ssc, ibps_po, rrb_ntpc, upsc_cse) |
| GET | `/notes` | Notes page |
| GET | `/quiz` | Daily quiz page |
| GET | `/videos` | Videos page |
| GET | `/progress` | Progress tracker |
| GET | `/api/notes` | Notes JSON (supports `?subject=X&search=Y`) |
| GET | `/api/quiz` | Quiz questions JSON |
| POST | `/api/submit-score` | Submit quiz score to leaderboard |
| GET | `/api/leaderboard` | Top 10 leaderboard |
| GET | `/api/videos` | Videos JSON (supports `?category=X`) |
| GET | `/api/exams` | Exams JSON (supports `?category=X`) |

---

## 🛠️ Adding More Content

### Add a new exam:
Edit `data/exams.json` and add a new key with the same structure as existing exams.

### Add new quiz questions:
Edit `data/quiz.json` and add objects to the `"daily"` array.

### Add new notes:
Edit `data/notes.json` and add objects to the `"notes"` array.

---

## 🏗️ Scaling Up

- **Database**: Replace JSON files with SQLite → PostgreSQL
- **User Accounts**: Add Flask-Login + bcrypt
- **More Quizzes**: Add subject-specific quiz banks
- **Admin Panel**: Flask-Admin for content management
- **Deployment**: Use Gunicorn + Nginx on a VPS

---

## 📄 License
Free for personal and educational use.
