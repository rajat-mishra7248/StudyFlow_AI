import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getDashboard,
    getMyProfile,
    getStudyPlans,
    getTimetables,
    getProgress,
    getAchievements,
} from "../services/api";

function Dashboard() {
    // ============================================================
    // STATE
    // ============================================================

    const [profile, setProfile] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [studyPlans, setStudyPlans] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [progress, setProgress] = useState(null);
    const [achievements, setAchievements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================================
    // LOAD DASHBOARD DATA
    // ============================================================

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.allSettled([
                getMyProfile(),
                getDashboard(),
                getStudyPlans(),
                getTimetables(),
                getProgress(),
                getAchievements(),
            ]);

            // Profile
            if (results[0].status === "fulfilled") {
                setProfile(results[0].value);
            }

            // Dashboard
            if (results[1].status === "fulfilled") {
                setDashboard(results[1].value);
            }

            // Study Plans
            if (results[2].status === "fulfilled") {
                const data = results[2].value;

                setStudyPlans(
                    Array.isArray(data)
                       ? data
                        : data?.items || data?.study_plans || []
                );
            }

            // Timetable
            if (results[3].status === "fulfilled") {
                const data = results[3].value;

                setTimetables(
                    Array.isArray(data)
                       ? data
                        : data?.items || data?.timetables || []
                );
            }

            // Progress
            if (results[4].status === "fulfilled") {
                setProgress(results[4].value);
            }

            // Achievements
            if (results[5].status === "fulfilled") {
                const data = results[5].value;

                setAchievements(
                    Array.isArray(data)
                       ? data
                        : data?.items || data?.achievements || []
                );
            }

        } catch (err) {
            console.error(
                "DASHBOARD LOAD ERROR:",
                err
            );

            setError(
                "Unable to load some dashboard information."
            );

        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // USER INFORMATION
    // ============================================================

    const userName =
        profile?.full_name ||
        profile?.name ||
        dashboard?.full_name ||
        dashboard?.student?.full_name ||
        "Student";

    const firstName =
        userName.split(" ")[0];

    const currentLevel =
        profile?.current_level ||
        dashboard?.current_level ||
        "Beginner";

    const studyGoal =
        profile?.study_goal ||
        dashboard?.study_goal ||
        "Keep learning consistently";

    // ============================================================
    // STATISTICS
    // ============================================================

    const totalPlans =
        dashboard?.total_study_plans??
        dashboard?.study_plans_count??
        studyPlans.length??
        0;

    const totalSessions =
        dashboard?.total_sessions??
        dashboard?.completed_sessions??
        0;

    const totalStudyHours =
        dashboard?.total_study_hours??
        dashboard?.study_hours??
        0;

    const progressValue = Math.min(
        100,
        Math.max(
            0,
            Number(
                progress?.progress_percentage??
                progress?.progress??
                dashboard?.progress_percentage??
                0
            )
        )
    );

    const completedTasks =
        dashboard?.completed_tasks??
        dashboard?.tasks_completed??
        0;

    const pendingTasks =
        dashboard?.pending_tasks??
        dashboard?.tasks_pending??
        0;

    // ============================================================
    // TODAY'S DATE
    // ============================================================

    const today = new Date();

    const dateText = today.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );

    // ============================================================
    // TIME
    // ============================================================

    const hour = today.getHours();

    let greeting = "Good evening";

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 17) {
        greeting = "Good afternoon";
    }

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");

        window.location.href = "/login";
    };

    // ============================================================
    // FORMAT TIME
    // ============================================================

    const formatTime = (value) => {
        if (!value) return "--:--";

        return value;
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <>
                <style>{dashboardStyles}</style>

                <div className="dashboard-loading">
                    <div className="dashboard-loader"></div>
                    <p>
                        Loading your dashboard...
                    </p>
                </div>
            </>
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <>
            <style>{dashboardStyles}</style>

            <div className="dashboard-layout">

                {/* ======================================================
                    SIDEBAR
                ====================================================== */}

                <aside className="dashboard-sidebar">

                    {/* BRAND */}

                    <div className="sidebar-brand">
                        <div className="sidebar-logo">
                            SF
                        </div>

                        <div>
                            <h2>
                                StudyFlow
                            </h2>
                            <span>
                                Student Workspace
                            </span>
                        </div>
                    </div>

                    {/* NAVIGATION */}

                    <nav className="sidebar-nav">

                        <div className="nav-section-title">
                            MAIN
                        </div>

                        <Link
                            to="/dashboard"
                            className="sidebar-link active"
                        >
                            <span>▦</span>
                            Dashboard
                        </Link>

                        <Link
                            to="/study-planner"
                            className="sidebar-link"
                        >
                            <span>☷</span>
                            Study Planner
                        </Link>

                        <Link
                            to="/timetable"
                            className="sidebar-link"
                        >
                            <span>▣</span>
                            Timetable
                        </Link>

                        <Link
                            to="/study-timer"
                            className="sidebar-link"
                        >
                            <span>◷</span>
                            Study Timer
                        </Link>

                        <div className="nav-section-title">
                            LEARNING
                        </div>

                        <Link
                            to="/quiz"
                            className="sidebar-link"
                        >
                            <span>✓</span>
                            Quizzes
                        </Link>

                        <Link
                            to="/resources"
                            className="sidebar-link"
                        >
                            <span>▤</span>
                            Resources
                        </Link>

                        <Link
                            to="/progress"
                            className="sidebar-link"
                        >
                            <span>↗</span>
                            Progress
                        </Link>

                        <div className="nav-section-title">
                            TOOLS
                        </div>

                        <Link
                            to="/ai-notes"
                            className="sidebar-link"
                        >
                            <span>▥</span>
                            AI Notes
                        </Link>

                        <Link
                            to="/ask-ai"
                            className="sidebar-link"
                        >
                            <span>?</span>
                            Ask AI
                        </Link>

                        <Link
                            to="/career-roadmap"
                            className="sidebar-link"
                        >
                            <span>⌁</span>
                            Career Roadmap
                        </Link>

                        <Link
                            to="/achievements"
                            className="sidebar-link"
                        >
                            <span>★</span>
                            Achievements
                        </Link>

                    </nav>

                    {/* SIDEBAR FOOTER */}

                    <div className="sidebar-footer">

                        <div className="sidebar-user">
                            <div className="sidebar-avatar">
                                {firstName.charAt(0).toUpperCase()}
                            </div>

                            <div className="sidebar-user-info">
                                <strong>
                                    {userName}
                                </strong>
                                <span>
                                    {currentLevel}
                                </span>
                            </div>
                        </div>

                        <button
                            className="sidebar-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </aside>

                {/* ======================================================
                    MAIN CONTENT
                ====================================================== */}

                <main className="dashboard-main">

                    {/* ====================================================
                        TOP BAR
                    ==================================================== */}

                    <header className="dashboard-topbar">

                        <div>
                            <div className="breadcrumb">
                                Workspace / Dashboard
                            </div>

                            <h1>
                                Dashboard
                            </h1>
                        </div>

                        <div className="topbar-right">

                            <span className="date-display">
                                {dateText}
                            </span>

                            <Link
                                to="/achievements"
                                className="topbar-icon"
                                title="Achievements"
                            >
                                ★
                            </Link>

                            <div className="topbar-profile">

                                <div className="topbar-avatar">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <strong>
                                        {firstName}
                                    </strong>
                                    <span>
                                        Student
                                    </span>
                                </div>

                            </div>

                        </div>

                    </header>

                    {/* ====================================================
                        ERROR
                    ==================================================== */}

                    {error && (
                        <div className="dashboard-warning">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ====================================================
                        WELCOME
                    ==================================================== */}

                    <section className="welcome-section">

                        <div>
                            <span className="welcome-label">
                                {greeting}
                            </span>

                            <h2>
                                Welcome back, {firstName}
                            </h2>

                            <p>
                                Stay consistent with your learning
                                and make progress one session at a time.
                            </p>
                        </div>

                        <Link
                            to="/study-planner"
                            className="primary-action"
                        >
                            + Plan Study Session
                        </Link>

                    </section>

                    {/* ====================================================
                        STATISTICS
                    ==================================================== */}

                    <section className="stats-grid">

                        <div className="stat-card">
                            <div className="stat-top">
                                <span>
                                    Study Plans
                                </span>
                                <div className="stat-icon blue">
                                    ☷
                                </div>
                            </div>

                            <strong>
                                {totalPlans}
                            </strong>

                            <small>
                                Active learning plans
                            </small>
                        </div>

                        <div className="stat-card">
                            <div className="stat-top">
                                <span>
                                    Study Hours
                                </span>
                                <div className="stat-icon green">
                                    ◷
                                </div>
                            </div>

                            <strong>
                                {totalStudyHours}
                            </strong>

                            <small>
                                Total recorded hours
                            </small>
                        </div>

                        <div className="stat-card">
                            <div className="stat-top">
                                <span>
                                    Sessions
                                </span>
                                <div className="stat-icon orange">
                                    ✓
                                </div>
                            </div>

                            <strong>
                                {totalSessions}
                            </strong>

                            <small>
                                Completed study sessions
                            </small>
                        </div>

                        <div className="stat-card">
                            <div className="stat-top">
                                <span>
                                    Current Progress
                                </span>
                                <div className="stat-icon purple">
                                    ↗
                                </div>
                            </div>

                            <strong>
                                {progressValue}%
                            </strong>

                            <small>
                                Overall learning progress
                            </small>
                        </div>

                    </section>

                    {/* ====================================================
                        CONTENT GRID
                    ==================================================== */}

                    <section className="dashboard-content-grid">

                        {/* ==================================================
                            LEFT COLUMN
                        ================================================== */}

                        <div className="dashboard-left-column">

                            {/* =================================================
                                STUDY SUMMARY
                            ================================================= */}

                            <div className="dashboard-card">

                                <div className="card-header">
                                    <div>
                                        <h3>
                                            Study Summary
                                        </h3>
                                        <p>
                                            Your current learning activity
                                        </p>
                                    </div>

                                    <Link to="/progress">
                                        View details
                                    </Link>
                                </div>

                                <div className="study-summary-grid">

                                    <div className="summary-item">
                                        <div className="summary-icon completed">
                                            ✓
                                        </div>
                                        <div>
                                            <strong>
                                                {completedTasks}
                                            </strong>
                                            <span>
                                                Completed Tasks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="summary-item">
                                        <div className="summary-icon pending">
                                            ◷
                                        </div>
                                        <div>
                                            <strong>
                                                {pendingTasks}
                                            </strong>
                                            <span>
                                                Pending Tasks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="summary-item">
                                        <div className="summary-icon plans">
                                            ☷
                                        </div>
                                        <div>
                                            <strong>
                                                {totalPlans}
                                            </strong>
                                            <span>
                                                Study Plans
                                            </span>
                                        </div>
                                    </div>

                                    <div className="summary-item">
                                        <div className="summary-icon sessions">
                                            ✓
                                        </div>
                                        <div>
                                            <strong>
                                                {totalSessions}
                                            </strong>
                                            <span>
                                                Study Sessions
                                            </span>
                                        </div>
                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                TODAY'S TIMETABLE
                            ================================================= */}

                            <div className="dashboard-card">

                                <div className="card-header">
                                    <div>
                                        <h3>
                                            Today's Schedule
                                        </h3>
                                        <p>
                                            Your planned learning sessions
                                        </p>
                                    </div>

                                    <Link to="/timetable">
                                        View timetable
                                    </Link>
                                </div>

                                {timetables.length === 0? (
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            ▣
                                        </div>
                                        <strong>
                                            No sessions scheduled
                                        </strong>
                                        <p>
                                            Add subjects to your timetable
                                            to organize today's study.
                                        </p>
                                        <Link to="/timetable">
                                            Create timetable
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="schedule-list">
                                        {timetables
                                           .slice(0, 5)
                                           .map((item, index) => (
                                                <div
                                                    className="schedule-item"
                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                >
                                                    <div className="schedule-time">
                                                        <strong>
                                                            {formatTime(
                                                                item.start_time ||
                                                                item.startTime ||
                                                                item.time
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div className="schedule-line">
                                                        <span></span>
                                                    </div>

                                                    <div className="schedule-info">
                                                        <strong>
                                                            {
                                                                item.subject ||
                                                                item.title ||
                                                                item.topic ||
                                                                "Study Session"
                                                            }
                                                        </strong>
                                                        <span>
                                                            {
                                                                item.description ||
                                                                item.duration ||
                                                                "Planned study session"
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                            </div>

                            {/* =================================================
                                STUDY PLANS
                            ================================================= */}

                            <div className="dashboard-card">

                                <div className="card-header">
                                    <div>
                                        <h3>
                                            Study Plans
                                        </h3>
                                        <p>
                                            Your current learning goals
                                        </p>
                                    </div>

                                    <Link to="/study-planner">
                                        Manage
                                    </Link>
                                </div>

                                {studyPlans.length === 0? (
                                    <div className="empty-state compact">
                                        <div className="empty-icon">
                                            ☷
                                        </div>
                                        <strong>
                                            No study plans yet
                                        </strong>
                                        <p>
                                            Create a study plan to start
                                            organizing your learning.
                                        </p>
                                        <Link to="/study-planner">
                                            Create study plan
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="plans-list">
                                        {studyPlans
                                           .slice(0, 4)
                                           .map((plan, index) => (
                                                <div
                                                    className="plan-row"
                                                    key={
                                                        plan.id ||
                                                        index
                                                    }
                                                >
                                                    <div className="plan-mark">
                                                        {index + 1}
                                                    </div>

                                                    <div className="plan-info">
                                                        <strong>
                                                            {
                                                                plan.title ||
                                                                plan.name ||
                                                                plan.subject ||
                                                                "Study Plan"
                                                            }
                                                        </strong>
                                                        <span>
                                                            {
                                                                plan.description ||
                                                                plan.goal ||
                                                                "Learning objective"
                                                            }
                                                        </span>
                                                    </div>

                                                    <span className="plan-status">
                                                        Active
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                )}

                            </div>

                        </div>

                        {/* ==================================================
                            RIGHT COLUMN
                        ================================================== */}

                        <div className="dashboard-right-column">

                            {/* =================================================
                                STUDY GOAL
                            ================================================= */}

                            <div className="dashboard-card goal-card">

                                <div className="card-header">
                                    <div>
                                        <h3>
                                            Current Goal
                                        </h3>
                                        <p>
                                            Your primary study objective
                                        </p>
                                    </div>
                                </div>

                                <div className="goal-content">
                                    <div className="goal-icon">
                                        ◎
                                    </div>

                                    <strong>
                                        {studyGoal}
                                    </strong>

                                    <span>
                                        Current level: {currentLevel}
                                    </span>
                                </div>

                                <Link
                                    to="/study-planner"
                                    className="secondary-action"
                                >
                                    Update goal
                                </Link>

                            </div>

                            {/* =================================================
                                QUICK ACTIONS
                            ================================================= */}

                            <div className="dashboard-card">

                                <div className="card-header">
                                    <div>
                                        <h3>
                                            Quick Actions
                                        </h3>
                                        <p>
                                            Continue your learning
                                        </p>
                                    </div>
                                </div>

                                <div className="quick-actions">

                                    <Link
                                        to="/study-timer"
                                        className="quick-action"
                                    >
                                        <span className="quick-icon blue">
                                            ◷
                                        </span>
                                        <div>
                                            <strong>
                                                Start Timer
                                            </strong>
                                            <span>
                                                Begin a study session
                                            </span>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/quiz"
                                        className="quick-action"
                                    >
                                        <span className="quick-icon green">
                                            ✓
                                        </span>
                                        <div>
                                            <strong>
                                                Take Quiz
                                            </strong>
                                            <span>
                                                Test your knowledge
                                            </span>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/resources"
                                        className="quick-action"
                                    >
                                        <span className="quick-icon orange">
                                            ▤
                                        </span>
                                        <div>
                                            <strong>
                                                Browse Resources
                                            </strong>
                                            <span>
                                                Find learning material
                                            </span>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/ask-ai"
                                        className="quick-action"
                                    >
                                        <span className="quick-icon purple">
                                           ?
                                        </span>
                                        <div>
                                            <strong>
                                                Ask a Question
                                            </strong>
                                            <span>
                                                Get help with a topic
                                            </span>
                                        </div>
                                    </Link>

                                </div>

                            </div>

                            {/* =================================================
                                ACHIEVEMENTS
                            ================================================= */}

                            <div className="dashboard-card">

                                <div className="card-header">
                                    <div>
                                        <h3>
                                            Achievements
                                        </h3>
                                        <p>
                                            Your recent milestones
                                        </p>
                                    </div>

                                    <Link to="/achievements">
                                        View all
                                    </Link>
                                </div>

                                {achievements.length === 0? (
                                    <div className="achievement-empty">
                                        <div className="achievement-empty-icon">
                                            ★
                                        </div>
                                        <p>
                                            Keep studying to unlock
                                            your first achievement.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="achievement-list">
                                        {achievements
                                           .slice(0, 3)
                                           .map((achievement, index) => (
                                                <div
                                                    className="achievement-row"
                                                    key={
                                                        achievement.id ||
                                                        index
                                                    }
                                                >
                                                    <div className="achievement-icon">
                                                        ★
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                achievement.title ||
                                                                achievement.name ||
                                                                "Achievement"
                                                            }
                                                        </strong>
                                                        <span>
                                                            {
                                                                achievement.description ||
                                                                "Milestone unlocked"
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                            </div>

                            {/* =================================================
                                STUDY TIMER CTA
                            ================================================= */}

                            <div className="timer-cta">

                                <div>
                                    <span>
                                        READY TO STUDY?
                                    </span>

                                    <h3>
                                        Start your next session
                                    </h3>

                                    <p>
                                        Stay focused and track your
                                        study time.
                                    </p>
                                </div>

                                <Link to="/study-timer">
                                    Start Timer →
                                </Link>

                            </div>

                        </div>

                    </section>

                    {/* ====================================================
                        FOOTER
                    ==================================================== */}

                    <footer className="dashboard-footer">
                        <span>
                            StudyFlow AI
                        </span>
                        <span>
                            Student Learning Workspace
                        </span>
                    </footer>

                </main>

            </div>
        </>
    );
}

// ================================================================
// DASHBOARD CSS
// ================================================================

const dashboardStyles = `

/* ================================================================
   GLOBAL
================================================================ */

* {
  box-sizing: border-box;
}

.dashboard-layout {
  min-height: 100vh;
  display: flex;
  background: #f6f7f9;
  color: #172033;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* ================================================================
   SIDEBAR
================================================================ */

.dashboard-sidebar {
  width: 245px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

/* BRAND */

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 22px 20px;
  border-bottom:
    1px solid #f1f3f5;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-size: 14px;
  font-weight: 800;
}

.sidebar-brand h2 {
  margin: 0;
  color: #111827;
  font-size: 17px;
  font-weight: 750;
}

.sidebar-brand span {
  display: block;
  margin-top: 2px;
  color: #9ca3af;
  font-size: 10px;
}

/* NAV */

.sidebar-nav {
  flex: 1;
  padding: 18px 12px;
  overflow-y: auto;
}

.nav-section-title {
  margin:
    18px 9px 8px;
  color: #9ca3af;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 11px;
  margin-bottom: 3px;
  border-radius: 8px;
  color: #5f6877;
  text-decoration: none;
  font-size: 13px;
  font-weight: 550;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.sidebar-link span {
  width: 20px;
  text-align: center;
  font-size: 16px;
  color: #8992a2;
}

.sidebar-link:hover {
  background: #f4f6f8;
  color: #1f2937;
}

.sidebar-link.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 650;
}

.sidebar-link.active span {
  color: #2563eb;
}

/* SIDEBAR FOOTER */

.sidebar-footer {
  padding: 15px;
  border-top:
    1px solid #f1f3f5;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sidebar-avatar {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e8eefc;
  color: #2563eb;
  font-size: 13px;
  font-weight: 750;
}

.sidebar-user-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-user-info strong {
  color: #374151;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-info span {
  color: #9ca3af;
  font-size: 10px;
  margin-top: 2px;
}

.sidebar-logout {
  width: 100%;
  padding: 8px;
  border:
    1px solid #e5e7eb;
  background: white;
  border-radius: 7px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
}

.sidebar-logout:hover {
  background: #f9fafb;
  color: #dc2626;
}

/* ================================================================
   MAIN
================================================================ */

.dashboard-main {
  width: calc(100% - 245px);
  margin-left: 245px;
  min-height: 100vh;
  padding: 0 34px 30px;
}

/* ================================================================
   TOPBAR
================================================================ */

.dashboard-topbar {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom:
    1px solid #e5e7eb;
}

.breadcrumb {
  color: #9ca3af;
  font-size: 11px;
  margin-bottom: 4px;
}

.dashboard-topbar h1 {
  margin: 0;
  font-size: 21px;
  color: #111827;
  font-weight: 720;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-display {
  color: #8b94a3;
  font-size: 11px;
}

.topbar-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border:
    1px solid #e5e7eb;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  background: white;
}

.topbar-profile {
  display: flex;
  align-items: center;
  gap: 9px;
}

.topbar-avatar {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  font-size: 13px;
  font-weight: 700;
}

.topbar-profile div:last-child {
  display: flex;
  flex-direction: column;
}

.topbar-profile strong {
  font-size: 12px;
  color: #374151;
}

.topbar-profile span {
  font-size: 10px;
  color: #9ca3af;
}

/* ================================================================
   WARNING
================================================================ */

.dashboard-warning {
  margin-top: 18px;
  padding: 12px 15px;
  background: #fffbeb;
  border:
    1px solid #fde68a;
  border-radius: 9px;
  color: #92400e;
  font-size: 12px;
}

/* ================================================================
   WELCOME
================================================================ */

.welcome-section {
  margin-top: 25px;
  padding: 26px 28px;
  background: white;
  border:
    1px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.welcome-label {
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.welcome-section h2 {
  margin: 6px 0 5px;
  color: #111827;
  font-size: 24px;
  font-weight: 720;
}

.welcome-section p {
  margin: 0;
  color: #7b8493;
  font-size: 13px;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  padding: 11px 16px;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  font-size: 12px;
  font-weight: 650;
}

.primary-action:hover {
  background: #1d4ed8;
}

/* ================================================================
   STATS
================================================================ */

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 15px;
  margin-top: 18px;
}

.stat-card {
  background: white;
  border:
    1px solid #e5e7eb;
  border-radius: 11px;
  padding: 18px;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7b8493;
  font-size: 11px;
  font-weight: 600;
}

.stat-card > strong {
  display: block;
  margin-top: 12px;
  color: #111827;
  font-size: 25px;
  font-weight: 730;
}

.stat-card small {
  display: block;
  margin-top: 3px;
  color: #9ca3af;
  font-size: 10px;
}

.stat-icon {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 15px;
}

.stat-icon.blue,
.quick-icon.blue {
  background: #eff6ff;
  color: #2563eb;
}

.stat-icon.green,
.quick-icon.green {
  background: #ecfdf5;
  color: #059669;
}

.stat-icon.orange,
.quick-icon.orange {
  background: #fff7ed;
  color: #ea580c;
}

.stat-icon.purple,
.quick-icon.purple {
  background: #f5f3ff;
  color: #7c3aed;
}

/* ================================================================
   CONTENT GRID
================================================================ */

.dashboard-content-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(300px, 0.9fr);
  gap: 18px;
  margin-top: 18px;
}

.dashboard-left-column,
.dashboard-right-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ================================================================
   CARD
================================================================ */

.dashboard-card {
  background: white;
  border:
    1px solid #e5e7eb;
  border-radius: 11px;
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.card-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
}

.card-header p {
  margin: 4px 0 0;
  color: #9ca3af;
  font-size: 11px;
}

.card-header a {
  color: #2563eb;
  text-decoration: none;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

/* ================================================================
   PROGRESS
================================================================ */

.progress-number {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.progress-number strong {
  color: #111827;
  font-size: 32px;
  font-weight: 750;
}

.progress-number span {
  color: #9ca3af;
  font-size: 11px;
}

.progress-track {
  width: 100%;
  height: 8px;
  margin-top: 13px;
  background: #eef0f3;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 10px;
  transition:
    width 0.6s ease;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 9px;
  color: #9ca3af;
  font-size: 10px;
}

/* ================================================================
   SCHEDULE
================================================================ */

.schedule-list {
  display: flex;
  flex-direction: column;
}

.schedule-item {
  display: grid;
  grid-template-columns:
    62px 18px minmax(0, 1fr);
  min-height: 64px;
}

.schedule-time {
  padding-top: 2px;
  color: #475569;
  font-size: 11px;
}

.schedule-line {
  position: relative;
}

.schedule-line::before {
  content: "";
  position: absolute;
  top: 5px;
  bottom: 0;
  left: 7px;
  width: 1px;
  background: #e5e7eb;
}

.schedule-line span {
  position: absolute;
  top: 4px;
  left: 3px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid white;
  box-shadow:
    0 0 0 1px #bfdbfe;
}

.schedule-info {
  padding-bottom: 15px;
}

.schedule-info strong {
  display: block;
  color: #374151;
  font-size: 12px;
}

.schedule-info span {
  display: block;
  margin-top: 4px;
  color: #9ca3af;
  font-size: 10px;
}

/* ================================================================
   STUDY PLANS
================================================================ */

.plans-list {
  display: flex;
  flex-direction: column;
}

.plan-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top:
    1px solid #f1f3f5;
}

.plan-row:first-child {
  border-top: none;
}

.plan-mark {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 7px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.plan-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.plan-info strong {
  color: #374151;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-info span {
  margin-top: 3px;
  color: #9ca3af;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-status {
  padding: 4px 7px;
  border-radius: 5px;
  background: #ecfdf5;
  color: #059669;
  font-size: 9px;
  font-weight: 700;
}

/* ================================================================
   EMPTY
================================================================ */

.empty-state {
  padding: 24px 15px;
  text-align: center;
  border:
    1px dashed #dbe1e8;
  border-radius: 9px;
}

.empty-state.compact {
  padding: 20px 15px;
}

.empty-icon {
  width: 38px;
  height: 38px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 18px;
}

.empty-state strong {
  display: block;
  color: #475569;
  font-size: 12px;
}

.empty-state p {
  margin: 5px auto 10px;
  max-width: 270px;
  color: #9ca3af;
  font-size: 10px;
  line-height: 1.5;
}

.empty-state a {
  color: #2563eb;
  text-decoration: none;
  font-size: 10px;
  font-weight: 650;
}

/* ================================================================
   GOAL
================================================================ */

.goal-content {
  text-align: center;
  padding: 5px 10px 18px;
}

.goal-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-size: 22px;
}

.goal-content strong {
  display: block;
  color: #374151;
  font-size: 13px;
  line-height: 1.5;
}

.goal-content span {
  display: block;
  margin-top: 6px;
  color: #9ca3af;
  font-size: 10px;
}

.secondary-action {
  display: block;
  padding: 9px;
  border:
    1px solid #dbe3ef;
  border-radius: 7px;
  text-align: center;
  color: #475569;
  text-decoration: none;
  font-size: 11px;
  font-weight: 650;
}

.secondary-action:hover {
  background: #f8fafc;
}

/* ================================================================
   QUICK ACTIONS
================================================================ */

.quick-actions {
  display: flex;
  flex-direction: column;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 0;
  border-top:
    1px solid #f1f3f5;
  text-decoration: none;
}

.quick-action:first-child {
  border-top: none;
}

.quick-icon {
  width: 33px;
  height: 33px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  font-size: 15px;
}

.quick-action div {
  display: flex;
  flex-direction: column;
}

.quick-action strong {
  color: #374151;
  font-size: 11px;
}

.quick-action span:not(.quick-icon) {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 9px;
}

.quick-action:hover strong {
  color: #2563eb;
}

/* ================================================================
   ACHIEVEMENTS
================================================================ */

.achievement-list {
  display: flex;
  flex-direction: column;
}

.achievement-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top:
    1px solid #f1f3f5;
}

.achievement-row:first-child {
  border-top: none;
}

.achievement-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fff7ed;
  color: #f59e0b;
  font-size: 14px;
}

.achievement-row div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.achievement-row strong {
  color: #475569;
  font-size: 11px;
}

.achievement-row span {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.achievement-empty {
  padding: 10px;
  text-align: center;
}

.achievement-empty-icon {
  color: #cbd5e1;
  font-size: 25px;
}

.achievement-empty p {
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 10px;
  line-height: 1.5;
}

/* ================================================================
   TIMER CTA
================================================================ */

.timer-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 19px;
  border-radius: 11px;
  background: #1e293b;
  color: white;
}

.timer-cta span {
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.timer-cta h3 {
  margin: 5px 0 3px;
  font-size: 14px;
}

.timer-cta p {
  margin: 0;
  color: #94a3b8;
  font-size: 10px;
}

.timer-cta a {
  padding: 8px 11px;
  border-radius: 7px;
  background: white;
  color: #1e293b;
  text-decoration: none;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

/* ================================================================
   FOOTER
================================================================ */

.dashboard-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  padding-top: 18px;
  border-top:
    1px solid #e5e7eb;
  color: #a1a8b3;
  font-size: 9px;
}

/* ================================================================
   LOADING
================================================================ */

.dashboard-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f6f7f9;
  color: #64748b;
  font-size: 12px;
}

.dashboard-loader {
  width: 30px;
  height: 30px;
  margin-bottom: 12px;
  border:
    3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation:
    dashboard-spin
    0.7s linear infinite;
}

@keyframes dashboard-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================================================================
   RESPONSIVE
================================================================ */

@media (max-width: 1100px) {

 .dashboard-sidebar {
    width: 215px;
  }

 .dashboard-main {
    width: calc(100% - 215px);
    margin-left: 215px;
    padding-left: 22px;
    padding-right: 22px;
  }

 .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

 .dashboard-content-grid {
    grid-template-columns:
      1fr;
  }

}

@media (max-width: 800px) {

 .dashboard-sidebar {
    position: relative;
    width: 100%;
    min-height: auto;
    border-right: none;
    border-bottom:
      1px solid #e5e7eb;
  }

 .dashboard-layout {
    display: block;
  }

 .sidebar-nav {
    display: flex;
    gap: 5px;
    overflow-x: auto;
    padding: 10px;
  }

 .nav-section-title {
    display: none;
  }

 .sidebar-link {
    white-space: nowrap;
    margin: 0;
  }

 .sidebar-footer {
    display: none;
  }

 .dashboard-main {
    width: 100%;
    margin-left: 0;
    padding:
      0 15px 25px;
  }

 .dashboard-topbar {
    min-height: 70px;
  }

}

@media (max-width: 600px) {

 .dashboard-topbar {
    align-items: flex-start;
    padding-top: 17px;
  }

 .date-display {
    display: none;
  }

 .topbar-profile div:last-child {
    display: none;
  }

 .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    padding: 21px;
  }

 .welcome-section h2 {
    font-size: 21px;
  }

 .primary-action {
    width: 100%;
    justify-content: center;
  }

 .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
    gap: 10px;
  }

 .stat-card {
    padding: 14px;
  }

 .stat-card > strong {
    font-size: 21px;
  }

 .dashboard-content-grid {
    grid-template-columns:
      1fr;
  }

 .timer-cta {
    flex-direction: column;
    align-items: flex-start;
  }

 .timer-cta a {
    width: 100%;
    text-align: center;
  }

 .dashboard-footer {
    flex-direction: column;
    gap: 5px;
  }

}
`;

export default Dashboard;