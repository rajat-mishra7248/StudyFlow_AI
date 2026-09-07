import React, { useCallback, useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH ACHIEVEMENTS
  // ============================================================

  const fetchAchievements = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Please login again.");
        }

        const response = await fetch(
          `${API_BASE_URL}/achievement`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            responseText ||
              `Failed to fetch achievements. Status: ${response.status}`
          );
        }

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "Achievement API returned invalid JSON."
          );
        }

        console.log(
          "Achievement API Response:",
          data
        );

        if (!Array.isArray(data)) {
          throw new Error(
            "Achievement API returned invalid data."
          );
        }

        setAchievements(data);
      } catch (error) {
        console.error(
          "Achievement Error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load achievements."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchAchievements(false);
  }, [fetchAchievements]);

  // ============================================================
  // REFRESH WHEN USER RETURNS TO THIS TAB
  // ============================================================

  useEffect(() => {
    const handleFocus = () => {
      fetchAchievements(true);
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [fetchAchievements]);

  // ============================================================
  // REFRESH WHEN PAGE BECOMES VISIBLE
  // ============================================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        fetchAchievements(true);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchAchievements]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getBadgeName = (achievement) => {
    return (
      achievement?.badge_name ||
      achievement?.badgeName ||
      achievement?.name ||
      "Achievement"
    );
  };

  const getBadgeIcon = (achievement) => {
    return (
      achievement?.badge_icon ||
      achievement?.badgeIcon ||
      "🏆"
    );
  };

  const getDescription = (achievement) => {
    return (
      achievement?.description ||
      "Achievement unlocked"
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const getEarnedDate = (achievement) => {
    if (!achievement?.earned_at) {
      return "";
    }

    try {
      return new Date(
        achievement.earned_at
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f7fb",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        Loading achievements...
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "60px",
              marginBottom: "15px",
            }}
          >
            ⚠️
          </div>

          <h2>
            Unable to Load Achievements
          </h2>

          <p
            style={{
              color: "#d32f2f",
              marginTop: "15px",
              wordBreak: "break-word",
            }}
          >
            {error}
          </p>

          <button
            onClick={() =>
              fetchAchievements(true)
            }
            disabled={refreshing}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              border: "none",
              borderRadius: "10px",
              cursor: refreshing
                ? "not-allowed"
                : "pointer",
              fontWeight: "600",
              background: "#6246ea",
              color: "white",
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            {refreshing
              ? "Refreshing..."
              : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalAchievements =
    achievements.length;

  const unlocked =
    achievements.length;

  /*
   * Do NOT hard-code total possible achievements.
   *
   * Backend currently returns the achievements
   * that have actually been unlocked.
   *
   * We therefore show remaining as 0 until
   * a fixed total-achievement system is added.
   */

  const remaining = 0;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        paddingBottom: "60px",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          background: "white",
          borderRadius:
            "0 0 22px 22px",
          padding:
            "25px 55px 35px",
          marginBottom: "30px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <div
            style={{
              fontSize: "65px",
            }}
          >
            🏆
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                fontWeight: "700",
              }}
            >
              Achievements
            </h1>

            <p
              style={{
                marginTop: "15px",
                marginBottom: 0,
                fontSize: "20px",
                color: "#58708d",
              }}
            >
              Track your learning milestones
              and celebrate your progress.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {/* ====================================================
            REFRESH BUTTON
        ==================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() =>
              fetchAchievements(true)
            }
            disabled={refreshing}
            style={{
              border: "none",
              borderRadius: "10px",
              padding:
                "11px 20px",
              background: "#6246ea",
              color: "white",
              fontWeight: "600",
              cursor: refreshing
                ? "not-allowed"
                : "pointer",
              opacity: refreshing
                ? 0.7
                : 1,
            }}
          >
            {refreshing
              ? "Refreshing..."
              : "🔄 Refresh Achievements"}
          </button>
        </div>

        {/* ====================================================
            STATS
        ==================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "24px",
            marginBottom: "30px",
          }}
        >
          {/* TOTAL */}

          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              minHeight: "130px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: "35px",
                marginBottom: "15px",
              }}
            >
              🏆
            </div>

            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              {totalAchievements}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "18px",
              }}
            >
              Total Achievements
            </div>
          </div>

          {/* UNLOCKED */}

          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              minHeight: "130px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: "35px",
                marginBottom: "15px",
              }}
            >
              ⭐
            </div>

            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              {unlocked}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "18px",
              }}
            >
              Unlocked
            </div>
          </div>

          {/* STATUS */}

          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              minHeight: "130px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: "35px",
                marginBottom: "15px",
              }}
            >
              🎯
            </div>

            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              {remaining}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "18px",
              }}
            >
              Remaining
            </div>
          </div>
        </div>

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {achievements.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding:
                "60px 30px",
              textAlign: "center",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: "70px",
              }}
            >
              🏆
            </div>

            <h2>
              No Achievements Yet
            </h2>

            <p
              style={{
                color: "#58708d",
                fontSize: "17px",
              }}
            >
              Complete your first quiz
              to unlock your first
              achievement.
            </p>

            <button
              onClick={() =>
                fetchAchievements(true)
              }
              style={{
                marginTop: "15px",
                padding:
                  "12px 22px",
                border: "none",
                borderRadius: "10px",
                background:
                  "#6246ea",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {/* ====================================================
            ACHIEVEMENT LIST
        ==================================================== */}

        {achievements.map(
          (achievement, index) => {
            const badgeName =
              getBadgeName(
                achievement
              );

            const badgeIcon =
              getBadgeIcon(
                achievement
              );

            const description =
              getDescription(
                achievement
              );

            const earnedDate =
              getEarnedDate(
                achievement
              );

            return (
              <div
                key={
                  achievement.id ||
                  `${badgeName}-${index}`
                }
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "30px",
                  marginBottom: "20px",
                  border:
                    "1px solid #b9d2ff",
                  display: "flex",
                  alignItems: "center",
                  gap: "25px",
                  boxShadow:
                    "0 8px 25px rgba(0,0,0,0.04)",
                }}
              >
                {/* BADGE ICON */}

                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "#eef5ff",
                    display: "flex",
                    justifyContent:
                      "center",
                    alignItems: "center",
                    fontSize: "42px",
                    flexShrink: 0,
                  }}
                >
                  {badgeIcon}
                </div>

                {/* CONTENT */}

                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      color: "#316cff",
                      fontWeight: "600",
                      marginBottom:
                        "15px",
                      fontSize: "16px",
                    }}
                  >
                    ✓ Unlocked
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "25px",
                      fontWeight: "700",
                    }}
                  >
                    {badgeName}
                  </h2>

                  <p
                    style={{
                      marginTop:
                        "15px",
                      marginBottom: 0,
                      fontSize: "18px",
                      color: "#58708d",
                    }}
                  >
                    {description}
                  </p>

                  {earnedDate && (
                    <p
                      style={{
                        marginTop:
                          "10px",
                        marginBottom: 0,
                        fontSize:
                          "14px",
                        color:
                          "#8a9bb0",
                      }}
                    >
                      Earned on{" "}
                      {earnedDate}
                    </p>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}