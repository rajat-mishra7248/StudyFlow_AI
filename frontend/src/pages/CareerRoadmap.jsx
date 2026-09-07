import React, { useState } from "react";
import { generateCareerRoadmap } from "../services/api";

// ============================================================
// CAREER OPTIONS
// ============================================================

const careerOptions = [
    {
        name: "AI Engineer",
        icon: "🤖",
        description: "Build intelligent AI applications",
    },
    {
        name: "Machine Learning Engineer",
        icon: "🧠",
        description: "Develop and deploy ML models",
    },
    {
        name: "Data Scientist",
        icon: "📊",
        description: "Turn data into useful insights",
    },
    {
        name: "Data Analyst",
        icon: "📈",
        description: "Analyze data and support decisions",
    },
    {
        name: "Python Backend Developer",
        icon: "🐍",
        description: "Build powerful backend systems",
    },
    {
        name: "Full Stack Developer",
        icon: "💻",
        description: "Create complete web applications",
    },
    {
        name: "Frontend Developer",
        icon: "🎨",
        description: "Build modern user interfaces",
    },
    {
        name: "Software Developer",
        icon: "⚙️",
        description: "Design and build software solutions",
    },
];

// ============================================================
// AI RESPONSE FORMATTER
// ============================================================

function renderInline(text) {
    const value = String(text || "");
    const parts = value.split(/(\*\*.*?\*\*|__.*?__|`.*?`)/g);

    return parts.map((part, index) => {
        if (/^\*\*.*\*\*$/.test(part) || /^__.*__$/.test(part)) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        if (/^`.*`$/.test(part)) {
            return <code key={index} style={styles.inlineCode}>{part.slice(1, -1)}</code>;
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

function renderRoadmap(text) {
    if (!text) return null;

    const lines = String(text).replace(/\r/g, "").split("\n");
    const elements = [];
    let inCodeBlock = false;
    let codeLines = [];

    lines.forEach((rawLine, index) => {
        const trimmed = rawLine.trim();

        if (trimmed.startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLines = [];
            } else {
                elements.push(
                    <pre key={`code-${index}`} style={styles.codeBlock}>
                        <code>{codeLines.join("\n")}</code>
                    </pre>
                );
                inCodeBlock = false;
                codeLines = [];
            }
            return;
        }

        if (inCodeBlock) {
            codeLines.push(rawLine);
            return;
        }

        if (!trimmed) {
            elements.push(<div key={`space-${index}`} style={styles.spacer} />);
            return;
        }

        const h1 = trimmed.match(/^#\s+(.*)$/);
        const h2 = trimmed.match(/^##\s+(.*)$/);
        const h3 = trimmed.match(/^###\s+(.*)$/);

        if (h1) {
            elements.push(
                <div key={`h1-${index}`} style={styles.headingRow}>
                    <span style={styles.headingAccent} />
                    <h2 style={styles.heading1}>{renderInline(h1[1])}</h2>
                </div>
            );
            return;
        }

        if (h2) {
            elements.push(
                <h3 key={`h2-${index}`} style={styles.heading2}>
                    {renderInline(h2[1])}
                </h3>
            );
            return;
        }

        if (h3) {
            elements.push(
                <h4 key={`h3-${index}`} style={styles.heading3}>
                    {renderInline(h3[1])}
                </h4>
            );
            return;
        }

        if (/^[-*•]\s+/.test(trimmed)) {
            elements.push(
                <div key={`bullet-${index}`} style={styles.bullet}>
                    <span style={styles.bulletIcon}>✓</span>
                    <span>{renderInline(trimmed.replace(/^[-*•]\s+/, ""))}</span>
                </div>
            );
            return;
        }

        const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
        if (numbered) {
            elements.push(
                <div key={`number-${index}`} style={styles.numbered}>
                    <span style={styles.numberBadge}>{numbered[1]}</span>
                    <span>{renderInline(numbered[2])}</span>
                </div>
            );
            return;
        }

        if (/^(---|\*\*\*|___)$/.test(trimmed)) {
            elements.push(<hr key={`divider-${index}`} style={styles.divider} />);
            return;
        }

        elements.push(
            <p key={`paragraph-${index}`} style={styles.paragraph}>
                {renderInline(trimmed)}
            </p>
        );
    });

    if (inCodeBlock && codeLines.length) {
        elements.push(
            <pre key="final-code" style={styles.codeBlock}>
                <code>{codeLines.join("\n")}</code>
            </pre>
        );
    }

    return elements;
}

// ============================================================
// CAREER ROADMAP COMPONENT
// ============================================================

function CareerRoadmap() {
    const [goal, setGoal] = useState("AI Engineer");
    const [roadmap, setRoadmap] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // ========================================================
    // GENERATE ROADMAP
    // ========================================================

    const handleGenerateRoadmap = async () => {
        if (!goal.trim()) {
            setError("Please select a career goal.");
            return;
        }

        setLoading(true);
        setError("");
        setRoadmap("");
        setCopied(false);

        try {
            console.log(
                "Generating career roadmap for:",
                goal
            );

            const response =
                await generateCareerRoadmap({
                    goal: goal,
                });

            console.log(
                "Career roadmap response:",
                response
            );

            const result =
                response?.response ||
                response?.data?.response ||
                response?.answer ||
                response?.message ||
                (typeof response === "string"
                    ? response
                    : "");

            if (!result || !result.trim()) {
                throw new Error(
                    "AI generated an empty roadmap. Please try again."
                );
            }

            setRoadmap(result);

            // Scroll toward result
            setTimeout(() => {
                document
                    .getElementById("career-roadmap-result")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
            }, 100);

        } catch (err) {
            console.error(
                "Career roadmap error:",
                err
            );

            setError(
                err.message ||
                    "Unable to generate career roadmap. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // CLEAR
    // ========================================================

    const handleClear = () => {
        setRoadmap("");
        setError("");
        setCopied(false);
    };

    // ========================================================
    // COPY
    // ========================================================

    const handleCopy = async () => {
        if (!roadmap) return;

        try {
            await navigator.clipboard.writeText(roadmap);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error(
                "Copy error:",
                err
            );

            setError(
                "Unable to copy roadmap."
            );
        }
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="career-roadmap-page" style={styles.page}>

            <div style={styles.container}>

                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="career-roadmap-hero" style={styles.hero}>

                    <div style={styles.heroGlow}></div>

                    <div style={styles.heroIcon}>
                        🚀
                    </div>

                    <div style={styles.heroContent}>

                        <div style={styles.eyebrow}>
                            <span style={styles.eyebrowDot}>
                                ✦
                            </span>

                            AI CAREER PLANNER
                        </div>

                        <h1 className="career-roadmap-title" style={styles.title}>
                            Build Your
                            <span style={styles.titleAccent}>
                                {" "}Career Roadmap
                            </span>
                        </h1>

                        <p style={styles.subtitle}>
                            Choose a target career and let
                            StudyFlow AI turn your goal into a clear,
                            practical learning journey.
                        </p>

                    </div>

                </section>


                {/* ==================================================
                    CAREER SELECTOR
                ================================================== */}

                <section className="career-roadmap-selector" style={styles.selectorCard}>

                    <div className="career-roadmap-section-header" style={styles.sectionHeader}>

                        <div>

                            <div style={styles.sectionEyebrow}>
                                STEP 1
                            </div>

                            <h2 style={styles.sectionTitle}>
                                What career are you preparing for?
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                Choose the path that best matches your current goal.
                            </p>

                        </div>

                        <div style={styles.targetIcon}>
                            🎯
                        </div>

                    </div>


                    {/* CAREER GRID */}

                    <div className="career-roadmap-career-grid" style={styles.careerGrid}>

                        {careerOptions.map((career) => {

                            const selected =
                                goal === career.name;

                            return (
                                <button
                                    key={career.name}
                                    type="button"
                                    onClick={() =>
                                        setGoal(career.name)
                                    }
                                    style={{
                                        ...styles.careerCard,
                                        ...(selected
                                            ? styles.careerCardSelected
                                            : {}),
                                    }}
                                >

                                    <div
                                        style={{
                                            ...styles.careerIcon,
                                            ...(selected
                                                ? styles.careerIconSelected
                                                : {}),
                                        }}
                                    >
                                        {career.icon}
                                    </div>

                                    <div style={styles.careerInfo}>

                                        <strong
                                            style={{
                                                ...styles.careerName,
                                                ...(selected
                                                    ? styles.careerNameSelected
                                                    : {}),
                                            }}
                                        >
                                            {career.name}
                                        </strong>

                                        <span
                                            style={
                                                styles.careerDescription
                                            }
                                        >
                                            {career.description}
                                        </span>

                                    </div>

                                    <div
                                        style={{
                                            ...styles.radio,
                                            ...(selected
                                                ? styles.radioSelected
                                                : {}),
                                        }}
                                    >
                                        {selected && "✓"}
                                    </div>

                                </button>
                            );
                        })}

                    </div>


                    {/* SELECTED CAREER */}

                    <div className="career-roadmap-selected" style={styles.selectedCareer}>

                        <div style={styles.selectedLeft}>

                            <span style={styles.selectedLabel}>
                                YOUR TARGET
                            </span>

                            <strong>
                                {goal}
                            </strong>

                        </div>

                        <span style={styles.selectedCheck}>
                            ✓ Selected
                        </span>

                    </div>


                    {/* GENERATE BUTTON */}

                    <button
                        type="button"
                        onClick={handleGenerateRoadmap}
                        disabled={loading}
                        className="career-roadmap-generate"
                        style={{
                            ...styles.generateButton,
                            ...(loading
                                ? styles.generateButtonDisabled
                                : {}),
                        }}
                    >

                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>

                                Creating your roadmap...
                            </>
                        ) : (
                            <>
                                ✨

                                <span>
                                    Generate My Career Roadmap
                                </span>

                                <span style={styles.buttonArrow}>
                                    →
                                </span>
                            </>
                        )}

                    </button>

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div style={styles.errorCard}>

                        <div style={styles.errorIcon}>
                            !
                        </div>

                        <div>
                            <strong>
                                Something went wrong
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>

                    </div>

                )}


                {/* ==================================================
                    LOADING
                ================================================== */}

                {loading && (

                    <section style={styles.loadingCard}>

                        <div style={styles.loadingAnimation}>

                            <div style={styles.loadingCircle}>
                                🤖
                            </div>

                        </div>

                        <h2 style={styles.loadingTitle}>
                            Building your career path...
                        </h2>

                        <p style={styles.loadingText}>
                            StudyFlow AI is analyzing the skills,
                            technologies and learning steps needed
                            for your target career.
                        </p>

                        <div style={styles.loadingSteps}>

                            <span style={styles.loadingStepActive}>
                                ✓ Analyzing career
                            </span>

                            <span>
                                • Planning skills
                            </span>

                            <span>
                                • Creating roadmap
                            </span>

                        </div>

                    </section>

                )}


                {/* ==================================================
                    RESULT
                ================================================== */}

                {!loading && roadmap && (

                    <section
                        id="career-roadmap-result"
                        style={styles.resultCard}
                    >

                        {/* RESULT HEADER */}

                        <div className="career-roadmap-result-top" style={styles.resultTop}>

                            <div style={styles.resultIdentity}>

                                <div style={styles.resultIcon}>
                                    🚀
                                </div>

                                <div>

                                    <div style={styles.resultBadge}>
                                        ✦ AI GENERATED
                                    </div>

                                    <h2 style={styles.resultTitle}>
                                        {goal} Roadmap
                                    </h2>

                                    <p style={styles.resultSubtitle}>
                                        A structured learning journey
                                        for your next career move
                                    </p>

                                </div>

                            </div>


                            <div className="career-roadmap-result-actions" style={styles.resultActions}>

                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    style={styles.copyButton}
                                >
                                    {copied
                                        ? "✓ Copied"
                                        : "📋 Copy"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClear}
                                    style={styles.clearButton}
                                >
                                    Clear
                                </button>

                            </div>

                        </div>


                        {/* PROGRESS STYLE INFO */}

                        <div className="career-roadmap-intro" style={styles.roadmapIntro}>

                            <div style={styles.introIcon}>
                                💡
                            </div>

                            <div>

                                <strong>
                                    How to use your roadmap
                                </strong>

                                <p>
                                    Move through the roadmap in order. Focus on fundamentals,
                                    build practical projects, practice consistently,
                                    and track what you complete.
                                </p>

                            </div>

                        </div>


                        {/* ROADMAP CONTENT */}

                        <div className="career-roadmap-content" style={styles.roadmapContent}>
                            {renderRoadmap(roadmap)}
                        </div>


                        {/* FOOTER */}

                        <div className="career-roadmap-footer" style={styles.resultFooter}>

                            <div style={styles.footerIcon}>
                                🎓
                            </div>

                            <div>

                                <strong>
                                    Keep building your momentum
                                </strong>

                                <span>
                                    A roadmap becomes valuable when you turn each step
                                    into practice, projects and measurable progress.
                                </span>

                            </div>

                        </div>

                    </section>

                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {!loading &&
                    !roadmap &&
                    !error && (

                        <section style={styles.emptyCard}>

                            <div style={styles.emptyIllustration}>
                                🧭
                            </div>

                            <h2 style={styles.emptyTitle}>
                                Your career journey starts here
                            </h2>

                            <p style={styles.emptyText}>
                                Select a career above and generate
                                an AI-powered roadmap containing the
                                skills, technologies and learning
                                direction you need.
                            </p>


                            <div className="career-roadmap-empty-benefits" style={styles.benefits}>

                                <div style={styles.benefit}>
                                    <span>📚</span>
                                    <div>
                                        <strong>
                                            Skills
                                        </strong>
                                        <small>
                                            Learn what matters
                                        </small>
                                    </div>
                                </div>

                                <div style={styles.benefit}>
                                    <span>🛠️</span>
                                    <div>
                                        <strong>
                                            Projects
                                        </strong>
                                        <small>
                                            Build practical experience
                                        </small>
                                    </div>
                                </div>

                                <div style={styles.benefit}>
                                    <span>💼</span>
                                    <div>
                                        <strong>
                                            Career
                                        </strong>
                                        <small>
                                            Prepare for opportunities
                                        </small>
                                    </div>
                                </div>

                            </div>

                        </section>

                    )}

            </div>

            <style>{`
                @media (max-width: 820px) {
                    .career-roadmap-page { padding: 20px 14px 50px !important; }
                    .career-roadmap-hero { flex-direction: column !important; align-items: flex-start !important; padding: 26px !important; }
                    .career-roadmap-title { font-size: 30px !important; }
                    .career-roadmap-section-header,
                    .career-roadmap-result-top { flex-direction: column !important; align-items: flex-start !important; }
                    .career-roadmap-result-actions { width: 100% !important; }
                    .career-roadmap-result-actions button { flex: 1 !important; }
                }
                @media (max-width: 560px) {
                    .career-roadmap-selector { padding: 20px !important; }
                    .career-roadmap-career-grid { grid-template-columns: 1fr !important; }
                    .career-roadmap-selected { flex-direction: column !important; align-items: flex-start !important; }
                    .career-roadmap-generate { width: 100% !important; }
                    .career-roadmap-content { padding: 8px 18px 24px !important; }
                    .career-roadmap-intro { margin-left: 18px !important; margin-right: 18px !important; }
                    .career-roadmap-footer { margin-left: 18px !important; margin-right: 18px !important; }
                    .career-roadmap-empty-benefits { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}


// ============================================================
// STYLES
// ============================================================

const styles = {

    page: {
        minHeight: "100vh",
        background:
            "linear-gradient(180deg, #f8faff 0%, #f4f6fb 100%)",
        padding: "28px 20px 60px",
        fontFamily:
            "Inter, Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        color: "#101828",
    },

    container: {
        maxWidth: "1080px",
        margin: "0 auto",
    },

    // ========================================================
    // HERO
    // ========================================================

    hero: {
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: "22px",
        padding: "34px",
        marginBottom: "22px",
        borderRadius: "24px",
        background:
            "linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)",
        border: "1px solid #e4e9f2",
        boxShadow:
            "0 12px 40px rgba(16,24,40,0.07)",
    },

    heroGlow: {
        position: "absolute",
        width: "180px",
        height: "180px",
        right: "-70px",
        top: "-70px",
        borderRadius: "50%",
        background:
            "rgba(37,99,235,0.08)",
    },

    heroIcon: {
        position: "relative",
        width: "70px",
        height: "70px",
        minWidth: "70px",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "37px",
        background: "#ffffff",
        border: "1px solid #dbe4f4",
        boxShadow:
            "0 8px 20px rgba(37,99,235,0.10)",
    },

    heroContent: {
        position: "relative",
    },

    eyebrow: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.2px",
        color: "#2563eb",
        marginBottom: "7px",
    },

    eyebrowDot: {
        fontSize: "14px",
    },

    title: {
        margin: 0,
        fontSize: "36px",
        lineHeight: "1.2",
        fontWeight: "800",
        letterSpacing: "-0.7px",
    },

    titleAccent: {
        color: "#2563eb",
    },

    subtitle: {
        margin: "9px 0 0",
        maxWidth: "700px",
        color: "#667085",
        fontSize: "15px",
        lineHeight: "1.65",
    },

    // ========================================================
    // SELECTOR
    // ========================================================

    selectorCard: {
        background: "#ffffff",
        padding: "30px",
        borderRadius: "24px",
        border: "1px solid #e4e7ec",
        boxShadow:
            "0 14px 40px rgba(16,24,40,0.07)",
        marginBottom: "22px",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        marginBottom: "22px",
    },

    sectionEyebrow: {
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1px",
        color: "#2563eb",
        marginBottom: "5px",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: "750",
    },

    sectionSubtitle: {
        margin: "6px 0 0",
        color: "#667085",
        fontSize: "14px",
    },

    targetIcon: {
        width: "45px",
        height: "45px",
        borderRadius: "13px",
        background: "#f2f6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
    },

    careerGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "12px",
    },

    careerCard: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left",
        padding: "15px",
        borderRadius: "14px",
        border: "1px solid #e4e7ec",
        background: "#ffffff",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: "82px",
    },

    careerCardSelected: {
        border:
            "1.5px solid #2563eb",
        background: "#f5f8ff",
        boxShadow:
            "0 5px 15px rgba(37,99,235,0.08)",
    },

    careerIcon: {
        width: "43px",
        height: "43px",
        minWidth: "43px",
        borderRadius: "12px",
        background: "#f2f4f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
    },

    careerIconSelected: {
        background: "#e7efff",
    },

    careerInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        paddingRight: "18px",
    },

    careerName: {
        fontSize: "14px",
        color: "#344054",
    },

    careerNameSelected: {
        color: "#1d4ed8",
    },

    careerDescription: {
        fontSize: "11px",
        lineHeight: "1.4",
        color: "#667085",
    },

    radio: {
        position: "absolute",
        top: "13px",
        right: "13px",
        width: "19px",
        height: "19px",
        borderRadius: "50%",
        border: "1px solid #d0d5dd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        color: "#ffffff",
        fontWeight: "800",
    },

    radioSelected: {
        background: "#2563eb",
        borderColor: "#2563eb",
    },

    selectedCareer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        marginTop: "18px",
        padding: "13px 15px",
        borderRadius: "12px",
        background: "#f8fafc",
        border: "1px solid #eaecf0",
    },

    selectedLeft: {
        display: "flex",
        flexDirection: "column",
        gap: "3px",
    },

    selectedLabel: {
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "1px",
        color: "#98a2b3",
    },

    selectedCheck: {
        color: "#027a48",
        fontSize: "12px",
        fontWeight: "700",
        background: "#ecfdf3",
        padding: "6px 9px",
        borderRadius: "7px",
    },

    generateButton: {
        width: "100%",
        marginTop: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        border: "none",
        borderRadius: "12px",
        padding: "15px 20px",
        background:
            "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow:
            "0 7px 18px rgba(37,99,235,0.20)",
    },

    generateButtonDisabled: {
        opacity: 0.75,
        cursor: "not-allowed",
    },

    buttonArrow: {
        fontSize: "20px",
        marginLeft: "2px",
    },

    spinner: {
        width: "17px",
        height: "17px",
        border:
            "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "#ffffff",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
    },

    // ========================================================
    // ERROR
    // ========================================================

    errorCard: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "15px",
        marginBottom: "22px",
        borderRadius: "13px",
        background: "#fff5f5",
        border: "1px solid #fecdca",
        color: "#b42318",
    },

    errorIcon: {
        width: "24px",
        height: "24px",
        minWidth: "24px",
        borderRadius: "50%",
        background: "#f04438",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "13px",
    },

    // ========================================================
    // LOADING
    // ========================================================

    loadingCard: {
        background: "#ffffff",
        borderRadius: "22px",
        padding: "45px 30px",
        textAlign: "center",
        border: "1px solid #e4e7ec",
        boxShadow:
            "0 10px 30px rgba(16,24,40,0.05)",
        marginBottom: "22px",
    },

    loadingAnimation: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "18px",
    },

    loadingCircle: {
        width: "72px",
        height: "72px",
        borderRadius: "22px",
        background: "#eef4ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
        boxShadow:
            "0 0 0 8px #f7f9ff",
    },

    loadingTitle: {
        margin: 0,
        fontSize: "20px",
    },

    loadingText: {
        maxWidth: "560px",
        margin: "8px auto 0",
        color: "#667085",
        lineHeight: "1.6",
        fontSize: "14px",
    },

    loadingSteps: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "22px",
        fontSize: "12px",
        color: "#98a2b3",
    },

    loadingStepActive: {
        color: "#027a48",
        fontWeight: "600",
    },

    // ========================================================
    // RESULT
    // ========================================================

    resultCard: {
        background: "#ffffff",
        borderRadius: "22px",
        border: "1px solid #e4e7ec",
        overflow: "hidden",
        boxShadow:
            "0 12px 35px rgba(16,24,40,0.07)",
    },

    resultTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        padding: "25px 28px",
        borderBottom: "1px solid #eaecf0",
        background:
            "linear-gradient(180deg, #fbfcff, #ffffff)",
    },

    resultIdentity: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
    },

    resultIcon: {
        width: "52px",
        height: "52px",
        minWidth: "52px",
        borderRadius: "15px",
        background: "#eef4ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "26px",
    },

    resultBadge: {
        display: "inline-block",
        color: "#027a48",
        background: "#ecfdf3",
        padding: "4px 7px",
        borderRadius: "5px",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "0.8px",
        marginBottom: "5px",
    },

    resultTitle: {
        margin: 0,
        fontSize: "23px",
        lineHeight: "1.25",
    },

    resultSubtitle: {
        margin: "4px 0 0",
        color: "#667085",
        fontSize: "12px",
    },

    resultActions: {
        display: "flex",
        gap: "8px",
    },

    copyButton: {
        background: "#eef4ff",
        color: "#1d4ed8",
        border: "1px solid #dbe7ff",
        borderRadius: "8px",
        padding: "9px 13px",
        fontWeight: "700",
        fontSize: "12px",
        cursor: "pointer",
    },

    clearButton: {
        background: "#ffffff",
        color: "#344054",
        border: "1px solid #d0d5dd",
        borderRadius: "8px",
        padding: "9px 13px",
        fontWeight: "600",
        fontSize: "12px",
        cursor: "pointer",
    },

    roadmapIntro: {
        display: "flex",
        alignItems: "flex-start",
        gap: "11px",
        margin: "22px 28px 0",
        padding: "14px",
        borderRadius: "12px",
        background: "#f8fafc",
        border: "1px solid #eaecf0",
    },

    introIcon: {
        fontSize: "20px",
    },

    roadmapContent: {
        padding: "8px 28px 28px",
        color: "#344054",
        lineHeight: "1.75",
        fontSize: "14px",
    },

    headingRow: {
        display: "flex",
        alignItems: "center",
        gap: "11px",
        margin: "27px 0 12px",
    },

    headingAccent: {
        width: "4px",
        height: "30px",
        flexShrink: 0,
        borderRadius: "999px",
        background: "linear-gradient(180deg, #4f46e5, #818cf8)",
    },

    inlineCode: {
        display: "inline-block",
        padding: "1px 6px",
        margin: "0 2px",
        borderRadius: "5px",
        background: "#f2f4f7",
        border: "1px solid #e4e7ec",
        color: "#344054",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: "0.92em",
    },

    codeBlock: {
        overflowX: "auto",
        margin: "18px 0",
        padding: "16px",
        borderRadius: "13px",
        background: "#101828",
        color: "#e4e7ec",
        border: "1px solid #1d2939",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: "12px",
        lineHeight: "1.65",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },

    divider: {
        border: "none",
        borderTop: "1px solid #eaecf0",
        margin: "24px 0",
    },

    heading1: {
        fontSize: "24px",
        color: "#101828",
        margin: "25px 0 12px",
    },

    heading2: {
        fontSize: "20px",
        color: "#1d2939",
        margin: "24px 0 10px",
        paddingBottom: "7px",
        borderBottom: "1px solid #eaecf0",
    },

    heading3: {
        fontSize: "17px",
        color: "#344054",
        margin: "20px 0 8px",
    },

    paragraph: {
        margin: "8px 0",
        lineHeight: "1.8",
    },

    bullet: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        margin: "8px 0",
        lineHeight: "1.7",
    },

    bulletIcon: {
        width: "20px",
        height: "20px",
        minWidth: "20px",
        borderRadius: "50%",
        background: "#ecfdf3",
        color: "#027a48",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "800",
        marginTop: "3px",
    },

    numbered: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        margin: "10px 0",
        lineHeight: "1.7",
    },

    numberBadge: {
        width: "23px",
        height: "23px",
        minWidth: "23px",
        borderRadius: "7px",
        background: "#eef4ff",
        color: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "800",
        marginTop: "2px",
    },

    spacer: {
        height: "8px",
    },

    resultFooter: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "0 28px 28px",
        padding: "15px",
        borderRadius: "12px",
        background: "#f5f8ff",
        border: "1px solid #e0e9ff",
    },

    footerIcon: {
        fontSize: "24px",
    },

    // ========================================================
    // EMPTY
    // ========================================================

    emptyCard: {
        background: "#ffffff",
        borderRadius: "22px",
        padding: "45px 30px",
        textAlign: "center",
        border: "1px solid #e4e7ec",
        boxShadow:
            "0 10px 30px rgba(16,24,40,0.05)",
    },

    emptyIllustration: {
        width: "75px",
        height: "75px",
        margin: "0 auto 17px",
        borderRadius: "22px",
        background: "#f2f6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "38px",
    },

    emptyTitle: {
        margin: 0,
        fontSize: "21px",
    },

    emptyText: {
        maxWidth: "600px",
        margin: "9px auto 0",
        color: "#667085",
        fontSize: "14px",
        lineHeight: "1.7",
    },

    benefits: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        maxWidth: "700px",
        margin: "25px auto 0",
    },

    benefit: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textAlign: "left",
        padding: "13px",
        borderRadius: "11px",
        background: "#f8fafc",
        border: "1px solid #eaecf0",
    },
};

export default CareerRoadmap;