import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// API HELPERS
// ============================================================

function getToken() {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("token")
    );
}

async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers,
            }
        );
    } catch (error) {
        console.error("FETCH ERROR:", error);

        throw new Error(
            "Unable to connect to backend. Make sure FastAPI server is running on http://127.0.0.1:8000"
        );
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    console.log("=================================");
    console.log("API ENDPOINT:", endpoint);
    console.log("STATUS:", response.status);
    console.log("RESPONSE:", data);
    console.log("=================================");

    if (!response.ok) {
        let message = "Something went wrong.";

        if (typeof data?.detail === "string") {
            message = data.detail;
        } else if (Array.isArray(data?.detail)) {
            message = data.detail
                .map(
                    (item) =>
                        item?.msg ||
                        "Invalid request"
                )
                .join(", ");
        }

        throw new Error(message);
    }

    return data;
}

// ============================================================
// QUESTION NORMALIZER
// ============================================================

function normalizeQuestions(data) {
    console.log(
        "RAW QUESTION RESPONSE:",
        data
    );

    let rawQuestions = [];

    if (Array.isArray(data)) {
        rawQuestions = data;
    } else if (
        Array.isArray(data?.questions)
    ) {
        rawQuestions = data.questions;
    } else if (
        Array.isArray(data?.data)
    ) {
        rawQuestions = data.data;
    } else if (
        Array.isArray(data?.items)
    ) {
        rawQuestions = data.items;
    } else if (
        Array.isArray(
            data?.quiz?.questions
        )
    ) {
        rawQuestions =
            data.quiz.questions;
    } else if (
        Array.isArray(data?.results)
    ) {
        rawQuestions = data.results;
    }

    const normalized =
        rawQuestions
            .map((q, index) => {
                let options = [];

                // --------------------------------------------
                // OPTIONS ARRAY
                // --------------------------------------------

                if (
                    Array.isArray(q?.options)
                ) {
                    options = q.options;
                }

                // --------------------------------------------
                // CHOICES ARRAY
                // --------------------------------------------

                else if (
                    Array.isArray(q?.choices)
                ) {
                    options = q.choices;
                }

                // --------------------------------------------
                // ANSWERS ARRAY
                // --------------------------------------------

                else if (
                    Array.isArray(q?.answers)
                ) {
                    options = q.answers;
                }

                // --------------------------------------------
                // OPTION A/B/C/D
                // --------------------------------------------

                else {
                    options = [
                        q?.option_a,
                        q?.option_b,
                        q?.option_c,
                        q?.option_d,
                    ].filter(
                        (option) =>
                            option !==
                                undefined &&
                            option !== null &&
                            String(
                                option
                            ).trim() !== ""
                    );
                }

                // --------------------------------------------
                // QUESTION TEXT
                // --------------------------------------------

                const text =
                    q?.question_text ??
                    q?.question ??
                    q?.questionText ??
                    q?.text ??
                    q?.title ??
                    `Question ${
                        index + 1
                    }`;

                // --------------------------------------------
                // QUESTION ID
                // --------------------------------------------

                const id =
                    q?.id ??
                    q?.question_id ??
                    q?.questionId ??
                    index + 1;

                return {
                    ...q,

                    id,

                    text: String(text),

                    options: options.map(
                        (option) =>
                            String(option)
                    ),
                };
            })
            .filter(
                (q) =>
                    q.text &&
                    q.options.length > 0
            );

    console.log(
        "NORMALIZED QUESTIONS:",
        normalized
    );

    return normalized;
}

// ============================================================
// MAIN QUIZ COMPONENT
// ============================================================

