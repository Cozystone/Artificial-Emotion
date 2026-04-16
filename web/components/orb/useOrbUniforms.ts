"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useInnerWeatherStore } from "@/store/useInnerWeatherStore";

type UniformMap = Record<string, THREE.IUniform<number>>;

export function useOrbUniforms(includeImpact = false) {
  const axes = useInnerWeatherStore((state) => state.axes);
  const visual = useInnerWeatherStore((state) => state.visual);
  const sendPulse = useInnerWeatherStore((state) => state.sendPulse);
  const lastPulse = useRef(sendPulse);

  const uniforms = useMemo<UniformMap>(
    () => ({
      uTime: { value: 0 },
      uTension: { value: axes.tension },
      uUncertainty: { value: axes.uncertainty },
      uConfidence: { value: axes.confidence },
      uAlignment: { value: axes.alignment },
      uResistance: { value: axes.resistance },
      uRipple: { value: visual.rippleAmplitude },
      uTremor: { value: visual.tremor },
      uCurl: { value: visual.inwardCurl },
      uGlow: { value: visual.glow },
      uImpact: { value: 0 },
    }),
    // Three uniforms are mutable render resources; they are initialized once and driven in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uTension.value = THREE.MathUtils.lerp(uniforms.uTension.value, axes.tension, 0.045);
    uniforms.uUncertainty.value = THREE.MathUtils.lerp(uniforms.uUncertainty.value, axes.uncertainty, 0.045);
    uniforms.uConfidence.value = THREE.MathUtils.lerp(uniforms.uConfidence.value, axes.confidence, 0.045);
    uniforms.uAlignment.value = THREE.MathUtils.lerp(uniforms.uAlignment.value, axes.alignment, 0.045);
    uniforms.uResistance.value = THREE.MathUtils.lerp(uniforms.uResistance.value, axes.resistance, 0.045);
    uniforms.uRipple.value = THREE.MathUtils.lerp(uniforms.uRipple.value, visual.rippleAmplitude, 0.06);
    uniforms.uTremor.value = THREE.MathUtils.lerp(uniforms.uTremor.value, visual.tremor, 0.06);
    uniforms.uCurl.value = THREE.MathUtils.lerp(uniforms.uCurl.value, visual.inwardCurl, 0.06);
    uniforms.uGlow.value = THREE.MathUtils.lerp(uniforms.uGlow.value, visual.glow, 0.05);

    if (includeImpact && lastPulse.current !== sendPulse) {
      lastPulse.current = sendPulse;
      uniforms.uImpact.value = 1;
    }
    uniforms.uImpact.value = Math.max(0, uniforms.uImpact.value - delta * 0.72);
  });

  return uniforms;
}
