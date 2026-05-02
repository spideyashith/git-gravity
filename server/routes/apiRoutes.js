// server/routes/apiRoutes.js

import { Router } from "express";
import {
  getCommits,
  getCommitDetail,
  getBranches,
  getContributors,
} from "../controllers/apiController.js";
import { getAuthStatus } from "../controllers/authController.js";

const router = Router();

// GitHub data proxies
router.get("/commits", getCommits);
router.get("/commits/:sha", getCommitDetail);
router.get("/branches", getBranches);
router.get("/contributors", getContributors);

// Auth status (also available at /auth/status, mirrored here for convenience)
router.get("/auth/status", getAuthStatus);

export default router;
