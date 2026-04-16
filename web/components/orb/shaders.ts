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
  float breath = sin(uTime * (0.62 + uAlignment * 0.35)) * (0.022 + uAlignment * 0.02);
  float slow = noise(normal * 2.1 + vec3(uTime * 0.12, -uTime * 0.08, uTime * 0.05));
  float activeField = noise(normal * (5.0 + uUncertainty * 4.0) + vec3(uTime * 0.35, -uTime * 0.18, uTime * 0.22));
  float livingCurrent = sin(normal.x * 4.6 + normal.y * 2.8 + uTime * 0.95) * 0.5 + 0.5;
  float ring = sin((normal.y * 5.0 + normal.x * 2.2) - uTime * (2.2 + uConfidence * 1.8));
  float shock = sin((1.0 - normal.y) * 13.0 - uTime * 5.6) * exp(-abs(normal.y - 0.22) * 2.4) * uImpact;
  float curl = -uCurl * pow(max(0.0, 1.0 - normal.z), 1.6) * 0.11;
  float tremor = sin(uTime * 32.0 + normal.x * 18.0 + normal.y * 7.0) * uTremor * 0.026;
  float displacement =
    breath +
    (slow - 0.5) * 0.05 +
    (livingCurrent - 0.5) * 0.018 +
    (activeField - 0.5) * (0.032 + uUncertainty * 0.035) +
    ring * uRipple * 0.026 +
    shock * 0.055 +
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
  float dominant = max(max(max(uConfidence, uAlignment), max(uTension, uUncertainty)), uResistance);
  vec3 flowNormal = normalize(normal + vec3(sin(uTime * 0.08) * 0.18, cos(uTime * 0.07) * 0.14, 0.0));
  float fieldA = noise(flowNormal * 1.65 + vec3(uTime * 0.11, -uTime * 0.08, uTime * 0.05));
  float fieldB = noise(flowNormal * 4.1 + vec3(-uTime * 0.22, uTime * 0.16, uTime * 0.12));
  float fieldC = noise(flowNormal * 8.5 + vec3(uTime * 0.31, uTime * 0.09, -uTime * 0.18));
  float livingField = noise(flowNormal * 2.35 + vec3(-uTime * 0.16, uTime * 0.13, uTime * 0.07));
  float latitudeFlow = sin(vUv.y * 10.0 + fieldA * 3.2 + uTime * (0.34 + uAlignment * 0.32));
  float meridianFlow = sin(vUv.x * 12.0 - fieldB * 2.4 - uTime * (0.28 + uTension * 0.5));
  float broadPool = smoothstep(0.28, 0.82, fieldA + latitudeFlow * 0.16);
  float driftingPool = smoothstep(0.34, 0.78, fieldB + meridianFlow * 0.13);
  float vein = smoothstep(0.38, 0.82, fieldC + latitudeFlow * 0.18);
  float confidenceRegion = smoothstep(0.42, 0.88, dot(normal, normalize(vec3(-0.24, 0.56, 0.79))) + livingField * 0.34);
  float alignmentRegion = smoothstep(0.32, 0.84, dot(normal, normalize(vec3(0.78, -0.15, 0.48))) + fieldA * 0.36);
  float tensionRegion = smoothstep(0.36, 0.82, dot(normal, normalize(vec3(-0.72, -0.36, 0.42))) + fieldC * 0.42);
  float uncertaintyRegion = smoothstep(0.26, 0.78, dot(normal, normalize(vec3(0.12, 0.82, -0.28))) + fieldB * 0.38);
  float resistanceRegion = smoothstep(0.38, 0.86, dot(normal, normalize(vec3(0.42, -0.72, -0.12))) + (1.0 - fieldA) * 0.32);

  vec3 neutral = vec3(0.22, 0.28, 0.36);
  vec3 milk = vec3(0.52, 0.62, 0.72);
  vec3 tension = vec3(0.72, 0.18, 0.92);
  vec3 uncertainty = vec3(0.34, 0.44, 0.70);
  vec3 confidence = vec3(0.66, 0.96, 1.0);
  vec3 alignment = vec3(0.10, 0.80, 0.98);
  vec3 resistance = vec3(0.18, 0.22, 0.30);
  vec3 dominantColor = confidence;
  if (uAlignment > uConfidence && uAlignment > uTension && uAlignment > uUncertainty && uAlignment > uResistance) {
    dominantColor = alignment;
  }
  if (uTension > uConfidence && uTension > uAlignment && uTension > uUncertainty && uTension > uResistance) {
    dominantColor = tension;
  }
  if (uUncertainty > uConfidence && uUncertainty > uAlignment && uUncertainty > uTension && uUncertainty > uResistance) {
    dominantColor = uncertainty;
  }
  if (uResistance > uConfidence && uResistance > uAlignment && uResistance > uTension && uResistance > uUncertainty) {
    dominantColor = resistance;
  }

  float confidenceWeight = (0.26 + uConfidence * 1.25) * confidenceRegion;
  float alignmentWeight = (0.22 + uAlignment * 1.30) * alignmentRegion;
  float tensionWeight = (0.10 + uTension * 1.45) * tensionRegion;
  float uncertaintyWeight = (0.14 + uUncertainty * 1.30) * uncertaintyRegion;
  float resistanceWeight = (0.06 + uResistance * 1.35) * resistanceRegion;
  float totalWeight = confidenceWeight + alignmentWeight + tensionWeight + uncertaintyWeight + resistanceWeight + 0.001;

  vec3 regionColor =
    confidence * confidenceWeight +
    alignment * alignmentWeight +
    tension * tensionWeight +
    uncertainty * uncertaintyWeight +
    resistance * resistanceWeight;
  regionColor /= totalWeight;

  vec3 baseFlow = mix(neutral, milk, 0.18 + livingField * 0.16);
  vec3 color = mix(baseFlow, regionColor, clamp(totalWeight * 0.92, 0.42, 0.98));
  color = mix(color, tension, uTension * vein * 0.62);
  color = mix(color, uncertainty, uUncertainty * broadPool * 0.42);
  color = mix(color, dominantColor, clamp((dominant - 0.18) * 1.25, 0.0, 0.46));

  vec3 seep =
    confidence * confidenceRegion * uConfidence * 0.18 +
    alignment * driftingPool * (0.10 + uAlignment * 0.18) +
    tension * vein * uTension * 0.22 +
    uncertainty * broadPool * uUncertainty * 0.18;
  float alpha = 0.46 + fresnel * 0.18 + uGlow * 0.05;
  float innerMilk = smoothstep(0.10, 0.86, fieldA) * 0.12;
  vec3 finalColor = color * 1.08 + seep + fresnel * vec3(0.10, 0.18, 0.24) + innerMilk * 0.45;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export const particleVertexShader = `
attribute float aSeed;
varying float vAlpha;
varying vec3 vColor;
varying vec2 vUvPoint;
uniform float uTime;
uniform float uTension;
uniform float uUncertainty;
uniform float uConfidence;
uniform float uAlignment;
uniform float uResistance;
uniform float uRipple;
uniform float uTremor;
uniform float uGlow;
uniform float uImpact;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.19, 0.37, 0.53));
  p *= 23.0;
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
  vec3 n = normalize(position);
  float longitude = atan(n.z, n.x);
  float latitude = asin(clamp(n.y, -1.0, 1.0));
  float breath = sin(uTime * 0.7 + n.y * 1.8) * 0.018;
  float membrane = noise(n * 2.8 + vec3(uTime * 0.16, -uTime * 0.11, uTime * 0.06));
  float ribbonA = sin(n.x * 9.0 + n.y * 5.0 + membrane * 3.5 + uTime * 0.55);
  float ribbonB = sin(n.y * 11.0 - n.z * 7.0 + uTime * (0.38 + uTension * 0.8));
  float panel = smoothstep(0.12, 0.96, abs(ribbonA)) * smoothstep(-0.65, 0.92, ribbonB);
  float guideEquator = smoothstep(0.11, 0.0, abs(latitude - 0.18));
  float guideMeridian = smoothstep(0.10, 0.0, abs(longitude + 1.12));
  float guideCluster = smoothstep(0.22, 0.0, distance(n, normalize(vec3(0.62, 0.54, -0.56))));
  float guideSignal = max(max(guideEquator * 0.9, guideMeridian), guideCluster * 1.3);
  float shock = sin((1.0 - n.y) * 13.0 - uTime * 5.6) * exp(-abs(n.y - 0.22) * 2.4) * uImpact;
  float displacement = breath + (membrane - 0.5) * 0.055 + panel * (0.015 + uRipple * 0.025) + guideSignal * 0.012 + shock * 0.05;
  vec3 p = n * (1.485 + displacement);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float rim = pow(1.0 - max(dot(n, normalize(cameraPosition - (modelMatrix * vec4(p, 1.0)).xyz)), 0.0), 1.8);
  float confidenceRegion = smoothstep(0.36, 0.88, dot(n, normalize(vec3(-0.24, 0.56, 0.79))) + membrane * 0.34);
  float alignmentRegion = smoothstep(0.30, 0.84, dot(n, normalize(vec3(0.78, -0.15, 0.48))) + noise(n * 2.0 + uTime * 0.11) * 0.36);
  float tensionRegion = smoothstep(0.34, 0.84, dot(n, normalize(vec3(-0.72, -0.36, 0.42))) + noise(n * 5.0 - uTime * 0.18) * 0.42);
  float uncertaintyRegion = smoothstep(0.28, 0.80, dot(n, normalize(vec3(0.12, 0.82, -0.28))) + noise(n * 3.4 + uTime * 0.14) * 0.38);
  float resistanceRegion = smoothstep(0.38, 0.86, dot(n, normalize(vec3(0.42, -0.72, -0.12))) + (1.0 - membrane) * 0.32);

  vec3 neutral = vec3(0.70, 0.80, 0.90);
  vec3 confidence = vec3(0.72, 0.98, 1.0);
  vec3 alignment = vec3(0.22, 0.88, 1.0);
  vec3 tension = vec3(0.76, 0.26, 0.98);
  vec3 uncertainty = vec3(0.42, 0.56, 0.78);
  vec3 resistance = vec3(0.28, 0.34, 0.44);
  vec3 dominantColor = confidence;
  float dominant = max(max(max(uConfidence, uAlignment), max(uTension, uUncertainty)), uResistance);
  if (uAlignment > uConfidence && uAlignment > uTension && uAlignment > uUncertainty && uAlignment > uResistance) {
    dominantColor = alignment;
  }
  if (uTension > uConfidence && uTension > uAlignment && uTension > uUncertainty && uTension > uResistance) {
    dominantColor = tension;
  }
  if (uUncertainty > uConfidence && uUncertainty > uAlignment && uUncertainty > uTension && uUncertainty > uResistance) {
    dominantColor = uncertainty;
  }
  if (uResistance > uConfidence && uResistance > uAlignment && uResistance > uTension && uResistance > uUncertainty) {
    dominantColor = resistance;
  }
  vec3 regionColor = neutral;
  regionColor = mix(regionColor, confidence, confidenceRegion * (0.28 + uConfidence * 1.05));
  regionColor = mix(regionColor, alignment, alignmentRegion * (0.22 + uAlignment * 1.05));
  regionColor = mix(regionColor, tension, tensionRegion * (0.08 + uTension * 1.20));
  regionColor = mix(regionColor, uncertainty, uncertaintyRegion * (0.12 + uUncertainty * 1.05));
  regionColor = mix(regionColor, resistance, resistanceRegion * (0.04 + uResistance * 1.05));
  regionColor = mix(regionColor, dominantColor, clamp((dominant - 0.18) * 1.3, 0.0, 0.52));

  float dotLife = 0.58 + 0.42 * sin(aSeed * 31.0 + uTime * (0.7 + uTremor * 1.8));
  float panelLight = 0.24 + panel * 0.26 + rim * 0.16 + uGlow * 0.12 + guideSignal * 0.62;
  vAlpha = clamp(panelLight * dotLife, 0.14, 0.92);
  vColor = mix(regionColor * (0.86 + panel * 0.30 + rim * 0.22), vec3(0.95, 0.98, 1.0), guideSignal * 0.55);
  gl_PointSize = (6.6 + panel * 3.2 + rim * 2.2 + guideSignal * 5.4) / max(1.2, -mvPosition.z);
}
`;

