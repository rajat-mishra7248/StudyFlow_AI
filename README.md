# StudyFlow AI

AI Powered Smart Learning Management System for Students.

StudyFlow AI is a full-stack learning management platform designed to help students plan, organize, track, and improve their learning using AI-powered features.

## Features

* Student authentication with JWT
* AI-powered quiz generation
* AI-generated study notes
* Study planning
* AI timetable generation
* Study timer and productivity tracking
* Learning resources
* Progress tracking
* Career roadmap
* Ask AI for study-related doubts
* Quiz evaluation and performance results

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* React Router

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* JWT Authentication

### AI

* Google Gemini API

## Project Structure

StudyFlow_AI/

├── backend/

│   └── app/

├── frontend/

│   └── src/

├── .gitignore

├── package.json

└── README.md

## Running the Project

### Backend

Create and activate the Python virtual environment:

```
.venv\Scripts\Activate.ps1
```

Start FastAPI:

```
cd backend
uvicorn app.main:app --reload
```

Backend:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

### Frontend

Open another terminal:

```
cd frontend
npm install
npm run dev
```

Frontend:

http://127.0.0.1:5173

## Environment Variables

API keys and secrets should be stored in `.env` files locally.


Rajat Mishra

## Project

StudyFlow AI — AI Powered Smart Learning Management System
