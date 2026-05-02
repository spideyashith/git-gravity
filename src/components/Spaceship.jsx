// src/components/Spaceship.jsx
// Detailed futuristic spaceship — multi-part geometry with PBR materials,
// engine glow animation, delta wings, cockpit canopy, and glowing trail.

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { hashColor, hslToHex } from "../utils/helpers.js";

const TRAIL_LENGTH = 50;

export default function Spaceship({ contributor, commits, onClick }) {
  const groupRef = useRef();
  const trailRef = useRef();
  const engineGlow1Ref = useRef();
  const engineGlow2Ref = useRef();
  const trailPositions = useRef(new Float32Array(TRAIL_LENGTH * 3).fill(0));
  const frameCount = useRef(0);

  // Deterministic colour from contributor login
  const hsl = useMemo(() => hashColor(contributor.login), [contributor.login]);
  const hex = useMemo(() => hslToHex(hsl), [hsl]);

  // Darker hull variant
  const hullColor = useMemo(() => {
    const c = new THREE.Color(hex);
    c.offsetHSL(0, -0.1, -0.1);
    return "#" + c.getHexString();
  }, [hex]);

  // Commits by this contributor
  const authorCommits = useMemo(() => {
    return commits.filter(
      (c) => c.authorLogin === contributor.login || c.author === contributor.login
    );
  }, [commits, contributor.login]);

  // Orbit parameters
  const orbitRadius = useMemo(() => 4 + (contributor.id % 20) * 1.8, [contributor.id]);
  const orbitSpeed = useMemo(
    () => 0.15 + (contributor.contributions % 10) * 0.03,
    [contributor.contributions]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime() * orbitSpeed;
    const x = Math.cos(t) * orbitRadius;
    const z = Math.sin(t) * orbitRadius;
    const y = Math.sin(t * 1.3) * 2 + 2;

    groupRef.current.position.set(x, y, z);

    // Point forward along orbit
    const lookX = -Math.sin(t) * orbitRadius;
    const lookZ = Math.cos(t) * orbitRadius;
    groupRef.current.lookAt(x + lookX * 0.1, y, z + lookZ * 0.1);

    // Engine glow pulsing
    const enginePulse = 1.0 + Math.sin(clock.getElapsedTime() * 8) * 0.3;
    if (engineGlow1Ref.current) {
      engineGlow1Ref.current.material.emissiveIntensity = enginePulse * 2;
      const s = 0.8 + Math.sin(clock.getElapsedTime() * 12) * 0.2;
      engineGlow1Ref.current.scale.set(s, s, s);
    }
    if (engineGlow2Ref.current) {
      engineGlow2Ref.current.material.emissiveIntensity = enginePulse * 2;
      const s = 0.8 + Math.sin(clock.getElapsedTime() * 12 + 1) * 0.2;
      engineGlow2Ref.current.scale.set(s, s, s);
    }

    // Update trail
    frameCount.current++;
    if (frameCount.current % 2 === 0) {
      const pos = trailPositions.current;
      for (let i = pos.length - 3; i >= 3; i -= 3) {
        pos[i] = pos[i - 3];
        pos[i + 1] = pos[i - 2];
        pos[i + 2] = pos[i - 1];
      }
      pos[0] = x;
      pos[1] = y;
      pos[2] = z;

      if (trailRef.current) {
        trailRef.current.geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(pos), 3)
        );
        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick({ ...contributor, commitCount: authorCommits.length, hexColor: hex });
        }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        {/* ── Fuselage (elongated capsule body) ──── */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.06, 0.3, 8, 12]} />
          <meshStandardMaterial
            color={hullColor}
            emissive={hex}
            emissiveIntensity={0.3}
            metalness={0.75}
            roughness={0.2}
          />
        </mesh>

        {/* ── Nose cone ────────────────────────── */}
        <mesh position={[0, 0, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.06, 0.12, 8]} />
          <meshStandardMaterial
            color={hullColor}
            metalness={0.8}
            roughness={0.15}
          />
        </mesh>

        {/* ── Cockpit canopy (glass-like) ──────── */}
        <mesh position={[0, 0.04, -0.15]}>
          <sphereGeometry args={[0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#88ccff"
            emissive="#4488cc"
            emissiveIntensity={0.4}
            metalness={0.1}
            roughness={0.05}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* ── Left Wing (delta shape) ──────────── */}
        <mesh position={[-0.15, -0.01, 0.05]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.22, 0.008, 0.18]} />
          <meshStandardMaterial
            color={hullColor}
            emissive={hex}
            emissiveIntensity={0.15}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* ── Right Wing ───────────────────────── */}
        <mesh position={[0.15, -0.01, 0.05]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.22, 0.008, 0.18]} />
          <meshStandardMaterial
            color={hullColor}
            emissive={hex}
            emissiveIntensity={0.15}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* ── Left Wingtip Light ───────────────── */}
        <mesh position={[-0.27, -0.01, 0.05]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#ff3333" />
        </mesh>

        {/* ── Right Wingtip Light ──────────────── */}
        <mesh position={[0.27, -0.01, 0.05]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#33ff33" />
        </mesh>

        {/* ── Tail Fin (vertical stabilizer) ───── */}
        <mesh position={[0, 0.06, 0.18]}>
          <boxGeometry args={[0.008, 0.1, 0.1]} />
          <meshStandardMaterial
            color={hullColor}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* ── Left Engine Nacelle ──────────────── */}
        <mesh position={[-0.08, -0.02, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
          <meshStandardMaterial
            color="#555566"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>

        {/* ── Right Engine Nacelle ─────────────── */}
        <mesh position={[0.08, -0.02, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
          <meshStandardMaterial
            color="#555566"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>

        {/* ── Left Engine Glow ─────────────────── */}
        <mesh ref={engineGlow1Ref} position={[-0.08, -0.02, 0.27]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color={hex}
            emissive={hex}
            emissiveIntensity={2.0}
            metalness={0.0}
            roughness={0.0}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* ── Right Engine Glow ────────────────── */}
        <mesh ref={engineGlow2Ref} position={[0.08, -0.02, 0.27]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color={hex}
            emissive={hex}
            emissiveIntensity={2.0}
            metalness={0.0}
            roughness={0.0}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* ── Engine area point light ──────────── */}
        <pointLight
          position={[0, -0.02, 0.3]}
          color={hex}
          intensity={2}
          distance={5}
          decay={2}
        />
      </group>

      {/* ── Motion Trail ───────────────────────── */}
      <line ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={trailPositions.current}
            count={TRAIL_LENGTH}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={hex} transparent opacity={0.3} />
      </line>
    </>
  );
}
