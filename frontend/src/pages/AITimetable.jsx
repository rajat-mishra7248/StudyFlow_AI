import React, { useMemo, useState } from "react";
import { apiPost } from "../services/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PRIORITY_ORDER = {
  High: 1,
  Medium: 2,
  Low: 3,
};

function formatTime(time) {
  if (!time) return "--";

  const parts = String(time).split(":");
  let hour = Number(parts[0]);
  const minute = parts[1] || "00";

  if (Number.isNaN(hour)) return time;

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${period}`;
}

function getPriorityClass(priority) {
  switch (String(priority || "").toLowerCase()) {
    case "high":
      return "priority-high";

    case "low":
      return "priority-low";

    default:
      return "priority-medium";
  }
}

function getDayShort(day) {
  return String(day || "").slice(0, 3);
}

export default function AITimetable() {
  const [subjects, setSubjects] = useState("");
  const [dailyHours, setDailyHours] = useState(3);
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [preferredTime, setPreferredTime] = useState("Morning");

  const [studyDays, setStudyDays] = useState([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDay, setSelectedDay] = useState("Monday");

  // ============================================================
  // SELECT / UNSELECT STUDY DAYS
  // ============================================================

  function toggleDay(day) {
    setStudyDays((current) => {
      if (current.includes(day)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== day);
      }

      return [...current, day];
    });
  }

  // ============================================================
  // GENERATE AI TIMETABLE
  // ============================================================

  async function handleGenerate() {
    setError("");

    const subjectList = subjects
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (subjectList.length === 0) {
      setError("Please enter at least one subject.");
      return;
    }

    if (studyDays.length === 0) {
      setError("Please select at least one study day.");
      return;
    }

    setLoading(true);

    try {
      // IMPORTANT:
      // Existing backend API is NOT changed.
      const response = await apiPost("/ai/timetable", {
        subjects: subjectList,
        daily_hours: Number(dailyHours),
        current_level: currentLevel,
        preferred_time: preferredTime,
        study_days: studyDays,
      });

      const generated = Array.isArray(response?.timetable)
        ? response.timetable
        : [];

      if (generated.length === 0) {
        throw new Error(
          "AI did not generate any timetable sessions."
        );
      }

      setTimetable(generated);

      setSelectedDay(
        generated[0]?.day || studyDays[0] || "Monday"
      );
    } catch (err) {
      console.error("AI TIMETABLE ERROR:", err);

      setError(
        err?.message ||
          "Unable to generate timetable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // SORT TIMETABLE
  // ============================================================

  const sortedTimetable = useMemo(() => {
    return [...timetable].sort((a, b) => {
      const dayA = DAYS.indexOf(a.day);
      const dayB = DAYS.indexOf(b.day);

      if (dayA !== dayB) {
        return dayA - dayB;
      }

      return String(a.start_time).localeCompare(
        String(b.start_time)
      );
    });
  }, [timetable]);

  // ============================================================
  // GROUP BY DAY
  // ============================================================

  const timetableByDay = useMemo(() => {
    const grouped = {};

    DAYS.forEach((day) => {
      grouped[day] = [];
    });

    sortedTimetable.forEach((item) => {
      if (!grouped[item.day]) {
        grouped[item.day] = [];
      }

      grouped[item.day].push(item);
    });

    return grouped;
  }, [sortedTimetable]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalSessions = timetable.length;

  const highPriority = timetable.filter(
    (item) =>
      String(item.priority).toLowerCase() === "high"
  ).length;

  const activeDays = [
    ...new Set(timetable.map((item) => item.day)),
  ].length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="ai-timetable-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .ai-timetable-page {
          min-height: 100vh;
          padding: 30px;
          background: #f5f7fb;
          color: #172033;
          font-family: Inter, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .page-container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 25px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 800;
        }

        .page-header p {
          margin-top: 8px;
          color: #6b7280;
          font-size: 15px;
        }

        .generator-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          border: 1px solid #e7eaf0;
          box-shadow: 0 8px 30px rgba(20, 30, 50, 0.06);
          margin-bottom: 25px;
        }

        .generator-title {
          font-size: 20px;
          font-weight: 750;
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #4b5563;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 45px;
          border: 1px solid #dfe3ea;
          border-radius: 10px;
          padding: 0 13px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.10);
        }

        .days-section {
          margin-top: 20px;
        }

        .days-title {
          font-size: 13px;
          font-weight: 700;
          color: #4b5563;
          margin-bottom: 10px;
        }

        .days-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .day-button {
          border: 1px solid #dfe3ea;
          background: white;
          padding: 9px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 650;
          transition: .2s;
        }

        .day-button:hover {
          border-color: #6366f1;
        }

        .day-button.active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .generate-button {
          margin-top: 22px;
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 11px;
          background: #4f46e5;
          color: white;
          font-size: 15px;
          font-weight: 750;
          cursor: pointer;
          transition: .2s;
        }

        .generate-button:hover {
          background: #4338ca;
          transform: translateY(-1px);
        }

        .generate-button:disabled {
          opacity: .65;
          cursor: not-allowed;
          transform: none;
        }

        .error-box {
          margin-top: 15px;
          padding: 12px 15px;
          border-radius: 10px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e7eaf0;
          border-radius: 16px;
          padding: 18px;
        }

        .stat-label {
          color: #737b8c;
          font-size: 13px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 800;
          margin-top: 5px;
        }

        .timetable-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e7eaf0;
          box-shadow: 0 8px 30px rgba(20,30,50,.06);
          overflow: hidden;
        }

        .table-header {
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f4;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .school-label {
          font-size: 12px;
          font-weight: 700;
          color: #6366f1;
          background: #eef2ff;
          padding: 7px 11px;
          border-radius: 20px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        thead th {
          background: #f8f9fc;
          color: #5d6677;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .4px;
          padding: 15px 13px;
          border-bottom: 1px solid #e8ebf0;
          text-align: left;
        }

        tbody td {
          padding: 15px 13px;
          border-bottom: 1px solid #edf0f4;
          vertical-align: middle;
          font-size: 14px;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: #fafbff;
        }

        .day-cell {
          font-weight: 750;
          min-width: 110px;
        }

        .day-cell span {
          display: block;
          color: #8a92a2;
          font-size: 11px;
          margin-top: 3px;
          font-weight: 500;
        }

        .subject-name {
          font-weight: 750;
        }

        .time-cell {
          white-space: nowrap;
          font-weight: 650;
          color: #374151;
        }

        .priority-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 750;
        }

        .priority-high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .priority-medium {
          background: #fef3c7;
          color: #92400e;
        }

        .priority-low {
          background: #dcfce7;
          color: #166534;
        }

        .empty-state {
          padding: 55px 20px;
          text-align: center;
          color: #7a8291;
        }

        .empty-state h3 {
          margin-bottom: 8px;
          color: #303846;
        }

        .mobile-days {
          display: none;
        }

        @media (max-width: 900px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .ai-timetable-page {
            padding: 15px;
          }

          .page-header h1 {
            font-size: 25px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header {
            padding: 16px;
          }

          .school-label {
            display: none;
          }
        }
      `}</style>

      <div className="page-container">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="page-header">
          <h1>📚 My Study Timetable</h1>

          <p>
            Create a personalized weekly study schedule
            with AI.
          </p>
        </div>

        {/* ================================================== */}
        {/* AI GENERATOR */}
        {/* ================================================== */}

        <div className="generator-card">

          <div className="generator-title">
            ✨ Create AI Timetable
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Subjects</label>

              <input
                type="text"
                value={subjects}
                onChange={(e) =>
                  setSubjects(e.target.value)
                }
                placeholder="Python, DSA, DBMS, Java"
              />
            </div>

            <div className="form-group">
              <label>Daily Study Hours</label>

              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={dailyHours}
                onChange={(e) =>
                  setDailyHours(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Current Level</label>

              <select
                value={currentLevel}
                onChange={(e) =>
                  setCurrentLevel(e.target.value)
                }
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Time</label>

              <select
                value={preferredTime}
                onChange={(e) =>
                  setPreferredTime(e.target.value)
                }
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </div>

          </div>

          {/* STUDY DAYS */}

          <div className="days-section">

            <div className="days-title">
              Select Study Days
            </div>

            <div className="days-list">

              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-button ${
                    studyDays.includes(day)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </button>
              ))}

            </div>

          </div>

          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? "✨ Creating Your Timetable..."
              : "✨ Generate AI Timetable"}
          </button>

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* STATS */}
        {/* ================================================== */}

        {timetable.length > 0 && (
          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-label">
                Total Study Sessions
              </div>

              <div className="stat-value">
                {totalSessions}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                Active Study Days
              </div>

              <div className="stat-value">
                {activeDays}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                High Priority Sessions
              </div>

              <div className="stat-value">
                {highPriority}
              </div>
            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* SCHOOL STYLE TIMETABLE */}
        {/* ================================================== */}

        <div className="timetable-card">

          <div className="table-header">

            <h2>
              📅 Weekly Study Schedule
            </h2>

            <span className="school-label">
              AI GENERATED
            </span>

          </div>

          {sortedTimetable.length === 0 ? (

            <div className="empty-state">

              <h3>
                Your timetable is empty
              </h3>

              <p>
                Enter your subjects above and
                generate your personalized timetable.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Day</th>
                    <th>Subject</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Priority</th>
                  </tr>

                </thead>

                <tbody>

                  {sortedTimetable.map(
                    (item, index) => {

                      const start =
                        new Date(
                          `1970-01-01T${item.start_time}`
                        );

                      const end =
                        new Date(
                          `1970-01-01T${item.end_time}`
                        );

                      let duration =
                        Math.round(
                          (end - start) / 60000
                        );

                      if (duration < 0) {
                        duration = 0;
                      }

                      return (
                        <tr key={`${item.day}-${index}`}>

                          <td className="day-cell">
                            {item.day}

                            <span>
                              {getDayShort(item.day)}
                            </span>
                          </td>

                          <td>
                            <div className="subject-name">
                              {item.subject}
                            </div>
                          </td>

                          <td className="time-cell">
                            {formatTime(
                              item.start_time
                            )}
                          </td>

                          <td className="time-cell">
                            {formatTime(
                              item.end_time
                            )}
                          </td>

                          <td>
                            {duration > 0
                              ? `${duration} min`
                              : "--"}
                          </td>

                          <td>

                            <span
                              className={`priority-badge ${getPriorityClass(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}