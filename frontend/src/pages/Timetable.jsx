import React, { useEffect, useMemo, useState } from "react";

import {
    getTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
    generateAITimetable,
} from "../services/api";


function Timetable() {

    // =========================================================
    // CONSTANTS
    // =========================================================

    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    const PRIORITIES = [
        "High",
        "Medium",
        "Low",
    ];


    // =========================================================
    // SAVED TIMETABLE
    // =========================================================

    const [timetables, setTimetables] = useState([]);

    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // =========================================================
    // AI FORM
    // =========================================================

    const [subjects, setSubjects] = useState(
        "Python, DSA, Machine Learning"
    );

    const [dailyHours, setDailyHours] = useState("4");

    const [currentLevel, setCurrentLevel] =
        useState("Beginner");

    const [preferredTime, setPreferredTime] =
        useState("Morning and Evening");

    const [studyDays, setStudyDays] = useState([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
    ]);


    // =========================================================
    // AI GENERATED TIMETABLE
    // =========================================================

    const [generatedTimetable, setGeneratedTimetable] =
        useState([]);

    const [aiLoading, setAiLoading] = useState(false);


    // =========================================================
    // EDIT
    // =========================================================

    const [editingId, setEditingId] = useState(null);

    const [editData, setEditData] = useState({
        subject: "",
        day: "Monday",
        start_time: "",
        end_time: "",
        priority: "Medium",
        completed: false,
    });


    // =========================================================
    // MANUAL ADD
    // =========================================================

    const [showAddForm, setShowAddForm] = useState(false);

    const [newData, setNewData] = useState({
        subject: "",
        day: "Monday",
        start_time: "",
        end_time: "",
        priority: "Medium",
    });

    const [adding, setAdding] = useState(false);


    // =========================================================
    // LOAD TIMETABLE
    // =========================================================

    useEffect(() => {
        loadTimetables();
    }, []);


    async function loadTimetables() {

        try {

            setLoading(true);
            setError("");

            const data = await getTimetables();

            if (Array.isArray(data)) {

                setTimetables(data);

            } else {

                setTimetables([]);

            }

        } catch (err) {

            console.error(
                "TIMETABLE LOAD ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to load timetable."
            );

        } finally {

            setLoading(false);

        }
    }


    // =========================================================
    // TIME FORMAT
    // Backend: 07:30:00
    // UI:      07:30 AM
    // =========================================================

    function formatTime(value) {

        if (!value) {
            return "--";
        }

        const parts = String(value).split(":");

        if (parts.length < 2) {
            return value;
        }

        let hours = Number(parts[0]);

        const minutes = parts[1];

        if (Number.isNaN(hours)) {
            return value;
        }

        const suffix = hours >= 12
            ? "PM"
            : "AM";

        hours = hours % 12;

        if (hours === 0) {
            hours = 12;
        }

        return `${String(hours).padStart(2, "0")}:${minutes} ${suffix}`;
    }


    // =========================================================
    // TIME TO MINUTES
    // =========================================================

    function timeToMinutes(value) {

        if (!value) {
            return 0;
        }

        const parts = String(value).split(":");

        const hours = Number(parts[0] || 0);

        const minutes = Number(parts[1] || 0);

        return hours * 60 + minutes;
    }


    // =========================================================
    // DURATION
    // =========================================================

    function getDuration(start, end) {

        const startMinutes =
            timeToMinutes(start);

        const endMinutes =
            timeToMinutes(end);

        let difference =
            endMinutes - startMinutes;

        if (difference < 0) {
            difference += 24 * 60;
        }

        if (!difference) {
            return "";
        }

        const hours =
            Math.floor(difference / 60);

        const minutes =
            difference % 60;

        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`;
        }

        if (hours > 0) {
            return `${hours}h`;
        }

        return `${minutes}m`;
    }


    // =========================================================
    // DAY TOGGLE
    // =========================================================

    function toggleDay(day) {

        setStudyDays((previous) => {

            if (previous.includes(day)) {

                return previous.filter(
                    (item) => item !== day
                );

            }

            return [
                ...previous,
                day,
            ];
        });
    }


    // =========================================================
    // GENERATE AI
    // =========================================================

    async function handleGenerateAI() {

        setError("");
        setSuccess("");
        setGeneratedTimetable([]);

        const subjectList = subjects
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);


        if (subjectList.length === 0) {

            setError(
                "Please enter at least one subject."
            );

            return;
        }


        const hours =
            Number(dailyHours);


        if (
            !hours ||
            hours <= 0 ||
            hours > 12
        ) {

            setError(
                "Daily study hours must be between 1 and 12."
            );

            return;
        }


        if (studyDays.length === 0) {

            setError(
                "Please select at least one study day."
            );

            return;
        }


        try {

            setAiLoading(true);


            const response =
                await generateAITimetable({

                    subjects: subjectList,

                    daily_hours: hours,

                    current_level:
                        currentLevel,

                    preferred_time:
                        preferredTime,

                    study_days:
                        studyDays,

                });


            console.log(
                "AI TIMETABLE RESPONSE:",
                response
            );


            if (
                response &&
                Array.isArray(
                    response.timetable
                )
            ) {

                setGeneratedTimetable(
                    response.timetable
                );

                setSuccess(
                    "✨ AI timetable generated successfully."
                );

            } else {

                setError(
                    "AI returned an invalid timetable."
                );
            }

        } catch (err) {

            console.error(
                "AI TIMETABLE ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to generate AI timetable."
            );

        } finally {

            setAiLoading(false);

        }
    }


    // =========================================================
    // SAVE AI TIMETABLE
    // =========================================================

    async function handleSaveAITimetable() {

        if (
            generatedTimetable.length === 0
        ) {

            setError(
                "Generate a timetable first."
            );

            return;
        }


        try {

            setSaving(true);

            setError("");
            setSuccess("");


            for (
                const item
                of generatedTimetable
            ) {

                await createTimetable({

                    subject:
                        item.subject,

                    day:
                        item.day,

                    start_time:
                        item.start_time,

                    end_time:
                        item.end_time,

                    priority:
                        item.priority ||
                        "Medium",

                });
            }


            setGeneratedTimetable([]);

            await loadTimetables();


            setSuccess(
                "🎉 AI timetable saved successfully."
            );

        } catch (err) {

            console.error(
                "SAVE AI TIMETABLE ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to save AI timetable."
            );

        } finally {

            setSaving(false);

        }
    }


    // =========================================================
    // MANUAL ADD
    // =========================================================

    async function handleAddTimetable() {

        setError("");
        setSuccess("");


        if (!newData.subject.trim()) {

            setError(
                "Please enter a subject."
            );

            return;
        }


        if (
            !newData.start_time ||
            !newData.end_time
        ) {

            setError(
                "Please select start and end time."
            );

            return;
        }


        if (
            timeToMinutes(
                newData.end_time
            ) <=
            timeToMinutes(
                newData.start_time
            )
        ) {

            setError(
                "End time must be later than start time."
            );

            return;
        }


        try {

            setAdding(true);


            await createTimetable({

                subject:
                    newData.subject.trim(),

                day:
                    newData.day,

                start_time:
                    newData.start_time,

                end_time:
                    newData.end_time,

                priority:
                    newData.priority,

            });


            setNewData({
                subject: "",
                day: "Monday",
                start_time: "",
                end_time: "",
                priority: "Medium",
            });


            setShowAddForm(false);

            await loadTimetables();


            setSuccess(
                "Timetable session added successfully."
            );

        } catch (err) {

            console.error(
                "ADD TIMETABLE ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to add timetable."
            );

        } finally {

            setAdding(false);

        }
    }


    // =========================================================
    // DELETE
    // =========================================================

    async function handleDelete(id) {

        const confirmed =
            window.confirm(
                "Delete this study session?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setSuccess("");


            await deleteTimetable(id);


            await loadTimetables();


            setSuccess(
                "Timetable session deleted."
            );

        } catch (err) {

            console.error(
                "DELETE TIMETABLE ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to delete timetable."
            );
        }
    }


    // =========================================================
    // START EDIT
    // =========================================================

    function startEdit(item) {

        setEditingId(item.id);


        setEditData({

            subject:
                item.subject || "",

            day:
                item.day || "Monday",

            start_time:
                String(
                    item.start_time || ""
                ).slice(0, 5),

            end_time:
                String(
                    item.end_time || ""
                ).slice(0, 5),

            priority:
                item.priority ||
                "Medium",

            completed:
                Boolean(
                    item.completed
                ),

        });
    }


    // =========================================================
    // CANCEL EDIT
    // =========================================================

    function cancelEdit() {

        setEditingId(null);


        setEditData({

            subject: "",

            day: "Monday",

            start_time: "",

            end_time: "",

            priority: "Medium",

            completed: false,

        });
    }


    // =========================================================
    // UPDATE
    // =========================================================

    async function handleUpdate(id) {

        if (
            !editData.subject.trim()
        ) {

            setError(
                "Subject cannot be empty."
            );

            return;
        }


        if (
            !editData.start_time ||
            !editData.end_time
        ) {

            setError(
                "Start and end time are required."
            );

            return;
        }


        if (
            timeToMinutes(
                editData.end_time
            ) <=
            timeToMinutes(
                editData.start_time
            )
        ) {

            setError(
                "End time must be later than start time."
            );

            return;
        }


        try {

            setError("");
            setSuccess("");


            await updateTimetable(

                id,

                {
                    subject:
                        editData.subject.trim(),

                    day:
                        editData.day,

                    start_time:
                        editData.start_time,

                    end_time:
                        editData.end_time,

                    priority:
                        editData.priority,

                    completed:
                        editData.completed,

                }
            );


            cancelEdit();


            await loadTimetables();


            setSuccess(
                "Timetable updated successfully."
            );

        } catch (err) {

            console.error(
                "UPDATE TIMETABLE ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to update timetable."
            );
        }
    }


    // =========================================================
    // GROUP BY DAY
    // =========================================================

    const timetableByDay = useMemo(() => {

        const grouped = {};

        DAYS.forEach((day) => {
            grouped[day] = [];
        });


        timetables.forEach((item) => {

            if (!grouped[item.day]) {
                grouped[item.day] = [];
            }

            grouped[item.day].push(item);

        });


        DAYS.forEach((day) => {

            grouped[day].sort(
                (a, b) =>
                    timeToMinutes(
                        a.start_time
                    ) -
                    timeToMinutes(
                        b.start_time
                    )
            );

        });


        return grouped;

    }, [timetables]);


    // =========================================================
    // STATISTICS
    // =========================================================

    const completedCount =
        timetables.filter(
            (item) => item.completed
        ).length;


    const pendingCount =
        timetables.length -
        completedCount;


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="timetable-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="hero">

                <div>

                    <div className="brand-label">
                        STUDYFLOW AI
                    </div>

                    <h1>
                        My Study Timetable
                    </h1>

                    <p>
                        Plan your week, stay consistent,
                        and make every study session count.
                    </p>

                </div>


                <div className="header-actions">

                    <button
                        className="outline-btn"
                        onClick={loadTimetables}
                        disabled={loading}
                    >
                        {loading
                            ? "Refreshing..."
                            : "↻ Refresh"}
                    </button>


                    <button
                        className="primary-btn"
                        onClick={() =>
                            setShowAddForm(
                                !showAddForm
                            )
                        }
                    >
                        + Add Session
                    </button>

                </div>

            </header>


            {/* =====================================================
                ALERTS
            ===================================================== */}

            {error && (

                <div className="alert error-alert">
                    <span>⚠️</span>
                    {error}
                </div>

            )}


            {success && (

                <div className="alert success-alert">
                    <span>✓</span>
                    {success}
                </div>

            )}


            {/* =====================================================
                STATS
            ===================================================== */}

            <section className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon">
                        📚
                    </div>

                    <div>

                        <span>
                            Total Sessions
                        </span>

                        <strong>
                            {timetables.length}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon green">
                        ✓
                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedCount}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon orange">
                        ⏳
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingCount}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon purple">
                        🤖
                    </div>

                    <div>

                        <span>
                            AI Planner
                        </span>

                        <strong>
                            Active
                        </strong>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MANUAL ADD FORM
            ===================================================== */}

            {showAddForm && (

                <section className="card add-card">

                    <div className="section-title">

                        <div>

                            <span className="mini-label">
                                MANUAL ENTRY
                            </span>

                            <h2>
                                Add Study Session
                            </h2>

                        </div>

                        <button
                            className="close-btn"
                            onClick={() =>
                                setShowAddForm(false)
                            }
                        >
                            ×
                        </button>

                    </div>


                    <div className="form-grid">

                        <div className="field">

                            <label>
                                Subject
                            </label>

                            <input
                                value={
                                    newData.subject
                                }
                                onChange={(e) =>
                                    setNewData({
                                        ...newData,
                                        subject:
                                            e.target.value,
                                    })
                                }
                                placeholder="e.g. Python"
                            />

                        </div>


                        <div className="field">

                            <label>
                                Day
                            </label>

                            <select
                                value={
                                    newData.day
                                }
                                onChange={(e) =>
                                    setNewData({
                                        ...newData,
                                        day:
                                            e.target.value,
                                    })
                                }
                            >

                                {DAYS.map(
                                    (day) => (
                                        <option
                                            key={day}
                                            value={day}
                                        >
                                            {day}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>


                        <div className="field">

                            <label>
                                Start Time
                            </label>

                            <input
                                type="time"
                                value={
                                    newData.start_time
                                }
                                onChange={(e) =>
                                    setNewData({
                                        ...newData,
                                        start_time:
                                            e.target.value,
                                    })
                                }
                            />

                        </div>


                        <div className="field">

                            <label>
                                End Time
                            </label>

                            <input
                                type="time"
                                value={
                                    newData.end_time
                                }
                                onChange={(e) =>
                                    setNewData({
                                        ...newData,
                                        end_time:
                                            e.target.value,
                                    })
                                }
                            />

                        </div>


                        <div className="field">

                            <label>
                                Priority
                            </label>

                            <select
                                value={
                                    newData.priority
                                }
                                onChange={(e) =>
                                    setNewData({
                                        ...newData,
                                        priority:
                                            e.target.value,
                                    })
                                }
                            >

                                {PRIORITIES.map(
                                    (priority) => (
                                        <option
                                            key={priority}
                                        >
                                            {priority}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    <div className="form-actions">

                        <button
                            className="outline-btn"
                            onClick={() =>
                                setShowAddForm(false)
                            }
                        >
                            Cancel
                        </button>

                        <button
                            className="primary-btn"
                            onClick={
                                handleAddTimetable
                            }
                            disabled={adding}
                        >
                            {adding
                                ? "Adding..."
                                : "Add Session"}
                        </button>

                    </div>

                </section>

            )}


            {/* =====================================================
                AI PLANNER
            ===================================================== */}

            <section className="card ai-card">

                <div className="ai-top">

                    <div className="ai-title">

                        <div className="ai-badge">
                            ✨
                        </div>

                        <div>

                            <span className="mini-label">
                                AI STUDY PLANNER
                            </span>

                            <h2>
                                Build My Timetable with AI
                            </h2>

                            <p>
                                Tell StudyFlow AI about your
                                subjects and preferences.
                            </p>

                        </div>

                    </div>

                    <div className="ai-powered">
                        AI POWERED
                    </div>

                </div>


                <div className="form-grid ai-form">

                    <div className="field full">

                        <label>
                            What do you want to study?
                        </label>

                        <input
                            value={subjects}
                            onChange={(e) =>
                                setSubjects(
                                    e.target.value
                                )
                            }
                            placeholder="Python, DSA, Machine Learning"
                        />

                        <small>
                            Add multiple subjects separated
                            by commas.
                        </small>

                    </div>


                    <div className="field">

                        <label>
                            Daily Study Hours
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="12"
                            step="0.5"
                            value={dailyHours}
                            onChange={(e) =>
                                setDailyHours(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="field">

                        <label>
                            Current Level
                        </label>

                        <select
                            value={currentLevel}
                            onChange={(e) =>
                                setCurrentLevel(
                                    e.target.value
                                )
                            }
                        >

                            <option>
                                Beginner
                            </option>

                            <option>
                                Intermediate
                            </option>

                            <option>
                                Advanced
                            </option>

                        </select>

                    </div>


                    <div className="field">

                        <label>
                            Preferred Study Time
                        </label>

                        <select
                            value={preferredTime}
                            onChange={(e) =>
                                setPreferredTime(
                                    e.target.value
                                )
                            }
                        >

                            <option>
                                Morning
                            </option>

                            <option>
                                Afternoon
                            </option>

                            <option>
                                Evening
                            </option>

                            <option>
                                Morning and Evening
                            </option>

                            <option>
                                Flexible
                            </option>

                        </select>

                    </div>

                </div>


                {/* STUDY DAYS */}

                <div className="days-area">

                    <label>
                        Study Days
                    </label>

                    <div className="day-selector">

                        {DAYS.map((day) => (

                            <button
                                key={day}
                                type="button"
                                className={
                                    studyDays.includes(day)
                                        ? "day-chip active"
                                        : "day-chip"
                                }
                                onClick={() =>
                                    toggleDay(day)
                                }
                            >

                                <span>
                                    {day.slice(0, 3)}
                                </span>

                                {studyDays.includes(day) && (
                                    <b>✓</b>
                                )}

                            </button>

                        ))}

                    </div>

                </div>


                <button
                    className="ai-generate-btn"
                    onClick={
                        handleGenerateAI
                    }
                    disabled={aiLoading}
                >

                    {aiLoading ? (

                        <>
                            <span className="spinner"></span>
                            Creating your timetable...
                        </>

                    ) : (

                        <>
                            ✨ Generate Smart Timetable
                        </>

                    )}

                </button>

            </section>


            {/* =====================================================
                AI PREVIEW
            ===================================================== */}

            {generatedTimetable.length > 0 && (

                <section className="card ai-preview">

                    <div className="section-title">

                        <div>

                            <span className="mini-label">
                                AI RECOMMENDATION
                            </span>

                            <h2>
                                Your Smart Weekly Plan
                            </h2>

                            <p>
                                Review the plan before saving it.
                            </p>

                        </div>


                        <div className="preview-actions">

                            <button
                                className="outline-btn"
                                onClick={
                                    handleGenerateAI
                                }
                                disabled={aiLoading}
                            >
                                ↻ Regenerate
                            </button>


                            <button
                                className="primary-btn"
                                onClick={
                                    handleSaveAITimetable
                                }
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "✓ Save Timetable"}
                            </button>

                        </div>

                    </div>


                    {/* AI SCHOOL TABLE */}

                    <div className="table-wrapper">

                        <table className="school-table">

                            <thead>

                                <tr>

                                    <th>
                                        Day
                                    </th>

                                    <th>
                                        Time
                                    </th>

                                    <th>
                                        Subject
                                    </th>

                                    <th>
                                        Duration
                                    </th>

                                    <th>
                                        Priority
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {generatedTimetable
                                    .map(
                                        (item, index) => (

                                            <tr
                                                key={index}
                                            >

                                                <td>
                                                    <strong>
                                                        {item.day}
                                                    </strong>
                                                </td>

                                                <td>

                                                    <div className="time-box">

                                                        <strong>
                                                            {formatTime(
                                                                item.start_time
                                                            )}
                                                        </strong>

                                                        <span>
                                                            →
                                                        </span>

                                                        <strong>
                                                            {formatTime(
                                                                item.end_time
                                                            )}
                                                        </strong>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="subject-cell">

                                                        <span className="subject-dot">
                                                        </span>

                                                        <strong>
                                                            {item.subject}
                                                        </strong>

                                                    </div>

                                                </td>

                                                <td>
                                                    {getDuration(
                                                        item.start_time,
                                                        item.end_time
                                                    )}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `priority ${
                                                                (
                                                                    item.priority ||
                                                                    "Medium"
                                                                ).toLowerCase()
                                                            }`
                                                        }
                                                    >
                                                        {item.priority ||
                                                            "Medium"}
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                            </tbody>

                        </table>

                    </div>

                </section>

            )}


            {/* =====================================================
                SAVED SCHOOL TIMETABLE
            ===================================================== */}

            <section className="card timetable-card">

                <div className="section-title">

                    <div>

                        <span className="mini-label">
                            WEEKLY SCHEDULE
                        </span>

                        <h2>
                            My School-Style Timetable
                        </h2>

                        <p>
                            Your complete weekly study schedule.
                        </p>

                    </div>


                    <div className="session-count">
                        {timetables.length} sessions
                    </div>

                </div>


                {loading ? (

                    <div className="state-box">

                        <div className="large-spinner"></div>

                        <h3>
                            Loading your timetable...
                        </h3>

                        <p>
                            Please wait a moment.
                        </p>

                    </div>

                ) : timetables.length === 0 ? (

                    <div className="state-box">

                        <div className="empty-calendar">
                            📅
                        </div>

                        <h3>
                            Your timetable is empty
                        </h3>

                        <p>
                            Generate a timetable with AI
                            or add a study session manually.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={() =>
                                setShowAddForm(true)
                            }
                        >
                            + Add First Session
                        </button>

                    </div>

                ) : (

                    <div className="school-table-wrapper">

                        <table className="weekly-table">

                            <thead>

                                <tr>

                                    <th className="day-header">
                                        DAY
                                    </th>

                                    {DAYS.map(
                                        (day) => (
                                            <th
                                                key={day}
                                                className="day-column"
                                            >
                                                <span>
                                                    {day.slice(
                                                        0,
                                                        3
                                                    )}
                                                </span>

                                                <small>
                                                    {day}
                                                </small>

                                            </th>
                                        )
                                    )}

                                </tr>

                            </thead>


                            <tbody>

                                <tr>

                                    <td className="day-label-cell">

                                        <div>
                                            📖
                                        </div>

                                        <span>
                                            STUDY
                                        </span>

                                    </td>


                                    {DAYS.map(
                                        (day) => (

                                            <td
                                                key={day}
                                                className="schedule-cell"
                                            >

                                                {groupedDayContent(
                                                    timetableByDay[
                                                        day
                                                    ]
                                                )}

                                            </td>

                                        )
                                    )}

                                </tr>

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================================
                FOOTER TIP
            ===================================================== */}

            <div className="study-tip">

                <span>
                    💡
                </span>

                <div>

                    <strong>
                        Study Tip
                    </strong>

                    <p>
                        Stay consistent with your schedule.
                        Complete sessions one by one instead
                        of trying to study everything at once.
                    </p>

                </div>

            </div>


            {/* =====================================================
                CSS
            ===================================================== */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                .timetable-page {
                    min-height: 100vh;
                    background:
                        linear-gradient(
                            180deg,
                            #f7f9fc 0%,
                            #eef2f7 100%
                        );
                    padding: 32px;
                    color: #172033;
                    font-family:
                        Inter,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }


                .hero,
                .card,
                .stats-grid,
                .alert,
                .study-tip {
                    max-width: 1250px;
                    margin-left: auto;
                    margin-right: auto;
                }


                /* ================================
                   HEADER
                ================================= */

                .hero {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 25px;
                    margin-bottom: 25px;
                }


                .brand-label,
                .mini-label {
                    color: #667085;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.6px;
                }


                .hero h1 {
                    margin: 7px 0 0;
                    font-size: 36px;
                    line-height: 1.15;
                    letter-spacing: -1px;
                }


                .hero p {
                    color: #667085;
                    margin: 10px 0 0;
                    font-size: 15px;
                }


                .header-actions,
                .preview-actions,
                .form-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }


                button {
                    font-family: inherit;
                }


                .primary-btn,
                .outline-btn {
                    border-radius: 10px;
                    padding: 11px 17px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 700;
                    transition: 0.2s ease;
                }


                .primary-btn {
                    border: 1px solid #182230;
                    background: #182230;
                    color: white;
                }


                .primary-btn:hover {
                    background: #0f1720;
                    transform: translateY(-1px);
                }


                .outline-btn {
                    border: 1px solid #d0d5dd;
                    background: white;
                    color: #344054;
                }


                .outline-btn:hover {
                    border-color: #98a2b3;
                    background: #f9fafb;
                }


                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }


                /* ================================
                   ALERTS
                ================================= */

                .alert {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    padding: 13px 16px;
                    margin-bottom: 18px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                }


                .error-alert {
                    background: #fff1f0;
                    color: #b42318;
                    border: 1px solid #fecdca;
                }


                .success-alert {
                    background: #ecfdf3;
                    color: #027a48;
                    border: 1px solid #abefc6;
                }


                /* ================================
                   STATS
                ================================= */

                .stats-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(4, 1fr);
                    gap: 14px;
                    margin-bottom: 20px;
                }


                .stat-card {
                    background: white;
                    border: 1px solid #e4e7ec;
                    border-radius: 14px;
                    padding: 18px;
                    display: flex;
                    gap: 13px;
                    align-items: center;
                    box-shadow:
                        0 4px 15px
                        rgba(16,24,40,0.035);
                }


                .stat-icon {
                    width: 43px;
                    height: 43px;
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #eef2f6;
                    font-size: 19px;
                }


                .stat-icon.green {
                    background: #ecfdf3;
                }


                .stat-icon.orange {
                    background: #fffaeb;
                }


                .stat-icon.purple {
                    background: #f4f3ff;
                }


                .stat-card span {
                    display: block;
                    color: #667085;
                    font-size: 11px;
                    font-weight: 600;
                }


                .stat-card strong {
                    display: block;
                    margin-top: 4px;
                    font-size: 21px;
                }


                /* ================================
                   CARD
                ================================= */

                .card {
                    background: white;
                    border: 1px solid #e4e7ec;
                    border-radius: 16px;
                    box-shadow:
                        0 5px 20px
                        rgba(16,24,40,0.04);
                    padding: 27px;
                    margin-bottom: 20px;
                }


                .section-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    padding-bottom: 19px;
                    border-bottom: 1px solid #eaecf0;
                    margin-bottom: 23px;
                }


                .section-title h2 {
                    margin: 6px 0 0;
                    font-size: 20px;
                    letter-spacing: -0.3px;
                }


                .section-title p {
                    color: #667085;
                    margin: 5px 0 0;
                    font-size: 13px;
                }


                .session-count {
                    background: #f2f4f7;
                    border-radius: 30px;
                    padding: 7px 12px;
                    color: #475467;
                    font-size: 12px;
                    font-weight: 700;
                    white-space: nowrap;
                }


                /* ================================
                   FORM
                ================================= */

                .form-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));
                    gap: 18px;
                }


                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }


                .field.full {
                    grid-column: 1 / -1;
                }


                .field label,
                .days-area > label {
                    font-size: 12px;
                    font-weight: 800;
                    color: #344054;
                }


                .field input,
                .field select {
                    width: 100%;
                    height: 44px;
                    border: 1px solid #d0d5dd;
                    border-radius: 9px;
                    padding: 0 12px;
                    outline: none;
                    background: white;
                    color: #172033;
                    font-size: 13px;
                }


                .field input:focus,
                .field select:focus {
                    border-color: #667085;
                    box-shadow:
                        0 0 0 3px
                        rgba(16,24,40,0.06);
                }


                .field small {
                    color: #98a2b3;
                    font-size: 11px;
                }


                .form-actions {
                    justify-content: flex-end;
                    margin-top: 20px;
                }


                .close-btn {
                    border: none;
                    background: #f2f4f7;
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    font-size: 21px;
                    cursor: pointer;
                    color: #475467;
                }


                /* ================================
                   AI CARD
                ================================= */

                .ai-card {
                    background:
                        linear-gradient(
                            135deg,
                            #ffffff 0%,
                            #f7f9fc 100%
                        );
                }


                .ai-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                    margin-bottom: 25px;
                }


                .ai-title {
                    display: flex;
                    gap: 13px;
                }


                .ai-badge {
                    width: 47px;
                    height: 47px;
                    border-radius: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #182230;
                    color: white;
                    font-size: 21px;
                }


                .ai-title h2 {
                    margin: 5px 0 0;
                    font-size: 21px;
                }


                .ai-title p {
                    margin: 5px 0 0;
                    color: #667085;
                    font-size: 13px;
                }


                .ai-powered {
                    padding: 7px 10px;
                    background: #ecfdf3;
                    color: #027a48;
                    border: 1px solid #abefc6;
                    border-radius: 30px;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.8px;
                }


                .days-area {
                    margin-top: 21px;
                }


                .day-selector {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 10px;
                }


                .day-chip {
                    min-width: 62px;
                    height: 40px;
                    border-radius: 9px;
                    border: 1px solid #d0d5dd;
                    background: white;
                    color: #475467;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 700;
                    transition: 0.2s ease;
                }


                .day-chip:hover {
                    border-color: #667085;
                }


                .day-chip.active {
                    background: #182230;
                    border-color: #182230;
                    color: white;
                }


                .day-chip b {
                    margin-left: 5px;
                }


                .ai-generate-btn {
                    width: 100%;
                    height: 50px;
                    margin-top: 24px;
                    border: none;
                    border-radius: 10px;
                    background: #182230;
                    color: white;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: 0.2s ease;
                }


                .ai-generate-btn:hover {
                    background: #0f1720;
                }


                .spinner,
                .large-spinner {
                    display: inline-block;
                    border: 3px solid rgba(255,255,255,0.35);
                    border-top-color: white;
                    border-radius: 50%;
                    width: 17px;
                    height: 17px;
                    animation: spin 0.8s linear infinite;
                    vertical-align: middle;
                    margin-right: 8px;
                }


                .large-spinner {
                    width: 34px;
                    height: 34px;
                    border-color: #d0d5dd;
                    border-top-color: #182230;
                    margin: 0;
                }


                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }


                /* ================================
                   TABLE
                ================================= */

                .table-wrapper,
                .school-table-wrapper {
                    overflow-x: auto;
                    width: 100%;
                }


                .school-table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 750px;
                }


                .school-table th {
                    background: #f8fafc;
                    color: #475467;
                    text-align: left;
                    font-size: 11px;
                    letter-spacing: 0.6px;
                    padding: 13px 14px;
                    border-bottom: 1px solid #e4e7ec;
                }


                .school-table td {
                    padding: 15px 14px;
                    border-bottom: 1px solid #eaecf0;
                    font-size: 13px;
                }


                .school-table tbody tr:last-child td {
                    border-bottom: none;
                }


                .time-box {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    white-space: nowrap;
                }


                .time-box span {
                    color: #98a2b3;
                }


                .subject-cell {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                }


                .subject-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #182230;
                }


                .priority {
                    display: inline-block;
                    padding: 5px 9px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 800;
                }


                .priority.high {
                    color: #b42318;
                    background: #fff1f0;
                }


                .priority.medium {
                    color: #b54708;
                    background: #fffaeb;
                }


                .priority.low {
                    color: #027a48;
                    background: #ecfdf3;
                }


                /* ================================
                   WEEKLY SCHOOL TABLE
                ================================= */

                .weekly-table {
                    width: 100%;
                    min-width: 1050px;
                    border-collapse: separate;
                    border-spacing: 0;
                    border: 1px solid #d0d5dd;
                    border-radius: 12px;
                    overflow: hidden;
                }


                .weekly-table th,
                .weekly-table td {
                    border-right: 1px solid #d0d5dd;
                    border-bottom: 1px solid #d0d5dd;
                }


                .weekly-table th:last-child,
                .weekly-table td:last-child {
                    border-right: none;
                }


                .weekly-table tr:last-child td {
                    border-bottom: none;
                }


                .day-header {
                    width: 90px;
                    background: #182230;
                    color: white;
                    font-size: 10px;
                    letter-spacing: 1px;
                }


                .day-column {
                    background: #f8fafc;
                    padding: 13px 8px;
                    text-align: center;
                }


                .day-column span {
                    display: block;
                    font-size: 13px;
                    font-weight: 800;
                }


                .day-column small {
                    display: block;
                    color: #667085;
                    font-size: 9px;
                    margin-top: 3px;
                }


                .day-label-cell {
                    background: #f8fafc;
                    text-align: center;
                    vertical-align: top;
                    padding-top: 18px;
                }


                .day-label-cell div {
                    font-size: 21px;
                }


                .day-label-cell span {
                    display: block;
                    margin-top: 5px;
                    font-size: 9px;
                    font-weight: 800;
                    color: #667085;
                }


                .schedule-cell {
                    vertical-align: top;
                    padding: 10px;
                    min-width: 135px;
                    background: white;
                }


                .session-card {
                    border: 1px solid #e4e7ec;
                    border-radius: 10px;
                    padding: 11px;
                    margin-bottom: 9px;
                    background: #fbfcfd;
                    transition: 0.2s ease;
                }


                .session-card:last-child {
                    margin-bottom: 0;
                }


                .session-card:hover {
                    transform: translateY(-1px);
                    box-shadow:
                        0 5px 15px
                        rgba(16,24,40,0.07);
                }


                .session-card.completed {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                }


                .session-time {
                    color: #344054;
                    font-size: 11px;
                    font-weight: 800;
                    line-height: 1.4;
                }


                .session-subject {
                    margin-top: 7px;
                    font-size: 13px;
                    font-weight: 800;
                    line-height: 1.3;
                    word-break: break-word;
                }


                .session-duration {
                    margin-top: 5px;
                    color: #667085;
                    font-size: 10px;
                }


                .session-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 5px;
                    margin-top: 9px;
                }


                .mini-priority {
                    padding: 3px 6px;
                    border-radius: 12px;
                    font-size: 8px;
                    font-weight: 800;
                }


                .mini-priority.high {
                    background: #fff1f0;
                    color: #b42318;
                }


                .mini-priority.medium {
                    background: #fffaeb;
                    color: #b54708;
                }


                .mini-priority.low {
                    background: #ecfdf3;
                    color: #027a48;
                }


                .completed-label {
                    font-size: 9px;
                    color: #027a48;
                    font-weight: 800;
                }


                .session-actions {
                    display: flex;
                    gap: 5px;
                    margin-top: 9px;
                }


                .session-actions button {
                    flex: 1;
                    border: 1px solid #d0d5dd;
                    background: white;
                    border-radius: 6px;
                    padding: 5px 3px;
                    font-size: 9px;
                    font-weight: 700;
                    cursor: pointer;
                    color: #344054;
                }


                .session-actions button:hover {
                    background: #f2f4f7;
                }


                .session-actions .delete-session {
                    color: #b42318;
                    border-color: #fecdca;
                }


                .no-session {
                    min-height: 130px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #c0c6cf;
                    font-size: 11px;
                }


                /* ================================
                   EDIT BOX
                ================================= */

                .edit-box {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }


                .edit-box input,
                .edit-box select {
                    width: 100%;
                    height: 31px;
                    border: 1px solid #d0d5dd;
                    border-radius: 6px;
                    padding: 0 7px;
                    font-size: 10px;
                    outline: none;
                }


                .edit-check {
                    display: flex;
                    gap: 5px;
                    align-items: center;
                    font-size: 9px;
                    color: #475467;
                }


                .edit-buttons {
                    display: flex;
                    gap: 5px;
                }


                .edit-buttons button {
                    flex: 1;
                    padding: 6px 3px;
                    border-radius: 6px;
                    border: 1px solid #d0d5dd;
                    cursor: pointer;
                    font-size: 9px;
                    font-weight: 700;
                    background: white;
                }


                .edit-buttons .save-edit {
                    background: #182230;
                    color: white;
                    border-color: #182230;
                }


                /* ================================
                   STATE
                ================================= */

                .state-box {
                    min-height: 260px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #667085;
                }


                .state-box h3 {
                    margin: 15px 0 5px;
                    color: #172033;
                    font-size: 17px;
                }


                .state-box p {
                    margin: 0 0 18px;
                    font-size: 12px;
                }


                .empty-calendar {
                    font-size: 43px;
                }


                /* ================================
                   STUDY TIP
                ================================= */

                .study-tip {
                    display: flex;
                    gap: 13px;
                    align-items: flex-start;
                    background: #fffbeb;
                    border: 1px solid #f5e6a8;
                    border-radius: 12px;
                    padding: 14px 17px;
                    margin-bottom: 30px;
                }


                .study-tip > span {
                    font-size: 20px;
                }


                .study-tip strong {
                    font-size: 12px;
                }


                .study-tip p {
                    margin: 4px 0 0;
                    color: #667085;
                    font-size: 11px;
                    line-height: 1.5;
                }


                /* ================================
                   RESPONSIVE
                ================================= */

                @media (max-width: 1000px) {

                    .stats-grid {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }

                }


                @media (max-width: 760px) {

                    .timetable-page {
                        padding: 18px 12px;
                    }


                    .hero {
                        flex-direction: column;
                    }


                    .hero h1 {
                        font-size: 29px;
                    }


                    .header-actions {
                        width: 100%;
                    }


                    .header-actions button {
                        flex: 1;
                    }


                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }


                    .card {
                        padding: 18px;
                        border-radius: 13px;
                    }


                    .form-grid {
                        grid-template-columns: 1fr;
                    }


                    .field.full {
                        grid-column: auto;
                    }


                    .ai-top {
                        flex-direction: column;
                    }


                    .section-title {
                        align-items: flex-start;
                        flex-direction: column;
                    }


                    .preview-actions {
                        width: 100%;
                    }


                    .preview-actions button {
                        flex: 1;
                    }


                    .day-selector {
                        display: grid;
                        grid-template-columns:
                            repeat(4, 1fr);
                    }


                    .day-chip {
                        width: 100%;
                        min-width: 0;
                    }

                }


                @media (max-width: 480px) {

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }


                    .day-selector {
                        grid-template-columns:
                            repeat(2, 1fr);
                    }


                    .hero h1 {
                        font-size: 26px;
                    }


                    .ai-title h2 {
                        font-size: 18px;
                    }

                }

            `}</style>

        </div>
    );
}


