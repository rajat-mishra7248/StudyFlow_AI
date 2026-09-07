import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ============================================================
// PAGES
// ============================================================

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import StudyPlanner from "./pages/StudyPlanner";
import Timetable from "./pages/Timetable";
import StudyTimer from "./pages/StudyTimer";
import Quiz from "./pages/Quiz";
import Resources from "./pages/Resources";
import Progress from "./pages/Progress";
import AINotes from "./pages/AINotes";
import CareerRoadmap from "./pages/CareerRoadmap";
import AskAI from "./pages/AskAI";

import Achievements from "./pages/Achievements";

// Password Reset
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  // --------------------------------------------------------
  // User is NOT logged in
  // --------------------------------------------------------

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // --------------------------------------------------------
  // User is logged in
  // --------------------------------------------------------

  return children;
}


// ============================================================
// PUBLIC ROUTE
// ============================================================

function PublicRoute({ children }) {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  // --------------------------------------------------------
  // Already logged in
  // Don't allow going back to login/signup
  // --------------------------------------------------------

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================================
            ROOT
        ================================================== */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />


        {/* ==================================================
            PUBLIC AUTHENTICATION ROUTES
        ================================================== */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />


        {/* ==================================================
            FORGOT PASSWORD
        ================================================== */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ==================================================
            RESET PASSWORD

            IMPORTANT:
            This route is intentionally NOT wrapped
            inside PublicRoute or ProtectedRoute.

            Reason:
            The reset link contains the token:

            /reset-password?token=XXXXXXXX

            The user must be able to open this page
            regardless of whether a JWT already exists.
        ================================================== */}

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* ==================================================
            PROTECTED DASHBOARD
        ================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            STUDY PLANNER
        ================================================== */}

        <Route
          path="/study-planner"
          element={
            <ProtectedRoute>
              <StudyPlanner />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            TIMETABLE
        ================================================== */}

        <Route
          path="/timetable"
          element={
            <ProtectedRoute>
              <Timetable />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            STUDY TIMER
        ================================================== */}

        <Route
          path="/study-timer"
          element={
            <ProtectedRoute>
              <StudyTimer />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            QUIZ
        ================================================== */}

        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            RESOURCES
        ================================================== */}

        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            PROGRESS
        ================================================== */}

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            AI NOTES
        ================================================== */}

        <Route
          path="/ai-notes"
          element={
            <ProtectedRoute>
              <AINotes />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            CAREER ROADMAP
        ================================================== */}

        <Route
          path="/career-roadmap"
          element={
            <ProtectedRoute>
              <CareerRoadmap />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            ASK AI
        ================================================== */}

        <Route
          path="/ask-ai"
          element={
            <ProtectedRoute>
              <AskAI />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            ACHIEVEMENTS
        ================================================== */}

        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            UNKNOWN ROUTE
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;