import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/api";


// ============================================================
// SIGNUP
// ============================================================

function Signup() {

    const navigate = useNavigate();


    // ========================================================
    // FORM STATE
    // ========================================================

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: "",
        password: "",
    });


    // ========================================================
    // UI STATE
    // ========================================================

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ========================================================
    // HANDLE INPUT
    // ========================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        // Clear old messages while typing
        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };


    // ========================================================
    // EXTRACT ERROR MESSAGE
    // ========================================================

    const getErrorMessage = (err) => {

        // -----------------------------------------------
        // Standard JavaScript error
        // -----------------------------------------------

        if (typeof err?.message === "string") {
            return err.message;
        }


        // -----------------------------------------------
        // Axios/FastAPI style response
        // -----------------------------------------------

        const responseData =
            err?.response?.data ||
            err?.data;


        if (!responseData) {
            return "Unable to create account. Please try again.";
        }


        // -----------------------------------------------
        // detail = string
        // -----------------------------------------------

        if (typeof responseData.detail === "string") {
            return responseData.detail;
        }


        // -----------------------------------------------
        // detail = array
        // FastAPI validation error
        // -----------------------------------------------

        if (Array.isArray(responseData.detail)) {

            return responseData.detail
                .map((item) => {

                    if (typeof item === "string") {
                        return item;
                    }

                    if (item?.msg) {
                        return item.msg;
                    }

                    return JSON.stringify(item);
                })
                .join(", ");
        }


        // -----------------------------------------------
        // message
        // -----------------------------------------------

        if (typeof responseData.message === "string") {
            return responseData.message;
        }


        // -----------------------------------------------
        // detail = object
        // -----------------------------------------------

        if (
            responseData.detail &&
            typeof responseData.detail === "object"
        ) {

            try {
                return JSON.stringify(
                    responseData.detail
                );
            } catch {
                return "Unable to create account.";
            }
        }


        return "Unable to create account. Please try again.";
    };


    // ========================================================
    // SIGNUP
    // ========================================================

    const handleSignup = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // ====================================================
        // VALIDATION
        // ====================================================

        if (!formData.full_name.trim()) {

            setError(
                "Please enter your full name."
            );

            return;
        }


        if (!formData.username.trim()) {

            setError(
                "Please enter a username."
            );

            return;
        }


        if (!formData.email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        if (!formData.password) {

            setError(
                "Please enter a password."
            );

            return;
        }


        if (formData.password.length < 6) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }


        // ====================================================
        // EMAIL VALIDATION
        // ====================================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(formData.email.trim())) {

            setError(
                "Please enter a valid email address."
            );

            return;
        }


        // ====================================================
        // START LOADING
        // ====================================================

        setLoading(true);


        try {

            console.log(
                "================================="
            );

            console.log(
                "SIGNUP REQUEST"
            );

            console.log(
                "Endpoint: POST /auth/signup"
            );

            console.log(
                "User:",
                {
                    full_name:
                        formData.full_name.trim(),

                    username:
                        formData.username.trim(),

                    email:
                        formData.email.trim(),
                }
            );

            console.log(
                "================================="
            );


            // =================================================
            // IMPORTANT
            // Uses api.js signupUser()
            // Backend route = /auth/signup
            // =================================================

            const response = await signupUser({

                full_name:
                    formData.full_name.trim(),

                username:
                    formData.username.trim(),

                email:
                    formData.email.trim(),

                password:
                    formData.password,

            });


            console.log(
                "Signup successful:"
            );

            console.log(
                response
            );


            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                "Account created successfully! Redirecting to login..."
            );


            // =================================================
            // CLEAR FORM
            // =================================================

            setFormData({
                full_name: "",
                username: "",
                email: "",
                password: "",
            });


            // =================================================
            // REDIRECT
            // =================================================

            setTimeout(() => {

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

            }, 1500);


        } catch (err) {

            console.error(
                "Signup error:",
                err
            );


            const message =
                getErrorMessage(err);


            setError(message);


        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // UI
    // ============================================================

    return (

        <div style={styles.page}>


            {/* ==================================================
                LEFT PANEL
            ================================================== */}

            <div style={styles.leftPanel}>

                <div style={styles.leftContent}>


                    {/* LOGO */}

                    <div style={styles.logoCircle}>
                        📚
                    </div>


                    {/* BRAND */}

                    <h1 style={styles.brandTitle}>
                        StudyFlow AI
                    </h1>


                    <p style={styles.brandSubtitle}>
                        Smart Learning Management System
                    </p>


                    <div style={styles.line} />


                    {/* HEADING */}

                    <h2 style={styles.leftHeading}>
                        Start Learning Smarter 🚀
                    </h2>


                    <p style={styles.leftText}>
                        Create your StudyFlow AI account
                        and manage your complete learning
                        journey in one place.
                    </p>


                    {/* ==================================================
                        FEATURES
                    ================================================== */}

                    <div style={styles.features}>


                        <div style={styles.feature}>

                            <span style={styles.featureIcon}>
                                🤖
                            </span>

                            <div>

                                <strong>
                                    AI Learning Assistant
                                </strong>

                                <p style={styles.featureText}>
                                    Get personalized learning support.
                                </p>

                            </div>

                        </div>


                        <div style={styles.feature}>

                            <span style={styles.featureIcon}>
                                📊
                            </span>

                            <div>

                                <strong>
                                    Track Your Progress
                                </strong>

                                <p style={styles.featureText}>
                                    Monitor quizzes and study performance.
                                </p>

                            </div>

                        </div>


                        <div style={styles.feature}>

                            <span style={styles.featureIcon}>
                                🎓
                            </span>

                            <div>

                                <strong>
                                    Free Learning Resources
                                </strong>

                                <p style={styles.featureText}>
                                    Find courses and useful resources.
                                </p>

                            </div>

                        </div>


                    </div>


                    {/* CREATOR */}

                    <div style={styles.leftCreator}>

                        <span>
                            Built with ❤️ by
                        </span>

                        <strong>
                            Rajat Mishra
                        </strong>

                    </div>


                </div>

            </div>


            {/* ==================================================
                RIGHT PANEL
            ================================================== */}

            <div style={styles.rightPanel}>

                <div style={styles.formCard}>


                    {/* FORM LOGO */}

                    <div style={styles.formLogo}>
                        🎓
                    </div>


                    <h2 style={styles.formTitle}>
                        Create Account
                    </h2>


                    <p style={styles.formSubtitle}>
                        Join StudyFlow AI and begin your
                        learning journey.
                    </p>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div style={styles.errorBox}>

                            <span style={styles.messageIcon}>
                                ⚠️
                            </span>

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* ==================================================
                        SUCCESS
                    ================================================== */}

                    {success && (

                        <div style={styles.successBox}>

                            <span style={styles.messageIcon}>
                                ✅
                            </span>

                            <span>
                                {success}
                            </span>

                        </div>

                    )}


                    {/* ==================================================
                        FORM
                    ================================================== */}

                    <form onSubmit={handleSignup}>


                        {/* FULL NAME */}

                        <div style={styles.inputGroup}>

                            <label style={styles.label}>
                                Full Name
                            </label>

                            <div style={styles.inputWrapper}>

                                <span style={styles.inputIcon}>
                                    👤
                                </span>

                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    style={styles.input}
                                    autoComplete="name"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* USERNAME */}

                        <div style={styles.inputGroup}>

                            <label style={styles.label}>
                                Username
                            </label>

                            <div style={styles.inputWrapper}>

                                <span style={styles.inputIcon}>
                                    🪪
                                </span>

                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a username"
                                    style={styles.input}
                                    autoComplete="username"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* EMAIL */}

                        <div style={styles.inputGroup}>

                            <label style={styles.label}>
                                Email Address
                            </label>

                            <div style={styles.inputWrapper}>

                                <span style={styles.inputIcon}>
                                    ✉️
                                </span>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    style={styles.input}
                                    autoComplete="email"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div style={styles.inputGroup}>

                            <label style={styles.label}>
                                Password
                            </label>

                            <div style={styles.inputWrapper}>

                                <span style={styles.inputIcon}>
                                    🔒
                                </span>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    style={styles.input}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        <p style={styles.passwordHint}>
                            Password must contain at least 6 characters.
                        </p>


                        {/* ==================================================
                            CREATE ACCOUNT BUTTON
                        ================================================== */}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.signupButton,

                                opacity:
                                    loading ? 0.7 : 1,

                                cursor:
                                    loading
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >

                            {loading ? (

                                <>
                                    <span style={styles.spinner}>
                                        ⏳
                                    </span>

                                    Creating Account...
                                </>

                            ) : (

                                <>
                                    Create Account 🚀
                                </>

                            )}

                        </button>


                    </form>


                    {/* ==================================================
                        LOGIN LINK
                    ================================================== */}

                    <div style={styles.loginBox}>

                        <span>
                            Already have an account?
                        </span>

                        <Link
                            to="/login"
                            style={styles.loginLink}
                        >
                            Login
                        </Link>

                    </div>


                    {/* ==================================================
                        CREATOR
                    ================================================== */}

                    <div style={styles.creator}>

                        <span>
                            StudyFlow AI • Developed by
                        </span>

                        <strong>
                            Rajat Mishra
                        </strong>

                    </div>


                </div>

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
        width: "100%",
        display: "flex",
        background: "#f5f7fb",
        fontFamily:
            "Inter, Arial, Helvetica, sans-serif",
    },


    // ========================================================
    // LEFT PANEL
    // ========================================================

    leftPanel: {
        width: "50%",
        minHeight: "100vh",

        background:
            "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)",

        color: "#ffffff",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "50px",
        boxSizing: "border-box",
    },


    leftContent: {
        width: "100%",
        maxWidth: "500px",
    },


    logoCircle: {
        width: "65px",
        height: "65px",

        borderRadius: "18px",

        background:
            "rgba(255,255,255,0.18)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        fontSize: "32px",

        marginBottom: "20px",
    },


    brandTitle: {
        fontSize: "44px",
        margin: "0 0 8px",
        fontWeight: "800",
    },


    brandSubtitle: {
        margin: 0,
        fontSize: "18px",
        opacity: 0.9,
    },


    line: {
        width: "70px",
        height: "4px",

        background: "#ffffff",

        borderRadius: "10px",

        margin: "30px 0",
    },


    leftHeading: {
        fontSize: "28px",
        margin: "0 0 15px",
    },


    leftText: {
        fontSize: "16px",
        lineHeight: "1.7",
        opacity: 0.9,
        marginBottom: "30px",
    },


    // ========================================================
    // FEATURES
    // ========================================================

    features: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },


    feature: {
        display: "flex",
        alignItems: "flex-start",
        gap: "15px",
    },


    featureIcon: {
        fontSize: "28px",
        width: "40px",
        flexShrink: 0,
    },


    featureText: {
        margin: "5px 0 0",
        fontSize: "13px",
        opacity: 0.85,
    },


    leftCreator: {
        marginTop: "45px",
        paddingTop: "20px",

        borderTop:
            "1px solid rgba(255,255,255,0.25)",

        display: "flex",
        gap: "6px",

        fontSize: "13px",

        opacity: 0.9,
    },


    // ========================================================
    // RIGHT PANEL
    // ========================================================

    rightPanel: {
        width: "50%",
        minHeight: "100vh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "35px",

        boxSizing: "border-box",
    },


    formCard: {
        width: "100%",
        maxWidth: "500px",

        background: "#ffffff",

        padding: "40px",

        borderRadius: "20px",

        boxShadow:
            "0 15px 45px rgba(16,24,40,0.08)",

        boxSizing: "border-box",
    },


    formLogo: {
        fontSize: "38px",
        marginBottom: "10px",
    },


    formTitle: {
        margin: "0 0 8px",
        fontSize: "30px",
        color: "#101828",
    },


    formSubtitle: {
        margin: "0 0 28px",
        color: "#667085",
        lineHeight: "1.5",
        fontSize: "14px",
    },


    // ========================================================
    // MESSAGES
    // ========================================================

    errorBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",

        background: "#fef3f2",

        color: "#b42318",

        border:
            "1px solid #fecdca",

        padding: "12px",

        borderRadius: "9px",

        marginBottom: "18px",

        fontSize: "14px",

        lineHeight: "1.5",
    },


    successBox: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",

        background: "#ecfdf3",

        color: "#027a48",

        border:
            "1px solid #abefc6",

        padding: "12px",

        borderRadius: "9px",

        marginBottom: "18px",

        fontSize: "14px",

        lineHeight: "1.5",
    },


    messageIcon: {
        flexShrink: 0,
    },


    // ========================================================
    // INPUTS
    // ========================================================

    inputGroup: {
        marginBottom: "18px",
    },


    label: {
        display: "block",

        marginBottom: "7px",

        fontSize: "14px",

        fontWeight: "600",

        color: "#344054",
    },


    inputWrapper: {
        display: "flex",
        alignItems: "center",

        width: "100%",

        height: "48px",

        border:
            "1px solid #d0d5dd",

        borderRadius: "10px",

        background: "#ffffff",

        boxSizing: "border-box",

        transition:
            "border-color 0.2s ease, box-shadow 0.2s ease",
    },


    inputIcon: {
        width: "42px",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        fontSize: "16px",

        flexShrink: 0,
    },


    input: {
        flex: 1,

        height: "100%",

        border: "none",

        outline: "none",

        padding: "0 13px 0 0",

        fontSize: "15px",

        boxSizing: "border-box",

        background: "transparent",

        color: "#101828",

        minWidth: 0,
    },


    passwordHint: {
        fontSize: "12px",

        color: "#98a2b3",

        margin:
            "-5px 0 20px",
    },


    // ========================================================
    // BUTTON
    // ========================================================

    signupButton: {
        width: "100%",

        height: "50px",

        border: "none",

        borderRadius: "10px",

        background:
            "linear-gradient(135deg, #2563eb, #4f46e5)",

        color: "#ffffff",

        fontSize: "15px",

        fontWeight: "700",

        boxShadow:
            "0 8px 20px rgba(37,99,235,0.25)",

        transition:
            "transform 0.2s ease, box-shadow 0.2s ease",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        gap: "7px",
    },


    spinner: {
        fontSize: "16px",
    },


    // ========================================================
    // LOGIN
    // ========================================================

    loginBox: {
        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        gap: "6px",

        marginTop: "22px",

        fontSize: "14px",

        color: "#667085",

        flexWrap: "wrap",
    },


    loginLink: {
        color: "#2563eb",

        textDecoration: "none",

        fontWeight: "700",
    },


    // ========================================================
    // CREATOR
    // ========================================================

    creator: {
        borderTop:
            "1px solid #eaecf0",

        marginTop: "25px",

        paddingTop: "18px",

        display: "flex",

        justifyContent: "center",

        gap: "5px",

        color: "#98a2b3",

        fontSize: "12px",

        flexWrap: "wrap",
    },
};


// ============================================================
// EXPORT
// ============================================================

export default Signup;