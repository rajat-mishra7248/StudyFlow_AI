import React, { useEffect, useMemo, useState } from "react";
import { getCourseResources } from "../services/api";

function normalizeResources(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.resources)) return response.resources;
    if (Array.isArray(response?.courses)) return response.courses;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.resources)) return response.data.resources;
    if (Array.isArray(response?.data?.courses)) return response.data.courses;

    return [];
}

function getTitle(item) {
    return (
        item?.course_name ||
        item?.course ||
        item?.title ||
        item?.name ||
        item?.subject ||
        item?.topic ||
        "Learning Resource"
    );
}

function getDescription(item) {
    return (
        item?.description ||
        item?.details ||
        item?.summary ||
        item?.content ||
        `Learn more about ${getTitle(item)} with this useful learning resource.`
    );
}

function getUrl(item) {
    return (
        item?.youtube_url ||
        item?.youtube_link ||
        item?.video_url ||
        item?.url ||
        item?.link ||
        item?.access_url ||
        item?.source_url ||
        ""
    );
}

function getPlatform(item) {
    const platform =
        item?.platform ||
        item?.source ||
        item?.provider ||
        "";

    if (platform) {
        return String(platform);
    }

    const url = String(getUrl(item)).toLowerCase();

    if (
        url.includes("youtube.com") ||
        url.includes("youtu.be")
    ) {
        return "YouTube";
    }

    return "Online";
}

