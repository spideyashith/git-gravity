// src/components/Sun.jsx
// Multi-layer realistic sun with corona, solar flares, and pulsing light.

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

export default function Sun({ repoName = "REPOSITORY" }) {
  const coreMatRef = useRef();
  const innerCoronaRef = useRef();
  const outerCoronaRef = useRef();
  const flare1Ref = useRef();
  const flare2Ref = useRef();
  const flare3Ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core pulsing
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 1.2 + Math.sin(t * 1.5) * 0.3;
    }

    // Inner corona breathing
    if (innerCoronaRef.current) {
      const s = 1.0 + Math.sin(t * 0.8) * 0.03;
      innerCoronaRef.current.scale.set(s, s, s);
      innerCoronaRef.current.material.opacity = 0.12 + Math.sin(t * 2.0) * 0.04;
    }

    // Outer corona slow pulse
    if (outerCoronaRef.current) {
      outerCoronaRef.current.material.opacity = 0.05 + Math.sin(t * 0.5) * 0.02;
    }

    // Solar flare rotations
    if (flare1Ref.current) flare1Ref.current.rotation.z += 0.002;
    if (flare2Ref.current) flare2Ref.current.rotation.x += 0.0015;
    if (flare3Ref.current) flare3Ref.current.rotation.y += 0.001;
  });

  return (
    <Float speed={0.8} floatIntensity={0.2}>
      <group>
        {/* ── Core star ─────────────────────────── */}
        <mesh>
          <sphereGeometry args={[1.0, 64, 64]} />
          <meshStandardMaterial
            ref={coreMatRef}
            color="#ffaa00"
            emissive="#ff8800"
            emissiveIntensity={1.2}
            roughness={0.0}
            metalness={0.0}
          />
        </mesh>

        {/* ── Surface turbulence layer ──────────── */}
        <mesh>
          <sphereGeometry args={[1.02, 48, 48]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff4400"
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.0}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* ── Inner corona ─────────────────────── */}
        <mesh ref={innerCoronaRef}>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial
            color="#ffcc44"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* ── Outer corona ─────────────────────── */}
        <mesh ref={outerCoronaRef}>
          <sphereGeometry args={[1.7, 32, 32]} />
          <meshBasicMaterial
            color="#ffaa22"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* ── Far glow halo ────────────────────── */}
        <mesh>
          <sphereGeometry args={[2.5, 24, 24]} />
          <meshBasicMaterial
            color="#ff880044"
            transparent
            opacity={0.025}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* ── Solar flare ring 1 (equatorial) ──── */}
        <mesh ref={flare1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.4, 0.015, 8, 64]} />
          <meshBasicMaterial
            color="#ff6600"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* ── Solar flare ring 2 (tilted) ──────── */}
        <mesh ref={flare2Ref} rotation={[0.6, 0.8, 0]}>
          <torusGeometry args={[1.55, 0.01, 8, 64]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* ── Solar flare ring 3 (opposite tilt) ─ */}
        <mesh ref={flare3Ref} rotation={[-0.4, 0.2, 1.2]}>
          <torusGeometry args={[1.3, 0.012, 8, 64]} />
          <meshBasicMaterial
            color="#ffcc00"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* ── Point light from the sun ─────────── */}
        <pointLight color="#ffcc44" intensity={150} distance={100} decay={2} />
        <pointLight color="#ff6600" intensity={40} distance={50} decay={2} />

        {/* ── Repo name label ──────────────────── */}
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.45}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#004422"
        >
          {repoName.toUpperCase()}
        </Text>
      </group>
    </Float>
  );
}
