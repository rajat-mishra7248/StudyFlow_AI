import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function StudyPlanner() {
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    subject: "",
    daily_hours: "",
    start_date: "",
    end_date: "",
    status: "Pending",
    progress: 0,
  });

  // ============================================================
  // TOKEN
  // ============================================================

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };

  // ============================================================
  // API ERROR HANDLER
  // ============================================================

  const getErrorMessage = (data, status) => {
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) => item?.msg || "Invalid field")
        .join(", ");
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    return `Request failed. Status: ${status}`;
  };

  // ============================================================
  // FETCH PLANS
  // ============================================================

  const fetchPlans = async () => {
    const token = getToken();

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/study-plans`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      console.log("GET STUDY PLANS:", response.status, data);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, response.status)
        );
      }

      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH STUDY PLANS ERROR:", err);

      setError(
        err.message || "Unable to load study plans."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!form.subject.trim()) {
      return "Please enter a subject.";
    }

    if (
      form.daily_hours === "" ||
      Number(form.daily_hours) <= 0
    ) {
      return "Please enter valid daily study hours.";
    }

    if (!form.start_date) {
      return "Please select a start date.";
    }

    if (!form.end_date) {
      return "Please select an end date.";
    }

    if (form.end_date < form.start_date) {
      return "End date cannot be before start date.";
    }

    return "";
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    setSaving(true);

    try {
      const createBody = {
        subject: form.subject.trim(),
        daily_hours: Number(form.daily_hours),
        start_date: form.start_date,
        end_date: form.end_date,
      };

      const updateBody = {
        subject: form.subject.trim(),
        daily_hours: Number(form.daily_hours),
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status || "Pending",
        progress: Number(form.progress || 0),
      };

      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_URL}/study-plans/${editingId}`
        : `${API_URL}/study-plans`;

      const method = isEditing ? "PUT" : "POST";

      const body = isEditing
        ? updateBody
        : createBody;

      console.log("================================");
      console.log("STUDY PLAN REQUEST");
      console.log("METHOD:", method);
      console.log("URL:", url);
      console.log("BODY:", body);
      console.log("================================");

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      console.log(
        "STUDY PLAN RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, response.status)
        );
      }

      if (isEditing) {
        setSuccess("Study plan updated successfully.");
      } else {
        setSuccess("Study plan created successfully.");
      }

      resetForm();

      await fetchPlans();
    } catch (err) {
      console.error("SAVE STUDY PLAN ERROR:", err);

      setError(
        err.message || "Unable to save study plan."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (plan) => {
    setEditingId(plan.id);

    setForm({
      subject: plan.subject || "",
      daily_hours:
        plan.daily_hours !== null &&
        plan.daily_hours !== undefined
          ? String(plan.daily_hours)
          : "",
      start_date: plan.start_date || "",
      end_date: plan.end_date || "",
      status: plan.status || "Pending",
      progress:
        plan.progress !== null &&
        plan.progress !== undefined
          ? Number(plan.progress)
          : 0,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study plan?"
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/study-plans/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "DELETE STUDY PLAN:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, response.status)
        );
      }

      setSuccess("Study plan deleted successfully.");

      await fetchPlans();
    } catch (err) {
      console.error("DELETE STUDY PLAN ERROR:", err);

      setError(
        err.message || "Unable to delete study plan."
      );
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetForm = () => {
    setEditingId(null);

    setForm({
      subject: "",
      daily_hours: "",
      start_date: "",
      end_date: "",
      status: "Pending",
      progress: 0,
    });
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchPlans();
  }, []);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <div style={styles.brand}>
              StudyFlow AI
            </div>

            <h1 style={styles.title}>
              Study Planner
            </h1>

            <p style={styles.subtitle}>
              Plan your subjects, set daily study hours,
              and organize your learning schedule.
            </p>
          </div>

          <Link
            to="/dashboard"
            style={styles.backLink}
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main style={styles.main}>

        {/* MESSAGES */}
        {error && (
          <div style={styles.errorBox}>
            <div style={styles.messageTitle}>
              Something went wrong
            </div>

            <div>{error}</div>
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            <div style={styles.messageTitle}>
              Success
            </div>

            <div>{success}</div>
          </div>
        )}

        {/* PLANNER FORM */}
        <section style={styles.formCard}>

          <div style={styles.formHeader}>
            <div>
              <div style={styles.formEyebrow}>
                PLAN YOUR LEARNING
              </div>

              <h2 style={styles.sectionTitle}>
                {editingId
                  ? "Edit Study Plan"
                  : "Create a Study Plan"}
              </h2>

              <p style={styles.sectionDescription}>
                Choose what you want to study and create
                a schedule that works for you.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>

            <div style={styles.formGrid}>

              {/* SUBJECT */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Python, DSA, Mathematics"
                  style={styles.input}
                  disabled={saving}
                />

                <span style={styles.fieldHint}>
                  What do you want to study?
                </span>
              </div>

              {/* DAILY HOURS */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Daily Study Hours
                </label>

                <input
                  type="number"
                  name="daily_hours"
                  value={form.daily_hours}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  min="0.5"
                  max="24"
                  step="0.5"
                  style={styles.input}
                  disabled={saving}
                />

                <span style={styles.fieldHint}>
                  How much time can you study each day?
                </span>
              </div>

              {/* START DATE */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Start Date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={saving}
                />

                <span style={styles.fieldHint}>
                  When will you start?
                </span>
              </div>

              {/* END DATE */}
              <div style={styles.field}>
                <label style={styles.label}>
                  End Date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={saving}
                />

                <span style={styles.fieldHint}>
                  When do you want to finish?
                </span>
              </div>

            </div>

            <div style={styles.formFooter}>

              <div style={styles.footerHint}>
                <span style={styles.footerIcon}>
                  ✓
                </span>

                <span>
                  Keep your study schedule simple and consistent.
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.primaryButton,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Plan"
                  : "Create Plan"}
              </button>

            </div>

          </form>
        </section>

        {/* PLANS SECTION */}
        <section>

          <div style={styles.listHeader}>

            <div>
              <div style={styles.listEyebrow}>
                YOUR SCHEDULE
              </div>

              <h2 style={styles.listTitle}>
                Study Plans
              </h2>

              <p style={styles.listSubtitle}>
                {plans.length === 0
                  ? "No plans created yet"
                  : `${plans.length} ${
                      plans.length === 1
                        ? "study plan"
                        : "study plans"
                    }`}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPlans}
              disabled={loading}
              style={styles.refreshButton}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>

          </div>

          {/* LOADING */}
          {loading && (
            <div style={styles.emptyCard}>

              <div style={styles.loader}></div>

              <h3 style={styles.emptyTitle}>
                Loading study plans
              </h3>

              <p style={styles.emptyText}>
                Please wait while we load your schedule.
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            plans.length === 0 &&
            !error && (
              <div style={styles.emptyCard}>

                <div style={styles.emptyIcon}>
                  +
                </div>

                <h3 style={styles.emptyTitle}>
                  Create your first study plan
                </h3>

                <p style={styles.emptyText}>
                  Add a subject, daily study hours and
                  your preferred study dates above.
                </p>

              </div>
            )}

          {/* PLAN CARDS */}
          {!loading &&
            plans.length > 0 && (
              <div style={styles.planGrid}>

                {plans.map((plan) => (
                  <article
                    key={plan.id}
                    style={styles.planCard}
                  >

                    {/* CARD HEADER */}
                    <div style={styles.cardHeader}>

                      <div style={styles.subjectIcon}>
                        {plan.subject
                          ? plan.subject
                              .charAt(0)
                              .toUpperCase()
                          : "S"}
                      </div>

                      <div style={styles.subjectContent}>

                        <span style={styles.planLabel}>
                          STUDY PLAN
                        </span>

                        <h3 style={styles.planSubject}>
                          {plan.subject}
                        </h3>

                      </div>

                    </div>

                    {/* SCHEDULE */}
                    <div style={styles.scheduleBox}>

                      <div style={styles.scheduleItem}>
                        <span style={styles.scheduleIcon}>
                          ⏱
                        </span>

                        <div>
                          <span style={styles.statLabel}>
                            Daily Time
                          </span>

                          <strong style={styles.statValue}>
                            {plan.daily_hours} hrs
                          </strong>
                        </div>
                      </div>

                      <div style={styles.scheduleDivider}></div>

                      <div style={styles.scheduleItem}>
                        <span style={styles.scheduleIcon}>
                          📅
                        </span>

                        <div>
                          <span style={styles.statLabel}>
                            Schedule
                          </span>

                          <strong style={styles.statValue}>
                            {plan.start_date}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* DATES */}
                    <div style={styles.dateSection}>

                      <div style={styles.dateItem}>
                        <span style={styles.dateLabel}>
                          START
                        </span>

                        <span style={styles.dateValue}>
                          {plan.start_date}
                        </span>
                      </div>

                      <div style={styles.dateArrow}>
                        →
                      </div>

                      <div
                        style={{
                          ...styles.dateItem,
                          textAlign: "right",
                        }}
                      >
                        <span style={styles.dateLabel}>
                          END
                        </span>

                        <span style={styles.dateValue}>
                          {plan.end_date}
                        </span>
                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div style={styles.actions}>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(plan)
                        }
                        style={styles.editButton}
                      >
                        Edit Plan
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(plan.id)
                        }
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>

                    </div>

                  </article>
                ))}

              </div>
            )}

        </section>

      </main>

      {/* SMALL FOOTER */}
      <footer style={styles.footer}>
        <span>
          StudyFlow AI
        </span>

        <span>
          Plan your learning. Stay consistent.
        </span>
      </footer>

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
      "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
    color: "#172033",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },

  headerInner: {
    width: "min(1120px, 90%)",
    margin: "0 auto",
    padding: "34px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
  },

  brand: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "7px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "12px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
    letterSpacing: "-0.035em",
    color: "#111827",
  },

  subtitle: {
    margin: "9px 0 0",
    maxWidth: "620px",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  backLink: {
    flexShrink: 0,
    textDecoration: "none",
    color: "#334155",
    border: "1px solid #dbe1e8",
    padding: "11px 16px",
    borderRadius: "9px",
    background: "#ffffff",
    fontWeight: "700",
    fontSize: "13px",
  },

  main: {
    width: "min(1120px, 90%)",
    margin: "0 auto",
    padding: "36px 0 70px",
  },

  errorBox: {
    background: "#fff7f7",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: "11px",
    padding: "14px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  successBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    borderRadius: "11px",
    padding: "14px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  messageTitle: {
    fontWeight: "800",
    marginBottom: "3px",
  },

  formCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "30px",
    marginBottom: "46px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.05)",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
  },

  formEyebrow: {
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "7px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "23px",
    fontWeight: "750",
    color: "#111827",
    letterSpacing: "-0.02em",
  },

  sectionDescription: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "22px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "750",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d7dee8",
    borderRadius: "9px",
    padding: "13px 14px",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff",
    color: "#172033",
    transition: "border-color 0.2s ease",
  },

  fieldHint: {
    fontSize: "11px",
    color: "#94a3b8",
  },

  formFooter: {
    marginTop: "28px",
    paddingTop: "22px",
    borderTop: "1px solid #eef2f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  footerHint: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "12px",
  },

  footerIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ecfdf5",
    color: "#059669",
    fontWeight: "800",
    fontSize: "11px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "9px",
    background: "#4f46e5",
    color: "#ffffff",
    padding: "12px 21px",
    fontSize: "13px",
    fontWeight: "750",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(79, 70, 229, 0.18)",
  },

  secondaryButton: {
    border: "1px solid #d7dee8",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#334155",
    padding: "10px 15px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "22px",
  },

  listEyebrow: {
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "5px",
  },

  listTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.025em",
  },

  listSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  refreshButton: {
    border: "1px solid #dbe1e8",
    background: "#ffffff",
    color: "#334155",
    borderRadius: "9px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },

  planCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    padding: "23px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.045)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },

  subjectIcon: {
    width: "48px",
    height: "48px",
    flexShrink: 0,
    borderRadius: "12px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },

  subjectContent: {
    minWidth: 0,
  },

  planLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "4px",
  },

  planSubject: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "750",
    color: "#111827",
    wordBreak: "break-word",
  },

  scheduleBox: {
    display: "flex",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #eef2f6",
    borderRadius: "11px",
    padding: "15px",
    marginBottom: "19px",
  },

  scheduleItem: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  scheduleIcon: {
    width: "30px",
    height: "30px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "#ffffff",
    fontSize: "14px",
  },

  scheduleDivider: {
    width: "1px",
    height: "35px",
    background: "#e2e8f0",
    margin: "0 13px",
  },

  statLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "4px",
  },

  statValue: {
    display: "block",
    fontSize: "13px",
    color: "#334155",
    fontWeight: "750",
    wordBreak: "break-word",
  },

  dateSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "2px 0 21px",
  },

  dateItem: {
    minWidth: 0,
  },

  dateLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    marginBottom: "5px",
  },

  dateValue: {
    display: "block",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "700",
    wordBreak: "break-word",
  },

  dateArrow: {
    color: "#94a3b8",
    fontSize: "17px",
    flexShrink: 0,
  },

  actions: {
    display: "flex",
    gap: "9px",
    borderTop: "1px solid #eef2f6",
    paddingTop: "17px",
  },

  editButton: {
    flex: 1,
    border: "1px solid #c7d2fe",
    background: "#eef2ff",
    color: "#4338ca",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "750",
    fontSize: "12px",
  },

  deleteButton: {
    flex: 1,
    border: "1px solid #fecaca",
    background: "#fffafa",
    color: "#b91c1c",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "750",
    fontSize: "12px",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    padding: "58px 25px",
    textAlign: "center",
    boxShadow:
      "0 6px 20px rgba(15, 23, 42, 0.035)",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "26px",
    fontWeight: "400",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "750",
    color: "#334155",
  },

  emptyText: {
    color: "#64748b",
    fontSize: "13px",
    maxWidth: "440px",
    margin: "8px auto 0",
    lineHeight: 1.6,
  },

  loader: {
    width: "28px",
    height: "28px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #4f46e5",
    borderRadius: "50%",
    margin: "0 auto 16px",
    animation: "spin 1s linear infinite",
  },

  footer: {
    borderTop: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: "20px 5%",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#94a3b8",
    fontSize: "11px",
  },
};

export default StudyPlanner;