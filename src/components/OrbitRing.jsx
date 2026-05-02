// src/components/OrbitRing.jsx
// A subtle circular orbit ring rendered as a line.

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function OrbitRing({ radius, color = "#00ff88", opacity = 0.1 }) {
  const ref = useRef();

  const points = useMemo(() => {
    const pts = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        )
      );
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0005;
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}
