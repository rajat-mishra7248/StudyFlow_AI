import React, { useCallback, useEffect, useRef, useState } from "react";
import { getProgress } from "../services/api";

const REFRESH_INTERVAL = 30000;
const AUTO_REFRESH_THROTTLE = 1500;

function Progress() {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const mounted = useRef(false);
    const requestInFlight = useRef(false);
    const lastAutoRefresh = useRef(0);

    const loadProgress = useCallback(async (manual = false) => {
        // Never allow overlapping requests.
        if (requestInFlight.current) {
            return;
        }

        // Prevent focus + visibility events from firing two requests
        // almost at the same time.
        if (
            !manual &&
            Date.now() - lastAutoRefresh.current < AUTO_REFRESH_THROTTLE
        ) {
            return;
        }

        requestInFlight.current = true;

        if (!manual) {
            lastAutoRefresh.current = Date.now();
        }

        if (manual) {
            setRefreshing(true);
        }

        try {
            const data = await getProgress();

            if (!mounted.current) {
                return;
            }

            setProgress(data);
            setError("");
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Progress loading error:", err);

            if (!mounted.current) {
                return;
            }

            // Do not destroy already-loaded progress because of a
            // temporary background refresh failure.
            setError((previousError) => {
                if (!progress && !previousError) {
                    return err?.message || "Unable to load your progress.";
                }
                return previousError;
            });
        } finally {
            requestInFlight.current = false;

            if (mounted.current) {
                setLoading(false);

                if (manual) {
                    setRefreshing(false);
                }
            }
        }
    }, [progress]);

    useEffect(() => {
        mounted.current = true;

        // Initial load is not a button refresh.
        loadProgress(false);

        const interval = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                loadProgress(false);
            }
        }, REFRESH_INTERVAL);

        const refreshWhenActive = () => {
            if (document.visibilityState === "visible") {
                loadProgress(false);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refreshWhenActive();
            }
        };

        window.addEventListener("focus", refreshWhenActive);
        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            mounted.current = false;
            window.clearInterval(interval);
            window.removeEventListener("focus", refreshWhenActive);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [loadProgress]);

    if (loading && !progress) {
        return (
            <div style={styles.page}>
                <div style={styles.centerCard}>
                    <div style={styles.loadingIcon}>📊</div>
                    <h2 style={styles.centerTitle}>Building your progress</h2>
                    <p style={styles.muted}>
                        Loading your latest learning activity...
                    </p>
                    <div style={styles.loadingTrack}>
                        <div style={styles.loadingFill} />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !progress) {
        return (
            <div style={styles.page}>
                <div style={styles.centerCard}>
                    <div style={styles.errorIcon}>!</div>
                    <h2 style={styles.centerTitle}>Unable to load progress</h2>
                    <p style={styles.errorText}>{error}</p>
                    <button
                        type="button"
                        onClick={() => loadProgress(true)}
                        style={styles.primaryButton}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!progress) return null;

    const overall = clamp(progress.overall_progress);
    const completedQuizzes = num(progress.completed_quizzes);
    const totalQuizzes = num(progress.total_quizzes);
    const averageScore = clamp(progress.average_quiz_score);
    const bestScore = clamp(progress.best_quiz_score);
    const completedPlans = num(progress.completed_plans);
    const totalPlans = num(progress.total_plans);
    const pendingPlans = num(progress.pending_plans);
    const studyHours = Math.max(Number(progress.study_hours) || 0, 0);
    const studySessions = num(progress.study_sessions);

    const level = progress.performance_level || "Beginner";
    const recommendation =
        progress.recommendation ||
        "Keep studying consistently and complete more learning activities.";

    const planProgress =
        totalPlans > 0
            ? clamp((completedPlans / totalPlans) * 100)
            : 0;

    const displayHours =
        studyHours === 0
            ? "0h"
            : studyHours < 1
                ? `${Math.round(studyHours * 60)}m`
                : `${studyHours.toFixed(2)}h`;

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                <header className="sf-progress-header" style={styles.header}>
                    <div>
                        <div style={styles.eyebrow}>LEARNING ANALYTICS</div>
                        <h1 style={styles.title}>My Progress</h1>
                        <p style={styles.subtitle}>
                            Understand your study activity, quiz performance
                            and learning growth in one place.
                        </p>

                        <div style={styles.liveRow}>
                            <span style={styles.liveDot} />
                            <span style={styles.liveText}>
                                Live database tracking
                            </span>
                            {lastUpdated && (
                                <span style={styles.updated}>
                                    Updated {lastUpdated.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={refreshing}
                        onClick={() => loadProgress(true)}
                        style={{
                            ...styles.refreshButton,
                            opacity: refreshing ? 0.65 : 1,
                        }}
                    >
                        {refreshing ? "Updating..." : "↻ Refresh"}
                    </button>
                </header>

                <section style={styles.hero}>
                    <div style={styles.heroMain}>
                        <div style={styles.smallLabel}>
                            OVERALL LEARNING PROGRESS
                        </div>

                        <div style={styles.heroNumber}>
                            {overall.toFixed(0)}
                            <span>%</span>
                        </div>

                        <p style={styles.heroDescription}>
                            Calculated from completed study plans and quizzes.
                        </p>

                        <div style={styles.progressTrack}>
                            <div
                                style={{
                                    ...styles.progressFill,
                                    width: `${overall}%`,
                                }}
                            />
                        </div>

                        <div style={styles.progressLabels}>
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div style={styles.levelCard}>
                        <div style={styles.levelIcon}>
                            {overall >= 80 ? "🏆" : overall >= 50 ? "🚀" : "🌱"}
                        </div>
                        <div style={styles.levelCaption}>CURRENT LEVEL</div>
                        <strong style={styles.level}>{level}</strong>
                        <span style={styles.levelHint}>
                            Keep building consistent habits.
                        </span>
                    </div>
                </section>

                <div style={styles.sectionHeader}>
                    <div>
                        <div style={styles.sectionEyebrow}>REAL ACTIVITY</div>
                        <h2 style={styles.sectionTitle}>Study Activity</h2>
                        <p style={styles.sectionSubtitle}>
                            Recorded from completed study sessions in your account.
                        </p>
                    </div>
                    <span style={styles.liveBadge}>● LIVE</span>
                </div>

                <div className="sf-activity-grid" style={styles.activityGrid}>
                    <Metric
                        icon="⏱️"
                        value={displayHours}
                        label="Total Study Time"
                        helper="Recorded study time"
                    />
                    <Metric
                        icon="📚"
                        value={studySessions}
                        label="Study Sessions"
                        helper="Completed sessions"
                    />
                    <Metric
                        icon="📝"
                        value={completedQuizzes}
                        label="Quiz Attempts"
                        helper="Completed quizzes"
                    />
                </div>

                <div className="sf-two-column" style={styles.twoColumn}>
                    <section style={styles.card}>
                        <CardHeader
                            eyebrow="PERFORMANCE"
                            title="Quiz Performance"
                            subtitle="Your results from completed quizzes."
                            icon="🎯"
                        />

                        <div style={styles.scoreArea}>
                            <div>
                                <div style={styles.scoreNumber}>
                                    {averageScore.toFixed(0)}%
                                </div>
                                <div style={styles.muted}>Average score</div>
                            </div>

                            <div style={styles.ring}>
                                <div
                                    style={{
                                        ...styles.ringProgress,
                                        background: `conic-gradient(#2563eb ${bestScore}%, #e8edf5 0)`,
                                    }}
                                >
                                    <div style={styles.ringInner}>
                                        {bestScore.toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.miniGrid}>
                            <Mini label="Completed" value={completedQuizzes} />
                            <Mini label="Total" value={totalQuizzes} />
                            <Mini label="Best" value={`${bestScore.toFixed(0)}%`} />
                        </div>
                    </section>

                    <section style={styles.card}>
                        <CardHeader
                            eyebrow="PLANNING"
                            title="Study Plans"
                            subtitle="Track your plan completion."
                            icon="📚"
                        />

                        <div style={styles.planTop}>
                            <div>
                                <div style={styles.planPercent}>
                                    {planProgress.toFixed(0)}%
                                </div>
                                <div style={styles.muted}>Plan completion</div>
                            </div>

                            <div style={styles.planCount}>
                                <strong>{completedPlans}</strong> / {totalPlans}
                            </div>
                        </div>

                        <div style={styles.smallTrack}>
                            <div
                                style={{
                                    ...styles.smallFill,
                                    width: `${planProgress}%`,
                                }}
                            />
                        </div>

                        <div style={styles.planFooter}>
                            <Mini label="Completed" value={completedPlans} />
                            <Mini label="Pending" value={pendingPlans} />
                        </div>
                    </section>
                </div>

                <section style={styles.insight}>
                    <div style={styles.insightIcon}>✦</div>
                    <div>
                        <div style={styles.insightEyebrow}>
                            AI LEARNING INSIGHT
                        </div>
                        <h2 style={styles.insightTitle}>
                            Recommended Next Step
                        </h2>
                        <p style={styles.insightText}>{recommendation}</p>
                    </div>
                </section>

                <section style={styles.motivation}>
                    <div style={styles.motivationIcon}>🚀</div>
                    <div>
                        <h2 style={styles.motivationTitle}>
                            Consistency compounds
                        </h2>
                        <p style={styles.motivationText}>
                            Every completed study session, quiz and plan
                            contributes to your learning journey.
                        </p>
                    </div>
                    <div style={styles.motivationStat}>
                        <strong>{displayHours}</strong>
                        <span>studied</span>
                    </div>
                </section>
            </div>

            <style>{`
                @keyframes sfProgressLoading {
                    0% { transform: translateX(-120%); }
                    100% { transform: translateX(250%); }
                }

                @media (max-width: 850px) {
                    .sf-activity-grid,
                    .sf-two-column {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 600px) {
                    .sf-progress-header {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}

function CardHeader({ eyebrow, title, subtitle, icon }) {
    return (
        <div style={styles.cardHeader}>
            <div>
                <div style={styles.cardEyebrow}>{eyebrow}</div>
                <h2 style={styles.cardTitle}>{title}</h2>
                <p style={styles.cardSubtitle}>{subtitle}</p>
            </div>
            <div style={styles.iconBox}>{icon}</div>
        </div>
    );
}

function Metric({ icon, value, label, helper }) {
    return (
        <div style={styles.metric}>
            <div style={styles.metricIcon}>{icon}</div>
            <div>
                <strong style={styles.metricValue}>{value}</strong>
                <span style={styles.metricLabel}>{label}</span>
                <span style={styles.metricHelper}>{helper}</span>
            </div>
        </div>
    );
}

function Mini({ label, value }) {
    return (
        <div style={styles.mini}>
            <strong>{value}</strong>
            <span>{label}</span>
        </div>
    );
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function clamp(value) {
    return Math.min(100, Math.max(0, Number(value) || 0));
}

const styles = {
    page: {
        minHeight: "100vh",
        padding: "28px 18px 55px",
        boxSizing: "border-box",
        background: "linear-gradient(180deg,#f8fafc,#f1f5f9)",
        fontFamily: "Inter,Arial,sans-serif",
        color: "#101828",
    },

    container: {
        maxWidth: "1180px",
        margin: "0 auto",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "22px",
        padding: "30px",
        marginBottom: "20px",
        background: "#fff",
        border: "1px solid #e7ebf2",
        borderRadius: "24px",
        boxShadow: "0 12px 35px rgba(16,24,40,.055)",
    },

    eyebrow: {
        color: "#2563eb",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "8px",
    },

    title: {
        margin: 0,
        fontSize: "clamp(30px,4vw,39px)",
        letterSpacing: "-1px",
    },

    subtitle: {
        maxWidth: "670px",
        margin: "9px 0 0",
        color: "#667085",
        fontSize: "14px",
        lineHeight: 1.65,
    },

    liveRow: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "15px",
    },

    liveDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#12b76a",
        boxShadow: "0 0 0 4px #ecfdf3",
    },

    liveText: {
        color: "#027a48",
        fontSize: "11px",
        fontWeight: "800",
    },

    updated: {
        color: "#98a2b3",
        fontSize: "11px",
    },

    refreshButton: {
        border: "1px solid #d0d5dd",
        background: "#fff",
        color: "#344054",
        borderRadius: "12px",
        padding: "11px 16px",
        fontWeight: "750",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },

    hero: {
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 220px",
        gap: "32px",
        alignItems: "center",
        padding: "30px",
        marginBottom: "25px",
        borderRadius: "24px",
        border: "1px solid #dce6f7",
        background: "linear-gradient(135deg,#fff,#f6f9ff,#eef4ff)",
        boxShadow: "0 14px 42px rgba(37,99,235,.07)",
    },

    smallLabel: {
        color: "#667085",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.3px",
    },

    heroNumber: {
        marginTop: "5px",
        color: "#2563eb",
        fontSize: "clamp(52px,8vw,72px)",
        lineHeight: 1,
        fontWeight: "850",
        letterSpacing: "-3px",
    },

    heroDescription: {
        margin: "9px 0 0",
        color: "#667085",
        fontSize: "12px",
    },

    progressTrack: {
        height: "12px",
        marginTop: "22px",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#e5eaf2",
    },

    progressFill: {
        height: "100%",
        borderRadius: "20px",
        background: "linear-gradient(90deg,#2563eb,#60a5fa)",
        transition: "width .6s ease",
    },

    progressLabels: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "7px",
        color: "#98a2b3",
        fontSize: "10px",
    },

    levelCard: {
        padding: "23px 18px",
        textAlign: "center",
        borderRadius: "20px",
        background: "#fff",
        border: "1px solid #e4e9f1",
    },

    levelIcon: {
        width: "58px",
        height: "58px",
        margin: "0 auto 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        background: "#eef4ff",
        fontSize: "27px",
    },

    levelCaption: {
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.2px",
        color: "#98a2b3",
    },

    level: {
        display: "block",
        marginTop: "4px",
        fontSize: "19px",
    },

    levelHint: {
        display: "block",
        marginTop: "5px",
        color: "#667085",
        fontSize: "10px",
        lineHeight: 1.5,
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "15px",
        marginBottom: "12px",
    },

    sectionEyebrow: {
        color: "#667085",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.2px",
    },

    sectionTitle: {
        margin: "3px 0 0",
        fontSize: "21px",
    },

    sectionSubtitle: {
        margin: "4px 0 0",
        color: "#667085",
        fontSize: "12px",
    },

    liveBadge: {
        padding: "7px 10px",
        borderRadius: "20px",
        color: "#027a48",
        background: "#ecfdf3",
        fontSize: "9px",
        fontWeight: "800",
    },

    activityGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3,minmax(0,1fr))",
        gap: "14px",
        marginBottom: "20px",
    },

    metric: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "20px",
        borderRadius: "19px",
        background: "#fff",
        border: "1px solid #e7ebf2",
        boxShadow: "0 8px 25px rgba(16,24,40,.045)",
    },

    metricIcon: {
        width: "49px",
        height: "49px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "15px",
        background: "#f1f5ff",
        fontSize: "22px",
    },

    metricValue: {
        display: "block",
        fontSize: "25px",
        lineHeight: 1.1,
    },

    metricLabel: {
        display: "block",
        marginTop: "4px",
        color: "#344054",
        fontSize: "12px",
        fontWeight: "700",
    },

    metricHelper: {
        display: "block",
        marginTop: "3px",
        color: "#98a2b3",
        fontSize: "10px",
    },

    twoColumn: {
        display: "grid",
        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
        gap: "20px",
        marginBottom: "20px",
    },

    card: {
        padding: "25px",
        borderRadius: "22px",
        background: "#fff",
        border: "1px solid #e7ebf2",
        boxShadow: "0 9px 30px rgba(16,24,40,.05)",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
    },

    cardEyebrow: {
        color: "#667085",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.1px",
    },

    cardTitle: {
        margin: "4px 0 0",
        fontSize: "19px",
    },

    cardSubtitle: {
        margin: "5px 0 0",
        color: "#667085",
        fontSize: "12px",
        lineHeight: 1.5,
    },

    iconBox: {
        width: "44px",
        height: "44px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "14px",
        background: "#f2f4f7",
        fontSize: "20px",
    },

    scoreArea: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "27px",
    },

    scoreNumber: {
        color: "#2563eb",
        fontSize: "43px",
        fontWeight: "850",
        lineHeight: 1,
    },

    ring: {
        flexShrink: 0,
    },

    ringProgress: {
        width: "78px",
        height: "78px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
    },

    ringInner: {
        width: "61px",
        height: "61px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "#fff",
        color: "#344054",
        fontSize: "13px",
        fontWeight: "800",
    },

    miniGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "10px",
        marginTop: "25px",
    },

    mini: {
        padding: "12px",
        borderRadius: "13px",
        background: "#f8fafc",
    },

    planTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: "29px",
    },

    planPercent: {
        color: "#2563eb",
        fontSize: "42px",
        fontWeight: "850",
        lineHeight: 1,
    },

    planCount: {
        color: "#98a2b3",
        fontSize: "14px",
    },

    smallTrack: {
        height: "10px",
        marginTop: "21px",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#e9edf4",
    },

    smallFill: {
        height: "100%",
        borderRadius: "20px",
        background: "linear-gradient(90deg,#2563eb,#60a5fa)",
        transition: "width .6s ease",
    },

    planFooter: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        marginTop: "22px",
    },

    insight: {
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        padding: "25px",
        marginBottom: "20px",
        borderRadius: "22px",
        border: "1px solid #dce7ff",
        background: "linear-gradient(135deg,#eef4ff,#fafcff)",
    },

    insightIcon: {
        width: "50px",
        height: "50px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16px",
        background: "#fff",
        color: "#2563eb",
        fontSize: "24px",
    },

    insightEyebrow: {
        color: "#2563eb",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1.2px",
    },

    insightTitle: {
        margin: "4px 0 0",
        fontSize: "19px",
    },

    insightText: {
        margin: "8px 0 0",
        color: "#344054",
        fontSize: "13px",
        lineHeight: 1.7,
    },

    motivation: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "23px",
        borderRadius: "22px",
        background: "#fff",
        border: "1px solid #e7ebf2",
    },

    motivationIcon: {
        fontSize: "31px",
    },

    motivationTitle: {
        margin: 0,
        fontSize: "17px",
    },

    motivationText: {
        margin: "5px 0 0",
        color: "#667085",
        fontSize: "12px",
        lineHeight: 1.6,
    },

    motivationStat: {
        marginLeft: "auto",
        textAlign: "right",
    },

    muted: {
        color: "#667085",
        fontSize: "11px",
        lineHeight: 1.5,
    },

    centerCard: {
        width: "min(92%,520px)",
        margin: "100px auto",
        padding: "45px 30px",
        boxSizing: "border-box",
        textAlign: "center",
        background: "#fff",
        borderRadius: "24px",
        border: "1px solid #e7ebf2",
        boxShadow: "0 14px 40px rgba(16,24,40,.06)",
    },

    loadingIcon: {
        width: "66px",
        height: "66px",
        margin: "0 auto 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        background: "#eef4ff",
        fontSize: "30px",
    },

    errorIcon: {
        width: "66px",
        height: "66px",
        margin: "0 auto 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        background: "#fef3f2",
        color: "#b42318",
        fontSize: "30px",
        fontWeight: "800",
    },

    centerTitle: {
        margin: 0,
        fontSize: "21px",
    },

    loadingTrack: {
        height: "5px",
        marginTop: "22px",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#edf1f7",
    },

    loadingFill: {
        width: "45%",
        height: "100%",
        background: "#2563eb",
        borderRadius: "20px",
        animation: "sfProgressLoading 1.2s ease-in-out infinite",
    },

    errorText: {
        margin: "10px 0 20px",
        color: "#b42318",
        fontSize: "13px",
    },

    primaryButton: {
        border: "none",
        borderRadius: "11px",
        padding: "12px 20px",
        background: "#2563eb",
        color: "#fff",
        fontWeight: "750",
        cursor: "pointer",
    },
};

export default Progress;
