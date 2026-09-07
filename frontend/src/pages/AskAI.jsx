import React, { useState } from "react";
import { solveDoubt } from "../services/api";

// ============================================================
// QUICK QUESTIONS
// ============================================================

const quickQuestions = [
{
icon: "🐍",
title: "Python",
question: "Explain Python functions with a simple example.",
},
{
icon: "🌐",
title: "REST API",
question: "What is a REST API and how does it work?",
},
{
icon: "🤖",
title: "Machine Learning",
question: "Explain machine learning in simple terms.",
},
{
icon: "🗄️",
title: "SQL",
question: "Explain SQL JOIN with a simple example.",
},
];

// ============================================================
// INLINE TEXT FORMATTER
// ============================================================

function formatInlineText(text) {
if (!text) return "";

const parts = text.split(
    /(\*\*.*?\*\*|__.*?__|`.*?`)/g
);

return parts.map((part, index) => {
    // BOLD
    if (
        (part.startsWith("**") && part.endsWith("**")) ||
        (part.startsWith("__") && part.endsWith("__"))
    ) {
        return (
            <strong
                key={index}
                style={styles.boldText}
            >
                {part.slice(2, -2)}
            </strong>
        );
    }

    // INLINE CODE
    if (
        part.startsWith("`") &&
        part.endsWith("`")
    ) {
        return (
            <code
                key={index}
                style={styles.inlineCode}
            >
                {part.slice(1, -1)}
            </code>
        );
    }

    return part;
});

}

// ============================================================
// FORMAT AI RESPONSE
// ============================================================

function formatAIResponse(text) {
if (!text) return null;

const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n");

const elements = [];

let inCodeBlock = false;
let codeLines = [];
let codeLanguage = "";

const flushCodeBlock = () => {
    if (codeLines.length > 0) {
        elements.push(
            <div
                key={`code-${elements.length}`}
                style={styles.codeWrapper}
            >
                {codeLanguage && (
                    <div style={styles.codeLanguage}>
                        {codeLanguage}
                    </div>
                )}

                <pre style={styles.codeBlock}>
                    <code>
                        {codeLines.join("\n")}
                    </code>
                </pre>
            </div>
        );
    }

    codeLines = [];
    codeLanguage = "";
};

lines.forEach((line, index) => {
    const trimmed = line.trim();

    // ====================================================
    // CODE BLOCK
    // ====================================================

    if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
            inCodeBlock = true;
            codeLanguage = trimmed
                .substring(3)
                .trim();

            codeLines = [];
        } else {
            inCodeBlock = false;
            flushCodeBlock();
        }

        return;
    }

    if (inCodeBlock) {
        codeLines.push(line);
        return;
    }

    // ====================================================
    // EMPTY LINE
    // ====================================================

    if (!trimmed) {
        elements.push(
            <div
                key={`space-${index}`}
                style={styles.responseSpacing}
            />
        );

        return;
    }

    // ====================================================
    // H1
    // ====================================================

    if (/^#\s+/.test(trimmed)) {
        elements.push(
            <h2
                key={index}
                style={styles.responseH1}
            >
                {formatInlineText(
                    trimmed.replace(/^#\s+/, "")
                )}
            </h2>
        );

        return;
    }

    // ====================================================
    // H2
    // ====================================================

    if (/^##\s+/.test(trimmed)) {
        elements.push(
            <h3
                key={index}
                style={styles.responseH2}
            >
                {formatInlineText(
                    trimmed.replace(/^##\s+/, "")
                )}
            </h3>
        );

        return;
    }

    // ====================================================
    // H3
    // ====================================================

    if (/^###\s+/.test(trimmed)) {
        elements.push(
            <h4
                key={index}
                style={styles.responseH3}
            >
                {formatInlineText(
                    trimmed.replace(/^###\s+/, "")
                )}
            </h4>
        );

        return;
    }

    // ====================================================
    // BULLET
    // ====================================================

    if (/^[-*•]\s+/.test(trimmed)) {
        elements.push(
            <div
                key={index}
                style={styles.bulletRow}
            >
                <span style={styles.bulletDot}>
                    ✦
                </span>

                <span style={styles.listText}>
                    {formatInlineText(
                        trimmed.replace(
                            /^[-*•]\s+/,
                            ""
                        )
                    )}
                </span>
            </div>
        );

        return;
    }

    // ====================================================
    // NUMBERED LIST
    // ====================================================

    const numberedMatch = trimmed.match(
        /^(\d+)[.)]\s+(.*)$/
    );

    if (numberedMatch) {
        elements.push(
            <div
                key={index}
                style={styles.numberRow}
            >
                <span style={styles.numberBadge}>
                    {numberedMatch[1]}
                </span>

                <span style={styles.listText}>
                    {formatInlineText(
                        numberedMatch[2]
                    )}
                </span>
            </div>
        );

        return;
    }

    // ====================================================
    // BLOCKQUOTE / TIP
    // ====================================================

    if (trimmed.startsWith("> ")) {
        elements.push(
            <div
                key={index}
                style={styles.quoteBox}
            >
                <span style={styles.quoteIcon}>
                    💡
                </span>

                <span>
                    {formatInlineText(
                        trimmed.replace(/^>\s+/, "")
                    )}
                </span>
            </div>
        );

        return;
    }

    // ====================================================
    // NORMAL PARAGRAPH
    // ====================================================

    elements.push(
        <p
            key={index}
            style={styles.responseParagraph}
        >
            {formatInlineText(trimmed)}
        </p>
    );
});

// ========================================================
// HANDLE UNFINISHED CODE BLOCK
// ========================================================

if (inCodeBlock) {
    flushCodeBlock();
}

return elements;

}

