// server/controllers/apiController.js
// GitHub API proxy — routes all GitHub requests through the backend.

import axios from "axios";
import { getTokenForSession } from "./authController.js";

const GITHUB_API = "https://api.github.com";

/**
 * Build headers for GitHub API requests.
 * Uses OAuth token if available, otherwise unauthenticated (60 req/hr).
 */
function buildHeaders(req) {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitGravity/2.0",
  };

  const sessionId = req.cookies?.gg_session;
  if (sessionId) {
    const token = getTokenForSession(sessionId);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Validate owner/repo params — must be non-empty, safe strings.
 */
function validateRepoParams(owner, repo) {
  if (!owner || !repo) return false;
  const safe = /^[a-zA-Z0-9._-]+$/;
  return safe.test(owner) && safe.test(repo);
}

/**
 * GET /api/commits?owner=X&repo=Y
 */
export async function getCommits(req, res) {
  const { owner, repo } = req.query;

  if (!validateRepoParams(owner, repo)) {
    return res.status(400).json({ error: "Invalid owner or repo" });
  }

  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/commits`,
      {
        params: { per_page: 30 },
        headers: buildHeaders(req),
      }
    );

    res.json(response.data);
  } catch (err) {
    handleGitHubError(err, res);
  }
}

/**
 * GET /api/commits/:sha?owner=X&repo=Y
 */
export async function getCommitDetail(req, res) {
  const { sha } = req.params;
  const { owner, repo } = req.query;

  if (!validateRepoParams(owner, repo)) {
    return res.status(400).json({ error: "Invalid owner or repo" });
  }

  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/commits/${sha}`,
      { headers: buildHeaders(req) }
    );

    // Return only what the frontend needs
    res.json({
      stats: response.data.stats,
      files: response.data.files,
    });
  } catch (err) {
    handleGitHubError(err, res);
  }
}

/**
 * GET /api/branches?owner=X&repo=Y
 */
export async function getBranches(req, res) {
  const { owner, repo } = req.query;

  if (!validateRepoParams(owner, repo)) {
    return res.status(400).json({ error: "Invalid owner or repo" });
  }

  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/branches`,
      {
        params: { per_page: 10 },
        headers: buildHeaders(req),
      }
    );

    res.json(response.data);
  } catch (err) {
    handleGitHubError(err, res);
  }
}

/**
 * GET /api/contributors?owner=X&repo=Y
 */
export async function getContributors(req, res) {
  const { owner, repo } = req.query;

  if (!validateRepoParams(owner, repo)) {
    return res.status(400).json({ error: "Invalid owner or repo" });
  }

  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/contributors`,
      {
        params: { per_page: 15 },
        headers: buildHeaders(req),
      }
    );

    res.json(response.data);
  } catch (err) {
    handleGitHubError(err, res);
  }
}

/**
 * Centralized GitHub error handler.
 */
function handleGitHubError(err, res) {
  if (err.response) {
    const status = err.response.status;

    if (status === 403 || status === 429) {
      return res.status(429).json({
        error: "RATE_LIMIT",
        message: "GitHub API rate limit reached. Connect GitHub for higher limits.",
      });
    }

    if (status === 404) {
      return res.status(404).json({ error: "Repository not found" });
    }

    return res.status(status).json({
      error: `GitHub API error: ${status}`,
    });
  }

  console.error("[API Proxy Error]", err.message);
  res.status(500).json({ error: "Failed to reach GitHub API" });
}
