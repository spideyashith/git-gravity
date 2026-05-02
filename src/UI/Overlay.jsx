// src/UI/Overlay.jsx
// Top-left HUD: title, GitHub auth, repo input, filters, toggles, insights, stats.

import React, { useState } from "react";

export default function Overlay({
  owner,
  repo,
  onRepoSubmit,
  filter,
  setFilter,
  showStations,
  setShowStations,
  showShips,
  setShowShips,
  loading,
  enriching,
  error,
  insights,
  stats,
  isAuthenticated,
  onConnectGitHub,
}) {
  const [inputValue, setInputValue] = useState(
    owner && repo ? `${owner}/${repo}` : ""
  );

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    const parts = trimmed.split("/");
    if (parts.length === 2 && parts[0] && parts[1]) {
      onRepoSubmit(parts[0], parts[1]);
    }
  }

  const filters = [
    { key: "all", label: "ALL" },
    { key: "feature", label: "FEAT" },
    { key: "fix", label: "FIX" },
    { key: "general", label: "OTHER" },
  ];

  return (
    <div className="overlay" id="overlay-hud">
      {/* Title */}
      <h1 className="overlay__title">
        GIT GRAVITY <span className="overlay__version">2.0</span>
      </h1>

      {/* GitHub Auth */}
      <button
        id="github-auth-btn"
        className={`overlay__github-btn ${isAuthenticated ? "overlay__github-btn--connected" : ""}`}
        onClick={isAuthenticated ? undefined : onConnectGitHub}
        disabled={isAuthenticated}
      >
        <svg
          className="overlay__github-icon"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="currentColor"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        {isAuthenticated ? "Connected ✓" : "Connect GitHub"}
      </button>

      {/* Repo input */}
      <form className="overlay__form" onSubmit={handleSubmit}>
        <input
          id="repo-input"
          className="overlay__input"
          type="text"
          placeholder="owner/repo"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          spellCheck={false}
        />
        <button
          id="repo-submit"
          className="overlay__submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "⏳" : "LAUNCH"}
        </button>
      </form>

      {/* Error */}
      {error && <p className="overlay__error">{error}</p>}

      {/* Status */}
      {loading && <p className="overlay__status">LOADING REPO DATA...</p>}
      {enriching && !loading && (
        <p className="overlay__status">ANALYZING COMMITS...</p>
      )}

      {/* Filters */}
      <div className="overlay__filters" id="filter-bar">
        {filters.map((f) => (
          <button
            key={f.key}
            id={`filter-${f.key}`}
            className={`overlay__filter-btn ${
              filter === f.key ? "overlay__filter-btn--active" : ""
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Toggles */}
      <div className="overlay__toggles">
        <label className="overlay__toggle" id="toggle-stations">
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
          />
          <span className="overlay__toggle-slider" />
          <span className="overlay__toggle-label">Stations</span>
        </label>

        <label className="overlay__toggle" id="toggle-ships">
          <input
            type="checkbox"
            checked={showShips}
            onChange={(e) => setShowShips(e.target.checked)}
          />
          <span className="overlay__toggle-slider" />
          <span className="overlay__toggle-label">Ships</span>
        </label>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="overlay__stats" id="stats-bar">
          <span>
            <strong>{stats.commits}</strong> commits
          </span>
          <span>
            <strong>{stats.branches}</strong> branches
          </span>
          <span>
            <strong>{stats.contributors}</strong> contributors
          </span>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="overlay__insights" id="insights-panel">
          <p className="overlay__insights-title">SYSTEM_ANALYSIS</p>
          {insights.map((text, i) => (
            <p key={i} className="overlay__insight">
              {text}
            </p>
          ))}
        </div>
      )}

      {/* Auth hint */}
      {!isAuthenticated && (
        <p className="overlay__auth-hint">
          ⚠ Unauthenticated: 60 req/hr limit
        </p>
      )}
    </div>
  );
}