export default function Quiz() {
    // ========================================================
    // QUIZ SETUP
    // ========================================================

    const [subject, setSubject] =
        useState("Python");

    const [topic, setTopic] =
        useState("");

    const [difficulty, setDifficulty] =
        useState("Easy");

    const [questionCount, setQuestionCount] =
        useState(5);

    // ========================================================
    // QUIZ DATA
    // ========================================================

    const [quiz, setQuiz] =
        useState(null);

    const [questions, setQuestions] =
        useState([]);

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    /*
        IMPORTANT:

        answers will store:

        {
            1: "A",
            2: "C",
            3: "B"
        }

        NOT:

        {
            1: "Python is interpreted..."
        }

        Backend also expects A/B/C/D.
    */

    const [answers, setAnswers] =
        useState({});

    // ========================================================
    // RESULT
    // ========================================================

    const [submitted, setSubmitted] =
        useState(false);

    const [result, setResult] =
        useState(null);

    // ========================================================
    // LOADING
    // ========================================================

    const [loading, setLoading] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    // ========================================================
    // ERROR
    // ========================================================

    const [error, setError] =
        useState("");

    // ========================================================
    // CONFIRMATION MODAL
    // ========================================================

    const [showConfirm, setShowConfirm] =
        useState(false);

    // ========================================================
    // TIMER
    // ========================================================

    const [secondsLeft, setSecondsLeft] =
        useState(0);

    // ========================================================
    // GENERATE QUIZ
    // ========================================================

    async function startQuiz() {
        setError("");

        if (!topic.trim()) {
            setError(
                "Please enter a topic first."
            );

            return;
        }

        setLoading(true);

        try {
            console.log(
                "GENERATING QUIZ:",
                {
                    subject,
                    topic,
                    difficulty,
                    questionCount,
                }
            );

            // ==================================================
            // CREATE QUIZ
            // ==================================================

            const quizData =
                await apiRequest(
                    "/quizzes",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            subject:
                                subject.trim(),

                            topic:
                                topic.trim(),

                            difficulty:
                                difficulty,
                        }),
                    }
                );

            console.log(
                "QUIZ CREATED:",
                quizData
            );

            // ==================================================
            // GET QUIZ ID
            // ==================================================

            const quizId =
                quizData?.id ??
                quizData?.quiz_id ??
                quizData?.data?.id ??
                quizData?.data?.quiz_id;

            if (!quizId) {
                throw new Error(
                    "Quiz was created but Quiz ID was not returned by backend."
                );
            }

            // ==================================================
            // GET QUESTIONS
            // ==================================================

            const questionData =
                await apiRequest(
                    `/questions/quiz/${quizId}`
                );

            const normalizedQuestions =
                normalizeQuestions(
                    questionData
                );

            if (
                !normalizedQuestions.length
            ) {
                throw new Error(
                    "Quiz was created, but no questions were returned by backend."
                );
            }

            // ==================================================
            // LIMIT QUESTIONS
            // ==================================================

            const finalQuestions =
                normalizedQuestions.slice(
                    0,
                    Number(questionCount)
                );

            if (!finalQuestions.length) {
                throw new Error(
                    "No usable questions available."
                );
            }

            console.log(
                "FINAL QUESTIONS:",
                finalQuestions
            );

            // ==================================================
            // RESET QUIZ STATE
            // ==================================================

            setQuiz({
                ...quizData,
                id: quizId,
            });

            setQuestions(
                finalQuestions
            );

            setCurrentQuestion(0);

            setAnswers({});

            setSubmitted(false);

            setResult(null);

            setShowConfirm(false);

            // ==================================================
            // 1 MINUTE PER QUESTION
            // ==================================================

            setSecondsLeft(
                finalQuestions.length * 60
            );
        } catch (err) {
            console.error(
                "QUIZ GENERATION ERROR:",
                err
            );

            setError(
                err?.message ||
                    "Unable to generate quiz."
            );
        } finally {
            setLoading(false);
        }
    }

    // ========================================================
    // TIMER
    // ========================================================

    useEffect(() => {
        if (
            !questions.length ||
            submitted ||
            secondsLeft <= 0
        ) {
            return;
        }

        const timer =
            setInterval(() => {
                setSecondsLeft(
                    (previous) => {
                        if (
                            previous <= 1
                        ) {
                            clearInterval(
                                timer
                            );

                            setTimeout(
                                () => {
                                    submitQuiz(
                                        true
                                    );
                                },
                                0
                            );

                            return 0;
                        }

                        return (
                            previous - 1
                        );
                    }
                );
            }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [
        questions.length,
        submitted,
        answers,
    ]);

    // ========================================================
    // FORMAT TIMER
    // ========================================================

    const formattedTime =
        useMemo(() => {
            const minutes =
                Math.floor(
                    secondsLeft / 60
                );

            const seconds =
                secondsLeft % 60;

            return (
                `${String(
                    minutes
                ).padStart(2, "0")}:` +
                `${String(
                    seconds
                ).padStart(2, "0")}`
            );
        }, [secondsLeft]);

    // ========================================================
    // SELECT ANSWER
    // ========================================================

    function selectAnswer(
        option,
        index
    ) {
        if (submitted) {
            return;
        }

        const question =
            questions[currentQuestion];

        if (!question) {
            return;
        }

        // ====================================================
        // VERY IMPORTANT
        //
        // index 0 => A
        // index 1 => B
        // index 2 => C
        // index 3 => D
        // ====================================================

        const selectedLetter =
            String.fromCharCode(
                65 + index
            );

        console.log(
            "================================="
        );

        console.log(
            "ANSWER SELECTED"
        );

        console.log({
            question_id:
                question.id,

            option_text:
                option,

            selected_answer:
                selectedLetter,
        });

        console.log(
            "================================="
        );

        setAnswers(
            (previous) => ({
                ...previous,

                [question.id]:
                    selectedLetter,
            })
        );
    }

    // ========================================================
    // NEXT QUESTION
    // ========================================================

    function nextQuestion() {
        if (
            currentQuestion <
            questions.length - 1
        ) {
            setCurrentQuestion(
                (previous) =>
                    previous + 1
            );
        }
    }

    // ========================================================
    // PREVIOUS QUESTION
    // ========================================================

    function previousQuestion() {
        if (
            currentQuestion > 0
        ) {
            setCurrentQuestion(
                (previous) =>
                    previous - 1
            );
        }
    }

    // ========================================================
    // SUBMIT QUIZ
    // ========================================================

    async function submitQuiz(
        autoSubmit = false
    ) {
        if (
            submitting ||
            submitted
        ) {
            return;
        }

        setShowConfirm(false);

        setSubmitting(true);

        setError("");

        try {
            // ==================================================
            // GET QUIZ ID
            // ==================================================

            const quizId =
                quiz?.id ??
                quiz?.quiz_id;

            if (!quizId) {
                throw new Error(
                    "Quiz ID is missing."
                );
            }

            // ==================================================
            // IMPORTANT:
            //
            // Backend expects:
            //
            // {
            //     question_id: 1,
            //     selected_answer: "A"
            // }
            //
            // ==================================================

            const formattedAnswers =
                questions.map(
                    (question) => ({
                        question_id:
                            Number(
                                question.id
                            ),

                        selected_answer:
                            answers[
                                question.id
                            ] ?? "",
                    })
                );

            // ==================================================
            // DEBUG
            // ==================================================

            console.log(
                "================================="
            );

            console.log(
                "FINAL SUBMISSION PAYLOAD"
            );

            console.log({
                quiz_id:
                    Number(quizId),

                answers:
                    formattedAnswers,
            });

            console.log(
                "================================="
            );

            // ==================================================
            // VALIDATE ANSWERS
            // ==================================================

            const invalidAnswers =
                formattedAnswers.filter(
                    (answer) =>
                        !answer.selected_answer
                );

            console.log(
                "UNANSWERED QUESTIONS:",
                invalidAnswers.length
            );

            // ==================================================
            // SEND TO BACKEND
            // ==================================================

            const response =
                await apiRequest(
                    "/quizzes/submit",
                    {
                        method: "POST",

                        body: JSON.stringify(
                            {
                                quiz_id:
                                    Number(
                                        quizId
                                    ),

                                answers:
                                    formattedAnswers,
                            }
                        ),
                    }
                );

            console.log(
                "QUIZ RESULT:",
                response
            );

            // ==================================================
            // SAVE RESULT
            // ==================================================

            setResult(response);

            setSubmitted(true);
        } catch (err) {
            console.error(
                "SUBMIT ERROR:",
                err
            );

            setError(
                autoSubmit
                    ? err?.message ||
                          "Quiz time ended but submission failed."
                    : err?.message ||
                          "Unable to submit quiz."
            );
        } finally {
            setSubmitting(false);
        }
    }

    // ========================================================
    // RESET QUIZ
    // ========================================================

    function resetQuiz() {
        setQuiz(null);

        setQuestions([]);

        setCurrentQuestion(0);

        setAnswers({});

        setSubmitted(false);

        setResult(null);

        setSecondsLeft(0);

        setError("");

        setShowConfirm(false);
    }

    // ========================================================
    // GET SCORE
    // ========================================================

    function getScore() {
        return (
            result?.score ??
            result?.correct_answers ??
            result?.total_score ??
            result?.marks ??
            0
        );
    }

    // ========================================================
    // GET TOTAL
    // ========================================================

    function getTotal() {
        return (
            result?.total_questions ??
            result?.total ??
            questions.length
        );
    }

    // ========================================================
    // GET PERCENTAGE
    // ========================================================

    function getPercentage() {
        if (
            result?.percentage !==
                undefined &&
            result?.percentage !==
                null
        ) {
            return Math.round(
                Number(
                    result.percentage
                )
            );
        }

        const total =
            Number(getTotal());

        const score =
            Number(getScore());

        if (!total) {
            return 0;
        }

        return Math.round(
            (score / total) * 100
        );
    }

    // ========================================================
    // PERFORMANCE TEXT
    // ========================================================

    function getPerformanceText() {
        const percentage =
            getPercentage();

        if (percentage >= 90) {
            return "Excellent Performance!";
        }

        if (percentage >= 75) {
            return "Great Job!";
        }

        if (percentage >= 60) {
            return "Good Progress!";
        }

        if (percentage >= 40) {
            return "Keep Practicing!";
        }

        return "More Practice Needed";
    }

    // ========================================================
    // STYLES
    // ========================================================

    const styles = {
        page: {
            minHeight:
                "100vh",

            background:
                "linear-gradient(135deg,#f8fafc,#eef2ff,#f8fafc)",

            padding:
                "30px",

            fontFamily:
                "Inter,system-ui,sans-serif",

            color:
                "#172033",

            boxSizing:
                "border-box",
        },

        container: {
            maxWidth:
                "1180px",

            margin:
                "0 auto",
        },

        card: {
            background:
                "#ffffff",

            border:
                "1px solid #e5e7eb",

            borderRadius:
                "20px",

            padding:
                "28px",

            boxShadow:
                "0 12px 35px rgba(15,23,42,.07)",
        },

        title: {
            fontSize:
                "32px",

            fontWeight:
                800,

            margin:
                0,
        },

        subtitle: {
            color:
                "#64748b",

            marginTop:
                "8px",
        },

        label: {
            display:
                "block",

            fontSize:
                "13px",

            fontWeight:
                700,

            color:
                "#475569",

            marginBottom:
                "8px",
        },

        input: {
            width:
                "100%",

            boxSizing:
                "border-box",

            padding:
                "13px",

            border:
                "1px solid #dbe1ea",

            borderRadius:
                "12px",

            fontSize:
                "15px",

            outline:
                "none",
        },

        select: {
            width:
                "100%",

            boxSizing:
                "border-box",

            padding:
                "13px",

            border:
                "1px solid #dbe1ea",

            borderRadius:
                "12px",

            fontSize:
                "15px",

            background:
                "#ffffff",

            outline:
                "none",
        },

        primary: {
            border:
                "none",

            borderRadius:
                "12px",

            padding:
                "13px 20px",

            background:
                "linear-gradient(135deg,#4f46e5,#7c3aed)",

            color:
                "#ffffff",

            fontWeight:
                700,

            cursor:
                "pointer",
        },

        secondary: {
            border:
                "1px solid #dbe1ea",

            borderRadius:
                "12px",

            padding:
                "12px 18px",

            background:
                "#ffffff",

            fontWeight:
                700,

            cursor:
                "pointer",
        },
    };

    // ========================================================
    // SETUP SCREEN
    // ========================================================

    if (!questions.length) {
        return (
            <div
                style={
                    styles.page
                }
            >
                <div
                    style={
                        styles.container
                    }
                >
                    {/* HEADER */}

                    <div
                        style={{
                            marginBottom:
                                "28px",
                        }}
                    >
                        <h1
                            style={
                                styles.title
                            }
                        >
                            🧠 AI Quiz
                        </h1>

                        <p
                            style={
                                styles.subtitle
                            }
                        >
                            Test your
                            knowledge
                            with an
                            AI-generated
                            quiz.
                        </p>
                    </div>

                    {/* CARD */}

                    <div
                        style={
                            styles.card
                        }
                    >
                        <h2>
                            Create Your
                            Quiz
                        </h2>

                        <p
                            style={{
                                color:
                                    "#64748b",
                            }}
                        >
                            Select
                            subject,
                            topic,
                            difficulty
                            and number
                            of
                            questions.
                        </p>

                        {/* ERROR */}

                        {error && (
                            <div
                                style={{
                                    padding:
                                        "14px",

                                    marginTop:
                                        "20px",

                                    marginBottom:
                                        "20px",

                                    borderRadius:
                                        "12px",

                                    background:
                                        "#fef2f2",

                                    color:
                                        "#b91c1c",

                                    border:
                                        "1px solid #fecaca",
                                }}
                            >
                                ⚠️{" "}
                                {error}
                            </div>
                        )}

                        {/* FORM GRID */}

                        <div
                            style={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                    "repeat(auto-fit,minmax(220px,1fr))",

                                gap:
                                    "20px",

                                marginTop:
                                    "25px",
                            }}
                        >
                            {/* SUBJECT */}

                            <div>
                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Subject
                                </label>

                                <select
                                    value={
                                        subject
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setSubject(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    style={
                                        styles.select
                                    }
                                >
                                    <option>
                                        Python
                                    </option>

                                    <option>
                                        DSA
                                    </option>

                                    <option>
                                        Data
                                        Science
                                    </option>

                                    <option>
                                        Machine
                                        Learning
                                    </option>

                                    <option>
                                        JavaScript
                                    </option>

                                    <option>
                                        React
                                    </option>

                                    <option>
                                        DBMS
                                    </option>

                                    <option>
                                        Operating
                                        System
                                    </option>
                                </select>
                            </div>

                            {/* TOPIC */}

                            <div>
                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Topic
                                </label>

                                <input
                                    value={
                                        topic
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setTopic(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. Python OOP"
                                    style={
                                        styles.input
                                    }
                                />
                            </div>

                            {/* DIFFICULTY */}

                            <div>
                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Difficulty
                                </label>

                                <select
                                    value={
                                        difficulty
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setDifficulty(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    style={
                                        styles.select
                                    }
                                >
                                    <option>
                                        Easy
                                    </option>

                                    <option>
                                        Medium
                                    </option>

                                    <option>
                                        Hard
                                    </option>
                                </select>
                            </div>

                            {/* QUESTION COUNT */}

                            <div>
                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Number of
                                    Questions
                                </label>

                                <select
                                    value={
                                        questionCount
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setQuestionCount(
                                            Number(
                                                e
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                    style={
                                        styles.select
                                    }
                                >
                                    <option
                                        value={
                                            5
                                        }
                                    >
                                        5
                                        Questions
                                    </option>

                                    <option
                                        value={
                                            10
                                        }
                                    >
                                        10
                                        Questions
                                    </option>

                                    <option
                                        value={
                                            15
                                        }
                                    >
                                        15
                                        Questions
                                    </option>

                                    <option
                                        value={
                                            20
                                        }
                                    >
                                        20
                                        Questions
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* TIMER INFO */}

                        <div
                            style={{
                                marginTop:
                                    "25px",

                                padding:
                                    "15px",

                                background:
                                    "#f8fafc",

                                borderRadius:
                                    "12px",

                                color:
                                    "#475569",
                            }}
                        >
                            ⏱️ 1 minute
                            per question
                        </div>

                        {/* GENERATE BUTTON */}

                        <button
                            onClick={
                                startQuiz
                            }
                            disabled={
                                loading
                            }
                            style={{
                                ...styles.primary,

                                width:
                                    "100%",

                                marginTop:
                                    "24px",

                                opacity:
                                    loading
                                        ? 0.7
                                        : 1,
                            }}
                        >
                            {loading
                                ? "✨ Generating Quiz..."
                                : "🚀 Generate AI Quiz"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // RESULT SCREEN
    // ========================================================

    if (
        submitted &&
        result
    ) {
        const percentage =
            getPercentage();

        return (
            <div
                style={
                    styles.page
                }
            >
                <div
                    style={
                        styles.container
                    }
                >
                    <div
                        style={{
                            ...styles.card,

                            maxWidth:
                                "760px",

                            margin:
                                "40px auto",

                            textAlign:
                                "center",
                        }}
                    >
                        {/* PERCENTAGE */}

                        <div
                            style={{
                                width:
                                    "110px",

                                height:
                                    "110px",

                                borderRadius:
                                    "50%",

                                margin:
                                    "0 auto 20px",

                                background:
                                    "linear-gradient(135deg,#4f46e5,#7c3aed)",

                                color:
                                    "#ffffff",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                fontSize:
                                    "30px",

                                fontWeight:
                                    800,
                            }}
                        >
                            {percentage}%
                        </div>

                        <h1>
                            {getPerformanceText()}
                        </h1>

                        <p
                            style={{
                                color:
                                    "#64748b",
                            }}
                        >
                            Quiz submitted
                            successfully.
                        </p>

                        {/* RESULT CARDS */}

                        <div
                            style={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                    "repeat(3,1fr)",

                                gap:
                                    "15px",

                                marginTop:
                                    "30px",
                            }}
                        >
                            {/* SCORE */}

                            <div
                                style={{
                                    padding:
                                        "20px",

                                    background:
                                        "#f8fafc",

                                    borderRadius:
                                        "15px",
                                }}
                            >
                                <strong
                                    style={{
                                        fontSize:
                                            "25px",
                                    }}
                                >
                                    {
                                        getScore()
                                    }
                                </strong>

                                <div>
                                    Score
                                </div>
                            </div>

                            {/* QUESTIONS */}

                            <div
                                style={{
                                    padding:
                                        "20px",

                                    background:
                                        "#f8fafc",

                                    borderRadius:
                                        "15px",
                                }}
                            >
                                <strong
                                    style={{
                                        fontSize:
                                            "25px",
                                    }}
                                >
                                    {
                                        getTotal()
                                    }
                                </strong>

                                <div>
                                    Questions
                                </div>
                            </div>

                            {/* ACCURACY */}

                            <div
                                style={{
                                    padding:
                                        "20px",

                                    background:
                                        "#f8fafc",

                                    borderRadius:
                                        "15px",
                                }}
                            >
                                <strong
                                    style={{
                                        fontSize:
                                            "25px",
                                    }}
                                >
                                    {
                                        percentage
                                    }%
                                </strong>

                                <div>
                                    Accuracy
                                </div>
                            </div>
                        </div>

                        {/* ANOTHER QUIZ */}

                        <button
                            onClick={
                                resetQuiz
                            }
                            style={{
                                ...styles.primary,

                                marginTop:
                                    "30px",
                            }}
                        >
                            🔄 Take Another
                            Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // CURRENT QUESTION
    // ========================================================

    const question =
        questions[
            currentQuestion
        ];

    if (!question) {
        return null;
    }

    // ========================================================
    // SELECTED ANSWER
    // ========================================================

    const selectedAnswer =
        answers[
            question.id
        ];

    // ========================================================
    // ANSWERED COUNT
    // ========================================================

    const answeredCount =
        Object.keys(
            answers
        ).length;

    // ========================================================
    // PROGRESS
    // ========================================================

    const progress =
        (
            ((currentQuestion + 1) /
                questions.length) *
            100
        );

    // ========================================================
    // QUESTION SCREEN
    // ========================================================

    return (
        <div
            style={
                styles.page
            }
        >
            <div
                style={
                    styles.container
                }
            >
                {/* ====================================================
                    HEADER
                ==================================================== */}

                <div
                    style={{
                        display:
                            "flex",

                        justifyContent:
                            "space-between",

                        alignItems:
                            "center",

                        marginBottom:
                            "25px",

                        gap:
                            "20px",
                    }}
                >
                    <div>
                        <h1
                            style={
                                styles.title
                            }
                        >
                            🧠{" "}
                            {subject}{" "}
                            Quiz
                        </h1>

                        <p
                            style={
                                styles.subtitle
                            }
                        >
                            {topic}{" "}
                            •{" "}
                            {difficulty}
                        </p>
                    </div>

                    {/* TIMER */}

                    <div
                        style={{
                            padding:
                                "12px 18px",

                            borderRadius:
                                "12px",

                            background:
                                secondsLeft <=
                                60
                                    ? "#fef2f2"
                                    : "#eef2ff",

                            color:
                                secondsLeft <=
                                60
                                    ? "#dc2626"
                                    : "#4f46e5",

                            fontWeight:
                                800,

                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        ⏱️{" "}
                        {
                            formattedTime
                        }
                    </div>
                </div>

                {/* ====================================================
                    PROGRESS BAR
                ==================================================== */}

                <div
                    style={{
                        height:
                            "8px",

                        background:
                            "#e2e8f0",

                        borderRadius:
                            "10px",

                        marginBottom:
                            "22px",
                    }}
                >
                    <div
                        style={{
                            width:
                                `${progress}%`,

                            height:
                                "100%",

                            background:
                                "linear-gradient(90deg,#4f46e5,#7c3aed)",

                            borderRadius:
                                "10px",

                            transition:
                                "width .3s ease",
                        }}
                    />
                </div>

                {/* ====================================================
                    MAIN GRID
                ==================================================== */}

                <div
                    style={{
                        display:
                            "grid",

                        gridTemplateColumns:
                            "minmax(0,1fr) 280px",

                        gap:
                            "22px",
                    }}
                >
                    {/* ==================================================
                        QUESTION CARD
                    ================================================== */}

                    <div
                        style={
                            styles.card
                        }
                    >
                        {/* QUESTION HEADER */}

                        <div
                            style={{
                                display:
                                    "flex",

                                justifyContent:
                                    "space-between",

                                marginBottom:
                                    "25px",

                                gap:
                                    "15px",
                            }}
                        >
                            <strong>
                                Question{" "}
                                {
                                    currentQuestion +
                                        1
                                }{" "}
                                /{" "}
                                {
                                    questions.length
                                }
                            </strong>

                            <span>
                                {
                                    answeredCount
                                }{" "}
                                answered
                            </span>
                        </div>

                        {/* QUESTION */}

                        <h2
                            style={{
                                fontSize:
                                    "22px",

                                lineHeight:
                                    1.5,

                                margin:
                                    0,
                            }}
                        >
                            {
                                question.text
                            }
                        </h2>

                        {/* ==================================================
                            OPTIONS
                        ================================================== */}

                        <div
                            style={{
                                marginTop:
                                    "25px",
                            }}
                        >
                            {question.options.map(
                                (
                                    option,
                                    index
                                ) => {
                                    // ----------------------------------------
                                    // A / B / C / D
                                    // ----------------------------------------

                                    const optionLetter =
                                        String.fromCharCode(
                                            65 +
                                                index
                                        );

                                    // ----------------------------------------
                                    // IMPORTANT
                                    //
                                    // selectedAnswer is now A/B/C/D
                                    // ----------------------------------------

                                    const selected =
                                        selectedAnswer ===
                                        optionLetter;

                                    return (
                                        <button
                                            key={
                                                index
                                            }
                                            onClick={() =>
                                                selectAnswer(
                                                    option,
                                                    index
                                                )
                                            }
                                            disabled={
                                                submitted
                                            }
                                            style={{
                                                width:
                                                    "100%",

                                                padding:
                                                    "16px",

                                                marginBottom:
                                                    "12px",

                                                textAlign:
                                                    "left",

                                                borderRadius:
                                                    "14px",

                                                border:
                                                    selected
                                                        ? "2px solid #4f46e5"
                                                        : "1px solid #e2e8f0",

                                                background:
                                                    selected
                                                        ? "#eef2ff"
                                                        : "#ffffff",

                                                cursor:
                                                    submitted
                                                        ? "default"
                                                        : "pointer",

                                                display:
                                                    "flex",

                                                alignItems:
                                                    "center",

                                                gap:
                                                    "13px",

                                                fontSize:
                                                    "15px",

                                                boxSizing:
                                                    "border-box",

                                                transition:
                                                    "all .15s ease",
                                            }}
                                        >
                                            {/* LETTER */}

                                            <span
                                                style={{
                                                    width:
                                                        "34px",

                                                    height:
                                                        "34px",

                                                    minWidth:
                                                        "34px",

                                                    borderRadius:
                                                        "10px",

                                                    background:
                                                        selected
                                                            ? "#4f46e5"
                                                            : "#f1f5f9",

                                                    color:
                                                        selected
                                                            ? "#ffffff"
                                                            : "#475569",

                                                    display:
                                                        "flex",

                                                    alignItems:
                                                        "center",

                                                    justifyContent:
                                                        "center",

                                                    fontWeight:
                                                        800,
                                                }}
                                            >
                                                {
                                                    optionLetter
                                                }
                                            </span>

                                            {/* TEXT */}

                                            <span>
                                                {
                                                    option
                                                }
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        {/* ==================================================
                            NAVIGATION
                        ================================================== */}

                        <div
                            style={{
                                display:
                                    "flex",

                                justifyContent:
                                    "space-between",

                                marginTop:
                                    "30px",

                                gap:
                                    "12px",
                            }}
                        >
                            {/* PREVIOUS */}

                            <button
                                onClick={
                                    previousQuestion
                                }
                                disabled={
                                    currentQuestion ===
                                    0
                                }
                                style={{
                                    ...styles.secondary,

                                    opacity:
                                        currentQuestion ===
                                        0
                                            ? 0.5
                                            : 1,
                                }}
                            >
                                ← Previous
                            </button>

                            {/* NEXT / SUBMIT */}

                            {currentQuestion <
                            questions.length -
                                1 ? (
                                <button
                                    onClick={
                                        nextQuestion
                                    }
                                    style={
                                        styles.primary
                                    }
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        setShowConfirm(
                                            true
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                    style={{
                                        ...styles.primary,

                                        background:
                                            "linear-gradient(135deg,#059669,#10b981)",
                                    }}
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "✓ Submit Quiz"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ==================================================
                        SIDEBAR
                    ================================================== */}

                    <div
                        style={{
                            ...styles.card,

                            height:
                                "fit-content",
                        }}
                    >
                        <h3>
                            Quiz Progress
                        </h3>

                        <div
                            style={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                    "repeat(5,1fr)",

                                gap:
                                    "9px",
                            }}
                        >
                            {questions.map(
                                (
                                    q,
                                    index
                                ) => {
                                    const answered =
                                        answers[
                                            q.id
                                        ] !==
                                        undefined &&
                                        answers[
                                            q.id
                                        ] !==
                                            "";

                                    const active =
                                        index ===
                                        currentQuestion;

                                    return (
                                        <button
                                            key={
                                                q.id
                                            }
                                            onClick={() =>
                                                setCurrentQuestion(
                                                    index
                                                )
                                            }
                                            style={{
                                                aspectRatio:
                                                    "1",

                                                borderRadius:
                                                    "10px",

                                                border:
                                                    active
                                                        ? "2px solid #4f46e5"
                                                        : "1px solid #e2e8f0",

                                                background:
                                                    answered
                                                        ? "#dcfce7"
                                                        : active
                                                        ? "#eef2ff"
                                                        : "#ffffff",

                                                fontWeight:
                                                    800,

                                                cursor:
                                                    "pointer",
                                            }}
                                        >
                                            {
                                                index +
                                                    1
                                            }
                                        </button>
                                    );
                                }
                            )}
                        </div>

                        {/* FINISH */}

                        <button
                            onClick={() =>
                                setShowConfirm(
                                    true
                                )
                            }
                            disabled={
                                submitting
                            }
                            style={{
                                ...styles.secondary,

                                width:
                                    "100%",

                                marginTop:
                                    "20px",
                            }}
                        >
                            Finish Quiz
                        </button>
                    </div>
                </div>

                {/* ========================================================
                    ERROR
                ======================================================== */}

                {error && (
                    <div
                        style={{
                            marginTop:
                                "20px",

                            padding:
                                "14px",

                            borderRadius:
                                "12px",

                            background:
                                "#fef2f2",

                            border:
                                "1px solid #fecaca",

                            color:
                                "#b91c1c",
                        }}
                    >
                        ⚠️{" "}
                        {error}
                    </div>
                )}

                {/* ========================================================
                    CONFIRMATION MODAL
                ======================================================== */}

                {showConfirm && (
                    <div
                        style={{
                            position:
                                "fixed",

                            inset:
                                0,

                            background:
                                "rgba(15,23,42,.55)",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            zIndex:
                                999,

                            padding:
                                "20px",

                            boxSizing:
                                "border-box",
                        }}
                    >
                        <div
                            style={{
                                background:
                                    "#ffffff",

                                padding:
                                    "28px",

                                borderRadius:
                                    "20px",

                                width:
                                    "90%",

                                maxWidth:
                                    "430px",

                                boxShadow:
                                    "0 20px 60px rgba(15,23,42,.2)",
                            }}
                        >
                            <h2>
                                Submit Quiz?
                            </h2>

                            <p
                                style={{
                                    color:
                                        "#64748b",
                                }}
                            >
                                You answered{" "}
                                <strong>
                                    {
                                        answeredCount
                                    }
                                </strong>{" "}
                                out of{" "}
                                <strong>
                                    {
                                        questions.length
                                    }
                                </strong>{" "}
                                questions.
                            </p>

                            <div
                                style={{
                                    display:
                                        "flex",

                                    gap:
                                        "12px",

                                    marginTop:
                                        "20px",
                                }}
                            >
                                {/* CONTINUE */}

                                <button
                                    onClick={() =>
                                        setShowConfirm(
                                            false
                                        )
                                    }
                                    style={{
                                        ...styles.secondary,

                                        flex:
                                            1,
                                    }}
                                >
                                    Continue
                                </button>

                                {/* SUBMIT */}

                                <button
                                    onClick={() =>
                                        submitQuiz(
                                            false
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                    style={{
                                        ...styles.primary,

                                        flex:
                                            1,

                                        background:
                                            "linear-gradient(135deg,#059669,#10b981)",

                                        opacity:
                                            submitting
                                                ? 0.7
                                                : 1,
                                    }}
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}