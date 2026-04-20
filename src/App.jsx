import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Text } from "@react-three/drei";

// This component creates the "Satellite" (the commit)
function Satellite({ distance, speed, color, name }) {
  const satelliteRef = useRef();

  // useFrame runs 60 times per second to animate the orbit
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    satelliteRef.current.position.x = Math.cos(t) * distance;
    satelliteRef.current.position.z = Math.sin(t) * distance;
  });

  return (
    <group ref={satelliteRef}>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <Text position={[0, 0.4, 0]} fontSize={0.2} color="white">
        {name}
      </Text>
    </group>
  );
}

// This component creates the "Sun" (The Project Central Mass)
function RepositorySun() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1} />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.5} color="white">
        Main Repo
      </Text>
    </Float>
  );
}

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#050505" }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={["#050505"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={20} color="#ffcc00" />
        
        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls makeDefault />

        {/* The Visualization */}
        <RepositorySun />
        
        {/* Example Satellites (Later we will map these from Git Data) */}
        <Satellite distance={3} speed={0.5} color="#00ff88" name="feat: init" />
        <Satellite distance={5} speed={0.8} color="#ff4444" name="fix: bug" />
        <Satellite distance={7} speed={0.3} color="#00bbff" name="docs: update" />

      </Canvas>
    </div>
  );
}