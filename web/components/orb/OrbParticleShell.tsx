"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { particleFragmentShader, particleVertexShader } from "@/components/orb/shaders";
import { useOrbUniforms } from "@/components/orb/useOrbUniforms";

const POINT_COUNT = 7600;

function buildSpherePoints() {
  const positions = new Float32Array(POINT_COUNT * 3);
  const seeds = new Float32Array(POINT_COUNT);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < POINT_COUNT; index += 1) {
    const y = 1 - (index / (POINT_COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
    seeds[index] = (index * 0.61803398875) % 1;
  }

  return { positions, seeds };
}

export function OrbParticleShell() {
  const uniforms = useOrbUniforms(true);
  const { positions, seeds } = useMemo(() => buildSpherePoints(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