function isYouTube(item) {
    const url = String(getUrl(item)).toLowerCase();
    const platform = String(getPlatform(item)).toLowerCase();

    return (
        platform.includes("youtube") ||
        url.includes("youtube.com") ||
        url.includes("youtu.be")
    );
}

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const loadResources = async (refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await getCourseResources();

            console.log("STUDYFLOW RESOURCES RESPONSE:", response);

            const normalized = normalizeResources(response);

            console.log("NORMALIZED RESOURCES:", normalized);

            setResources(normalized);
        } catch (err) {
            console.error("RESOURCE ERROR:", err);

            const message =
                err?.response?.data?.detail ||
                err?.message ||
                "Unable to load resources.";

            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    const filteredResources = useMemo(() => {
        const query = search.trim().toLowerCase();

        return resources.filter((item) => {
            const title = String(getTitle(item)).toLowerCase();
            const description = String(getDescription(item)).toLowerCase();
            const platform = String(getPlatform(item)).toLowerCase();

            const youtube = isYouTube(item);

            const searchMatch =
                !query ||
                title.includes(query) ||
                description.includes(query) ||
                platform.includes(query);

            let filterMatch = true;

            if (filter === "YouTube") {
                filterMatch = youtube;
            }

            if (filter === "Other") {
                filterMatch = !youtube;
            }

            return searchMatch && filterMatch;
        });
    }, [resources, search, filter]);

    const youtubeCount = resources.filter((item) => isYouTube(item)).length;
    const otherCount = resources.length - youtubeCount;

    if (loading) {
        return (
            <div className="resources-page">
                <div className="resources-loading">
                    <div className="loading-spinner">
                        <span>✦</span>
                    </div>

                    <h2>Loading Resources</h2>

                    <p>
                        StudyFlow AI is preparing your learning resources...
                    </p>
                </div>

                <style>{styles}</style>
            </div>
        );
    }

    return (
        <div className="resources-page">
            <div className="resources-container">

                <section className="resources-hero">
                    <div className="hero-content">

                        <div className="hero-badge">
                            <span>✦</span>
                            STUDYFLOW AI
                            <span className="badge-dot"></span>
                            RESOURCE HUB
                        </div>

                        <h1>
                            Your gateway to
                            <span>smarter learning.</span>
                        </h1>

                        <p>
                            Discover useful courses, tutorials and videos
                            to strengthen your knowledge and build practical skills.
                        </p>

                        <button
                            className="hero-button"
                            onClick={() => {
                                document
                                    .getElementById("resource-search")
                                    ?.focus();
                            }}
                        >
                            <span>⌕</span>
                            Explore Resources
                        </button>
                    </div>

                    <div className="hero-card">

                        <div className="hero-card-header">
                            <div>
                                <small>RESOURCE LIBRARY</small>
                                <strong>Learn something new</strong>
                            </div>

                            <div className="hero-star">✦</div>
                        </div>

                        <div className="hero-stat">
                            <div className="hero-stat-icon">📚</div>

                            <div>
                                <span>Total Resources</span>
                                <strong>{resources.length}</strong>
                            </div>
                        </div>

                        <div className="hero-stat">
                            <div className="hero-stat-icon youtube">▶</div>

                            <div>
                                <span>YouTube Learning</span>
                                <strong>{youtubeCount}</strong>
                            </div>
                        </div>

                        <div className="hero-status">
                            <span></span>
                            Learning resources available
                        </div>
                    </div>
                </section>

                <div className="stats">

                    <div className="stat">
                        <div className="stat-icon purple">📚</div>

                        <div>
                            <small>ALL RESOURCES</small>
                            <strong>{resources.length}</strong>
                        </div>
                    </div>

                    <div className="stat">
                        <div className="stat-icon red">▶</div>

                        <div>
                            <small>YOUTUBE</small>
                            <strong>{youtubeCount}</strong>
                        </div>
                    </div>

                    <div className="stat">
                        <div className="stat-icon blue">🌐</div>

                        <div>
                            <small>OTHER</small>
                            <strong>{otherCount}</strong>
                        </div>
                    </div>

                    <div className="stat">
                        <div className="stat-icon green">✓</div>

                        <div>
                            <small>SHOWING</small>
                            <strong>{filteredResources.length}</strong>
                        </div>
                    </div>

                </div>

                <section className="search-panel">

                    <div className="search-header">
                        <div>
                            <small>RESOURCE LIBRARY</small>

                            <h2>Find your next topic</h2>

                            <p>
                                Search by subject, topic or platform.
                            </p>
                        </div>

                        <button
                            className={
                                refreshing
                                    ? "refresh-button rotating"
                                    : "refresh-button"
                            }
                            onClick={() => loadResources(true)}
                            disabled={refreshing}
                            title="Refresh resources"
                        >
                            ↻
                        </button>
                    </div>

                    <div className="search-box">

                        <span className="search-icon">⌕</span>

                        <input
                            id="resource-search"
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                            }}
                            placeholder="Search Python, DSA, SQL, React, Machine Learning..."
                        />

                        {search && (
                            <button
                                className="clear-button"
                                onClick={() => setSearch("")}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="filters">

                        <span className="filter-title">
                            FILTER
                        </span>

                        <button
                            className={
                                filter === "All"
                                    ? "filter active"
                                    : "filter"
                            }
                            onClick={() => setFilter("All")}
                        >
                            📚 All
                            <b>{resources.length}</b>
                        </button>

                        <button
                            className={
                                filter === "YouTube"
                                    ? "filter youtube active"
                                    : "filter youtube"
                            }
                            onClick={() => setFilter("YouTube")}
                        >
                            ▶ YouTube
                            <b>{youtubeCount}</b>
                        </button>

                        <button
                            className={
                                filter === "Other"
                                    ? "filter active"
                                    : "filter"
                            }
                            onClick={() => setFilter("Other")}
                        >
                            🌐 Other
                            <b>{otherCount}</b>
                        </button>

                        {(search || filter !== "All") && (
                            <button
                                className="clear-filters"
                                onClick={() => {
                                    setSearch("");
                                    setFilter("All");
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </section>

                {error && (
                    <div className="error-box">

                        <div className="error-icon">
                            !
                        </div>

                        <div className="error-content">

                            <strong>
                                Unable to load resources
                            </strong>

                            <p>{error}</p>

                            <button onClick={() => loadResources()}>
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {!error && (
                    <div className="results-header">

                        <div>
                            <div className="results-title">

                                <h2>
                                    {filter === "All"
                                        ? "Recommended Resources"
                                        : filter === "YouTube"
                                            ? "YouTube Learning"
                                            : "Other Resources"}
                                </h2>

                                <span>
                                    {filteredResources.length}
                                </span>
                            </div>

                            <p>
                                {search
                                    ? `Results matching "${search}"`
                                    : "Resources to help you learn, practice and grow."}
                            </p>
                        </div>
                    </div>
                )}

                {!error && filteredResources.length === 0 && (
                    <div className="empty-state">

                        <div className="empty-icon">
                            ⌕
                        </div>

                        <h2>No resources found</h2>

                        <p>
                            We couldn't find anything matching your current
                            search or filter.
                        </p>

                        <button
                            onClick={() => {
                                setSearch("");
                                setFilter("All");
                            }}
                        >
                            Show All Resources
                        </button>
                    </div>
                )}

                {!error && filteredResources.length > 0 && (
                    <div className="resource-grid">

                        {filteredResources.map((item, index) => {

                            const title = getTitle(item);
                            const description = getDescription(item);
                            const url = getUrl(item);
                            const platform = getPlatform(item);
                            const youtube = isYouTube(item);

                            return (
                                <article
                                    className={
                                        youtube
                                            ? "resource-card youtube-card"
                                            : "resource-card"
                                    }
                                    key={
                                        item?.id ||
                                        item?.resource_id ||
                                        item?.course_id ||
                                        `${title}-${index}`
                                    }
                                >

                                    <div className="card-top">

                                        <div
                                            className={
                                                youtube
                                                    ? "resource-icon youtube"
                                                    : "resource-icon"
                                            }
                                        >
                                            {youtube ? "▶" : "📚"}
                                        </div>

                                        <div className="card-number">
                                            #
                                            {String(index + 1).padStart(2, "0")}
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            youtube
                                                ? "platform youtube"
                                                : "platform"
                                        }
                                    >
                                        {youtube
                                            ? "YOUTUBE"
                                            : platform}
                                    </div>

                                    <h3>{title}</h3>

                                    <p className="description">
                                        {description}
                                    </p>

                                    <div className="card-meta">
                                        <span>
                                            {youtube
                                                ? "▶ Video learning"
                                                : "📖 Self-paced learning"}
                                        </span>
                                    </div>

                                    <div className="card-footer">

                                        {url ? (
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={
                                                    youtube
                                                        ? "open-resource youtube"
                                                        : "open-resource"
                                                }
                                            >
                                                <span>
                                                    {youtube
                                                        ? "Watch on YouTube"
                                                        : "Open Resource"}
                                                </span>

                                                <span>↗</span>
                                            </a>
                                        ) : (
                                            <div className="no-link">
                                                Link unavailable
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <footer className="resources-footer">

                    <div>
                        <strong>✦ StudyFlow AI</strong>
                        <span>Resource Hub</span>
                    </div>

                    <p>
                        Learn consistently. Grow continuously.
                    </p>

                    <div className="online">
                        <span></span>
                        Online
                    </div>
                </footer>

            </div>

            <style>{styles}</style>
        </div>
    );
}

const styles = `
* {
    box-sizing: border-box;
}

.resources-page {
    min-height: 100vh;
    width: 100%;
    padding: 28px 20px 50px;
    background:
        radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 30%),
        radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 25%),
        #f7f8fc;
    color: #172033;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.resources-page button,
.resources-page input {
    font-family: inherit;
}

.resources-page button {
    cursor: pointer;
}

.resources-page a {
    text-decoration: none;
}

.resources-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.resources-hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 45px;
    min-height: 390px;
    padding: 50px;
    overflow: hidden;
    border-radius: 30px;
    background: linear-gradient(135deg, #171b4d 0%, #302b7b 52%, #5146b8 100%);
    box-shadow: 0 25px 60px rgba(31,41,91,0.22);
    color: white;
}

.resources-hero::before {
    content: "";
    position: absolute;
    width: 320px;
    height: 320px;
    right: 220px;
    top: -190px;
    border-radius: 50%;
    background: rgba(129,140,248,0.18);
}

.resources-hero::after {
    content: "";
    position: absolute;
    width: 260px;
    height: 260px;
    right: -90px;
    bottom: -170px;
    border-radius: 50%;
    background: rgba(196,181,253,0.15);
}

.hero-content {
    position: relative;
    z-index: 2;
    max-width: 650px;
}

.hero-badge {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    color: rgba(255,255,255,0.8);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
}

.hero-badge > span:first-child {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(255,255,255,0.14);
    color: white;
}

.badge-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    margin-left: 3px;
}

.hero-content h1 {
    margin: 0;
    font-size: clamp(38px, 5vw, 60px);
    line-height: 1;
    letter-spacing: -2.8px;
    font-weight: 900;
}

.hero-content h1 span {
    display: block;
    margin-top: 7px;
    color: #a5b4fc;
}

.hero-content p {
    max-width: 590px;
    margin: 21px 0 0;
    color: rgba(255,255,255,0.7);
    font-size: 15px;
    line-height: 1.7;
}

.hero-button {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-top: 27px;
    padding: 13px 17px;
    border: none;
    border-radius: 12px;
    background: white;
    color: #312e81;
    font-size: 12px;
    font-weight: 850;
    transition: transform .2s ease, box-shadow .2s ease;
}

.hero-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0,0,0,0.18);
}

.hero-button span {
    font-size: 19px;
}

.hero-card {
    position: relative;
    z-index: 2;
    width: 335px;
    flex-shrink: 0;
    padding: 23px;
    border-radius: 21px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.09);
    backdrop-filter: blur(12px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.hero-card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 21px;
}

.hero-card-header small {
    display: block;
    margin-bottom: 6px;
    color: rgba(255,255,255,0.42);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 1px;
}

.hero-card-header strong {
    font-size: 16px;
}

.hero-star {
    width: 37px;
    height: 37px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 11px;
    background: rgba(255,255,255,0.1);
    color: #c4b5fd;
}

.hero-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-top: 9px;
    border-radius: 12px;
    background: rgba(255,255,255,0.07);
}

.hero-stat-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(129,140,248,0.16);
}

.hero-stat-icon.youtube {
    background: rgba(248,113,113,0.15);
}

.hero-stat span {
    display: block;
    margin-bottom: 2px;
    color: rgba(255,255,255,0.5);
    font-size: 9px;
}

.hero-stat strong {
    font-size: 18px;
}

.hero-status {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 17px;
    color: rgba(255,255,255,0.45);
    font-size: 9px;
}

.hero-status span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #86efac;
}

.stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 13px;
    margin-top: 18px;
}

.stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e6e8ef;
    border-radius: 17px;
    background: white;
    box-shadow: 0 7px 22px rgba(15,23,42,0.04);
}

.stat-icon {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 17px;
}

.stat-icon.purple {
    background: #ede9fe;
}

.stat-icon.red {
    background: #fee2e2;
}

.stat-icon.blue {
    background: #dbeafe;
}

.stat-icon.green {
    background: #dcfce7;
}

.stat small {
    display: block;
    margin-bottom: 3px;
    color: #9aa4b3;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .7px;
}

.stat strong {
    display: block;
    font-size: 21px;
    font-weight: 850;
}

.search-panel {
    margin-top: 24px;
    padding: 25px;
    border: 1px solid #e4e7ee;
    border-radius: 21px;
    background: white;
    box-shadow: 0 9px 30px rgba(15,23,42,0.05);
}

.search-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 17px;
}

.search-header small {
    color: #6366f1;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 1px;
}

.search-header h2 {
    margin: 5px 0 0;
    font-size: 21px;
    font-weight: 850;
    letter-spacing: -.5px;
}

.search-header p {
    margin: 5px 0 0;
    color: #8993a3;
    font-size: 12px;
}

.refresh-button {
    width: 42px;
    height: 42px;
    border: 1px solid #e2e6ee;
    border-radius: 11px;
    background: #f8fafc;
    color: #475569;
    font-size: 21px;
    font-weight: 700;
}

.refresh-button:hover {
    background: #eef2ff;
    color: #4f46e5;
}

.refresh-button:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.rotating {
    animation: refreshSpin .8s linear infinite;
}

@keyframes refreshSpin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.search-box {
    position: relative;
}

.search-box input {
    width: 100%;
    height: 56px;
    padding: 0 48px;
    border: 1px solid #dfe3eb;
    border-radius: 14px;
    background: #f8fafc;
    color: #172033;
    outline: none;
    font-size: 13px;
    transition: .2s ease;
}

.search-box input:focus {
    background: white;
    border-color: #818cf8;
    box-shadow: 0 0 0 4px rgba(99,102,241,.08);
}

.search-icon {
    position: absolute;
    left: 17px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 22px;
}

.clear-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 29px;
    height: 29px;
    border: none;
    border-radius: 50%;
    background: #e5e7eb;
    color: #475569;
    font-size: 18px;
}

.filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 15px;
}

.filter-title {
    margin-right: 3px;
    color: #9aa4b3;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .8px;
}

.filter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 11px;
    border: 1px solid #e1e5ec;
    border-radius: 999px;
    background: white;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
}

.filter b {
    padding: 2px 5px;
    border-radius: 999px;
    background: #f1f5f9;
    font-size: 8px;
}

.filter.active {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
}

.filter.active b {
    background: rgba(255,255,255,.16);
    color: white;
}

.filter.youtube.active {
    background: #dc2626;
    border-color: #dc2626;
}

.clear-filters {
    margin-left: auto;
    border: none;
    background: transparent;
    color: #6366f1;
    font-size: 10px;
    font-weight: 800;
}

.error-box {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    margin-top: 20px;
    padding: 17px;
    border: 1px solid #fecdd3;
    border-radius: 15px;
    background: #fff1f2;
}

.error-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: #ffe4e6;
    color: #be123c;
    font-weight: 900;
}

.error-content strong {
    font-size: 13px;
}

.error-content p {
    margin: 4px 0 8px;
    color: #9f1239;
    font-size: 11px;
}

.error-content button {
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background: #4f46e5;
    color: white;
    font-size: 10px;
    font-weight: 800;
}

.results-header {
    display: flex;
    justify-content: space-between;
    margin: 32px 2px 17px;
}

.results-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.results-title h2 {
    margin: 0;
    font-size: 23px;
    font-weight: 850;
}

.results-title span {
    min-width: 25px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #ede9fe;
    color: #6d28d9;
    font-size: 9px;
    font-weight: 900;
}

.results-header p {
    margin: 5px 0 0;
    color: #8993a3;
    font-size: 12px;
}

.resource-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 17px;
}

.resource-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 310px;
    padding: 20px;
    border: 1px solid #e4e7ee;
    border-radius: 19px;
    background: white;
    box-shadow: 0 7px 25px rgba(15,23,42,0.045);
    overflow: hidden;
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.resource-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    opacity: 0;
    transition: opacity .2s ease;
}

.resource-card:hover {
    transform: translateY(-4px);
    border-color: #d5d9e5;
    box-shadow: 0 17px 38px rgba(15,23,42,.09);
}

.resource-card:hover::before {
    opacity: 1;
}

.youtube-card::before {
    background: linear-gradient(90deg, #dc2626, #ef4444);
}

.card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.resource-icon {
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 13px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 18px;
    font-weight: 900;
}

.resource-icon.youtube {
    background: #fee2e2;
    color: #dc2626;
}

.card-number {
    color: #c2c8d3;
    font-size: 9px;
    font-weight: 800;
}

.platform {
    align-self: flex-start;
    max-width: 160px;
    margin-bottom: 11px;
    padding: 5px 9px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 999px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .5px;
}

.platform.youtube {
    background: #fee2e2;
    color: #dc2626;
}

.resource-card h3 {
    margin: 0 0 9px;
    color: #172033;
    font-size: 18px;
    line-height: 1.3;
    font-weight: 850;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.description {
    flex: 1;
    margin: 0;
    color: #6f7b8e;
    font-size: 12px;
    line-height: 1.65;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
}

.card-meta {
    margin-top: 15px;
    color: #9aa4b3;
    font-size: 9px;
    font-weight: 700;
}

.card-footer {
    margin-top: 14px;
    padding-top: 13px;
    border-top: 1px solid #f0f2f5;
}

.open-resource {
    width: 100%;
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 13px;
    border-radius: 10px;
    background: #4f46e5;
    color: white;
    font-size: 10px;
    font-weight: 850;
    transition: transform .2s ease, background .2s ease;
}

.open-resource:hover {
    transform: translateY(-1px);
    background: #4338ca;
}

.open-resource.youtube {
    background: #dc2626;
}

.open-resource.youtube:hover {
    background: #b91c1c;
}

.open-resource span:last-child {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    background: rgba(255,255,255,.12);
    font-size: 13px;
}

.no-link {
    min-height: 42px;
    display: flex;
    align-items: center;
    padding: 0 13px;
    border-radius: 10px;
    background: #f8fafc;
    color: #9aa4b3;
    font-size: 10px;
    font-weight: 700;
}

.empty-state {
    padding: 65px 20px;
    text-align: center;
    border: 1px solid #e5e7ed;
    border-radius: 21px;
    background: white;
    box-shadow: 0 8px 25px rgba(15,23,42,.04);
}

.empty-icon {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 17px;
    border-radius: 22px;
    background: #eef2ff;
    color: #6366f1;
    font-size: 31px;
}

.empty-state h2 {
    margin: 0 0 7px;
    font-size: 21px;
    font-weight: 850;
}

.empty-state p {
    max-width: 450px;
    margin: 0 auto 18px;
    color: #8993a3;
    font-size: 12px;
    line-height: 1.6;
}

.empty-state button {
    border: none;
    padding: 10px 15px;
    border-radius: 9px;
    background: #4f46e5;
    color: white;
    font-size: 10px;
    font-weight: 800;
}

.resources-loading {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.loading-spinner {
    width: 58px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: loadingSpin .8s linear infinite;
}

.loading-spinner span {
    color: #6366f1;
    font-size: 15px;
}

.resources-loading h2 {
    margin: 18px 0 6px;
    font-size: 20px;
}

.resources-loading p {
    margin: 0;
    color: #8993a3;
    font-size: 12px;
}

@keyframes loadingSpin {
    to {
        transform: rotate(360deg);
    }
}

.resources-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-top: 35px;
    padding-top: 17px;
    border-top: 1px solid #e5e7eb;
    color: #9aa4b3;
    font-size: 9px;
}

.resources-footer strong {
    color: #475569;
    margin-right: 8px;
    font-size: 10px;
}

.resources-footer p {
    margin: 0;
}

.online {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
}

.online span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
}

@media (max-width: 1000px) {

    .resources-hero {
        padding: 40px;
    }

    .hero-card {
        width: 290px;
    }

    .resource-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .stats {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 700px) {

    .resources-page {
        padding: 12px 10px 35px;
    }

    .resources-hero {
        flex-direction: column;
        align-items: stretch;
        padding: 30px 23px;
        border-radius: 24px;
    }

    .hero-content h1 {
        font-size: 40px;
        letter-spacing: -2px;
    }

    .hero-content p {
        font-size: 13px;
    }

    .hero-card {
        width: 100%;
    }

    .stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 9px;
    }

    .stat {
        padding: 13px;
    }

    .search-panel {
        padding: 18px;
    }

    .resource-grid {
        grid-template-columns: 1fr;
    }

    .results-header {
        margin-top: 27px;
    }

    .resources-footer {
        align-items: flex-start;
        flex-direction: column;
    }
}

@media (max-width: 430px) {

    .resources-hero {
        padding: 25px 19px;
    }

    .hero-content h1 {
        font-size: 34px;
    }

    .hero-badge {
        font-size: 8px;
    }

    .stats {
        grid-template-columns: 1fr;
    }

    .search-header h2 {
        font-size: 18px;
    }

    .filter-title {
        width: 100%;
    }

    .clear-filters {
        width: 100%;
        margin-left: 0;
        text-align: left;
    }
}
`;
