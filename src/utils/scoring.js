// src/utils/scoring.js
// Centralised scoring, classification, and insight generation.

/**
 * Calculate an impact score for a commit.
 * Raw = additions * 0.5 + deletions * 0.3 + filesChanged * 2
 * Normalised to 0‑1 via log1p to compress outliers.
 */
export function calcImpactScore(additions = 0, deletions = 0, filesChanged = 0) {
  const raw = additions * 0.5 + deletions * 0.3 + filesChanged * 2;
  // log1p compresses large values; 8.5 is a reasonable ceiling for most repos
  return Math.min(Math.log1p(raw) / 8.5, 1);
}

/**
 * Map a 0‑1 impact score to visual / physics properties.
 */
export function mapScoreToPhysics(score) {
  if (score < 0.3) {
    return { size: 0.22, speed: 0.9, glow: 0.4, tier: "asteroid" };
  }
  if (score < 0.6) {
    return { size: 0.55, speed: 0.55, glow: 1.0, tier: "rocky" };
  }
  return { size: 1.4, speed: 0.25, glow: 2.5, tier: "gasGiant" };
}

/**
 * Classify a commit message into a type + colour.
 */
export function classifyCommit(message = "") {
  const msg = message.toLowerCase();
  if (msg.includes("feat") || msg.includes("add")) {
    return { type: "feature", color: "#00ff88" };
  }
  if (msg.includes("fix") || msg.includes("bug")) {
    return { type: "fix", color: "#ff4444" };
  }
  return { type: "general", color: "#ffffff" };
}

/**
 * Generate human‑readable insights from enriched commit + contributor data.
 * Returns an array of short insight strings.
 */
export function generateInsights(commits = [], contributors = []) {
  const insights = [];
  const scored = commits.filter((c) => c.impactScore != null);

  if (scored.length === 0) {
    insights.push("Waiting for commit data…");
    return insights;
  }

  // commit type balance
  const feats = scored.filter((c) => c.commitType === "feature").length;
  const fixes = scored.filter((c) => c.commitType === "fix").length;

  if (feats > fixes * 1.5) insights.push("⚡ Feature-heavy development phase");
  else if (fixes > feats * 1.5) insights.push("🛠 Bug-fix dominant repository");
  else insights.push("⚖ Balanced feature / fix distribution");

  // high-impact ratio
  const gasGiants = scored.filter((c) => c.tier === "gasGiant").length;
  if (gasGiants > scored.length * 0.3) {
    insights.push("🔥 High ratio of large-impact commits");
  }

  // most active contributor
  if (contributors.length > 0) {
    const top = [...contributors].sort(
      (a, b) => b.contributions - a.contributions
    )[0];
    insights.push(`🚀 Top contributor: ${top.login} (${top.contributions} commits)`);
  }

  // commit frequency
  if (scored.length >= 5) {
    const dates = scored
      .map((c) => new Date(c.date).getTime())
      .sort((a, b) => b - a);
    const spanDays = (dates[0] - dates[dates.length - 1]) / 86_400_000;
    const freq = spanDays > 0 ? (scored.length / spanDays).toFixed(1) : "∞";
    insights.push(`📈 ~${freq} commits / day (last ${Math.round(spanDays)} days)`);
  }

  return insights;
}
