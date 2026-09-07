import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import { generateNotes } from "../services/api";

// ============================================================
// TOPICS
// ============================================================

const topics = [
    "Python",
    "Data Structures and Algorithms",
    "SQL",
    "JavaScript",
    "React",
    "Machine Learning",
    "Data Science",
    "Web Development",
];

// ============================================================
// MARKDOWN CLEANER
// ============================================================

function cleanMarkdown(text) {
    if (!text) return "";

    return String(text)
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

// ============================================================
// MARKDOWN / AI NOTES RENDERER
// ============================================================

function renderNotes(text) {
    if (!text) return null;

    const lines = String(text).split("\n");
    const elements = [];
    let inCodeBlock = false;
    let codeLines = [];

    lines.forEach((rawLine, index) => {
        const line = rawLine.replace(/\r/g, "");
        const trimmed = line.trim();

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
            codeLines.push(line);
            return;
        }

        if (!trimmed) {
            elements.push(
                <div key={`space-${index}`} style={styles.contentSpace} />
            );
            return;
        }

        if (trimmed.startsWith("# ")) {
            elements.push(
                <h2 key={`h1-${index}`} style={styles.heading1}>
                    {cleanMarkdown(trimmed.substring(2))}
                </h2>
            );
            return;
        }

        if (trimmed.startsWith("## ")) {
            elements.push(
                <h3 key={`h2-${index}`} style={styles.heading2}>
                    {cleanMarkdown(trimmed.substring(3))}
                </h3>
            );
            return;
        }

        if (trimmed.startsWith("### ")) {
            elements.push(
                <h4 key={`h3-${index}`} style={styles.heading3}>
                    {cleanMarkdown(trimmed.substring(4))}
                </h4>
            );
            return;
        }

        if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("* ") ||
            trimmed.startsWith("• ")
        ) {
            elements.push(
                <div key={`bullet-${index}`} style={styles.bullet}>
                    <span style={styles.bulletDot}>•</span>
                    <span>{cleanMarkdown(trimmed.substring(2))}</span>
                </div>
            );
            return;
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

        if (numberedMatch) {
            elements.push(
                <div key={`number-${index}`} style={styles.numberedItem}>
                    <span style={styles.numberBadge}>
                        {numberedMatch[1]}
                    </span>
                    <span>{cleanMarkdown(numberedMatch[2])}</span>
                </div>
            );
            return;
        }

        if (trimmed === "---" || trimmed === "***") {
            elements.push(
                <hr key={`divider-${index}`} style={styles.divider} />
            );
            return;
        }

        elements.push(
            <p key={`paragraph-${index}`} style={styles.paragraph}>
                {cleanMarkdown(trimmed)}
            </p>
        );
    });

    if (inCodeBlock && codeLines.length > 0) {
        elements.push(
            <pre key="final-code" style={styles.codeBlock}>
                <code>{codeLines.join("\n")}</code>
            </pre>
        );
    }

    return elements;
}

// ============================================================
// PDF HTML ESCAPER
// ============================================================

function escapeHtml(value) {
    if (!value) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\s+/g, " ");
}

// ============================================================
// CONVERT NOTES TO PRINTABLE HTML
// ============================================================

