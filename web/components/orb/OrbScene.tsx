"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { OrbAura } from "@/components/orb/OrbAura";
import { OrbCore } from "@/components/orb/OrbCore";
import { OrbShell } from "@/components/orb/OrbShell";

export function OrbScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 7, 13]} />
        <ambientLight intensity={0.22} />
        <pointLight position={[-3.8, 2.6, 3]} intensity={2.4} color="#ddebff" />
        <pointLight position={[3.5, -2.2, 2.6]} intensity={1.2} color="#6ce7ff" />
        <group position={[-0.18, 0.02, 0]} rotation={[0.05, -0.18, 0]}>
          <OrbAura />
          <OrbCore />
          <OrbShell />
        </group>
        <Environment preset="night" />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.55} luminanceThreshold={0.16} luminanceSmoothing={0.72} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

