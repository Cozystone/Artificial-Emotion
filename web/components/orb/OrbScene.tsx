"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { OrbAura } from "@/components/orb/OrbAura";
import { OrbCore } from "@/components/orb/OrbCore";
import { OrbParticleShell } from "@/components/orb/OrbParticleShell";
import { OrbShell } from "@/components/orb/OrbShell";

export function OrbScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.8], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 7, 13]} />
        <ambientLight intensity={0.22} />
        <pointLight position={[-4.4, 3.0, 3.6]} intensity={2.6} color="#ddebff" />
        <pointLight position={[3.8, -2.6, 3.2]} intensity={1.35} color="#6ce7ff" />
        <group position={[-0.12, 0.02, 0]} rotation={[0.05, -0.18, 0]} scale={0.86}>
          <OrbAura />
          <OrbCore />
          <OrbShell />
          <OrbParticleShell />
        </group>
        <Environment preset="night" />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.68} luminanceThreshold={0.12} luminanceSmoothing={0.78} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
