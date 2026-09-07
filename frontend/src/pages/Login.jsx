import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
    const navigate = useNavigate();

    // ============================================================
    // STATE
    // ============================================================

    const [lampOn, setLampOn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ============================================================
    // ERROR NORMALIZER
    // ============================================================

    const getErrorMessage = (err) => {
        console.error("FULL LOGIN ERROR:", err);

        const responseData = err?.response?.data;

        if (responseData) {
            console.log("Backend error response:", responseData);

            const detail = responseData?.detail;

            if (Array.isArray(detail)) {
                return detail
                    .map((item) => {
                        if (typeof item === "string") {
                            return item;
                        }
                        if (item?.msg) {
                            return item.msg;
                        }
                        if (item?.message) {
                            return item.message;
                        }
                        return JSON.stringify(item);
                    })
                    .join(" ");
            }

            if (typeof detail === "string") {
                return detail;
            }

            if (detail && typeof detail === "object") {
                if (detail.msg) {
                    return detail.msg;
                }
                if (detail.message) {
                    return detail.message;
                }
                return JSON.stringify(detail);
            }

            if (typeof responseData?.message === "string") {
                return responseData.message;
            }

            if (typeof responseData?.error === "string") {
                return responseData.error;
            }
        }

        if (typeof err?.message === "string") {
            return err.message;
        }

        return "Unable to login. Please check your email and password.";
    };

    // ============================================================
    // PULL LAMP
    // ============================================================

    const toggleLamp = () => {
        setLampOn((previous) => !previous);
        setError("");
    };

    // ============================================================
    // LOGIN
    // ============================================================

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!password.trim()) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            console.log("=================================");
            console.log("LOGIN STARTED");
            console.log("Email:", email.trim());
            console.log("=================================");

            const response = await loginUser({
                email: email.trim(),
                password: password,
            });

            console.log("LOGIN RAW RESPONSE:", response);

            const responseData = response?.data || response;

            console.log("LOGIN RESPONSE DATA:", responseData);

            const token =
                responseData?.access_token ||
                responseData?.token ||
                response?.access_token ||
                response?.token;

            console.log("TOKEN RECEIVED:", token ? "YES" : "NO");

            if (!token) {
                throw new Error(
                    "Login response received, but access token was not found."
                );
            }

            localStorage.setItem("access_token", token);

            console.log("Access token saved successfully.");

            console.log(
                "Saved token:",
                localStorage.getItem("access_token") ? "YES" : "NO"
            );

            navigate("/dashboard", {
                replace: true,
            });

        } catch (err) {
            console.error("=================================");
            console.error("LOGIN FAILED");
            console.error("=================================");
            console.error(err);

            const message = getErrorMessage(err);

            console.error("USER FRIENDLY ERROR:", message);

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div
            style={{
                ...styles.page,
                background: lampOn
                    ? "radial-gradient(circle at 50% 20%, #fff7c2 0%, #eef2ff 42%, #e5e7eb 100%)"
                    : "radial-gradient(circle at 50% 20%, #273449 0%, #111827 45%, #080b12 100%)",
            }}
        >
            {/* AMBIENT LIGHT */}
            <div
                style={{
                    ...styles.lightGlow,
                    opacity: lampOn ? 1 : 0,
                }}
            />

            {/* BRAND */}
            <div style={styles.brand}>
                <div style={styles.brandIcon}>🎓</div>
                <div>
                    <p
                        style={{
                            ...styles.brandSubtitle,
                            color: lampOn ? "#667085" : "#98a2b3",
                        }}
                    >
                        Smart Learning Management System
                    </p>
                    <p
                        style={{
                            ...styles.developerName,
                            color: lampOn ? "#2563eb" : "#d0d5dd",
                        }}
                    >
                        Developed by <strong>Rajat Mishra</strong>
                    </p>
                </div>
            </div>

            {/* LAMP */}
            <div style={styles.lampArea}>
                <div style={styles.wire} />
                <div
                    style={{
                        ...styles.lampTop,
                        background: lampOn ? "#fbbf24" : "#374151",
                        boxShadow: lampOn ? "0 0 30px rgba(251,191,36,0.8)" : "none",
                    }}
                />
                <div
                    style={{
                        ...styles.lampShade,
                        background: lampOn
                            ? "linear-gradient(180deg, #fff4a8, #fbbf24)"
                            : "linear-gradient(180deg, #4b5563, #1f2937)",
                        boxShadow: lampOn
                            ? "0 10px 50px rgba(251,191,36,0.65)"
                            : "0 8px 20px rgba(0,0,0,0.4)",
                    }}
                >
                    <div
                        style={{
                            ...styles.bulb,
                            background: lampOn ? "#fffde7" : "#6b7280",
                            boxShadow: lampOn ? "0 0 35px #fde68a" : "none",
                        }}
                    />
                </div>

                <button
                    type="button"
                    onClick={toggleLamp}
                    aria-label="Pull lamp cord"
                    style={{
                        ...styles.cordButton,
                        transform: lampOn ? "translateY(5px)" : "translateY(0)",
                    }}
                >
                    <span style={styles.cord} />
                    <span
                        style={{
                            ...styles.pullHandle,
                            boxShadow: lampOn
                                ? "0 5px 15px rgba(37,99,235,0.4)"
                                : "0 4px 10px rgba(0,0,0,0.3)",
                        }}
                    >
                        🪢
                    </span>
                </button>

                <p
                    style={{
                        ...styles.pullText,
                        color: lampOn ? "#475467" : "#d0d5dd",
                    }}
                >
                    {lampOn
                        ? "Pull again to turn the light off"
                        : "Pull the cord to start learning"}
                </p>
            </div>

            {/* LOGIN CARD */}
            <div
                style={{
                    ...styles.loginWrapper,
                    maxHeight: lampOn ? "700px" : "0px",
                    opacity: lampOn ? 1 : 0,
                    transform: lampOn ? "translateY(0)" : "translateY(-20px)",
                    pointerEvents: lampOn ? "auto" : "none",
                }}
            >
                <div style={styles.loginCard}>
                    <div style={styles.watermark}>
                        <img
                            src="/study-logo.png"
                            alt=""
                            style={styles.watermarkImage}
                        />
                    </div>

                    {/* LOGO */}
                    <img
                        src="/study-logo.png"
                        alt="StudyFlow AI"
                        style={styles.loginLogo}
                    />

                    {/* HEADER */}
                    <div style={styles.loginHeader}>
                        <h2 style={styles.loginTitle}>Welcome Back</h2>
                        <p style={styles.loginSubtitle}>
                            Continue your learning journey
                        </p>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div style={styles.error}>
                            <span style={styles.errorIcon}>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* FORM */}
                    <form onSubmit={handleLogin}>
                        {/* EMAIL */}
                        <div style={styles.field}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>✉️</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    style={styles.input}
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div style={styles.field}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔒</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={styles.input}
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "10px",
                                marginBottom: "18px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    color: "#2563eb",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.loginButton,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}>⏳</span> Signing in...
                                </>
                            ) : (
                                <>🚀 Sign In</>
                            )}
                        </button>
                    </form>

                    {/* SIGNUP */}
                    <div style={styles.signupSection}>
                        <span style={styles.signupText}>
                            Don't have an account?
                        </span>
                        <Link to="/signup" style={styles.signupLink}>
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <p
                style={{
                    ...styles.footer,
                    color: lampOn ? "#98a2b3" : "#667085",
                }}
            >
                StudyFlow AI • Learn Smarter • Grow Faster
            </p>
        </div>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
    page: {
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        padding: "30px 20px 40px",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "hidden",
        transition: "background 0.7s ease",
        position: "relative",
    },

    lightGlow: {
        position: "fixed",
        top: "-200px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "650px",
        height: "650px",
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(255,226,102,0.35), rgba(255,226,102,0) 70%)",
        pointerEvents: "none",
        transition: "opacity 0.7s ease",
    },

    brand: {
        width: "100%",
        maxWidth: "900px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        position: "relative",
        zIndex: 2,
    },

    brandIcon: {
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "27px",
        boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
    },

    brandSubtitle: {
        margin: "3px 0 0",
        fontSize: "12px",
        transition: "color 0.5s ease",
    },

    developerName: {
        margin: "3px 0 0",
        fontSize: "12px",
        fontWeight: "600",
        transition: "color 0.5s ease",
    },

    lampArea: {
        width: "100%",
        height: "300px",
        maxWidth: "500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        zIndex: 2,
    },

    wire: {
        width: "4px",
        height: "60px",
        background: "#6b7280",
        borderRadius: "5px",
    },

    lampTop: {
        width: "20px",
        height: "15px",
        borderRadius: "6px 6px 2px 2px",
        transition: "background 0.5s ease, box-shadow 0.5s ease",
    },

    lampShade: {
        width: "180px",
        height: "90px",
        clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
        borderRadius: "8px 8px 20px 20px",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingBottom: "10px",
        transition: "background 0.5s ease, box-shadow 0.5s ease",
    },

    bulb: {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        marginBottom: "-25px",
        transition: "background 0.5s ease, box-shadow 0.5s ease",
    },

    cordButton: {
        border: "none",
        background: "transparent",
        padding: 0,
        marginTop: "25px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "transform 0.15s ease",
    },

    cord: {
        width: "3px",
        height: "48px",
        background: "#9ca3af",
        display: "block",
    },

    pullHandle: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        border: "3px solid #ffffff",
        transition: "box-shadow 0.3s ease",
    },

    pullText: {
        fontSize: "13px",
        marginTop: "10px",
        transition: "color 0.5s ease",
    },

    loginWrapper: {
        width: "100%",
        maxWidth: "450px",
        overflow: "hidden",
        transition: "max-height 0.6s ease, opacity 0.5s ease, transform 0.5s ease",
        position: "relative",
        zIndex: 5,
    },

    loginCard: {
        background: "rgba(255,255,255,0.97)",
        borderRadius: "22px",
        padding: "32px",
        boxSizing: "border-box",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.8)",
        position: "relative",
        zIndex: 2,
    },

    authLogo: {
        width: "180px",
        height: "auto",
        display: "block",
        margin: "0 auto 18px",
        position: "relative",
        zIndex: 2,
    },

    loginLogo: {
        width: "170px",
        height: "auto",
        display: "block",
        margin: "0 auto 12px",
    },

    watermark: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 1,
    },

    watermarkImage: {
        width: "420px",
        height: "auto",
        opacity: 0.06,
    },

    loginHeader: {
        textAlign: "center",
        marginBottom: "25px",
    },

    loginIcon: {
        fontSize: "36px",
        marginBottom: "5px",
    },

    loginTitle: {
        margin: "0 0 6px",
        fontSize: "27px",
        color: "#101828",
    },

    loginSubtitle: {
        margin: 0,
        color: "#667085",
        fontSize: "14px",
    },

    field: {
        marginBottom: "18px",
    },

    label: {
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#344054",
        marginBottom: "8px",
    },

    inputWrapper: {
        display: "flex",
        alignItems: "center",
        border: "1px solid #d0d5dd",
        borderRadius: "10px",
        background: "#ffffff",
    },

    inputIcon: {
        paddingLeft: "13px",
        fontSize: "16px",
    },

    input: {
        width: "100%",
        border: "none",
        outline: "none",
        padding: "13px 14px 13px 10px",
        fontSize: "15px",
        borderRadius: "10px",
        boxSizing: "border-box",
        background: "transparent",
    },

    loginButton: {
        width: "100%",
        border: "none",
        borderRadius: "10px",
        padding: "14px",
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "700",
        boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },

    spinner: {
        marginRight: "7px",
    },

    error: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        background: "#fef3f2",
        border: "1px solid #fecdca",
        color: "#b42318",
        padding: "11px 13px",
        borderRadius: "9px",
        fontSize: "13px",
        marginBottom: "18px",
        lineHeight: "1.5",
    },

    errorIcon: {
        flexShrink: 0,
    },

    signupSection: {
        marginTop: "22px",
        paddingTop: "20px",
        borderTop: "1px solid #eaecf0",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        gap: "5px",
        flexWrap: "wrap",
    },

    signupText: {
        color: "#667085",
        fontSize: "13px",
    },

    signupLink: {
        color: "#2563eb",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: "700",
    },

    footer: {
        position: "relative",
        zIndex: 2,
        marginTop: "25px",
        fontSize: "12px",
        transition: "color 0.5s ease",
    },
};

export default Login;