// ============================================================
// ASK AI COMPONENT
// ============================================================

function AskAI() {
const [question, setQuestion] = useState("");
const [response, setResponse] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [copied, setCopied] = useState(false);

// ========================================================
// ASK AI
// ========================================================

const handleAskAI = async () => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
        setError("Please enter a question first.");
        return;
    }

    if (loading) {
        return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setCopied(false);

    try {
        console.log(
            "Sending question to AI:",
            cleanQuestion
        );

        const data = await solveDoubt({
            question: cleanQuestion,
        });

        console.log(
            "AI response:",
            data
        );

        let aiResponse = "";

        if (typeof data === "string") {
            aiResponse = data;
        } else if (
            typeof data?.response === "string"
        ) {
            aiResponse = data.response;
        } else if (
            typeof data?.answer === "string"
        ) {
            aiResponse = data.answer;
        } else if (
            typeof data?.message === "string"
        ) {
            aiResponse = data.message;
        } else if (
            typeof data?.data?.response === "string"
        ) {
            aiResponse = data.data.response;
        } else if (
            typeof data?.data?.answer === "string"
        ) {
            aiResponse = data.data.answer;
        }

        if (!aiResponse.trim()) {
            throw new Error(
                "AI returned an empty response."
            );
        }

        setResponse(aiResponse.trim());
    } catch (err) {
        console.error(
            "Ask AI error:",
            err
        );

        setError(
            err?.message ||
                "Unable to get a response from StudyFlow AI."
        );
    } finally {
        setLoading(false);
    }
};

// ========================================================
// QUICK QUESTION
// ========================================================

