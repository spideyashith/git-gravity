// server/controllers/authController.js
// GitHub OAuth flow — redirect to GitHub, exchange code for token.

import axios from "axios";

// In-memory session store: sessionId → access_token
// (Adequate for single-instance dev; swap for Redis in production)
const sessions = new Map();

/**
 * Redirect user to GitHub OAuth authorization page.
 */
export function redirectToGitHub(_req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.FRONTEND_URL ? "http://localhost:" + (process.env.PORT || 3001) : "http://localhost:3001"}/auth/github/callback`;

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "repo read:user");

  res.redirect(url.toString());
}

/**
 * Handle OAuth callback — exchange code for access_token, store in session.
 */
export async function handleCallback(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const { access_token, error: oauthError } = response.data;

    if (oauthError || !access_token) {
      console.error("[OAuth Error]", response.data);
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}?auth_error=token_exchange_failed`
      );
    }

    // Generate simple session ID
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, access_token);

    // Set session cookie (httpOnly, not accessible from JS)
    res.cookie("gg_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
      path: "/",
    });

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?auth=success`);
  } catch (err) {
    console.error("[OAuth Callback Error]", err.message);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}?auth_error=server_error`
    );
  }
}

/**
 * Get the stored access token for a session, or null.
 */
export function getTokenForSession(sessionId) {
  return sessions.get(sessionId) || null;
}

/**
 * Check if a request has a valid session.
 */
export function getAuthStatus(req, res) {
  const sessionId = req.cookies?.gg_session;
  const token = sessionId ? sessions.get(sessionId) : null;
  res.json({ authenticated: !!token });
}
