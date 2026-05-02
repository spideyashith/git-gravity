// src/App.jsx
// Top-level orchestrator — state management + layout only.
// Handles auth state, data fetching, UI coordination.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Scene from "./components/Scene.jsx";
import Overlay from "./UI/Overlay.jsx";
import DetailsPanel from "./UI/DetailsPanel.jsx";
import {
  fetchCommits,
  enrichCommits,
  fetchBranches,
  fetchContributors,
  checkAuthStatus,
} from "./services/githubService.js";
import { generateInsights } from "./utils/scoring.js";
import "./App.css";

export default function App() {
  // ── Auth ────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Repo identity ───────────────────────────────────────────
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");

  // ── Data ────────────────────────────────────────────────────
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [contributors, setContributors] = useState([]);

  // ── UI state ────────────────────────────────────────────────
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState(null);

  const [selection, setSelection] = useState(null);
  const [selectionType, setSelectionType] = useState(null);

  const [showStations, setShowStations] = useState(true);
  const [showShips, setShowShips] = useState(true);

  // ── Check auth status on mount ──────────────────────────────
  useEffect(() => {
    checkAuthStatus().then(setIsAuthenticated);

    // Handle OAuth redirect result
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "success") {
      setIsAuthenticated(true);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("auth_error")) {
      setError(`GitHub auth failed: ${params.get("auth_error")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ── Connect GitHub ──────────────────────────────────────────
  const handleConnectGitHub = useCallback(() => {
    window.location.href = "/auth/github";
  }, []);

  // ── Data fetching ───────────────────────────────────────────
  const loadRepo = useCallback(async (o, r) => {
    setOwner(o);
    setRepo(r);
    setLoading(true);
    setEnriching(false);
    setError(null);
    setSelection(null);
    setSelectionType(null);
    setCommits([]);
    setBranches([]);
    setContributors([]);

    try {
      const [rawCommits, branchList, contribList] = await Promise.all([
        fetchCommits(o, r),
        fetchBranches(o, r),
        fetchContributors(o, r),
      ]);

      if (rawCommits.length === 0) {
        setError("No commits found. Check the owner/repo name.");
        setLoading(false);
        return;
      }

      setCommits(rawCommits);
      setBranches(branchList);
      setContributors(contribList);
      setLoading(false);

      setEnriching(true);
      const enriched = await enrichCommits(rawCommits, o, r);
      setCommits(enriched);
      setEnriching(false);
    } catch (err) {
      if (err.message === "RATE_LIMIT") {
        setError(
          isAuthenticated
            ? "GitHub API rate limit reached. Try again shortly."
            : "Rate limit reached. Connect GitHub for higher limits (5000 req/hr)."
        );
      } else {
        setError("Failed to load repository. Please check the name and try again.");
      }
      setLoading(false);
      setEnriching(false);
    }
  }, [isAuthenticated]);

  // ── Derived data ────────────────────────────────────────────
  const filteredCommits = useMemo(() => {
    if (filter === "all") return commits;
    return commits.filter((c) => c.commitType === filter);
  }, [commits, filter]);

  const insights = useMemo(
    () => generateInsights(commits, contributors),
    [commits, contributors]
  );

  const stats = useMemo(() => {
    if (!owner) return null;
    return {
      commits: commits.length,
      branches: branches.length,
      contributors: contributors.length,
    };
  }, [owner, commits, branches, contributors]);

  // ── Selection handlers ──────────────────────────────────────
  const handleSelectCommit = useCallback((data) => {
    setSelection(data);
    setSelectionType("commit");
  }, []);

  const handleSelectBranch = useCallback((data) => {
    setSelection(data);
    setSelectionType("branch");
  }, []);

  const handleSelectContributor = useCallback((data) => {
    setSelection(data);
    setSelectionType("contributor");
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelection(null);
    setSelectionType(null);
  }, []);

  // ── Render ──────────────────────────────────────────────────
  const repoName = repo || "GIT GRAVITY";

  return (
    <div className="app">
      <Scene
        repoName={repoName}
        commits={filteredCommits}
        branches={branches}
        contributors={contributors}
        showStations={showStations}
        showShips={showShips}
        onSelectCommit={handleSelectCommit}
        onSelectBranch={handleSelectBranch}
        onSelectContributor={handleSelectContributor}
      />

      <Overlay
        owner={owner}
        repo={repo}
        onRepoSubmit={loadRepo}
        filter={filter}
        setFilter={setFilter}
        showStations={showStations}
        setShowStations={setShowStations}
        showShips={showShips}
        setShowShips={setShowShips}
        loading={loading}
        enriching={enriching}
        error={error}
        insights={insights}
        stats={stats}
        isAuthenticated={isAuthenticated}
        onConnectGitHub={handleConnectGitHub}
      />

      <DetailsPanel
        selection={selection}
        selectionType={selectionType}
        onClose={handleCloseDetails}
      />
    </div>
  );
}