const handleQuickQuestion = (text) => {
    setQuestion(text);
    setError("");

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

// ========================================================
// CLEAR
// ========================================================

const handleClear = () => {
    setQuestion("");
    setResponse("");
    setError("");
    setCopied(false);
};

// ========================================================
// COPY
// ========================================================

const handleCopy = async () => {
    if (!response) return;

    try {
        await navigator.clipboard.writeText(
            response
        );

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    } catch (err) {
        console.error(
            "Copy failed:",
            err
        );

        setError(
            "Unable to copy the answer."
        );
    }
};

// ========================================================
// KEYBOARD
// ========================================================

const handleKeyDown = (e) => {
    if (
        e.key === "Enter" &&
        (e.ctrlKey || e.metaKey)
    ) {
        e.preventDefault();
        handleAskAI();
    }
};

// ========================================================
// RENDER
// ========================================================

return (
    <div style={styles.page}>
        <div style={styles.container}>

            {/* HERO HEADER */}

            <section style={styles.hero}>
                <div style={styles.heroIcon}>
                    ✨
                </div>

                <div style={styles.heroContent}>
                    <div style={styles.badge}>
                        <span
                            style={styles.badgeDot}
                        />

                        AI LEARNING ASSISTANT
                    </div>

                    <h1 style={styles.title}>
                        Ask StudyFlow AI
                    </h1>

                    <p style={styles.subtitle}>
                        Get clear explanations, coding help,
                        concepts, examples and study guidance
                        whenever you need it.
                    </p>
                </div>
            </section>

            {/* QUESTION AREA */}

            <section style={styles.askCard}>
                <div style={styles.askHeader}>
                    <div>
                        <h2 style={styles.askTitle}>
                            What would you like to learn?
                        </h2>

                        <p style={styles.askSubtitle}>
                            Ask anything related to your studies.
                        </p>
                    </div>

                    <div style={styles.aiStatus}>
                        <span
                            style={styles.statusDot}
                        />

                        AI Ready
                    </div>
                </div>

                {/* TEXTAREA */}

                <div style={styles.textareaWrapper}>
                    <textarea
                        value={question}
                        onChange={(e) => {
                            setQuestion(
                                e.target.value
                            );
                            setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question... e.g. Explain Python list comprehension with an example."
                        rows={6}
                        maxLength={2000}
                        style={styles.textarea}
                        disabled={loading}
                    />

                    <div
                        style={
                            styles.textareaFooter
                        }
                    >
                        <span
                            style={
                                styles.characterCount
                            }
                        >
                            {question.length}/2000
                        </span>

                        <span
                            style={
                                styles.keyboardHint
                            }
                        >
                            Ctrl + Enter to ask
                        </span>
                    </div>
                </div>

                {/* ERROR */}

                {error && (
                    <div style={styles.errorBox}>
                        <span
                            style={styles.errorIcon}
                        >
                            !
                        </span>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                {/* BUTTONS */}

                <div style={styles.actionRow}>
                    <button
                        type="button"
                        onClick={handleAskAI}
                        disabled={
                            loading ||
                            !question.trim()
                        }
                        style={{
                            ...styles.askButton,
                            opacity:
                                loading ||
                                !question.trim()
                                    ? 0.6
                                    : 1,
                            cursor:
                                loading ||
                                !question.trim()
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        {loading ? (
                            <>
                                <span
                                    style={
                                        styles.spinner
                                    }
                                />

                                Thinking...
                            </>
                        ) : (
                            <>
                                ✨ Ask StudyFlow AI
                            </>
                        )}
                    </button>

                    {question && !loading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            style={
                                styles.clearButton
                            }
                        >
                            Clear
                        </button>
                    )}
                </div>
            </section>

            {/* LOADING */}

            {loading && (
                <section
                    style={styles.loadingCard}
                >
                    <div
                        style={
                            styles.loadingMascot
                        }
                    >
                        <div
                            style={
                                styles.loadingFace
                            }
                        >
                            🤖
                        </div>

                        <span
                            style={
                                styles.loadingSparkleOne
                            }
                        >
                            ✨
                        </span>

                        <span
                            style={
                                styles.loadingSparkleTwo
                            }
                        >
                            ⭐
                        </span>
                    </div>

                    <h3
                        style={
                            styles.loadingTitle
                        }
                    >
                        StudyFlow AI is thinking...
                    </h3>

                    <p
                        style={
                            styles.loadingText
                        }
                    >
                        Finding the best way to explain it to you
                    </p>

                    <div
                        style={
                            styles.thinkingDots
                        }
                    >
                        <span
                            style={
                                styles.thinkingDot
                            }
                        />

                        <span
                            style={{
                                ...styles.thinkingDot,
                                animationDelay:
                                    "0.15s",
                            }}
                        />

                        <span
                            style={{
                                ...styles.thinkingDot,
                                animationDelay:
                                    "0.3s",
                            }}
                        />
                    </div>

                    <div
                        style={
                            styles.loadingBar
                        }
                    >
                        <div
                            style={
                                styles.loadingProgress
                            }
                        />
                    </div>

                    <span
                        style={
                            styles.loadingHint
                        }
                    >
                        🧠 Making your answer easy to understand...
                    </span>
                </section>
            )}

            {/* RESPONSE */}

            {response && !loading && (
                <section
                    style={styles.responseCard}
                >
                    {/* RESPONSE HEADER */}

                    <div
                        style={
                            styles.responseHeader
                        }
                    >
                        <div
                            style={
                                styles.responseIdentity
                            }
                        >
                            <div
                                style={
                                    styles.aiAvatar
                                }
                            >
                                🤖
                            </div>

                            <div>
                                <div
                                    style={
                                        styles.aiNameRow
                                    }
                                >
                                    <h2
                                        style={
                                            styles.aiName
                                        }
                                    >
                                        StudyFlow AI
                                    </h2>

                                    <span
                                        style={
                                            styles.verifiedBadge
                                        }
                                    >
                                        ✓
                                    </span>
                                </div>

                                <p
                                    style={
                                        styles.aiDescription
                                    }
                                >
                                    Learning Assistant
                                </p>
                            </div>
                        </div>

                        {/* RESPONSE ACTIONS */}

                        <div
                            style={
                                styles.responseActions
                            }
                        >
                            <button
                                type="button"
                                onClick={handleCopy}
                                style={
                                    styles.copyButton
                                }
                            >
                                {copied
                                    ? "✓ Copied"
                                    : "📋 Copy"}
                            </button>
                        </div>
                    </div>

                    {/* ORIGINAL QUESTION */}

                    <div
                        style={
                            styles.questionPreview
                        }
                    >
                        <span
                            style={
                                styles.questionLabel
                            }
                        >
                            YOUR QUESTION
                        </span>

                        <p
                            style={
                                styles.questionText
                            }
                        >
                            {question}
                        </p>
                    </div>

                    {/* RESPONSE BODY */}

                    <div
                        style={
                            styles.responseBody
                        }
                    >
                        {formatAIResponse(response)}
                    </div>

                    {/* RESPONSE FOOTER */}

                    <div
                        style={
                            styles.responseFooter
                        }
                    >
                        <div
                            style={
                                styles.helpfulText
                            }
                        >
                            💡 Use this explanation as a
                            learning guide and practice the
                            concept yourself.
                        </div>

                        <button
                            type="button"
                            onClick={handleClear}
                            style={
                                styles.askAnotherButton
                            }
                        >
                            + Ask Another Question
                        </button>
                    </div>
                </section>
            )}

            {/* QUICK QUESTIONS */}

            {!response && !loading && (
                <section
                    style={styles.quickSection}
                >
                    <div
                        style={
                            styles.quickHeader
                        }
                    >
                        <div>
                            <h2
                                style={
                                    styles.quickTitle
                                }
                            >
                                Need some inspiration?
                            </h2>

                            <p
                                style={
                                    styles.quickSubtitle
                                }
                            >
                                Start with one of these popular
                                learning questions.
                            </p>
                        </div>

                        <span
                            style={
                                styles.sparkle
                            }
                        >
                            ✨
                        </span>
                    </div>

                    <div
                        style={
                            styles.quickGrid
                        }
                    >
                        {quickQuestions.map(
                            (item) => (
                                <button
                                    key={item.title}
                                    type="button"
                                    onClick={() =>
                                        handleQuickQuestion(
                                            item.question
                                        )
                                    }
                                    style={
                                        styles.quickCard
                                    }
                                >
                                    <div
                                        style={
                                            styles.quickIcon
                                        }
                                    >
                                        {item.icon}
                                    </div>

                                    <div
                                        style={
                                            styles.quickContent
                                        }
                                    >
                                        <strong>
                                            {item.title}
                                        </strong>

                                        <span>
                                            {item.question}
                                        </span>
                                    </div>

                                    <span
                                        style={
                                            styles.arrow
                                        }
                                    >
                                        →
                                    </span>
                                </button>
                            )
                        )}
                    </div>
                </section>
            )}

            {/* FOOTER TIP */}

            {!response && !loading && (
                <div style={styles.tip}>
                    <span
                        style={
                            styles.tipIcon
                        }
                    >
                        🧠
                    </span>

                    <div>
                        <strong>
                            Study smarter with AI
                        </strong>

                        <p>
                            Be specific in your questions to
                            get more useful explanations and
                            examples.
                        </p>
                    </div>
                </div>
            )}
        </div>
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
"linear-gradient(180deg, #f8faff 0%, #f4f7fb 100%)",
padding: "32px 20px 60px",
fontFamily:
"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
boxSizing: "border-box",
},

container: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
},

// ========================================================
// HERO
// ========================================================

hero: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
},

heroIcon: {
    width: "68px",
    height: "68px",
    borderRadius: "20px",
    background:
        "linear-gradient(135deg, #2563eb, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "31px",
    boxShadow:
        "0 12px 30px rgba(37,99,235,0.20)",
    flexShrink: 0,
},

heroContent: {
    flex: 1,
},

badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#2563eb",
    marginBottom: "6px",
},

badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#2563eb",
    display: "inline-block",
},

title: {
    margin: "0 0 7px",
    fontSize: "32px",
    lineHeight: "1.2",
    color: "#101828",
    fontWeight: "750",
},

subtitle: {
    margin: 0,
    color: "#667085",
    fontSize: "15px",
    lineHeight: "1.6",
    maxWidth: "720px",
},

// ========================================================
// ASK CARD
// ========================================================

askCard: {
    background: "#ffffff",
    border: "1px solid #eaecf0",
    borderRadius: "20px",
    padding: "28px",
    boxShadow:
        "0 10px 35px rgba(16,24,40,0.06)",
    marginBottom: "20px",
},

askHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "18px",
},

askTitle: {
    margin: "0 0 5px",
    fontSize: "20px",
    color: "#101828",
},

askSubtitle: {
    margin: 0,
    color: "#667085",
    fontSize: "14px",
},

aiStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#ecfdf3",
    color: "#027a48",
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
},

statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#12b76a",
},

textareaWrapper: {
    border: "1px solid #d0d5dd",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#ffffff",
},

textarea: {
    width: "100%",
    minHeight: "145px",
    padding: "17px",
    border: "none",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#101828",
    fontFamily: "inherit",
    background: "#ffffff",
},

textareaFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eaecf0",
    padding: "9px 13px",
    background: "#fafafa",
},

characterCount: {
    color: "#98a2b3",
    fontSize: "12px",
},

keyboardHint: {
    color: "#98a2b3",
    fontSize: "12px",
},

// ========================================================
// ERROR
// ========================================================

errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fef3f2",
    border: "1px solid #fecdca",
    color: "#b42318",
    padding: "11px 13px",
    borderRadius: "10px",
    marginTop: "14px",
    fontSize: "14px",
},

errorIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#f04438",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "12px",
    flexShrink: 0,
},

// ========================================================
// BUTTONS
// ========================================================

actionRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "17px",
},

askButton: {
    border: "none",
    borderRadius: "10px",
    padding: "13px 20px",
    background:
        "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    boxShadow:
        "0 7px 18px rgba(37,99,235,0.20)",
    display: "flex",
    alignItems: "center",
    gap: "9px",
},

clearButton: {
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    padding: "12px 18px",
    background: "#ffffff",
    color: "#344054",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
},

