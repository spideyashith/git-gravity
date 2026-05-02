// server/routes/authRoutes.js

import { Router } from "express";
import { redirectToGitHub, handleCallback, getAuthStatus } from "../controllers/authController.js";

const router = Router();

// Redirect user to GitHub for authorization
router.get("/github", redirectToGitHub);

// GitHub redirects back here with a code
router.get("/github/callback", handleCallback);

// Check if current session is authenticated
router.get("/status", getAuthStatus);

export default router;
