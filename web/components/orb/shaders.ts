export const shellVertexShader = `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
uniform float uTime;
uniform float uTension;
uniform float uUncertainty;
uniform float uConfidence;
uniform float uAlignment;
uniform float uResistance;
uniform float uRipple;
uniform float uTremor;
uniform float uCurl;
uniform float uImpact;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
                 mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
                 mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec3 p = position;
  float breath = sin(uTime * (0.55 + uAlignment * 0.35)) * (0.025 + uAlignment * 0.04);
  float slow = noise(normal * 2.4 + uTime * 0.08);
  float activeField = noise(normal * (5.0 + uUncertainty * 4.0) + vec3(uTime * 0.35, -uTime * 0.18, uTime * 0.22));
  float ring = sin((normal.y * 5.0 + normal.x * 2.2) - uTime * (2.2 + uConfidence * 1.8));
  float shock = sin((1.0 - normal.y) * 13.0 - uTime * 5.6) * exp(-abs(normal.y - 0.22) * 2.4) * uImpact;
  float curl = -uCurl * pow(max(0.0, 1.0 - normal.z), 1.6) * 0.11;
  float tremor = sin(uTime * 32.0 + normal.x * 18.0 + normal.y * 7.0) * uTremor * 0.026;
  float displacement =
    breath +
    (slow - 0.5) * 0.09 +
    (activeField - 0.5) * (0.08 + uUncertainty * 0.1) +
    ring * uRipple * 0.055 +
    shock * 0.105 +
    tremor +
    curl;
  p += normal * displacement;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const shellFragmentShader = `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
uniform float uTime;
uniform float uTension;
uniform float uUncertainty;
uniform float uConfidence;
uniform float uAlignment;
uniform float uResistance;
uniform float uGlow;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.12, 0.27, 0.41));
  p *= 19.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
                 mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
                 mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.15);
  vec3 flowNormal = normalize(normal + vec3(sin(uTime * 0.08) * 0.18, cos(uTime * 0.07) * 0.14, 0.0));
  float fieldA = noise(flowNormal * 1.65 + vec3(uTime * 0.11, -uTime * 0.08, uTime * 0.05));
  float fieldB = noise(flowNormal * 4.1 + vec3(-uTime * 0.22, uTime * 0.16, uTime * 0.12));
  float fieldC = noise(flowNormal * 8.5 + vec3(uTime * 0.31, uTime * 0.09, -uTime * 0.18));
  float latitudeFlow = sin(vUv.y * 10.0 + fieldA * 3.2 + uTime * (0.34 + uAlignment * 0.32));
  float meridianFlow = sin(vUv.x * 12.0 - fieldB * 2.4 - uTime * (0.28 + uTension * 0.5));
  float broadPool = smoothstep(0.28, 0.82, fieldA + latitudeFlow * 0.16);
  float driftingPool = smoothstep(0.34, 0.78, fieldB + meridianFlow * 0.13);
  float vein = smoothstep(0.38, 0.82, fieldC + latitudeFlow * 0.18);

  vec3 neutral = vec3(0.90, 0.94, 0.98);
  vec3 tension = vec3(0.64, 0.36, 1.0);
  vec3 uncertainty = vec3(0.45, 0.54, 0.68);
  vec3 confidence = vec3(0.83, 0.98, 1.0);
  vec3 alignment = vec3(0.42, 0.91, 1.0);
  vec3 resistance = vec3(0.29, 0.34, 0.40);

  vec3 color = neutral;
  color = mix(color, uncertainty, uUncertainty * (0.24 + broadPool * 0.72));
  color = mix(color, alignment, uAlignment * (0.20 + driftingPool * 0.66));
  color = mix(color, confidence, uConfidence * (0.22 + fresnel * 0.38 + (1.0 - broadPool) * 0.20));
  color = mix(color, tension, uTension * (0.18 + vein * 0.78));
  color = mix(color, resistance, uResistance * (0.34 + fresnel * 0.34 + (1.0 - driftingPool) * 0.18));

  vec3 seep = alignment * driftingPool * uAlignment * 0.18 + tension * vein * uTension * 0.16 + uncertainty * broadPool * uUncertainty * 0.14;
  float alpha = 0.28 + fresnel * 0.48 + uGlow * 0.16 + max(max(uTension, uAlignment), uUncertainty) * 0.06;
  float innerMilk = smoothstep(0.12, 0.88, fieldA) * 0.16;
  vec3 finalColor = color + seep + fresnel * vec3(0.22, 0.34, 0.44) + innerMilk;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export const coreVertexShader = `
varying vec3 vNormal;
varying vec3 vWorld;
uniform float uTime;
uniform float uUncertainty;
uniform float uGlow;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec3 p = position;
  p += normal * sin(uTime * 0.9) * (0.018 + uGlow * 0.03);
  p += normal * sin(position.y * 6.0 + uTime * 0.6) * uUncertainty * 0.035;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const coreFragmentShader = `
varying vec3 vNormal;
varying vec3 vWorld;
uniform float uGlow;
uniform float uConfidence;
uniform float uUncertainty;
uniform float uAlignment;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float center = pow(max(dot(normalize(vNormal), viewDir), 0.0), 1.8);
  vec3 clarity = vec3(0.82, 0.98, 1.0);
  vec3 cooperative = vec3(0.36, 0.86, 1.0);
  vec3 diffuse = vec3(0.46, 0.54, 0.70);
  vec3 color = mix(clarity, cooperative, uAlignment * 0.45);
  color = mix(color, diffuse, uUncertainty * 0.45);
  float alpha = (0.12 + uGlow * 0.42 + uConfidence * 0.16) * center;
  gl_FragColor = vec4(color, alpha);
}
`;

export const auraVertexShader = `
varying vec3 vNormal;
varying vec3 vWorld;
uniform float uTime;
uniform float uTension;
uniform float uAlignment;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec3 p = position;
  p += normal * sin(uTime * 0.45 + position.y * 2.4) * (0.025 + uAlignment * 0.04);
  p += normal * sin(uTime * 1.8 + position.x * 5.0) * uTension * 0.025;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const auraFragmentShader = `
varying vec3 vNormal;
varying vec3 vWorld;
uniform float uTension;
uniform float uUncertainty;
uniform float uConfidence;
uniform float uAlignment;
uniform float uResistance;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float rim = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 3.2);
  vec3 color = vec3(0.72, 0.86, 1.0);
  color = mix(color, vec3(0.64, 0.36, 1.0), uTension * 0.55);
  color = mix(color, vec3(0.42, 0.91, 1.0), uAlignment * 0.45);
  color = mix(color, vec3(0.45, 0.54, 0.68), uUncertainty * 0.35);
  color = mix(color, vec3(0.28, 0.32, 0.38), uResistance * 0.55);
  float alpha = rim * (0.12 + uConfidence * 0.08 + uAlignment * 0.08 + uTension * 0.10);
  gl_FragColor = vec4(color, alpha);
}
`;
