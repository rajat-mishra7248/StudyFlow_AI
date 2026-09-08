// ============================================================
// STUDYFLOW AI - API SERVICE
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";


// ============================================================
// AUTH TOKEN
// ============================================================

function getAuthToken() {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        null
    );
}


// ============================================================
// COMMON API REQUEST
// ============================================================

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();

    const headers = {
        Accept: "application/json",
        ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    console.log("========================================");
    console.log("STUDYFLOW AI API REQUEST");
    console.log("METHOD:", options.method || "GET");
    console.log("URL:", url);
    console.log("BODY:", options.body || "No body");
    console.log("TOKEN:", token ? "Present" : "Not found");
    console.log("========================================");

    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers,
        });
    } catch (error) {
        console.error("NETWORK ERROR:", error);

        throw new Error(
            "Unable to connect to StudyFlow AI backend. Please make sure FastAPI is running on http://127.0.0.1:8000"
        );
    }

    // ========================================================
    // READ RESPONSE
    // ========================================================

    let data = null;

    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch (error) {
            console.error("JSON PARSE ERROR:", error);
            data = null;
        }
    } else {
        try {
            data = await response.text();
        } catch (error) {
            console.error("TEXT RESPONSE ERROR:", error);
            data = null;
        }
    }

    console.log("API STATUS:", response.status);
    console.log("API RESPONSE:", data);

    // ========================================================
    // ERROR HANDLING
    // ========================================================

    if (!response.ok) {
        let message = "Request failed.";

        if (typeof data?.detail === "string") {
            message = data.detail;
        }

        else if (Array.isArray(data?.detail)) {
            message = data.detail
                .map((item) => {
                    const field =
                        item?.loc
                            ?.filter(
                                (value) => value !== "body"
                            )
                            ?.join(".") ||
                        "field";

                    return `${field}: ${
                        item?.msg || "Invalid value"
                    }`;
                })
                .join(", ");
        }

        else if (typeof data?.message === "string") {
            message = data.message;
        }

        if (response.status === 400) {
            message =
                typeof data?.detail === "string"
                    ? data.detail
                    : "Invalid request.";
        }

        if (response.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("token");

            message =
                "Authentication failed. Please login again.";
        }

        if (response.status === 403) {
            message =
                typeof data?.detail === "string"
                    ? data.detail
                    : "You do not have permission to perform this action.";
        }

        if (response.status === 404) {
            message =
                `API endpoint not found: ${endpoint}`;
        }

        if (response.status === 422) {
            if (Array.isArray(data?.detail)) {
                message = data.detail
                    .map((item) => {
                        const field =
                            item?.loc
                                ?.filter(
                                    (value) => value !== "body"
                                )
                                ?.join(".") ||
                            "field";

                        return `${field}: ${
                            item?.msg || "Invalid value"
                        }`;
                    })
                    .join(", ");
            } else {
                message =
                    typeof data?.detail === "string"
                        ? data.detail
                        : "Invalid request data.";
            }
        }

        if (response.status >= 500) {
            message =
                typeof data?.detail === "string"
                    ? data.detail
                    : "Server error. Please check the FastAPI terminal.";
        }

        console.error("API ERROR:", message);

        throw new Error(message);
    }

    return data;
}


// ============================================================
// GET
// ============================================================

export async function apiGet(endpoint) {
    return apiRequest(endpoint, {
        method: "GET",
    });
}


// ============================================================
// POST
// ============================================================

export async function apiPost(endpoint, body = {}) {
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });
}


// ============================================================
// PUT
// ============================================================

export async function apiPut(endpoint, body = {}) {
    return apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}


// ============================================================
// DELETE
// ============================================================

export async function apiDelete(endpoint) {
    return apiRequest(endpoint, {
        method: "DELETE",
    });
}


// ============================================================
// AUTH
// ============================================================

export async function loginUser(data) {
    return apiPost("/auth/login", {
        email: data.email,
        password: data.password,
    });
}


export async function signupUser(data) {
    return apiPost("/auth/signup", {
        full_name: data.full_name,
        username: data.username,
        email: data.email,
        password: data.password,
    });
}


export async function forgotPassword(email) {
    return apiPost("/auth/forgot-password", {
        email: email.trim(),
    });
}


export async function resetPassword(
    token,
    newPassword
) {
    return apiPost("/auth/reset-password", {
        token: token,
        new_password: newPassword,
    });
}


export function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");

    window.location.href = "/login";
}


// ============================================================
// STUDENT
// ============================================================

export async function getMyProfile() {
    return apiGet("/students/me");
}


// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboard() {
    return apiGet("/dashboard");
}


// ============================================================
// STUDY PLANS
// ============================================================

export async function getStudyPlans() {
    return apiGet("/study-plans");
}


export async function createStudyPlan(data) {
    return apiPost("/study-plans", data);
}


export async function updateStudyPlan(id, data) {
    return apiPut(`/study-plans/${id}`, data);
}


