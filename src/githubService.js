// src/githubService.js

const CACHE_PREFIX = "gg_commit_";

// --------------------
// STEP 1: FETCH COMMITS
// --------------------
export const fetchCommits = async (owner, repo) => {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`
    );

    const data = await res.json();

    return data.map((commit, index) => {
      const msg = commit.commit.message.toLowerCase();

      const isFix = msg.includes("fix") || msg.includes("bug");
      const isFeat = msg.includes("feat") || msg.includes("add");

      return {
        id: commit.sha,
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author.name,
        date: commit.commit.author.date,

        type: isFeat ? "feature" : isFix ? "fix" : "general",

        // Phase 1 fallback (will be replaced later)
        size: 0.25,
        speed: 0.4,

        distance: 5 + (data.length - index) * 1.5,
        color: isFeat ? "#00ff88" : isFix ? "#ff4444" : "#ffffff",

        // Phase 2 fields
        impactScore: null
      };
    });
  } catch {
    return [];
  }
};

// --------------------
// STEP 2: CACHE
// --------------------
function getCached(sha) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + sha);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache(sha, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + sha, JSON.stringify(data));
  } catch {}
}

// --------------------
// STEP 3: NORMALIZATION
// --------------------
function normalize(add, del, files) {
  const score =
    Math.log1p(add) * 0.5 +
    Math.log1p(del) * 0.3 +
    Math.log1p(files) * 0.2;

  return Math.min(score / 6.5, 1);
}

// --------------------
// STEP 4: PHYSICS MAPPING
// --------------------
function mapScore(score) {
  if (score < 0.3)
    return { size: 0.2, speed: 0.8, glow: 0.5 };

  if (score < 0.6)
    return { size: 0.5, speed: 0.5, glow: 1 };

  if (score < 0.9)
    return { size: 1.0, speed: 0.3, glow: 1.5 };

  return { size: 2.0, speed: 0.15, glow: 2.5 };
}
// --------------------
// STEP 5: ENRICH
// --------------------
export async function enrichCommits(commits, owner, repo) {
  const limited = commits.slice(0, 20); // keep safe for rate limit

  const results = await Promise.all(
    limited.map(async (c) => {
      const cached = getCached(c.id);
      if (cached) return applyStats(c, cached);

      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits/${c.id}`
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

  return [...results, ...commits.slice(20)];
}

// --------------------
// APPLY STATS
// --------------------
function applyStats(commit, data) {
  const add = data.stats?.additions || 0;
  const del = data.stats?.deletions || 0;
  const files = data.files?.length || 0;

  const score = normalize(add, del, files);
  const physics = mapScore(score);

  return {
    ...commit,
    impactScore: score,
    size: physics.size,
    speed: physics.speed,
    glow: physics.glow
  };
}