spinner: {
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    display: "inline-block",
    animation:
        "studyflowSpin 0.8s linear infinite",
},

// ========================================================
// LOADING
// ========================================================

loadingCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "38px 25px 30px",
    textAlign: "center",
    boxShadow:
        "0 12px 35px rgba(16,24,40,0.07)",
    marginBottom: "20px",
    position: "relative",
    overflow: "hidden",
},

loadingMascot: {
    position: "relative",
    width: "78px",
    height: "70px",
    margin: "0 auto 13px",
},

loadingFace: {
    width: "60px",
    height: "60px",
    borderRadius: "20px",
    background:
        "linear-gradient(135deg, #eef4ff, #f3efff)",
    border: "1px solid #e4e7ec",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "29px",
    margin: "0 auto",
    boxShadow:
        "0 8px 20px rgba(79,70,229,0.10)",
    animation:
        "studyflowFloat 1.8s ease-in-out infinite",
},

loadingSparkleOne: {
    position: "absolute",
    top: "-2px",
    right: "2px",
    fontSize: "15px",
    animation:
        "studyflowSparkle 1.2s ease-in-out infinite",
},

loadingSparkleTwo: {
    position: "absolute",
    bottom: "1px",
    left: "2px",
    fontSize: "12px",
    animation:
        "studyflowSparkle 1.4s ease-in-out infinite 0.2s",
},

loadingTitle: {
    margin: "0 0 7px",
    color: "#101828",
    fontSize: "18px",
    fontWeight: "750",
},

loadingText: {
    margin: "0 0 12px",
    color: "#667085",
    fontSize: "14px",
},

thinkingDots: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    height: "20px",
    marginBottom: "15px",
},

thinkingDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#6366f1",
    display: "block",
    animation:
        "studyflowThinkingBounce 0.9s ease-in-out infinite",
},

