// src/UI/DetailsPanel.jsx
// Right-side panel showing details of the selected commit, contributor, or branch.

import React from "react";
import { formatDate } from "../utils/helpers.js";

export default function DetailsPanel({ selection, selectionType, onClose }) {
  if (!selection) return null;

  return (
    <div className="details-panel" id="details-panel">
      <button
        className="details-panel__close"
        id="details-close"
        onClick={onClose}
        aria-label="Close details"
      >
        ✕
      </button>

      {/* ── Commit Details ───────────────── */}
      {selectionType === "commit" && (
        <>
          <h3 className="details-panel__heading">COMMIT</h3>

          <div className="details-panel__field">
            <span className="details-panel__label">Message</span>
            <p className="details-panel__value details-panel__value--msg">
              {selection.message}
            </p>
          </div>

          <div className="details-panel__field">
            <span className="details-panel__label">Author</span>
            <p className="details-panel__value">{selection.author}</p>
          </div>

          <div className="details-panel__field">
            <span className="details-panel__label">Date</span>
            <p className="details-panel__value">
              {formatDate(selection.date)}
            </p>
          </div>

          {selection.impactScore != null && (
            <>
              <div className="details-panel__divider" />

              <div className="details-panel__field">
                <span className="details-panel__label">Impact Score</span>
                <p className="details-panel__value details-panel__value--score">
                  {selection.impactScore.toFixed(3)}
                </p>
              </div>

              <div className="details-panel__field">
                <span className="details-panel__label">Tier</span>
                <p className="details-panel__value">
                  <span
                    className={`details-panel__tier details-panel__tier--${selection.tier}`}
                  >
                    {selection.tier === "gasGiant"
                      ? "🪐 Gas Giant"
                      : selection.tier === "rocky"
                      ? "🌍 Rocky Planet"
                      : "☄️ Asteroid"}
                  </span>
                </p>
              </div>

              <div className="details-panel__stats-grid">
                <div className="details-panel__stat">
                  <span className="details-panel__stat-num details-panel__stat-num--add">
                    +{selection.additions}
                  </span>
                  <span className="details-panel__stat-label">added</span>
                </div>
                <div className="details-panel__stat">
                  <span className="details-panel__stat-num details-panel__stat-num--del">
                    -{selection.deletions}
                  </span>
                  <span className="details-panel__stat-label">deleted</span>
                </div>
                <div className="details-panel__stat">
                  <span className="details-panel__stat-num">
                    {selection.filesChanged}
                  </span>
                  <span className="details-panel__stat-label">files</span>
                </div>
              </div>
            </>
          )}

          <div className="details-panel__type-badge" style={{ borderColor: selection.color }}>
            {selection.commitType}
          </div>
        </>
      )}

      {/* ── Contributor Details ───────────── */}
      {selectionType === "contributor" && (
        <>
          <h3 className="details-panel__heading">CONTRIBUTOR</h3>

          <div className="details-panel__field">
            <span className="details-panel__label">Login</span>
            <p className="details-panel__value">{selection.login}</p>
          </div>

          <div className="details-panel__field">
            <span className="details-panel__label">Total Contributions</span>
            <p className="details-panel__value details-panel__value--score">
              {selection.contributions}
            </p>
          </div>

          <div className="details-panel__field">
            <span className="details-panel__label">Commits in View</span>
            <p className="details-panel__value">{selection.commitCount}</p>
          </div>

          <div className="details-panel__field">
            <span className="details-panel__label">Ship Color</span>
            <div
              className="details-panel__color-swatch"
              style={{ background: selection.hexColor }}
            />
          </div>
        </>
      )}

      {/* ── Branch Details ───────────────── */}
      {selectionType === "branch" && (
        <>
          <h3 className="details-panel__heading">BRANCH</h3>

          <div className="details-panel__field">
            <span className="details-panel__label">Name</span>
            <p className="details-panel__value">{selection.name}</p>
          </div>

          <div className="details-panel__field">
            <span className="details-panel__label">Default</span>
            <p className="details-panel__value">
              {selection.isDefault ? "Yes" : "No"}
            </p>
          </div>

          <div className="details-panel__field">
            <span className="details-panel__label">HEAD SHA</span>
            <p className="details-panel__value details-panel__value--sha">
              {selection.sha?.slice(0, 10)}…
            </p>
          </div>
        </>
      )}
    </div>
  );
}
