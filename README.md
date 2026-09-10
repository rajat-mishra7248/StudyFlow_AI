StudyFlow AI

AI Powered Smart Learning Management System for Students

StudyFlow AI is a full-stack learning management platform designed to
help students plan, organize, track, and improve their learning using
AI-powered features.

Features

Student authentication with JWT

AI-powered quiz generation

AI-generated study notes

Smart study planning

AI timetable generation

Study timer and productivity tracking

Learning resources

Progress tracking

Career roadmap

Ask AI for study-related doubts

Quiz evaluation and performance results

Tech Stack

Frontend

React

Vite

JavaScript

React Router

Backend

Python

FastAPI

SQLAlchemy

SQLite

JWT Authentication

AI

Google Gemini API

Groq API (fallback for temporary Gemini/API failures)

Project Structure

StudyFlow_AI/
├── backend/
│   ├── app/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

Live Demo

Frontend: https://study-flow-ai-sand.vercel.app

Backend API: https://studyflow-ai-3wq0.onrender.com

Swagger API Docs: https://studyflow-ai-3wq0.onrender.com/docs

Health Check: https://studyflow-ai-3wq0.onrender.com/health

GitHub Repository

https://github.com/rajat-mishra7248/StudyFlow_AI

Running the Project Locally

1. Backend

From the project root, create and activate the Python virtual
environment:

.venv\Scripts\Activate.ps1

Install backend dependencies:

cd backend
pip install -r requirements.txt

Start FastAPI:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger API documentation:

http://127.0.0.1:8000/docs

2. Frontend

Open another terminal and run:

cd frontend
npm install
npm run dev

Frontend:

http://127.0.0.1:5173

Environment Variables

API keys, authentication secrets, database configuration, and email
credentials should be stored in local .env files and must not be
committed to GitHub.

Example:

GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key

Use the project's existing environment configuration for the complete
list of required variables.

Deployment

The project is deployed using:

Frontend: Vercel

Backend: Render

The frontend communicates with the deployed FastAPI backend through the
VITE_API_BASE_URL environment variable.

For local development, the frontend uses:

VITE_API_BASE_URL=http://127.0.0.1:8000

For the production frontend, it points to:

VITE_API_BASE_URL=https://studyflow-ai-3wq0.onrender.com

Security

Never commit .env files.

Never expose Gemini, Groq, SMTP, or JWT secret values in source
code.

Keep API keys and other credentials in environment variables.

Do not upload the Python virtual environment, node_modules, or
local database files to GitHub.

Project

StudyFlow AI --- AI Powered Smart Learning Management System

Developed as a final-year BCA project.

Author: Rajat Mishra