loadingBar: {
    maxWidth: "320px",
    height: "5px",
    background: "#eaecf0",
    borderRadius: "10px",
    margin: "0 auto",
    overflow: "hidden",
},

loadingProgress: {
    width: "45%",
    height: "100%",
    background:
        "linear-gradient(90deg, #2563eb, #7c3aed)",
    borderRadius: "10px",
    animation:
        "studyflowLoading 1.2s ease-in-out infinite",
},

loadingHint: {
    display: "block",
    marginTop: "13px",
    color: "#98a2b3",
    fontSize: "11px",
},

// ========================================================
// RESPONSE CARD
// ========================================================

responseCard: {
    background: "#ffffff",
    border: "1px solid #eaecf0",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow:
        "0 12px 35px rgba(16,24,40,0.07)",
    marginBottom: "20px",
},

responseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "19px 24px",
    borderBottom: "1px solid #eaecf0",
    background:
        "linear-gradient(90deg, #f8faff, #ffffff)",
},

responseIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
},

aiAvatar: {
    width: "43px",
    height: "43px",
    borderRadius: "13px",
    background:
        "linear-gradient(135deg, #2563eb, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
},

aiNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
},

aiName: {
    margin: 0,
    fontSize: "16px",
    color: "#101828",
},

verifiedBadge: {
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
},

aiDescription: {
    margin: "2px 0 0",
    color: "#667085",
    fontSize: "12px",
},

responseActions: {
    display: "flex",
    gap: "8px",
},

copyButton: {
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    color: "#344054",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
},

// ========================================================
// QUESTION PREVIEW
// ========================================================

questionPreview: {
    margin: "20px 24px 0",
    padding: "13px 15px",
    background: "#f8fafc",
    borderLeft: "3px solid #2563eb",
    borderRadius: "8px",
},

questionLabel: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.8px",
    fontWeight: "800",
    color: "#667085",
    marginBottom: "5px",
},

questionText: {
    margin: 0,
    color: "#344054",
    fontSize: "13px",
    lineHeight: "1.5",
    overflowWrap: "anywhere",
},

// ========================================================
// RESPONSE BODY
// ========================================================

responseBody: {
    padding: "24px 28px 28px",
    color: "#344054",
    fontSize: "15px",
    lineHeight: "1.8",
    overflowWrap: "anywhere",
},

responseSpacing: {
    height: "9px",
},

responseH1: {
    color: "#101828",
    fontSize: "26px",
    lineHeight: "1.3",
    margin: "8px 0 16px",
    fontWeight: "800",
},

responseH2: {
    color: "#182230",
    fontSize: "21px",
    lineHeight: "1.4",
    margin: "25px 0 12px",
    padding: "0 0 8px",
    borderBottom: "1px solid #eaecf0",
    fontWeight: "750",
},

responseH3: {
    color: "#1d2939",
    fontSize: "18px",
    lineHeight: "1.45",
    margin: "20px 0 9px",
    fontWeight: "700",
},

responseParagraph: {
    margin: "8px 0",
    color: "#344054",
    lineHeight: "1.8",
    fontSize: "15px",
},

boldText: {
    color: "#182230",
    fontWeight: "750",
},

listText: {
    flex: 1,
    minWidth: 0,
},

bulletRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    margin: "9px 0",
    padding: "3px 0",
    lineHeight: "1.75",
},

bulletDot: {
    width: "22px",
    height: "22px",
    borderRadius: "8px",
    background: "#eef4ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "900",
    flexShrink: 0,
    marginTop: "2px",
},

numberRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    margin: "10px 0",
    padding: "3px 0",
    lineHeight: "1.75",
},

numberBadge: {
    width: "25px",
    height: "25px",
    borderRadius: "8px",
    background: "#eef4ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    flexShrink: 0,
    marginTop: "1px",
},

inlineCode: {
    display: "inline-block",
    background: "#f2f4f7",
    color: "#6941c6",
    padding: "2px 7px",
    borderRadius: "6px",
    border: "1px solid #e4e7ec",
    fontFamily:
        "Consolas, 'Courier New', monospace",
    fontSize: "13px",
    lineHeight: "1.5",
},

quoteBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    margin: "14px 0",
    padding: "12px 15px",
    background: "#fffaeb",
    border: "1px solid #fedf89",
    borderLeft: "4px solid #fdb022",
    borderRadius: "10px",
    color: "#7a5b00",
    fontSize: "14px",
    lineHeight: "1.65",
},

