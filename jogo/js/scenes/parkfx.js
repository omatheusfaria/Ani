import * as THREE from 'three';

// ===============================================================
// Luz de cinema do parque (noite de outubro, luzes quentes)
//
// Um passe de tela cheia depois da cena (ver PixelRenderer: lightPass):
//  • halo das lâmpadas no ar: a névoa espalhando a luz de cada lâmpada,
//    calculado de forma ANALÍTICA (a integral exata da luz ao longo do
//    raio), então é liso, sem serrilhado e sem ruído de raymarch.
//    O halo termina onde o raio bate na cena, então as barracas na
//    frente escondem o brilho do que está atrás;
//  • névoa de profundidade (mais densa perto do chão), azul-violeta,
//    separando os planos: barracas → carrossel → roda-gigante → cidade;
//  • profundidade de campo: o fundo fica levemente desfocado e as
//    lâmpadas longe viram bolinhas macias (bokeh).
// Mais: partículas (mariposas nas lâmpadas, poeira dourada e vapor).
// ===============================================================

export const MAX_GLOWS = 24;

const passVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const compFrag = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform mat4 uProjInv;
uniform mat4 uCamWorld;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uL[${MAX_GLOWS}];   // posição + tamanho do núcleo
uniform vec4 uC[${MAX_GLOWS}];   // cor * força + alcance
uniform int uN;
uniform float uGlowGain;
uniform vec3 uFogCol;
uniform float uFogDen;
uniform float uFogFloor;
uniform float uDof;              // raio máximo do desfoque (pixels)
uniform vec2 uFocus;             // distância nítida: começo e fim da transição
varying vec2 vUv;

vec3 worldAt(vec2 uv, float d) {
  vec4 v = uProjInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
  v /= v.w;
  return (uCamWorld * v).xyz;
}

float cocAt(float dist) {
  // longe: desfoca aos poucos; perto demais da câmera: desfoca também
  return uDof * (smoothstep(uFocus.x, uFocus.y, dist) + 0.8 * (1.0 - smoothstep(1.2, 2.4, dist)));
}