/* =============================================================
   SESSION CARD RENDERER
============================================================= */

function groupedDayContent(items) {

    if (!items || items.length === 0) {

        return (
            <div className="no-session">
                Free
            </div>
        );
    }


    return items.map((item) => (

        <SessionCard
            key={item.id}
            item={item}
        />

    ));
}


/* =============================================================
   SESSION CARD
============================================================= */

function SessionCard({ item }) {

    const [editing, setEditing] =
        useState(false);

    const [data, setData] = useState({

        subject:
            item.subject || "",

        day:
            item.day || "Monday",

        start_time:
            String(
                item.start_time || ""
            ).slice(0, 5),

        end_time:
            String(
                item.end_time || ""
            ).slice(0, 5),

        priority:
            item.priority ||
            "Medium",

        completed:
            Boolean(item.completed),

    });


    const [busy, setBusy] =
        useState(false);


    function formatTime(value) {

        if (!value) {
            return "--";
        }

        const parts =
            String(value).split(":");

        let hour =
            Number(parts[0]);

        const minute =
            parts[1] || "00";

        const suffix =
            hour >= 12 ? "PM" : "AM";

        hour =
            hour % 12 || 12;

        return `${String(hour).padStart(
            2,
            "0"
        )}:${minute} ${suffix}`;
    }


    function timeToMinutes(value) {

        const parts =
            String(value || "")
                .split(":");

        return (
            Number(parts[0] || 0) * 60 +
            Number(parts[1] || 0)
        );
    }


    function duration() {

        let difference =
            timeToMinutes(
                data.end_time
            ) -
            timeToMinutes(
                data.start_time
            );

        if (difference <= 0) {
            return "";
        }

        const hours =
            Math.floor(
                difference / 60
            );

        const minutes =
            difference % 60;


        if (
            hours > 0 &&
            minutes > 0
        ) {

            return `${hours}h ${minutes}m`;

        }


        if (hours > 0) {
            return `${hours}h`;
        }


        return `${minutes}m`;
    }


    async function save() {

        if (!data.subject.trim()) {
            return;
        }


        if (
            !data.start_time ||
            !data.end_time
        ) {
            return;
        }


        if (
            timeToMinutes(
                data.end_time
            ) <=
            timeToMinutes(
                data.start_time
            )
        ) {
            alert(
                "End time must be later than start time."
            );
            return;
        }


        try {

            setBusy(true);


            await updateTimetable(
                item.id,
                {
                    subject:
                        data.subject.trim(),

                    day:
                        data.day,

                    start_time:
                        data.start_time,

                    end_time:
                        data.end_time,

                    priority:
                        data.priority,

                    completed:
                        data.completed,
                }
            );


            window.location.reload();

        } catch (error) {

            console.error(
                "SESSION UPDATE ERROR:",
                error
            );

            alert(
                error?.message ||
                "Unable to update session."
            );

        } finally {

            setBusy(false);

        }
    }


    async function remove() {

        const confirmed =
            window.confirm(
                `Delete "${item.subject}" session?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setBusy(true);


            await deleteTimetable(
                item.id
            );


            window.location.reload();

        } catch (error) {

            console.error(
                "SESSION DELETE ERROR:",
                error
            );

            alert(
                error?.message ||
                "Unable to delete session."
            );

        } finally {

            setBusy(false);

        }
    }


    if (editing) {

        return (

            <div className="session-card">

                <div className="edit-box">

                    <input
                        value={data.subject}
                        onChange={(e) =>
                            setData({
                                ...data,
                                subject:
                                    e.target.value,
                            })
                        }
                        placeholder="Subject"
                    />


                    <select
                        value={data.day}
                        onChange={(e) =>
                            setData({
                                ...data,
                                day:
                                    e.target.value,
                            })
                        }
                    >

                        {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                        ].map(
                            (day) => (
                                <option
                                    key={day}
                                >
                                    {day}
                                </option>
                            )
                        )}

                    </select>


                    <input
                        type="time"
                        value={data.start_time}
                        onChange={(e) =>
                            setData({
                                ...data,
                                start_time:
                                    e.target.value,
                            })
                        }
                    />


                    <input
                        type="time"
                        value={data.end_time}
                        onChange={(e) =>
                            setData({
                                ...data,
                                end_time:
                                    e.target.value,
                            })
                        }
                    />


                    <select
                        value={data.priority}
                        onChange={(e) =>
                            setData({
                                ...data,
                                priority:
                                    e.target.value,
                            })
                        }
                    >

                        <option>
                            High
                        </option>

                        <option>
                            Medium
                        </option>

                        <option>
                            Low
                        </option>

                    </select>


                    <label className="edit-check">

                        <input
                            type="checkbox"
                            checked={
                                data.completed
                            }
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    completed:
                                        e.target.checked,
                                })
                            }
                        />

                        Completed

                    </label>


                    <div className="edit-buttons">

                        <button
                            className="save-edit"
                            onClick={save}
                            disabled={busy}
                        >
                            Save
                        </button>

                        <button
                            onClick={() =>
                                setEditing(false)
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </div>

            </div>

        );
    }


    return (

        <div
            className={
                item.completed
                    ? "session-card completed"
                    : "session-card"
            }
        >

            <div className="session-time">

                {formatTime(
                    item.start_time
                )}

                {" → "}

                {formatTime(
                    item.end_time
                )}

            </div>


            <div className="session-subject">
                {item.subject}
            </div>


            <div className="session-duration">

                {(() => {

                    const start =
                        timeToMinutes(
                            item.start_time
                        );

                    const end =
                        timeToMinutes(
                            item.end_time
                        );

                    const diff =
                        end - start;

                    if (diff <= 0) {
                        return "";
                    }

                    const h =
                        Math.floor(
                            diff / 60
                        );

                    const m =
                        diff % 60;

                    if (h && m) {
                        return `${h}h ${m}m study`;
                    }

                    if (h) {
                        return `${h}h study`;
                    }

                    return `${m}m study`;

                })()}

            </div>


            <div className="session-bottom">

                <span
                    className={
                        `mini-priority ${
                            (
                                item.priority ||
                                "Medium"
                            ).toLowerCase()
                        }`
                    }
                >
                    {item.priority ||
                        "Medium"}
                </span>


                {item.completed && (

                    <span className="completed-label">
                        ✓ Done
                    </span>

                )}

            </div>


            <div className="session-actions">

                <button
                    onClick={() =>
                        setEditing(true)
                    }
                >
                    Edit
                </button>


                <button
                    className="delete-session"
                    onClick={remove}
                    disabled={busy}
                >
                    Delete
                </button>

            </div>

        </div>

    );
}


export default Timetable;