export const particleFragmentShader = `
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float radius = dot(centered, centered);
  if (radius > 0.25) {
    discard;
  }
  float soft = smoothstep(0.25, 0.02, radius);
  gl_FragColor = vec4(vColor, vAlpha * soft);
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
  vec3 clarity = vec3(0.54, 0.84, 0.96);
  vec3 cooperative = vec3(0.22, 0.66, 0.88);
  vec3 diffuse = vec3(0.30, 0.38, 0.52);
  vec3 color = mix(clarity, cooperative, uAlignment * 0.45);
  color = mix(color, diffuse, uUncertainty * 0.45);
  float alpha = (0.04 + uGlow * 0.14 + uConfidence * 0.08) * center;
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
  p += normal * sin(uTime * 0.62 + position.y * 2.4) * (0.045 + uAlignment * 0.04);
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
  vec3 color = vec3(0.28, 0.36, 0.48);
  color = mix(color, vec3(0.64, 0.36, 1.0), uTension * 0.55);
  color = mix(color, vec3(0.42, 0.91, 1.0), uAlignment * 0.45);
  color = mix(color, vec3(0.45, 0.54, 0.68), uUncertainty * 0.35);
  color = mix(color, vec3(0.28, 0.32, 0.38), uResistance * 0.55);
  float alpha = rim * (0.06 + uConfidence * 0.04 + uAlignment * 0.05 + uTension * 0.07);
  gl_FragColor = vec4(color, alpha);
}
`;
