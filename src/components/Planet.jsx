// src/components/Planet.jsx
// Tier-specific celestial bodies: Asteroids, Rocky Planets, Gas Giants.
// Each tier has unique geometry, PBR materials, and visual effects.

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════
// ASTEROID — irregular dodecahedron, tumbling, rocky
// ═══════════════════════════════════════════════════════════════
function AsteroidModel({ color, glow, hovered }) {
  const geo = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(0.2, 1);
    // Jitter vertices for irregular rocky shape
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.06);
      pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.06);
      pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.06);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? glow * 1.5 : glow * 0.3}
        roughness={0.92}
        metalness={0.08}
        flatShading
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROCKY PLANET — sphere + atmosphere shell + optional ring
// ═══════════════════════════════════════════════════════════════
function RockyModel({ color, glow, hovered, hasRing }) {
  return (
    <group>
      {/* Core body */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? glow * 1.5 : glow * 0.5}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Surface detail layer */}
      <mesh>
        <sphereGeometry args={[0.51, 24, 24]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Thin atmosphere glow */}
      <mesh>
        <sphereGeometry args={[0.58, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.18 : 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Optional thin ring (for some rocky planets) */}
      {hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[0.75, 0.02, 4, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAS GIANT — large sphere + bands + ring system + atmosphere
// ═══════════════════════════════════════════════════════════════
function GasGiantModel({ color, glow, hovered }) {
  const bandMatRef = useRef();

  useFrame(({ clock }) => {
    if (bandMatRef.current) {
      bandMatRef.current.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05;
    }
  });

  // Darken/lighten the color for band variation
  const bandColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0, -0.1, -0.15);
    return "#" + c.getHexString();
  }, [color]);

  return (
    <group>
      {/* Core body */}
      <mesh>
        <sphereGeometry args={[1.2, 48, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? glow * 1.3 : glow}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Atmospheric bands (subtle overlay) */}
      <mesh>
        <sphereGeometry args={[1.22, 32, 8]} />
        <meshBasicMaterial
          ref={bandMatRef}
          color={bandColor}
          transparent
          opacity={0.2}
          wireframe={false}
          depthWrite={false}
        />
      </mesh>

      {/* Inner atmosphere */}
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.15 : 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.6, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Ring system — main ring */}
      <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
        <torusGeometry args={[1.8, 0.08, 4, 80]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
          roughness={0.7}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ring system — inner ring */}
      <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
        <torusGeometry args={[1.55, 0.04, 4, 80]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Ring system — outer ring */}
      <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
        <torusGeometry args={[2.05, 0.03, 4, 80]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Spot light from gas giant glow */}
      <pointLight color={color} intensity={5} distance={15} decay={2} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLANET WRAPPER — orbital motion + tier delegation
// ═══════════════════════════════════════════════════════════════
export default function Planet({ data, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  // Stable orbital tilt from sha
  const tilt = useMemo(() => {
    let h = 0;
    for (let i = 0; i < 8 && i < data.id.length; i++) {
      h += data.id.charCodeAt(i);
    }
    return (h % 100) * 0.01 * Math.PI * 0.5;
  }, [data.id]);

  // Whether rocky planet gets a ring (deterministic from sha)
  const hasRing = useMemo(() => data.id.charCodeAt(2) % 3 === 0, [data.id]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * data.speed;

    ref.current.position.x = Math.cos(t + tilt) * data.distance;
    ref.current.position.z = Math.sin(t + tilt) * data.distance;
    ref.current.position.y = Math.sin(t * 0.7 + tilt) * 1.2;

    // Self-rotation: asteroids tumble fast, gas giants turn slowly
    const rotSpeed = data.tier === "asteroid" ? 0.02 : data.tier === "gasGiant" ? 0.003 : 0.008;
    ref.current.rotation.y += rotSpeed;
    if (data.tier === "asteroid") {
      ref.current.rotation.x += 0.012;
      ref.current.rotation.z += 0.007;
    }
  });

  const scale = hovered ? 1.2 : 1;

  return (
    <group
      ref={ref}
      scale={[scale, scale, scale]}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      {data.tier === "asteroid" && (
        <AsteroidModel color={data.color} glow={data.glow} hovered={hovered} />
      )}
      {data.tier === "rocky" && (
        <RockyModel color={data.color} glow={data.glow} hovered={hovered} hasRing={hasRing} />
      )}
      {data.tier === "gasGiant" && (
        <GasGiantModel color={data.color} glow={data.glow} hovered={hovered} />
      )}
    </group>
  );
}
