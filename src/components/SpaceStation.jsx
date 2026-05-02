// src/components/SpaceStation.jsx
// Detailed space station — ~15 geometry parts with PBR materials,
// rotating ring, docking arms, solar panels, antenna, window lights.

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ── Shared PBR material configs ────────────────────────────────
const HULL_MAT = { metalness: 0.8, roughness: 0.2 };
const PANEL_MAT = { metalness: 0.4, roughness: 0.3 };

export default function SpaceStation({ branch, onClick }) {
  const groupRef = useRef();
  const ringRef = useRef();
  const antennaLightRef = useRef();
  const [hovered, setHovered] = useState(false);

  const mainColor = branch.isDefault ? "#ccaa00" : "#0088cc";
  const accentColor = branch.isDefault ? "#ffdd44" : "#00ccff";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Orbital motion
    const ot = t * branch.orbitSpeed;
    groupRef.current.position.x = Math.cos(ot) * branch.orbitRadius;
    groupRef.current.position.z = Math.sin(ot) * branch.orbitRadius;
    groupRef.current.position.y = Math.sin(ot * 0.3) * 0.8;

    // Slow self-rotation
    groupRef.current.rotation.y += 0.003;

    // Rotating ring
    if (ringRef.current) ringRef.current.rotation.z += 0.008;

    // Blinking antenna light
    if (antennaLightRef.current) {
      antennaLightRef.current.material.opacity =
        Math.sin(t * 4) > 0 ? 0.9 : 0.1;
    }
  });

  const emissiveBoost = hovered ? 1.5 : 0.6;

  return (
    <group
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onClick(branch); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {/* ── Central Hub (cylinder) ─────────────── */}
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, 0.8, 16]} />
        <meshStandardMaterial
          color="#888899"
          emissive={mainColor}
          emissiveIntensity={emissiveBoost * 0.3}
          {...HULL_MAT}
        />
      </mesh>

      {/* ── Hub top cap ────────────────────────── */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#777788" {...HULL_MAT} />
      </mesh>

      {/* ── Hub bottom cap ─────────────────────── */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.25, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#777788" {...HULL_MAT} />
      </mesh>

      {/* ── Rotating Ring ──────────────────────── */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.06, 8, 40]} />
          <meshStandardMaterial
            color="#aaaabb"
            emissive={accentColor}
            emissiveIntensity={emissiveBoost * 0.4}
            {...HULL_MAT}
          />
        </mesh>
      </group>

      {/* ── Docking Arms (4 at 90° intervals) ──── */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <group key={`arm-${i}`} rotation={[0, angle, 0]}>
          {/* Arm strut */}
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
            <meshStandardMaterial color="#666677" {...HULL_MAT} />
          </mesh>

          {/* Docking port (emissive sphere) */}
          <mesh position={[0.75, 0, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={hovered ? 2.0 : 1.0}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}

      {/* ── Solar Panel Array — Left ───────────── */}
      <group position={[-1.0, 0, 0]}>
        {/* Support beam */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
          <meshStandardMaterial color="#555566" {...HULL_MAT} />
        </mesh>
        {/* Panel 1 */}
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[0.5, 0.015, 0.22]} />
          <meshStandardMaterial
            color="#2244aa"
            emissive="#2244aa"
            emissiveIntensity={0.4}
            {...PANEL_MAT}
          />
        </mesh>
        {/* Panel 2 */}
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[0.5, 0.015, 0.22]} />
          <meshStandardMaterial
            color="#2244aa"
            emissive="#2244aa"
            emissiveIntensity={0.4}
            {...PANEL_MAT}
          />
        </mesh>
      </group>

      {/* ── Solar Panel Array — Right ──────────── */}
      <group position={[1.0, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
          <meshStandardMaterial color="#555566" {...HULL_MAT} />
        </mesh>
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[0.5, 0.015, 0.22]} />
          <meshStandardMaterial
            color="#2244aa"
            emissive="#2244aa"
            emissiveIntensity={0.4}
            {...PANEL_MAT}
          />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[0.5, 0.015, 0.22]} />
          <meshStandardMaterial
            color="#2244aa"
            emissive="#2244aa"
            emissiveIntensity={0.4}
            {...PANEL_MAT}
          />
        </mesh>
      </group>

      {/* ── Antenna Mast ───────────────────────── */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 4]} />
        <meshStandardMaterial color="#888899" {...HULL_MAT} />
      </mesh>

      {/* ── Antenna Light (blinking) ───────────── */}
      <mesh ref={antennaLightRef} position={[0, 0.96, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial
          color="#ff3333"
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* ── Communication Dish (bottom) ────────── */}
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.08, 12, 1, true]} />
        <meshStandardMaterial
          color="#999999"
          side={THREE.DoubleSide}
          {...HULL_MAT}
        />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 4]} />
        <meshStandardMaterial color="#888899" {...HULL_MAT} />
      </mesh>

      {/* ── Window Lights (emissive dots on hull) ─ */}
      {[0.15, -0.15, 0].map((y, i) => (
        <mesh key={`win-${i}`} position={[0.26, y, 0]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#ffcc66" />
        </mesh>
      ))}
      {[0.15, -0.15, 0].map((y, i) => (
        <mesh key={`win2-${i}`} position={[-0.26, y, 0]}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#ffcc66" />
        </mesh>
      ))}

      {/* ── Station point light ────────────────── */}
      <pointLight color={accentColor} intensity={3} distance={8} decay={2} />

      {/* ── Hover tooltip ──────────────────────── */}
      {hovered && (
        <Html distanceFactor={12} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.9)",
              color: "#00ff88",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              border: "1px solid #00ff8844",
              whiteSpace: "nowrap",
              backdropFilter: "blur(8px)",
            }}
          >
            🏗 {branch.name}
            {branch.isDefault && " (default)"}
          </div>
        </Html>
      )}
    </group>
  );
}