quoteIcon: {
    flexShrink: 0,
},

// ========================================================
// CODE
// ========================================================

codeWrapper: {
    margin: "16px 0",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #1d2939",
    boxShadow:
        "0 6px 18px rgba(16,24,40,0.10)",
},

codeLanguage: {
    padding: "7px 13px",
    background: "#182230",
    color: "#98a2b3",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    fontFamily:
        "Inter, sans-serif",
},

codeBlock: {
    margin: 0,
    padding: "16px",
    background: "#101828",
    color: "#e4e7ec",
    fontFamily:
        "Consolas, 'Courier New', monospace",
    fontSize: "13px",
    lineHeight: "1.7",
    overflowX: "auto",
    whiteSpace: "pre",
    wordBreak: "normal",
},

// ========================================================
// RESPONSE FOOTER
// ========================================================

responseFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px 24px",
    borderTop: "1px solid #eaecf0",
    background: "#fafbfc",
},

helpfulText: {
    color: "#667085",
    fontSize: "12px",
    lineHeight: "1.5",
},

askAnotherButton: {
    border: "none",
    background: "#eef4ff",
    color: "#175cd3",
    borderRadius: "8px",
    padding: "9px 13px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
},

// ========================================================
// QUICK QUESTIONS
// ========================================================

quickSection: {
    marginTop: "10px",
},

quickHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "13px",
},

quickTitle: {
    margin: "0 0 4px",
    color: "#101828",
    fontSize: "18px",
},

quickSubtitle: {
    margin: 0,
    color: "#667085",
    fontSize: "13px",
},

sparkle: {
    fontSize: "25px",
},

quickGrid: {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "12px",
},

quickCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    border: "1px solid #eaecf0",
    background: "#ffffff",
    borderRadius: "13px",
    padding: "14px",
    cursor: "pointer",
    boxShadow:
        "0 4px 15px rgba(16,24,40,0.035)",
    transition:
        "transform 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
},

quickIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#f2f4f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    flexShrink: 0,
},

quickContent: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
},

quickContentTitle: {
    fontSize: "13px",
    color: "#101828",
},

quickContent: {
flex: 1,
minWidth: 0,
display: "flex",
flexDirection: "column",
gap: "4px",
},
quickQuestionText: {
color: "#667085",
fontSize: "11px",
lineHeight: "1.4",
display: "block",
margin: 0,
overflow: "hidden",
textOverflow: "ellipsis",
whiteSpace: "nowrap",
},
arrow: {
    color: "#98a2b3",
    fontSize: "19px",
    flexShrink: 0,
},

// ========================================================
// TIP
// ========================================================

tip: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginTop: "22px",
    padding: "15px",
    background: "#fffaeb",
    border: "1px solid #fedf89",
    borderRadius: "12px",
},

tipIcon: {
    fontSize: "20px",
},

};

// ============================================================
// GLOBAL ANIMATIONS
// ============================================================

if (
typeof document !== "undefined" &&
!document.getElementById(
"studyflow-ai-animations"
)
) {
const styleElement =
document.createElement("style");

styleElement.id =
    "studyflow-ai-animations";

styleElement.innerHTML = `
    @keyframes studyflowSpin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @keyframes studyflowLoading {
        0% {
            transform: translateX(-120%);
        }

        50% {
            transform: translateX(120%);
        }

        100% {
            transform: translateX(250%);
        }
    }

    @keyframes studyflowThinkingBounce {
        0%,
        60%,
        100% {
            transform: translateY(0);
            opacity: 0.45;
        }

        30% {
            transform: translateY(-6px);
            opacity: 1;
        }
    }

    @keyframes studyflowFloat {
        0%,
        100% {
            transform: translateY(0) rotate(0deg);
        }

        50% {
            transform: translateY(-5px) rotate(-2deg);
        }
    }

    @keyframes studyflowSparkle {
        0%,
        100% {
            transform: scale(0.8) rotate(0deg);
            opacity: 0.5;
        }

        50% {
            transform: scale(1.15) rotate(15deg);
            opacity: 1;
        }
    }

    @media (max-width: 700px) {
        .studyflow-mobile-response {
            padding: 18px;
        }
    }
`;

document.head.appendChild(
    styleElement
);

}
export default AskAI;