function notesToPrintableHtml(text) {
    if (!text) return "";

    const lines = String(text).replace(/\r/g, "").split("\n");
    let html = "";
    let inCodeBlock = false;
    let codeBuffer = [];

    const inlineMarkdown = (value) => {
        if (!value) return "";
        return escapeHtml(value)
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/__(.*?)__/g, "<strong>$1</strong>")
            .replace(/`([^`]+)`/g, "<code>$1</code>");
    };

    const flushCode = () => {
        if (codeBuffer.length === 0) return;
        html += `
            <pre class="pdf-code">${escapeHtml(
                codeBuffer.join("\n")
            )}</pre>
        `;
        codeBuffer = [];
    };

    lines.forEach((rawLine) => {
        const line = rawLine.trim();

        if (line.startsWith("```")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBuffer = [];
            } else {
                flushCode();
                inCodeBlock = false;
            }
            return;
        }

        if (inCodeBlock) {
            codeBuffer.push(rawLine);
            return;
        }

        if (!line) {
            html += `<div class="pdf-space"></div>`;
            return;
        }

        if (line.startsWith("### ")) {
            html += `<h3 class="pdf-h3">${inlineMarkdown(line.substring(4))}</h3>`;
            return;
        }

        if (line.startsWith("## ")) {
            html += `<h2 class="pdf-h2">${inlineMarkdown(line.substring(3))}</h2>`;
            return;
        }

        if (line.startsWith("# ")) {
            html += `<h1 class="pdf-h1">${inlineMarkdown(line.substring(2))}</h1>`;
            return;
        }

        if (
            line.startsWith("- ") ||
            line.startsWith("* ") ||
            line.startsWith("• ")
        ) {
            html += `
                <div class="pdf-bullet">
                    <span class="pdf-bullet-dot">•</span>
                    <span>${inlineMarkdown(line.substring(2))}</span>
                </div>
            `;
            return;
        }

        const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);

        if (numberedMatch) {
            html += `
                <div class="pdf-number">
                    <span class="pdf-number-badge">
                        ${numberedMatch[1]}
                    </span>
                    <span>${inlineMarkdown(numberedMatch[2])}</span>
                </div>
            `;
            return;
        }

        if (line === "---" || line === "***") {
            html += `<hr class="pdf-hr" />`;
            return;
        }

        html += `<p class="pdf-p">${inlineMarkdown(line)}</p>`;
    });

    if (inCodeBlock) {
        flushCode();
    }

    return html;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AINotes() {
    const [topic, setTopic] = useState("Python");
    const [customTopic, setCustomTopic] = useState("");
    const [notes, setNotes] = useState("");
    const [generatedTopic, setGeneratedTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // ========================================================
    // GENERATE NOTES
    // ========================================================

    const handleGenerateNotes = async () => {
        setError("");
        setCopied(false);

        const finalTopic = customTopic.trim() || topic;

        if (!finalTopic) {
            setError("Please select or enter a topic first.");
            return;
        }

        setLoading(true);

        try {
            console.log("Generating AI notes for:", finalTopic);

            const data = await generateNotes({
                topic: finalTopic,
            });

            console.log("AI Notes response:", data);

            let generatedNotes = "";

            if (typeof data === "string") {
                generatedNotes = data;
            } else if (typeof data?.response === "string") {
                generatedNotes = data.response;
            } else if (typeof data?.notes === "string") {
                generatedNotes = data.notes;
            } else if (typeof data?.data === "string") {
                generatedNotes = data.data;
            } else if (typeof data?.data?.response === "string") {
                generatedNotes = data.data.response;
            } else if (typeof data?.data?.notes === "string") {
                generatedNotes = data.data.notes;
            } else {
                generatedNotes = JSON.stringify(data, null, 2);
            }

            if (!generatedNotes || !generatedNotes.trim()) {
                throw new Error("AI returned an empty response.");
            }

            setNotes(generatedNotes.trim());
            setGeneratedTopic(finalTopic);
        } catch (err) {
            console.error("AI Notes Error:", err);

            setError(
                err?.message ||
                    "Unable to generate notes. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // COPY NOTES
    // ========================================================

    const handleCopy = async () => {
        if (!notes) return;

        try {
            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {
                await navigator.clipboard.writeText(notes);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = notes;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Copy error:", err);
            setError("Unable to copy notes.");
        }
    };

    // ========================================================
    // DOWNLOAD PDF - MULTIPLE PAGES SUPPORT
    // ========================================================

    const handleDownloadPDF = async () => {
        if (!notes || !notes.trim()) {
            setError("Generate notes first before downloading the PDF.");
            return;
        }

        let pdfContainer = null;

        try {
            setError("");

            console.log("PDF: Starting generation...");
            console.log("PDF: Notes length:", notes.length);

            const printableNotes = notesToPrintableHtml(notes);

            console.log("PDF: Generated HTML length:", printableNotes.length);

            if (!printableNotes.trim()) {
                throw new Error("Unable to convert notes into PDF content.");
            }

            pdfContainer = document.createElement("div");

            const safeTopic = escapeHtml(generatedTopic || "Study Notes");

            // ===== PDF HTML =====
            pdfContainer.innerHTML = `
                <div class="pdf-document-wrapper">

                    <!-- PAGE 1 -->
                    <div class="pdf-page">
                        <div class="pdf-header">
                            <div class="pdf-header-row">
                                <div class="pdf-brand">
                                    <span class="pdf-brand-icon">📚</span>
                                    STUDYFLOW AI
                                </div>
                                <div class="pdf-logo-placeholder">
                                    <div class="pdf-logo-text">SF</div>
                                </div>
                            </div>
                            <h1 class="pdf-title">${safeTopic}</h1>
                            <div class="pdf-subtitle">AI Generated Study Notes</div>
                            <div class="pdf-meta">
                                <span>📅 ${new Date().toLocaleDateString()}</span>
                                <span>⏱ ${new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div class="pdf-content">
                            ${printableNotes}
                        </div>

                        <div class="pdf-footer">
                            <span>Generated by StudyFlow AI</span>
                            <span>•</span>
                            <span>AI Powered Learning</span>
                        </div>
                    </div>

                </div>
            `;

            // ===== CSS =====
            const style = document.createElement("style");

            style.textContent = `
                /* WRAPPER */
                .pdf-document-wrapper {
                    width: 100%;
                    max-width: 794px;
                    margin: 0 auto;
                    background: #ffffff;
                    box-sizing: border-box;
                }

                /* PAGE */
                .pdf-page {
                    width: 100%;
                    min-height: 1123px;
                    padding: 40px 50px;
                    background: #ffffff;
                    color: #1e293b;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                    box-sizing: border-box;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    page-break-after: always;
                    break-after: page;
                }

                .pdf-page:last-child {
                    page-break-after: auto;
                    break-after: auto;
                }

                /* HEADER */
                .pdf-header {
                    border-bottom: 3px solid #4f46e5;
                    padding-bottom: 18px;
                    margin-bottom: 22px;
                }

                .pdf-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .pdf-brand {
                    color: #4f46e5;
                    font-size: 13px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pdf-brand-icon {
                    font-size: 18px;
                }

                .pdf-logo-placeholder {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 800;
                    font-size: 14px;
                }

                .pdf-title {
                    margin: 6px 0 2px;
                    color: #111827;
                    font-size: 26px;
                    line-height: 1.25;
                    font-weight: 800;
                    word-break: break-word;
                }

                .pdf-subtitle {
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 600;
                }

                .pdf-meta {
                    display: flex;
                    gap: 16px;
                    margin-top: 8px;
                    color: #94a3b8;
                    font-size: 11px;
                    font-weight: 500;
                }

                /* CONTENT */
                .pdf-content {
                    width: 100%;
                    color: #334155;
                    font-size: 14px;
                    line-height: 1.8;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .pdf-content h1, .pdf-h1 {
                    color: #111827;
                    font-size: 22px;
                    line-height: 1.3;
                    margin: 22px 0 10px;
                    font-weight: 800;
                    page-break-after: avoid;
                    word-break: break-word;
                }

                .pdf-content h2, .pdf-h2 {
                    color: #1e293b;
                    font-size: 19px;
                    line-height: 1.35;
                    margin: 18px 0 8px;
                    font-weight: 800;
                    page-break-after: avoid;
                    word-break: break-word;
                }

                .pdf-content h3, .pdf-h3 {
                    color: #334155;
                    font-size: 16px;
                    line-height: 1.4;
                    margin: 16px 0 6px;
                    font-weight: 700;
                    page-break-after: avoid;
                    word-break: break-word;
                }

                .pdf-content p, .pdf-p {
                    margin: 4px 0;
                    font-size: 14px;
                    line-height: 1.8;
                    word-break: break-word;
                }

                .pdf-bullet {
                    display: flex;
                    gap: 10px;
                    margin: 4px 0;
                    font-size: 14px;
                    line-height: 1.7;
                    word-break: break-word;
                }

                .pdf-bullet-dot {
                    color: #4f46e5;
                    font-weight: 900;
                    flex-shrink: 0;
                }

                .pdf-number {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    margin: 6px 0;
                    font-size: 14px;
                    line-height: 1.7;
                    word-break: break-word;
                }

                .pdf-number-badge {
                    min-width: 26px;
                    height: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    background: #eef2ff;
                    color: #4f46e5;
                    font-size: 11px;
                    font-weight: 800;
                    flex-shrink: 0;
                }

                .pdf-code {
                    margin: 12px 0;
                    padding: 14px;
                    border-radius: 8px;
                    background: #0f172a;
                    color: #e2e8f0;
                    font-family: 'Courier New', Consolas, monospace;
                    font-size: 12px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    word-break: break-word;
                    page-break-inside: avoid;
                    overflow-x: auto;
                }

                .pdf-content code {
                    background: #f1f5f9;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', Consolas, monospace;
                    font-size: 12px;
                    word-break: break-word;
                }

                .pdf-hr {
                    border: none;
                    border-top: 1px solid #e2e8f0;
                    margin: 18px 0;
                }

                .pdf-space {
                    height: 6px;
                }

                /* FOOTER */
                .pdf-footer {
                    margin-top: 30px;
                    padding-top: 12px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    color: #94a3b8;
                    font-size: 10px;
                    font-weight: 500;
                }
            `;

            pdfContainer.prepend(style);

            // ===== ADD TO DOM =====
            pdfContainer.style.position = "fixed";
            pdfContainer.style.left = "-100000px";
            pdfContainer.style.top = "0";
            pdfContainer.style.zIndex = "-9999";
            pdfContainer.style.background = "#ffffff";
            pdfContainer.style.width = "794px";
            pdfContainer.style.overflow = "visible";

            document.body.appendChild(pdfContainer);

            // Wait for render
            await new Promise((resolve) =>
                requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                })
            );

            console.log("PDF: Container added to DOM");

            const filename =
                `StudyFlow-AI-${(generatedTopic || "Study-Notes")
                    .replace(/[^a-z0-9]+/gi, "-")
                    .replace(/^-+|-+$/g, "")}.pdf`;

            // ===== PDF OPTIONS - MULTIPLE PAGES SUPPORT =====
            const opt = {
                margin: [8, 8, 8, 8],
                filename: filename,
                image: {
                    type: "jpeg",
                    quality: 0.98,
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 794,
                    width: 794,
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait",
                    compress: true,
                },
                pagebreak: {
                    mode: ["css", "legacy", "avoid-all"],
                },
            };

            // ===== GENERATE PDF =====
            const element = pdfContainer.querySelector(".pdf-document-wrapper");

            await html2pdf()
                .set(opt)
                .from(element)
                .save();

            console.log("PDF: Download completed successfully.");

        } catch (err) {
            console.error("PDF generation failed:", err);
            setError(
                err?.message || "Unable to generate PDF. Please try again."
            );
        } finally {
            if (pdfContainer && pdfContainer.parentNode) {
                pdfContainer.remove();
            }
        }
    };

    // ========================================================
    // CLEAR
    // ========================================================

    const handleClear = () => {
        setNotes("");
        setGeneratedTopic("");
        setError("");
        setCopied(false);
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* HERO */}
                <section style={styles.hero}>
                    <div style={styles.heroIcon}>✨</div>
                    <div>
                        <div style={styles.heroLabel}>STUDYFLOW AI</div>
                        <h1 style={styles.heroTitle}>AI Notes Generator</h1>
                        <p style={styles.heroSubtitle}>
                            Turn any topic into clear, structured and easy-to-revise study notes.
                        </p>
                    </div>
                </section>

                {/* GENERATOR CARD */}
                <section style={styles.generatorCard}>
                    <div style={styles.cardHeader}>
                        <div>
                            <h2 style={styles.cardTitle}>Create your study notes</h2>
                            <p style={styles.cardSubtitle}>
                                Choose a subject or enter a specific topic you want to learn.
                            </p>
                        </div>
                        <div style={styles.aiBadge}>🤖 AI Powered</div>
                    </div>

                    {/* TOPICS */}
                    <div style={styles.field}>
                        <label style={styles.label}>Choose a topic</label>
                        <div style={styles.topicGrid}>
                            {topics.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => {
                                        setTopic(item);
                                        setCustomTopic("");
                                        setError("");
                                    }}
                                    style={{
                                        ...styles.topicButton,
                                        ...(topic === item && !customTopic
                                            ? styles.activeTopic
                                            : {}),
                                    }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CUSTOM TOPIC */}
                    <div style={styles.field}>
                        <label style={styles.label}>Or enter your own topic</label>
                        <div style={styles.customInputWrapper}>
                            <span style={styles.inputIcon}>🔎</span>
                            <input
                                type="text"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="Example: Python Functions, SQL Joins, React Hooks..."
                                style={styles.customInput}
                            />
                            {customTopic && (
                                <button
                                    type="button"
                                    onClick={() => setCustomTopic("")}
                                    style={styles.inputClear}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* INFO */}
                    <div style={styles.infoBox}>
                        <div style={styles.infoIcon}>💡</div>
                        <div>
                            <strong style={styles.infoTitle}>Study smarter with AI</strong>
                            <p style={styles.infoText}>
                                StudyFlow AI creates structured explanations, key concepts,
                                examples and important points for your selected topic.
                            </p>
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div style={styles.actionRow}>
                        <button
                            type="button"
                            onClick={handleGenerateNotes}
                            disabled={loading}
                            style={{
                                ...styles.generateButton,
                                ...(loading ? styles.disabledButton : {}),
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.smallSpinner}>⟳</span>
                                    Generating...
                                </>
                            ) : (
                                <>✨ Generate Study Notes</>
                            )}
                        </button>

                        {notes && (
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={loading}
                                style={styles.clearButton}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </section>

                {/* LOADING */}
                {loading && (
                    <section style={styles.loadingCard}>
                        <div style={styles.loadingAnimation}>🤖</div>
                        <h2 style={styles.loadingTitle}>AI is preparing your notes</h2>
                        <p style={styles.loadingText}>
                            Analyzing the topic and creating useful study material...
                        </p>
                        <div style={styles.loadingDots}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </section>
                )}

                {/* NOTES */}
                {!loading && notes && (
                    <section style={styles.notesCard}>
                        <div style={styles.notesHeader}>
                            <div style={styles.notesHeaderLeft}>
                                <div style={styles.notesIcon}>📖</div>
                                <div>
                                    <div style={styles.notesLabel}>AI GENERATED NOTES</div>
                                    <h2 style={styles.notesTitle}>{generatedTopic}</h2>
                                </div>
                            </div>

                            <div style={styles.notesActions}>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    style={styles.copyButton}
                                >
                                    {copied ? "✓ Copied" : "📋 Copy"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadPDF}
                                    style={styles.pdfButton}
                                >
                                    ⬇ Download PDF
                                </button>

                                <button
                                    type="button"
                                    onClick={handleGenerateNotes}
                                    disabled={loading}
                                    style={styles.regenerateButton}
                                >
                                    ↻ Regenerate
                                </button>
                            </div>
                        </div>

                        <div style={styles.notesContent}>
                            <div style={styles.notesIntro}>
                                <span>🧠</span>
                                <span>
                                    Review these notes, highlight important concepts and use them for revision.
                                </span>
                            </div>

                            <div style={styles.notesBody}>
                                {renderNotes(notes)}
                            </div>
                        </div>

                        <div style={styles.notesFooter}>
                            <span>✨ Generated by StudyFlow AI</span>
                            <button
                                type="button"
                                onClick={handleCopy}
                                style={styles.footerCopy}
                            >
                                {copied ? "Copied" : "Copy Notes"}
                            </button>
                        </div>
                    </section>
                )}

                {/* EMPTY STATE */}
                {!loading && !notes && !error && (
                    <section style={styles.emptyCard}>
                        <div style={styles.emptyIcon}>📝</div>
                        <h2 style={styles.emptyTitle}>Your notes will appear here</h2>
                        <p style={styles.emptyText}>
                            Select a topic above and click
                            <strong> Generate Study Notes</strong>
                            to create your personalized study material.
                        </p>
                    </section>
                )}
            </div>

            {/* ANIMATIONS */}
            <style>
                {`
                    @keyframes notesSpin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    @keyframes notesPulse {
                        0% { opacity: 0.35; transform: translateY(0); }
                        50% { opacity: 1; transform: translateY(-4px); }
                        100% { opacity: 0.35; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(145deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "30px 20px 60px",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#172033",
        boxSizing: "border-box",
    },

    container: {
        width: "100%",
        maxWidth: "1050px",
        margin: "0 auto",
    },

    hero: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "34px",
        borderRadius: "24px",
        background: "linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #6366f1 100%)",
        color: "#ffffff",
        marginBottom: "24px",
        boxShadow: "0 18px 45px rgba(79,70,229,0.20)",
    },

    heroIcon: {
        width: "65px",
        height: "65px",
        borderRadius: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.2)",
        fontSize: "31px",
        flexShrink: 0,
    },

    heroLabel: {
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "1.2px",
        opacity: 0.8,
        marginBottom: "5px",
    },

    heroTitle: {
        margin: 0,
        fontSize: "35px",
        lineHeight: 1.15,
        fontWeight: 800,
        letterSpacing: "-0.8px",
    },

    heroSubtitle: {
        margin: "9px 0 0",
        maxWidth: "650px",
        color: "rgba(255,255,255,0.82)",
        fontSize: "15px",
        lineHeight: 1.6,
    },

    generatorCard: {
        background: "#ffffff",
        borderRadius: "22px",
        padding: "28px",
        marginBottom: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 35px rgba(15,23,42,0.07)",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        marginBottom: "25px",
    },

    cardTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: 800,
    },

    cardSubtitle: {
        margin: "6px 0 0",
        color: "#64748b",
        fontSize: "14px",
        lineHeight: 1.5,
    },

    aiBadge: {
        background: "#eef2ff",
        color: "#4f46e5",
        padding: "7px 11px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 800,
        whiteSpace: "nowrap",
    },

    field: {
        marginTop: "22px",
    },

    label: {
        display: "block",
        marginBottom: "10px",
        fontSize: "14px",
        fontWeight: 700,
        color: "#334155",
    },

    topicGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "9px",
    },

    topicButton: {
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        color: "#475569",
        padding: "9px 13px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 650,
        cursor: "pointer",
        transition: "all 0.2s",
    },

    activeTopic: {
        background: "#4f46e5",
        color: "#ffffff",
        borderColor: "#4f46e5",
        boxShadow: "0 5px 15px rgba(79,70,229,0.18)",
    },

    customInputWrapper: {
        position: "relative",
        width: "100%",
    },

    inputIcon: {
        position: "absolute",
        left: "15px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "17px",
        pointerEvents: "none",
    },

    customInput: {
        width: "100%",
        height: "52px",
        border: "1px solid #dbe3ef",
        borderRadius: "13px",
        background: "#f8fafc",
        padding: "0 45px",
        fontSize: "14px",
        color: "#172033",
        outline: "none",
        boxSizing: "border-box",
    },

    inputClear: {
        position: "absolute",
        right: "11px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "27px",
        height: "27px",
        border: "none",
        borderRadius: "50%",
        background: "#e2e8f0",
        color: "#475569",
        fontSize: "19px",
        cursor: "pointer",
    },

    infoBox: {
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        marginTop: "22px",
        padding: "15px",
        borderRadius: "14px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
    },

    infoIcon: {
        fontSize: "22px",
        flexShrink: 0,
    },

    infoTitle: {
        fontSize: "13px",
        color: "#334155",
    },

    infoText: {
        margin: "4px 0 0",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    errorBox: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        marginTop: "18px",
        padding: "12px 14px",
        borderRadius: "11px",
        background: "#fff1f2",
        border: "1px solid #fecdd3",
        color: "#be123c",
        fontSize: "13px",
        fontWeight: 600,
    },

    actionRow: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        marginTop: "23px",
    },

    generateButton: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        border: "none",
        borderRadius: "12px",
        padding: "13px 20px",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 7px 18px rgba(79,70,229,0.20)",
    },

    disabledButton: {
        cursor: "not-allowed",
        opacity: 0.7,
    },

    smallSpinner: {
        display: "inline-block",
        fontSize: "17px",
        animation: "notesSpin 0.8s linear infinite",
    },

    clearButton: {
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        color: "#475569",
        borderRadius: "12px",
        padding: "12px 17px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
    },

    loadingCard: {
        background: "#ffffff",
        borderRadius: "22px",
        padding: "45px 25px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 25px rgba(15,23,42,0.06)",
    },

    loadingAnimation: {
        fontSize: "48px",
        marginBottom: "10px",
    },

    loadingTitle: {
        margin: "0 0 7px",
        fontSize: "21px",
        fontWeight: 800,
    },

    loadingText: {
        margin: 0,
        color: "#64748b",
        fontSize: "14px",
    },

    loadingDots: {
        display: "flex",
        justifyContent: "center",
        gap: "5px",
        marginTop: "17px",
    },

    notesCard: {
        background: "#ffffff",
        borderRadius: "22px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 12px 35px rgba(15,23,42,0.08)",
    },

    notesHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "15px",
        padding: "22px 25px",
        borderBottom: "1px solid #eef2f7",
        background: "#ffffff",
        flexWrap: "wrap",
    },

    notesHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        minWidth: 0,
    },

    notesIcon: {
        width: "47px",
        height: "47px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eef2ff",
        fontSize: "22px",
        flexShrink: 0,
    },

    notesLabel: {
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "1px",
        color: "#64748b",
        marginBottom: "4px",
    },

    notesTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: 800,
        color: "#172033",
        wordBreak: "break-word",
    },

    notesActions: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        flexShrink: 0,
    },

    copyButton: {
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        color: "#334155",
        borderRadius: "10px",
        padding: "9px 12px",
        fontSize: "12px",
        fontWeight: 750,
        cursor: "pointer",
    },

    pdfButton: {
        border: "none",
        background: "#0f766e",
        color: "#ffffff",
        borderRadius: "10px",
        padding: "9px 12px",
        fontSize: "12px",
        fontWeight: 750,
        cursor: "pointer",
    },

    regenerateButton: {
        border: "none",
        background: "#4f46e5",
        color: "#ffffff",
        borderRadius: "10px",
        padding: "9px 12px",
        fontSize: "12px",
        fontWeight: 750,
        cursor: "pointer",
    },

    notesContent: {
        padding: "25px",
    },

    notesIntro: {
        display: "flex",
        gap: "9px",
        alignItems: "center",
        background: "#f8fafc",
        border: "1px solid #eef2f7",
        borderRadius: "12px",
        padding: "11px 13px",
        marginBottom: "25px",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: 1.5,
    },

    notesBody: {
        maxWidth: "850px",
        margin: "0 auto",
        color: "#334155",
    },

    heading1: {
        fontSize: "27px",
        lineHeight: 1.3,
        margin: "25px 0 13px",
        color: "#111827",
        fontWeight: 800,
    },

    heading2: {
        fontSize: "23px",
        lineHeight: 1.35,
        margin: "24px 0 11px",
        color: "#1e293b",
        fontWeight: 800,
    },

    heading3: {
        fontSize: "19px",
        lineHeight: 1.4,
        margin: "20px 0 9px",
        color: "#334155",
        fontWeight: 800,
    },

    paragraph: {
        margin: "8px 0",
        fontSize: "15px",
        lineHeight: 1.8,
        color: "#475569",
    },

    bullet: {
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        margin: "8px 0",
        paddingLeft: "4px",
        fontSize: "15px",
        lineHeight: 1.75,
        color: "#475569",
    },

    bulletDot: {
        color: "#4f46e5",
        fontSize: "19px",
        lineHeight: 1.4,
        fontWeight: 900,
    },

    numberedItem: {
        display: "flex",
        gap: "11px",
        alignItems: "flex-start",
        margin: "10px 0",
        fontSize: "15px",
        lineHeight: 1.7,
        color: "#475569",
    },

    numberBadge: {
        width: "25px",
        height: "25px",
        borderRadius: "8px",
        background: "#eef2ff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 800,
        flexShrink: 0,
    },

    codeBlock: {
        margin: "18px 0",
        padding: "17px",
        borderRadius: "13px",
        background: "#0f172a",
        color: "#e2e8f0",
        overflowX: "auto",
        fontSize: "13px",
        lineHeight: 1.65,
        fontFamily: "'Consolas', 'Courier New', monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },

    divider: {
        border: "none",
        borderTop: "1px solid #e2e8f0",
        margin: "22px 0",
    },

    contentSpace: {
        height: "7px",
    },

    notesFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        padding: "14px 25px",
        background: "#f8fafc",
        borderTop: "1px solid #eef2f7",
        color: "#94a3b8",
        fontSize: "11px",
        fontWeight: 650,
    },

    footerCopy: {
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        fontWeight: 750,
        cursor: "pointer",
        fontSize: "11px",
    },

    emptyCard: {
        background: "#ffffff",
        borderRadius: "22px",
        padding: "55px 25px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 25px rgba(15,23,42,0.05)",
    },

    emptyIcon: {
        width: "70px",
        height: "70px",
        margin: "0 auto 15px",
        borderRadius: "20px",
        background: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "32px",
    },

    emptyTitle: {
        margin: "0 0 8px",
        fontSize: "21px",
        fontWeight: 800,
    },

    emptyText: {
        maxWidth: "560px",
        margin: "0 auto",
        color: "#07080a",
        fontSize: "14px",
        lineHeight: 1.7,
    },
};