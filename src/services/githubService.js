// src/services/githubService.js
// All GitHub API interactions — routed through backend proxy.
// Retains client-side localStorage caching for commit details.

import {
  calcImpactScore,
  mapScoreToPhysics,
  classifyCommit,
} from "../utils/scoring.js";

const CACHE_PREFIX = "gg_commit_";

// ── Cache helpers ──────────────────────────────────────────────
function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    /* quota exceeded */
  }
}

// ── Error handling ─────────────────────────────────────────────
function checkResponse(res) {
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

// ── Auth Status ────────────────────────────────────────────────
export async function checkAuthStatus() {
  try {
    const res = await fetch("/api/auth/status", { credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
}

// ── 1. Fetch Commits ──────────────────────────────────────────
export async function fetchCommits(owner, repo) {
  try {
    const res = await fetch(
      `/api/commits?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
      { credentials: "include" }
    );
    checkResponse(res);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid response");

    return data.map((c, index) => {
      const { type, color } = classifyCommit(c.commit.message);
      return {
        id: c.sha,
        message: c.commit.message.split("\n")[0],
        author: c.commit.author.name,
        authorLogin: c.author?.login || c.commit.author.name,
        date: c.commit.author.date,
        commitType: type,
        color,
        distance: 5 + (data.length - index) * 1.5,
        size: 0.25,
        speed: 0.4,
        glow: 0.4,
        tier: "asteroid",
        impactScore: null,
        additions: 0,
        deletions: 0,
        filesChanged: 0,
      };
    });
  } catch (err) {
    if (err.message === "RATE_LIMIT") throw err;
    console.error("fetchCommits:", err);
    return [];
  }
}

// ── 2. Enrich Commits ─────────────────────────────────────────
export async function enrichCommits(commits, owner, repo) {
  const limited = commits.slice(0, 20);

  const enriched = await Promise.all(
    limited.map(async (c) => {
      const cached = getCached(c.id);
      if (cached) return applyStats(c, cached);

      try {
        const res = await fetch(
          `/api/commits/${c.id}?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
          { credentials: "include" }
        );
        if (!res.ok) return c;

        const data = await res.json();
        setCache(c.id, data);
        return applyStats(c, data);
      } catch {
        return c;
      }
    })
  );

  return [...enriched, ...commits.slice(20)];
}

function applyStats(commit, data) {
  const additions = data.stats?.additions || 0;
  const deletions = data.stats?.deletions || 0;
  const filesChanged = data.files?.length || 0;

  const score = calcImpactScore(additions, deletions, filesChanged);
  const physics = mapScoreToPhysics(score);

  return {
    ...commit,
    impactScore: score,
    additions,
    deletions,
    filesChanged,
    size: physics.size,
    speed: physics.speed,
    glow: physics.glow,
    tier: physics.tier,
  };
}

// ── 3. Fetch Branches ─────────────────────────────────────────
export async function fetchBranches(owner, repo) {
  try {
    const res = await fetch(
      `/api/branches?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
      { credentials: "include" }
    );
    checkResponse(res);
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data.map((b, i) => ({
      name: b.name,
      isDefault: i === 0,
      sha: b.commit.sha,
      orbitRadius: 20 + i * 5,
      orbitSpeed: 0.1 + i * 0.02,
    }));
  } catch (err) {
    if (err.message === "RATE_LIMIT") throw err;
    console.error("fetchBranches:", err);
    return [];
  }
}

// ── 4. Fetch Contributors ─────────────────────────────────────
export async function fetchContributors(owner, repo) {
  try {
    const res = await fetch(
      `/api/contributors?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
      { credentials: "include" }
    );
    checkResponse(res);
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data.map((c) => ({
      login: c.login,
      avatar: c.avatar_url,
      contributions: c.contributions,
      id: c.id,
    }));
  } catch (err) {
    if (err.message === "RATE_LIMIT") throw err;
    console.error("fetchContributors:", err);
    return [];
  }
}
