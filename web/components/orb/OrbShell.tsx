"use client";

import * as THREE from "three";
import { shellFragmentShader, shellVertexShader } from "@/components/orb/shaders";
import { useOrbUniforms } from "@/components/orb/useOrbUniforms";

export function OrbShell() {
  const uniforms = useOrbUniforms(true);

  return (
    <mesh>
      <sphereGeometry args={[1.52, 176, 176]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={shellVertexShader}
        fragmentShader={shellFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

