"use client";

import * as THREE from "three";
import { auraFragmentShader, auraVertexShader } from "@/components/orb/shaders";
import { useOrbUniforms } from "@/components/orb/useOrbUniforms";

export function OrbAura() {
  const uniforms = useOrbUniforms();

  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[1.56, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={auraVertexShader}
        fragmentShader={auraFragmentShader}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
