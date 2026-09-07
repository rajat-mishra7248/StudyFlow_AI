import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  startTimer,
  finishTimer,
  getTimerHistory,
} from "../services/api";

function StudyTimer() {
  // ============================================================
  // TIMER SETTINGS
  // ============================================================

  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");

  const [breakMinutes, setBreakMinutes] = useState("5");

  // ============================================================
  // TIMER STATE
  // ============================================================

  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);

  const [timerId, setTimerId] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);

  const intervalRef = useRef(null);

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    loadHistory();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ============================================================
  // LOAD TIMER HISTORY
  // ============================================================

  async function loadHistory() {
    try {
      setHistoryLoading(true);

      const data = await getTimerHistory();

      if (Array.isArray(data)) {
        setHistory(data);
      } else if (Array.isArray(data?.items)) {
        setHistory(data.items);
      } else if (Array.isArray(data?.data)) {
        setHistory(data.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("TIMER HISTORY ERROR:", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  // ============================================================
  // CALCULATE DURATION
  // ============================================================

  function calculateDuration() {
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;

    return h * 3600 + m * 60 + s;
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);

    const h = Math.floor(safeSeconds / 3600);
    const m = Math.floor((safeSeconds % 3600) / 60);
    const s = safeSeconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  }

  // ============================================================
  // UPDATE INPUT
  // ============================================================

  function updateDuration(type, value) {
    if (isRunning) {
      return;
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    if (type === "hours") {
      setHours(value);
    }

    if (type === "minutes") {
      setMinutes(value);
    }

    if (type === "seconds") {
      setSeconds(value);
    }
  }

  // ============================================================
  // SET PRESET
  // ============================================================

  function setPreset(h, m, s) {
    if (isRunning) {
      return;
    }

    setHours(String(h));
    setMinutes(String(m));
    setSeconds(String(s));

    const duration = h * 3600 + m * 60 + s;

    setRemainingSeconds(duration);
    setTotalSeconds(duration);

    setMessage("");
    setError("");
  }

  // ============================================================
  // START TIMER
  // ============================================================

  async function handleStart() {
    setMessage("");
    setError("");

    const duration = calculateDuration();

    if (duration <= 0) {
      setError("Please select a study duration greater than 0.");
      return;
    }

    const breakDuration = Number(breakMinutes) || 0;

    if (breakDuration < 0) {
      setError("Break duration cannot be negative.");
      return;
    }

    if (isRunning) {
      return;
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT
       *
       * Backend schema expects:
       *
       * study_duration
       * break_duration
       *
       * study_duration is stored as INTEGER.
       *
       * We send the duration in MINUTES.
       *
       * Example:
       * 25 minutes -> study_duration: 25
       */

      const studyDurationMinutes = Math.ceil(duration / 60);

      const response = await startTimer({
        study_duration: studyDurationMinutes,
        break_duration: breakDuration,
      });

      console.log("START TIMER RESPONSE:", response);

      const createdTimerId =
        response?.id ??
        response?.timer_id ??
        response?.data?.id ??
        null;

      if (!createdTimerId) {
        console.warn(
          "Timer created but no timer ID was returned:",
          response
        );
      }

      setTimerId(createdTimerId);

      setRemainingSeconds(duration);
      setTotalSeconds(duration);

      setIsRunning(true);
      setIsPaused(false);

      setMessage("Study session started successfully.");

      // ========================================================
      // START LOCAL COUNTDOWN
      // ========================================================

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setRemainingSeconds((previous) => {
          if (previous <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            setIsRunning(false);
            setIsPaused(false);

            handleTimerCompleted(createdTimerId);

            return 0;
          }

          return previous - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("START TIMER ERROR:", err);

      setError(
        err?.message ||
          "Unable to start the study timer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // PAUSE TIMER
  // ============================================================

  function handlePause() {
    if (!isRunning || isPaused) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPaused(true);
    setMessage("Timer paused.");
  }

  // ============================================================
  // RESUME TIMER
  // ============================================================

  function handleResume() {
    if (!isRunning || !isPaused) {
      return;
    }

    setIsPaused(false);
    setMessage("Timer resumed.");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          setIsRunning(false);
          setIsPaused(false);

          handleTimerCompleted(timerId);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);
  }

  // ============================================================
  // TIMER COMPLETED
  // ============================================================

  async function handleTimerCompleted(id) {
    setMessage(
      "Study session completed. Take a short break!"
    );

    // Browser notification
    showNotification(
      "StudyFlow AI",
      "Your study session is complete. Take a short break."
    );

    // Finish backend session
    if (id) {
      try {
        await finishTimer(id);
      } catch (err) {
        console.error("AUTO FINISH TIMER ERROR:", err);
      }
    }

    await loadHistory();
  }

  // ============================================================
  // STOP / FINISH TIMER
  // ============================================================

  async function handleStop() {
    setMessage("");
    setError("");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    setIsPaused(false);

    if (timerId) {
      try {
        setLoading(true);

        await finishTimer(timerId);

        setMessage("Study session finished and saved.");

        await loadHistory();
      } catch (err) {
        console.error("FINISH TIMER ERROR:", err);

        setError(
          err?.message ||
            "Unable to save the study session."
        );
      } finally {
        setLoading(false);
      }
    } else {
      setMessage("Timer stopped.");
    }
  }

  // ============================================================
  // RESET TIMER
  // ============================================================

  function handleReset() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    setIsPaused(false);
    setTimerId(null);

    const duration = calculateDuration();

    setRemainingSeconds(duration);
    setTotalSeconds(duration);

    setMessage("");
    setError("");
  }

  // ============================================================
  // BROWSER NOTIFICATION
  // ============================================================

  function showNotification(title, body) {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
      });

      return;
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body,
          });
        }
      });
    }
  }

  // ============================================================
  // PROGRESS
  // ============================================================

  const progress =
    totalSeconds > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((totalSeconds - remainingSeconds) /
              totalSeconds) *
              100
          )
        )
      : 0;

  // ============================================================
  // TIMER CIRCLE
  // ============================================================

  const circumference = 2 * Math.PI * 130;

  const strokeOffset =
    circumference -
    (progress / 100) * circumference;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="timer-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="timer-header">

        <div>
          <span className="timer-label">
            STUDYFLOW AI
          </span>

          <h1>Study Timer</h1>

          <p>
            Focus on your studies and make every minute count.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="timer-dashboard-link"
        >
          ← Dashboard
        </Link>

      </div>

      {/* ======================================================
          MAIN TIMER CARD
      ====================================================== */}

      <div className="timer-main-card">

        <div className="timer-section-title">

          <div>
            <h2>
              {isRunning
                ? isPaused
                  ? "Session Paused"
                  : "Focus Session"
                : "Set Study Duration"}
            </h2>

            <p>
              {isRunning
                ? "Stay focused on your current task."
                : "Choose your preferred study duration."}
            </p>
          </div>

          <span
            className={
              isRunning
                ? isPaused
                  ? "timer-status paused"
                  : "timer-status active"
                : "timer-status"
            }
          >
            {isRunning
              ? isPaused
                ? "PAUSED"
                : "RUNNING"
              : "READY"}
          </span>

        </div>

        {/* ====================================================
            SETTINGS
        ==================================================== */}

        {!isRunning && (
          <>

            <div className="duration-title">
              Study Duration
            </div>

            <div className="duration-inputs">

              <div className="duration-field">
                <label>Hours</label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={hours}
                  onChange={(e) =>
                    updateDuration(
                      "hours",
                      e.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="duration-separator">
                :
              </div>

              <div className="duration-field">
                <label>Minutes</label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={minutes}
                  onChange={(e) =>
                    updateDuration(
                      "minutes",
                      e.target.value
                    )
                  }
                  placeholder="25"
                />
              </div>

              <div className="duration-separator">
                :
              </div>

              <div className="duration-field">
                <label>Seconds</label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={seconds}
                  onChange={(e) =>
                    updateDuration(
                      "seconds",
                      e.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>

            </div>

            {/* ==================================================
                BREAK DURATION
            ================================================== */}

            <div className="break-setting">

              <div>
                <strong>Break after session</strong>

                <span>
                  Recommended break duration
                </span>
              </div>

              <select
                value={breakMinutes}
                onChange={(e) =>
                  setBreakMinutes(e.target.value)
                }
              >
                <option value="0">
                  No break
                </option>

                <option value="5">
                  5 minutes
                </option>

                <option value="10">
                  10 minutes
                </option>

                <option value="15">
                  15 minutes
                </option>
              </select>

            </div>

            {/* ==================================================
                QUICK PRESETS
            ================================================== */}

            <div className="preset-section">

              <span>Quick sessions</span>

              <div className="preset-buttons">

                <button
                  type="button"
                  onClick={() =>
                    setPreset(0, 25, 0)
                  }
                >
                  25 min
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreset(0, 45, 0)
                  }
                >
                  45 min
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreset(1, 0, 0)
                  }
                >
                  1 hour
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreset(2, 0, 0)
                  }
                >
                  2 hours
                </button>

              </div>

            </div>

          </>
        )}

        {/* ====================================================
            TIMER DISPLAY
        ==================================================== */}

        <div className="timer-display-area">

          <div className="timer-circle">

            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
            >

              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="#eaecf0"
                strokeWidth="10"
              />

              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="#344054"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform="rotate(-90 150 150)"
              />

            </svg>

            <div className="timer-circle-content">

              <div className="timer-display">
                {formatTime(remainingSeconds)}
              </div>

              <div className="timer-caption">
                {isRunning
                  ? isPaused
                    ? "Paused"
                    : "Stay focused"
                  : "Ready when you are"}
              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            PROGRESS
        ==================================================== */}

        <div className="progress-info">

          <span>Session progress</span>

          <strong>
            {Math.round(progress)}%
          </strong>

        </div>

        <div className="progress-container">

          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {message && (
          <div className="timer-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="timer-message error">
            {error}
          </div>
        )}

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="timer-actions">

          {!isRunning && (
            <button
              type="button"
              className="start-button"
              onClick={handleStart}
              disabled={loading}
            >
              {loading
                ? "Starting..."
                : "Start Study Session"}
            </button>
          )}

          {isRunning && !isPaused && (
            <>
              <button
                type="button"
                className="pause-button"
                onClick={handlePause}
                disabled={loading}
              >
                Pause
              </button>

              <button
                type="button"
                className="stop-button"
                onClick={handleStop}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Finish Session"}
              </button>
            </>
          )}

          {isRunning && isPaused && (
            <>
              <button
                type="button"
                className="resume-button"
                onClick={handleResume}
              >
                Resume
              </button>

              <button
                type="button"
                className="stop-button"
                onClick={handleStop}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Finish Session"}
              </button>
            </>
          )}

          <button
            type="button"
            className="reset-button"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>

        </div>

      </div>

      {/* ======================================================
          TIPS
      ====================================================== */}

      <div className="timer-tips">

        <div className="tip-card">
          <div className="tip-number">01</div>

          <strong>Focus</strong>

          <p>
            Keep distractions away and concentrate
            on one task at a time.
          </p>
        </div>

        <div className="tip-card">
          <div className="tip-number">02</div>

          <strong>Take a Break</strong>

          <p>
            Give your mind time to recover after
            completing a focused session.
          </p>
        </div>

        <div className="tip-card">
          <div className="tip-number">03</div>

          <strong>Stay Consistent</strong>

          <p>
            Regular study sessions are more effective
            than occasional long sessions.
          </p>
        </div>

      </div>

      {/* ======================================================
          HISTORY
      ====================================================== */}

      <div className="history-card">

        <div className="history-header">

          <div>
            <span className="timer-label">
              ACTIVITY
            </span>

            <h2>Study History</h2>

            <p>
              Your recently completed study sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={historyLoading}
          >
            {historyLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {historyLoading && history.length === 0 ? (
          <div className="empty-history">
            Loading study history...
          </div>
        ) : history.length === 0 ? (
          <div className="empty-history">
            <strong>No study sessions yet</strong>

            <span>
              Complete your first study session and
              it will appear here.
            </span>
          </div>
        ) : (
          <div className="history-list">

            {history.map((item, index) => {

              const durationValue =
                item.study_duration ??
                item.duration_minutes ??
                item.duration ??
                0;

              return (
                <div
                  className="history-row"
                  key={item.id || index}
                >

                  <div className="history-main">

                    <div className="history-icon">
                      ✓
                    </div>

                    <div>
                      <strong>
                        Study Session
                      </strong>

                      <span>
                        {item.started_at
                          ? new Date(
                              item.started_at
                            ).toLocaleString()
                          : item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString()
                          : "Recent session"}
                      </span>
                    </div>

                  </div>

                  <div className="history-right">

                    <span
                      className={
                        item.completed
                          ? "history-status completed"
                          : "history-status"
                      }
                    >
                      {item.completed
                        ? "Completed"
                        : "In Progress"}
                    </span>

                    <strong>
                      {durationValue} min
                    </strong>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* ======================================================
          CSS
      ====================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .timer-page {
          min-height: 100vh;
          background: #f6f7f9;
          padding: 42px;
          color: #172033;
        }

        .timer-header {
          max-width: 1100px;
          margin: 0 auto 28px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .timer-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #667085;
          margin-bottom: 8px;
        }

        .timer-header h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .timer-header p {
          margin: 8px 0 0;
          color: #667085;
          font-size: 15px;
        }

        .timer-dashboard-link {
          text-decoration: none;
          color: #344054;
          background: white;
          border: 1px solid #e4e7ec;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .timer-dashboard-link:hover {
          background: #f9fafb;
        }

        .timer-main-card,
        .history-card {
          max-width: 1100px;
          margin: 0 auto;
          background: white;
          border: 1px solid #e4e7ec;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
        }

        .timer-main-card {
          padding: 34px;
        }

        .timer-section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eaecf0;
          padding-bottom: 20px;
        }

        .timer-section-title h2 {
          margin: 0;
          font-size: 19px;
        }

        .timer-section-title p {
          margin: 6px 0 0;
          color: #667085;
          font-size: 13px;
        }

        .timer-status {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 6px 10px;
          border-radius: 20px;
          background: #f2f4f7;
          color: #667085;
        }

        .timer-status.active {
          background: #ecfdf3;
          color: #027a48;
        }

        .timer-status.paused {
          background: #fffaeb;
          color: #b54708;
        }

        .duration-title {
          text-align: center;
          margin-top: 34px;
          font-size: 13px;
          font-weight: 700;
          color: #344054;
        }

        .duration-inputs {
          display: flex;
          justify-content: center;
          align-items: end;
          gap: 12px;
          margin: 18px 0 24px;
        }

        .duration-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .duration-field label {
          text-align: center;
          color: #667085;
          font-size: 12px;
          font-weight: 600;
        }

        .duration-field input {
          width: 110px;
          height: 58px;
          border: 1px solid #d0d5dd;
          border-radius: 9px;
          text-align: center;
          font-size: 25px;
          font-weight: 600;
          outline: none;
          color: #172033;
          background: white;
        }

        .duration-field input:focus {
          border-color: #667085;
          box-shadow: 0 0 0 3px rgba(16, 24, 40, 0.05);
        }

        .duration-separator {
          font-size: 25px;
          font-weight: 700;
          color: #98a2b3;
          padding-bottom: 13px;
        }

        .break-setting {
          max-width: 560px;
          margin: 0 auto 25px;
          padding: 14px 16px;
          border: 1px solid #eaecf0;
          border-radius: 9px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          background: #fafafa;
        }

        .break-setting strong {
          display: block;
          font-size: 13px;
          color: #344054;
        }

        .break-setting span {
          display: block;
          margin-top: 4px;
          color: #667085;
          font-size: 12px;
        }

        .break-setting select {
          min-width: 130px;
          padding: 9px 10px;
          border: 1px solid #d0d5dd;
          border-radius: 7px;
          background: white;
          color: #344054;
          outline: none;
        }

        .preset-section {
          text-align: center;
          margin-bottom: 28px;
        }

        .preset-section > span {
          color: #667085;
          font-size: 12px;
          font-weight: 600;
        }

        .preset-buttons {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .preset-buttons button {
          background: #f9fafb;
          border: 1px solid #e4e7ec;
          color: #344054;
          border-radius: 7px;
          padding: 8px 14px;
          cursor: pointer;
          font-size: 13px;
        }

        .preset-buttons button:hover {
          background: #f2f4f7;
        }

        .timer-display-area {
          display: flex;
          justify-content: center;
          padding: 8px 0 25px;
        }

        .timer-circle {
          width: 300px;
          height: 300px;
          position: relative;
        }

        .timer-circle svg {
          display: block;
        }

        .timer-circle-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .timer-display {
          font-size: 45px;
          font-weight: 600;
          letter-spacing: 2px;
          font-variant-numeric: tabular-nums;
          color: #101828;
        }

        .timer-caption {
          margin-top: 8px;
          color: #667085;
          font-size: 13px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          color: #667085;
          font-size: 12px;
        }

        .progress-info strong {
          color: #344054;
        }

        .progress-container {
          height: 7px;
          width: 100%;
          background: #eaecf0;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #344054;
          border-radius: 20px;
          transition: width 0.4s linear;
        }

        .timer-message {
          margin-top: 18px;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
        }

        .timer-message.success {
          background: #ecfdf3;
          color: #027a48;
          border: 1px solid #abefc6;
        }

        .timer-message.error {
          background: #fef3f2;
          color: #b42318;
          border: 1px solid #fecdca;
        }

        .timer-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 26px;
          flex-wrap: wrap;
        }

        .timer-actions button {
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .start-button {
          background: #172033;
          color: white;
          border: 1px solid #172033;
          min-width: 210px;
        }

        .start-button:hover {
          background: #101828;
        }

        .pause-button {
          background: #fffaeb;
          color: #b54708;
          border: 1px solid #fedf89;
          min-width: 120px;
        }

        .resume-button {
          background: #ecfdf3;
          color: #027a48;
          border: 1px solid #abefc6;
          min-width: 120px;
        }

        .stop-button {
          background: white;
          color: #b42318;
          border: 1px solid #fecdca;
        }

        .reset-button {
          background: white;
          color: #344054;
          border: 1px solid #d0d5dd;
        }

        .timer-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .timer-tips {
          max-width: 1100px;
          margin: 20px auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .tip-card {
          background: white;
          border: 1px solid #e4e7ec;
          border-radius: 12px;
          padding: 20px;
        }

        .tip-number {
          font-size: 11px;
          font-weight: 700;
          color: #98a2b3;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .tip-card strong {
          font-size: 14px;
        }

        .tip-card p {
          color: #667085;
          font-size: 13px;
          line-height: 1.6;
          margin: 8px 0 0;
        }

        .history-card {
          padding: 28px;
          margin-top: 20px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 18px;
          border-bottom: 1px solid #eaecf0;
          gap: 20px;
        }

        .history-header h2 {
          margin: 0;
          font-size: 19px;
        }

        .history-header p {
          margin: 6px 0 0;
          color: #667085;
          font-size: 13px;
        }

        .history-header button {
          border: 1px solid #d0d5dd;
          background: white;
          color: #344054;
          border-radius: 7px;
          padding: 8px 13px;
          cursor: pointer;
          font-weight: 600;
        }

        .history-header button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-history {
          text-align: center;
          color: #667085;
          padding: 40px 20px;
          font-size: 14px;
        }

        .empty-history strong {
          display: block;
          color: #344054;
          margin-bottom: 6px;
        }

        .empty-history span {
          display: block;
          font-size: 13px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
        }

        .history-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 17px 0;
          border-bottom: 1px solid #f2f4f7;
        }

        .history-row:last-child {
          border-bottom: none;
        }

        .history-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .history-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #ecfdf3;
          color: #027a48;
          font-weight: 700;
          font-size: 13px;
        }

        .history-row strong {
          display: block;
          font-size: 14px;
        }

        .history-row span {
          display: block;
          color: #667085;
          font-size: 12px;
          margin-top: 5px;
        }

        .history-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .history-right > strong {
          min-width: 65px;
          text-align: right;
        }

        .history-status {
          padding: 5px 9px;
          border-radius: 20px;
          background: #f2f4f7;
          color: #667085;
          font-size: 11px !important;
          font-weight: 600;
        }

        .history-status.completed {
          background: #ecfdf3;
          color: #027a48;
        }

        @media (max-width: 700px) {

          .timer-page {
            padding: 20px 14px;
          }

          .timer-header {
            flex-direction: column;
          }

          .timer-main-card {
            padding: 22px 16px;
          }

          .timer-section-title {
            align-items: flex-start;
          }

          .duration-inputs {
            gap: 6px;
          }

          .duration-field input {
            width: 82px;
            height: 52px;
            font-size: 20px;
          }

          .timer-circle {
            width: 260px;
            height: 260px;
          }

          .timer-circle svg {
            width: 260px;
            height: 260px;
          }

          .timer-display {
            font-size: 36px;
            letter-spacing: 1px;
          }

          .timer-tips {
            grid-template-columns: 1fr;
          }

          .timer-actions {
            flex-direction: column;
          }

          .timer-actions button {
            width: 100%;
          }

          .break-setting {
            flex-direction: column;
            align-items: stretch;
          }

          .break-setting select {
            width: 100%;
          }

          .history-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .history-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .history-right {
            width: 100%;
            justify-content: space-between;
          }

          .history-right > strong {
            text-align: right;
          }
        }

      `}</style>

    </div>
  );
}

export default StudyTimer;