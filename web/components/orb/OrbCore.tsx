"use client";

import * as THREE from "three";
import { coreFragmentShader, coreVertexShader } from "@/components/orb/shaders";
import { useOrbUniforms } from "@/components/orb/useOrbUniforms";

export function OrbCore() {
  const uniforms = useOrbUniforms();

  return (
    <mesh scale={0.72}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={coreVertexShader}
        fragmentShader={coreFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