void main() {
  float d = texture2D(tDepth, vUv).x;
  bool sky = d >= 0.99999;
  vec3 O = uCamWorld[3].xyz;
  vec3 P = worldAt(vUv, min(d, 0.99999));
  vec3 D = P - O;
  float dist = sky ? 140.0 : length(D);
  D = normalize(D);

  // --- profundidade de campo (disco de Vogel, 12 amostras) ---
  vec3 col = texture2D(tScene, vUv).rgb;
  float coc = cocAt(dist);
  if (coc > 0.25) {
    vec3 acc = col;
    float wsum = 1.0;
    for (int i = 0; i < 12; i++) {
      float fi = float(i) + 0.5;
      float r = sqrt(fi / 12.0) * coc;
      float a = fi * 2.39996;
      vec2 o = vec2(cos(a), sin(a)) * r / uRes;
      float ds = texture2D(tDepth, vUv + o).x;
      float dd = ds >= 0.99999 ? 140.0 : length(worldAt(vUv + o, ds) - O);
      // uma amostra nítida (mais perto) não vaza para o fundo desfocado
      float w = dd >= dist * 0.8 ? 1.0 : clamp(cocAt(dd) / coc, 0.0, 1.0);
      acc += texture2D(tScene, vUv + o).rgb * w;
      wsum += w;
    }
    col = acc / wsum;
  }

  // --- névoa de profundidade (mais densa embaixo) ---
  if (!sky) {
    float hgt = exp(-max(P.y, 0.0) * 0.22);
    float f = (1.0 - exp(-uFogDen * max(dist - 3.0, 0.0))) * mix(0.55, 1.0, hgt);
    col = mix(col, uFogCol, clamp(f, 0.0, 0.92));
    // um véu bem leve no chão perto da câmera
    col += uFogCol * uFogFloor * hgt * smoothstep(2.0, 9.0, dist);
  }

  // --- halo das lâmpadas na névoa (integral exata de 1/r² ao longo do raio) ---
  vec3 g = vec3(0.0);
  float tMax = min(dist, 90.0);
  for (int i = 0; i < ${MAX_GLOWS}; i++) {
    if (i >= uN) break;
    vec3 L = uL[i].xyz - O;
    float tc = dot(L, D);
    float h2 = max(dot(L, L) - tc * tc, 0.0);
    float s = uL[i].w;
    float h = sqrt(h2 + s * s);
    float I = (atan((tMax - tc) / h) - atan(-tc / h)) / h;
    // alcance: o halo some longe da lâmpada (sem lavar a tela inteira)
    I *= exp(-sqrt(h2) / uC[i].w);
    g += uC[i].rgb * I;
  }
  col += g * uGlowGain;

  gl_FragColor = vec4(col, 1.0);
}`;

// ---------------------------------------------------------------
// Partículas: mariposas em volta das lâmpadas, poeira dourada no ar
// e vapor saindo das barracas de comida. Tudo aditivo e macio.
// ---------------------------------------------------------------
const pointVert = /* glsl */ `
attribute vec4 seed;
attribute vec3 home;
attribute float kind;     // 0 = mariposa, 1 = poeira, 2 = vapor
uniform float uTime;
uniform float uPx;
varying float vA;
varying float vKind;
varying vec3 vCol;
void main() {
  vec3 p = home;
  float t = uTime;
  vKind = kind;
  if (kind < 0.5) {
    // mariposa: órbita nervosa em volta da lâmpada
    float a = t * (2.5 + seed.x * 3.0) + seed.y * 6.28;
    float r = 0.12 + seed.z * 0.22;
    p += vec3(cos(a) * r, sin(a * 1.7 + seed.w * 4.0) * 0.1, sin(a) * r * 0.7);
    p += vec3(sin(t * 13.0 + seed.x * 40.0), cos(t * 17.0 + seed.y * 30.0), 0.0) * 0.02;
    vA = 0.75 * (0.6 + 0.4 * sin(t * 30.0 + seed.w * 50.0));
    vCol = vec3(1.0, 0.86, 0.62);
  } else if (kind < 1.5) {
    // poeira: deriva devagar
    p += vec3(sin(t * 0.21 + seed.x * 6.28) * 0.6, sin(t * 0.13 + seed.y * 6.28) * 0.35, cos(t * 0.17 + seed.z * 6.28) * 0.4);
    vA = 0.22 + 0.2 * sin(t * 0.9 + seed.w * 20.0);
    vCol = mix(vec3(1.0, 0.75, 0.5), vec3(0.85, 0.7, 1.0), seed.z);
  } else {
    // vapor: sobe, abre e some
    float life = fract(t * (0.16 + seed.x * 0.08) + seed.y);
    p += vec3(sin(life * 3.0 + seed.z * 6.0) * 0.12 + life * 0.25 * (seed.w - 0.5), life * 1.3, 0.0);
    vA = 0.13 * sin(life * 3.14159) * (1.0 - life * 0.5);
    vCol = vec3(1.0, 0.9, 0.8);
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = kind < 0.5 ? 1.6 : kind < 1.5 ? 1.5 + seed.x * 1.5 : 10.0 + seed.z * 14.0;
  gl_PointSize = kind < 1.5 ? size : size * (uPx / 360.0) * (4.0 / -mv.z);
}`;

const pointFrag = /* glsl */ `
varying float vA;
varying float vKind;
varying vec3 vCol;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c) * 2.0;
  float a = vKind < 1.5 ? step(r, 1.0) : smoothstep(1.0, 0.0, r) * smoothstep(1.0, 0.3, r);
  if (a <= 0.001) discard;
  gl_FragColor = vec4(vCol * vA * a * (vKind < 0.5 ? 2.2 : 1.0), 1.0);
}`;

export function createParkFx() {
  const uniforms = {
    tScene: { value: null },
    tDepth: { value: null },
    tVol: { value: null },
    uProjInv: { value: new THREE.Matrix4() },
    uCamWorld: { value: new THREE.Matrix4() },
    uRes: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uL: { value: Array.from({ length: MAX_GLOWS }, () => new THREE.Vector4()) },
    uC: { value: Array.from({ length: MAX_GLOWS }, () => new THREE.Vector4()) },
    uN: { value: 0 },
    uGlowGain: { value: 1 },
    uFogCol: { value: new THREE.Color('#202450') },
    uFogDen: { value: 0.024 },
    uFogFloor: { value: 0.025 },
    uDof: { value: 1.8 },
    uFocus: { value: new THREE.Vector2(9, 26) },
  };
  const composite = new THREE.ShaderMaterial({
    vertexShader: passVert,
    fragmentShader: compFrag,
    uniforms,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });

  const glows = [];
  // pos (mundo), cor, força, tamanho do núcleo, alcance; flicker = quanto tremula
  const addGlow = (pos, color, { power = 1, core = 0.18, reach = 2.5, flicker = 0.04, follow = null } = {}) => {
    const g = { pos: pos.clone(), color: new THREE.Color(color), power, core, reach, flicker, follow, k: 1, seed: Math.random() * 100 };
    if (glows.length < MAX_GLOWS) glows.push(g);
    return g;
  };

  // partículas
  const homes = [], seeds = [], kinds = [];
  const addPoints = (n, kind, fn) => {
    for (let i = 0; i < n; i++) {
      homes.push(...fn(i).toArray());
      seeds.push(Math.random(), Math.random(), Math.random(), Math.random());
      kinds.push(kind);
    }
  };
  const pointMat = new THREE.ShaderMaterial({
    vertexShader: pointVert,
    fragmentShader: pointFrag,
    uniforms: { uTime: { value: 0 }, uPx: { value: 360 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  let points = null;
  const buildPoints = () => {
    const geo = new THREE.BufferGeometry();
    const n = kinds.length;
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('home', new THREE.Float32BufferAttribute(homes, 3));
    geo.setAttribute('seed', new THREE.Float32BufferAttribute(seeds, 4));
    geo.setAttribute('kind', new THREE.Float32BufferAttribute(kinds, 1));
    points = new THREE.Points(geo, pointMat);
    points.frustumCulled = false;
    return points;
  };

  const tmp = new THREE.Vector3();
  return {
    pass: { composite },
    uniforms,
    glows,
    addGlow,
    addPoints,
    buildPoints,
    update(dt, t, { rows = 360 } = {}) {
      uniforms.uN.value = glows.length;
      glows.forEach((g, i) => {
        if (g.follow) g.follow.getWorldPosition(tmp);
        else tmp.copy(g.pos);
        const fl = 1 + Math.sin(t * 9.7 + g.seed) * g.flicker + Math.sin(t * 23.1 + g.seed * 3) * g.flicker * 0.5;
        uniforms.uL.value[i].set(tmp.x, tmp.y, tmp.z, g.core);
        const k = g.power * g.k * fl * 0.01;
        uniforms.uC.value[i].set(g.color.r * k, g.color.g * k, g.color.b * k, g.reach);
      });
      pointMat.uniforms.uTime.value = t;
      pointMat.uniforms.uPx.value = rows;
    },
  };
}