export async function deleteStudyPlan(id) {
    return apiDelete(`/study-plans/${id}`);
}


// ============================================================
// TIMETABLE
// ============================================================

export async function getTimetables() {
    return apiGet("/timetables");
}


export async function createTimetable(data) {
    return apiPost("/timetables", data);
}


export async function updateTimetable(id, data) {
    return apiPut(`/timetables/${id}`, data);
}


export async function deleteTimetable(id) {
    return apiDelete(`/timetables/${id}`);
}


// ============================================================
// AI TIMETABLE
// ============================================================

export async function generateAITimetable(data) {
    return apiPost("/ai/timetable", data);
}


// ============================================================
// STUDY TIMER
// ============================================================

export async function getTimerHistory() {
    return apiGet("/study-timers");
}


export async function startTimer(data) {
    return apiPost("/study-timers", {
        study_duration: Number(data.study_duration),
        break_duration: Number(
            data.break_duration ?? 5
        ),
    });
}


export async function finishTimer(timerId) {
    return apiPut(
        `/study-timers/${timerId}/finish`,
        {
            completed: true,
            ended_at: new Date().toISOString(),
        }
    );
}


// ============================================================
// QUIZ
// ============================================================

export async function createQuiz(data) {
    return apiPost("/quizzes", data);
}


export async function getQuestionsByQuiz(quizId) {
    return apiGet(
        `/questions/quiz/${quizId}`
    );
}


export async function submitQuiz(data) {
    return apiPost(
        "/quiz-submissions",
        data
    );
}


// ============================================================
// RESOURCES
// ============================================================

export async function getCourseResources() {
    return apiGet("/resources/courses");
}


export async function getResourcesByCourse(courseName) {
    return apiGet(
        `/resources/courses/${encodeURIComponent(
            courseName
        )}`
    );
}


// ============================================================
// PROGRESS
// ============================================================
// Backend router:
// prefix="/progress"
// GET /progress
// ============================================================

export async function getProgress() {
    return apiGet("/progress");
}


// ============================================================
// AI SERVICES
// ============================================================

// ------------------------------------------------------------
// AI QUIZ
// ------------------------------------------------------------

export async function generateQuiz(data) {
    return apiPost(
        "/ai/quiz",
        data
    );
}


// ------------------------------------------------------------
// AI NOTES
// ------------------------------------------------------------

export async function generateNotes(data) {
    return apiPost(
        "/ai/notes",
        data
    );
}


// ------------------------------------------------------------
// AI CAREER ROADMAP
// ------------------------------------------------------------

export async function generateCareerRoadmap(data) {
    return apiPost(
        "/ai/career",
        data
    );
}


// ------------------------------------------------------------
// AI DOUBT SOLVER
// ------------------------------------------------------------

export async function solveDoubt(data) {
    return apiPost(
        "/ai/doubt",
        data
    );
}


// ------------------------------------------------------------
// AI STUDY PLAN
// ------------------------------------------------------------

export async function getStudyPlan() {
    return apiGet(
        "/ai/study-plan"
    );
}


// ------------------------------------------------------------
// AI PROGRESS ANALYSIS
// ------------------------------------------------------------
// If your frontend needs the separate AI analysis endpoint,
// use this function.
//
// IMPORTANT:
// This does NOT replace getProgress().
// getProgress() = /progress
// analyzeProgress() = /ai/progress
// ------------------------------------------------------------

export async function analyzeProgress(data) {
    return apiPost(
        "/ai/progress",
        data
    );
}


// ============================================================
// ACHIEVEMENTS
// ============================================================
// Backend endpoint:
// /achievement
// NOT /achievements
// ============================================================

export async function getAchievements() {
    console.log(
        "Fetching achievements from /achievement..."
    );

    try {
        const data = await apiGet(
            "/achievement"
        );

        console.log(
            "Achievements received:",
            data
        );

        return data;

    } catch (error) {
        console.error(
            "Achievements API error:",
            error
        );

        throw error;
    }
}


// ============================================================
// DEFAULT API OBJECT
// ============================================================

const api = {
    // Common
    apiGet,
    apiPost,
    apiPut,
    apiDelete,

    // Auth
    loginUser,
    signupUser,
    forgotPassword,
    resetPassword,
    logoutUser,

    // Student
    getMyProfile,

    // Dashboard
    getDashboard,

    // Study Plans
    getStudyPlans,
    createStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,

    // Timetable
    getTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,

    // AI Timetable
    generateAITimetable,

    // Study Timer
    getTimerHistory,
    startTimer,
    finishTimer,

    // Quiz
    createQuiz,
    getQuestionsByQuiz,
    submitQuiz,

    // Resources
    getCourseResources,
    getResourcesByCourse,

    // Progress
    getProgress,
    analyzeProgress,

    // AI
    generateQuiz,
    generateNotes,
    generateCareerRoadmap,
    solveDoubt,
    getStudyPlan,

    // Achievements
    getAchievements,
};


export default api;

