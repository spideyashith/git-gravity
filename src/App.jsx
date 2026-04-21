import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Text } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/* ================= CONFIG ================= */
const OWNER = "spideyashith";
const REPO = "AndriodstudybuddyApp";
const CACHE_PREFIX = "gg_commit_";

/* ================= DATA ================= */

async function fetchCommits() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=30`
  );
  const data = await res.json();

  return data.map((c, index) => {
    const msg = c.commit.message.toLowerCase();

    const isFix = msg.includes("fix") || msg.includes("bug");
    const isFeat = msg.includes("feat") || msg.includes("add");

    return {
      id: c.sha,
      message: c.commit.message.split("\n")[0],
      author: c.commit.author.name,
      date: c.commit.author.date,
      type: isFeat ? "feature" : isFix ? "fix" : "general",

      distance: 5 + (data.length - index) * 1.5,

      size: 0.4,
      speed: 0.4,
      glow: 1,

      color: isFeat ? "#00ff88" : isFix ? "#ff4444" : "#ffffff",
      impactScore: null
    };
  });
}

function getCache(sha) {
  try {
    return JSON.parse(localStorage.getItem(CACHE_PREFIX + sha));
  } catch {
    return null;
  }
}

function setCache(sha, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + sha, JSON.stringify(data));
  } catch {}
}

function normalize(add, del, files) {
  const score =
    Math.log1p(add) * 0.5 +
    Math.log1p(del) * 0.3 +
    Math.log1p(files) * 0.2;

  return Math.min(score / 6.5, 1);
}

function mapScore(score) {
  if (score < 0.3) return { size: 0.4, speed: 1.0, glow: 0.6, color: "#ffffff" };
  if (score < 0.6) return { size: 0.8, speed: 0.6, glow: 1.2, color: "#00ff88" };
  if (score < 0.9) return { size: 1.4, speed: 0.35, glow: 2, color: "#ffff00" };
  return { size: 2.0, speed: 0.2, glow: 3, color: "#ff9900" };
}

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
    glow: physics.glow,
    color: physics.color
  };
}

async function enrich(commits) {
  const limited = commits.slice(0, 20);

  const enriched = await Promise.all(
    limited.map(async (c) => {
      const cached = getCache(c.id);
      if (cached) return applyStats(c, cached);

      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/commits/${c.id}`
      );

      if (!res.ok) return c;

      const data = await res.json();
      setCache(c.id, data);

      return applyStats(c, data);
    })
  );

  return [...enriched, ...commits.slice(20)];
}

/* ================= INSIGHT ================= */

function generateInsights(commits) {
  const valid = commits.filter(c => c.impactScore !== null);

  if (valid.length === 0) return "Analyzing repository...";

  const high = valid.filter(c => c.impactScore > 0.7).length;
  const fixes = valid.filter(c => c.type === "fix").length;
  const feats = valid.filter(c => c.type === "feature").length;

  if (high > valid.length * 0.4)
    return "High impact development phase detected";

  if (fixes > feats)
    return "Bug-fix dominant repository";

  if (feats > fixes)
    return "Feature-heavy development";

  return "Balanced commit distribution";
}

/* ================= 3D ================= */

function Satellite({ data, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * data.speed;
    const tilt = data.id.charCodeAt(0) * 0.01;

    ref.current.position.x = Math.cos(t) * data.distance;
    ref.current.position.z = Math.sin(t) * data.distance;
    ref.current.position.y = Math.sin(t + tilt) * 1.5;
  });

  return (
    <mesh
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[hovered ? data.size * 1.2 : data.size, 16, 16]} />
      <meshStandardMaterial
        color={data.color}
        emissive={data.color}
        emissiveIntensity={hovered ? data.glow * 2 : data.glow}
      />
    </mesh>
  );
}

function Sun() {
  return (
    <Float>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1.2} />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.4} color="#00ff88">
        {REPO.toUpperCase()}
      </Text>
    </Float>
  );
}

/* 🔥 FINAL FIXED ORBIT RINGS */
function OrbitRing({ radius }) {
  const ref = useRef();

  const points = [];
  const segments = 128;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * 0.1,
        Math.sin(angle) * radius
      )
    );
  }

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0008;
  });

  return (
    <line ref={ref}>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color="#00ff88" opacity={0.12} transparent />
    </line>
  );
}

/* ================= APP ================= */

export default function App() {
  const [commits, setCommits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(true);

  useEffect(() => {
    async function load() {
      const base = await fetchCommits();
      setCommits(base);

      const enriched = await enrich(base);
      setCommits(enriched);

      setEnriching(false);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = commits.filter(c => filter === "all" || c.type === filter);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      
      {/* UI */}
      <div style={{ position: "absolute", top: 20, left: 20, color: "#00ff88" }}>
        <h2>GIT GRAVITY</h2>

        <button onClick={() => setFilter("all")}>ALL</button>
        <button onClick={() => setFilter("feature")}>FEAT</button>
        <button onClick={() => setFilter("fix")}>FIX</button>

        {loading && <p>LOADING...</p>}
        {enriching && <p>ANALYZING COMMITS...</p>}

        <p style={{ fontSize: 12 }}>
          SYSTEM_ANALYSIS: {generateInsights(commits)}
        </p>
      </div>

      {/* DETAILS */}
      {selected && (
        <div style={{
          position: "absolute",
          right: 20,
          top: 20,
          color: "#00ff88",
          background: "rgba(0,0,0,0.8)",
          padding: 15
        }}>
          <p>{selected.message}</p>
          <p>Author: {selected.author}</p>

          {selected.impactScore !== null && (
            <>
              <p>Score: {selected.impactScore.toFixed(2)}</p>
              <p>
                Tier: {
                  selected.impactScore < 0.3 ? "Minor" :
                  selected.impactScore < 0.6 ? "Moderate" :
                  selected.impactScore < 0.9 ? "Significant" :
                  "Gas Giant"
                }
              </p>
            </>
          )}
        </div>
      )}

      {/* 3D */}
      <Canvas camera={{ position: [0, 15, 25] }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={100} />

        <Stars />
        <OrbitControls />

        <Sun />

        {[6, 8, 10, 12, 14, 16].map((r) => (
          <OrbitRing key={r} radius={r} />
        ))}

        {filtered.map(c => (
          <Satellite key={c.id} data={c} onClick={() => setSelected(c)} />
        ))}

        <EffectComposer>
          <Bloom intensity={0.8} />
          <Noise opacity={0.05} />
          <Vignette />
        </EffectComposer>
      </Canvas>
    </div>
  );
}