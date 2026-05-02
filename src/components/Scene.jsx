// src/components/Scene.jsx
// Orchestrates the full 3D scene — Canvas, lighting, environment, effects.

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  DepthOfField,
} from "@react-three/postprocessing";

import Sun from "./Sun.jsx";
import Planet from "./Planet.jsx";
import SpaceStation from "./SpaceStation.jsx";
import Spaceship from "./Spaceship.jsx";
import OrbitRing from "./OrbitRing.jsx";

export default function Scene({
  repoName,
  commits,
  branches,
  contributors,
  showStations,
  showShips,
  onSelectCommit,
  onSelectBranch,
  onSelectContributor,
}) {
  // Generate orbit ring radii from commit distances + station radii
  const ringRadii = useMemo(() => {
    const radii = new Set();
    commits.forEach((c) => radii.add(Math.round(c.distance)));
    if (showStations) {
      branches.forEach((b) => radii.add(Math.round(b.orbitRadius)));
    }
    return [...radii].sort((a, b) => a - b);
  }, [commits, branches, showStations]);

  return (
    <Canvas
      camera={{ position: [0, 18, 30], fov: 55 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: 3, // ACESFilmicToneMapping
        toneMappingExposure: 1.0,
      }}
      shadows
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* ── Lighting ──────────────────────────── */}
      <ambientLight intensity={0.08} color="#334466" />
      <pointLight position={[0, 0, 0]} intensity={80} color="#ffcc44" castShadow />
      <pointLight position={[30, 20, 30]} intensity={8} color="#4466aa" />
      <pointLight position={[-20, -10, -30]} intensity={4} color="#442266" />

      {/* ── Environment (HDR-like ambient) ─────── */}
      <Environment preset="night" />

      {/* ── Depth fog ─────────────────────────── */}
      <fog attach="fog" args={["#000008", 40, 120]} />

      {/* ── Starfield background ──────────────── */}
      <Stars
        radius={150}
        depth={100}
        count={5000}
        factor={5}
        saturation={0.3}
        fade
        speed={0.3}
      />

      {/* ── Camera controls ───────────────────── */}
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={4}
        maxDistance={90}
        maxPolarAngle={Math.PI * 0.88}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />

      {/* ── Central star ──────────────────────── */}
      <Sun repoName={repoName} />

      {/* ── Orbit rings ───────────────────────── */}
      {ringRadii.map((r) => (
        <OrbitRing key={`ring-${r}`} radius={r} />
      ))}

      {/* ── Commit planets ────────────────────── */}
      {commits.map((c) => (
        <Planet key={c.id} data={c} onClick={onSelectCommit} />
      ))}

      {/* ── Branch stations ───────────────────── */}
      {showStations &&
        branches.map((b) => (
          <SpaceStation key={b.name} branch={b} onClick={onSelectBranch} />
        ))}

      {/* ── Contributor spaceships ─────────────── */}
      {showShips &&
        contributors.map((cont) => (
          <Spaceship
            key={cont.login}
            contributor={cont}
            commits={commits}
            onClick={onSelectContributor}
          />
        ))}

      {/* ── Post-processing effects ───────────── */}
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.95}
          mipmapBlur
        />
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.08}
          bokehScale={1.5}
        />
        <Noise opacity={0.035} />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer>
    </Canvas>
  );
}
