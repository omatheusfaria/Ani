import * as THREE from 'three';

// ===============================================================
// Iluminação cinematográfica do quarto (referência: Until Then)
//
// Um passe de tela cheia depois da cena (ver PixelRenderer: lightPass):
//  • feixes de luar volumétricos entrando pela janela — raymarch pelo
//    ar do quarto, com os caixilhos e as cortinas recortando a luz,
//    densidade de poeira que se mexe devagar e penumbra que abre com a
//    distância;
//  • o recorte da janela projetado nas superfícies (chão, tapete, ela);
//  • a Ani bloqueia a luz: a silhueta dela (o próprio sprite) faz sombra
//    no luar e na luz do lustre, no chão e dentro do feixe;
//  • cone de luz quente do lustre quando a luz está acesa;
//  • névoa leve da cor da luz dominante.
// Mais: poeira em partículas que brilha só dentro da luz e abre caminho
// quando ela passa.
// ===============================================================

const COMMON = /* glsl */ `
uniform vec3 uMoonDir;   // direção em que o luar viaja
uniform vec3 uMoonCol;   // cor * força
uniform vec4 uWin;       // x0, x1, y0, y1 da abertura da janela
uniform float uWinZ;     // plano da janela
uniform vec2 uMull;      // x do caixilho vertical, y do horizontal
uniform vec2 uOpen;      // faixa em x que as cortinas deixam aberta
uniform vec3 uLampPos;
uniform vec3 uLampCol;   // cor * força (0 com a luz apagada)
uniform float uLampCos;  // abertura do cone do lustre (cosseno)
uniform sampler2D tAni;  // folha de sprites da Ani
uniform float uAniOn;
uniform vec3 uAniPos;
uniform vec2 uAniSize;   // largura e altura da placa (m)
uniform vec3 uAniUV;     // deslocamento do quadro, repetição, espelho
uniform float uAniFoot;  // folga embaixo da sola (fração da altura)

// luz da janela num ponto: 0..1 (t = distância percorrida desde a janela,
// w = onde o raio cruzou o vidro — usado para as estrias dos raios)
float windowLight(vec3 p, out float t, out vec2 wxy) {
  t = (uWinZ - p.z) / (-uMoonDir.z);
  wxy = vec2(0.0);
  if (t < 0.03) return 0.0;
  vec3 w = p - uMoonDir * t;
  wxy = w.xy;
  float pen = 0.003 + t * 0.006; // penumbra abre longe da janela
  float x0 = max(uWin.x, uOpen.x), x1 = min(uWin.y, uOpen.y);
  float a = smoothstep(x0 - pen, x0 + pen, w.x) * (1.0 - smoothstep(x1 - pen, x1 + pen, w.x));
  a *= smoothstep(uWin.z - pen, uWin.z + pen, w.y) * (1.0 - smoothstep(uWin.w - pen, uWin.w + pen, w.y));
  // caixilhos um pouco mais grossos que a peça (a sombra precisa ler na tela)
  a *= smoothstep(0.032, 0.032 + pen * 1.5, abs(w.x - uMull.x));
  a *= smoothstep(0.026, 0.026 + pen * 1.5, abs(w.y - uMull.y));
  return a;
}

// 0 se a silhueta da Ani está entre p e a luz (direção L, até maxT), senão 1
float aniShadow(vec3 p, vec3 L, float maxT) {
  if (uAniOn < 0.5 || abs(L.z) < 1e-4) return 1.0;
  float t = (uAniPos.z - p.z) / L.z;
  if (t <= 0.004 || t > maxT) return 1.0;
  vec3 q = p + L * t;
  float u = (q.x - uAniPos.x) / uAniSize.x * uAniUV.z + 0.5;
  float v = (q.y - uAniPos.y) / uAniSize.y + uAniFoot;
  if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) return 1.0;
  float a = textureLod(tAni, vec2(uAniUV.x + u * uAniUV.y, v), 1.0).a;
  return 1.0 - step(0.5, a);
}

float lampCone(vec3 x, out float r) {
  vec3 d = x - uLampPos;
  r = length(d);
  float c = -d.y / max(r, 1e-4);
  return smoothstep(uLampCos - 0.1, uLampCos + 0.14, c);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), f.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), f.x), f.y);
}
// estrias: variam só com o ponto do vidro, então viram "raios" ao longo do feixe
float streaks(vec2 w, float time) {
  float a = noise2(vec2((w.x + w.y * 0.35) * 26.0, time * 0.15));
  float b = noise2(vec2((w.x - w.y * 0.2) * 9.0 + 7.0, time * 0.07));
  return 0.3 + 0.7 * smoothstep(0.2, 0.85, a * 0.6 + b * 0.4);
}
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
`;

const passVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const PASS_HEAD = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform sampler2D tVol;
uniform mat4 uProjInv;
uniform mat4 uCamWorld;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uHaze;
uniform float uVol;
uniform float uCookie;
uniform float uLampShadow;
uniform float uLampVol;
varying vec2 vUv;
${COMMON}

vec3 worldAt(vec2 uv, float d) {
  vec4 v = uProjInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
  v /= v.w;
  return (uCamWorld * v).xyz;
}
`;

// Ar iluminado (meia resolução; o renderizador desfoca depois)
const volFrag = /* glsl */ `
${PASS_HEAD}
void main() {
  float d = texture2D(tDepth, vUv).r;
  vec3 cam = (uCamWorld * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 P = worldAt(vUv, min(d, 0.99999));
  bool sky = d >= 0.99999;
  vec3 rd = normalize(P - cam);
  float far = min(sky ? 14.0 : length(P - cam), 14.0);
  const int N = 40;
  float stepL = far / float(N);
  // ruído de gradiente intercalado (fixo): o blur transforma em luz macia
  float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  vec3 acc = vec3(0.0);
  for (int i = 0; i < N; i++) {
    float s = (float(i) + jit) * stepL;
    vec3 x = cam + rd * s;
    if (x.z > 2.45 || x.y < 0.0 || x.y > 2.8 || abs(x.x) > 3.0) continue; // fora do quarto
    // perto da câmera o ar não brilha (senão, com a câmera dentro do feixe, a tela estoura)
    float nearK = smoothstep(0.35, 1.6, s);
    float dens = (0.45 + 0.55 * vnoise(x * vec3(2.4, 3.2, 2.4) + vec3(uTime * 0.05, -uTime * 0.02, uTime * 0.03))) * nearK;
    float t;
    vec2 wxy;
    float w = windowLight(x, t, wxy);
    if (w > 0.0) acc += uMoonCol * (w * dens * streaks(wxy, uTime) * exp(-t * 0.3) * aniShadow(x, -uMoonDir, 30.0));
    float r;
    float cone = lampCone(x, r);
    if (cone > 0.0 && dot(uLampCol, uLampCol) > 0.0) {
      acc += uLampCol * (cone * dens * aniShadow(x, -(x - uLampPos) / r, r) * uLampVol / (1.0 + r * r * 2.5));
    }
    acc += uHaze * dens;
  }
  vec3 v = acc * stepL * uVol;
  gl_FragColor = vec4(v / (1.0 + max(v.r, max(v.g, v.b)) * 0.8), 1.0); // satura macio, nunca chapa
}`;

// Cena + luz nas superfícies + ar iluminado (já macio)
const compFrag = /* glsl */ `
${PASS_HEAD}
void main() {
  vec3 col = texture2D(tScene, vUv).rgb;
  float d = texture2D(tDepth, vUv).r;
  vec3 P = worldAt(vUv, min(d, 0.99999));
  if (d < 0.99999) {
    // recorte da janela nas superfícies (com a sombra dela)
    float t;
    vec2 wxy;
    float w = windowLight(P, t, wxy);
    if (w > 0.0) {
      w *= aniShadow(P, -uMoonDir, 30.0) * (0.75 + 0.25 * streaks(wxy, uTime));
      col += (col * 1.7 + 0.03) * uMoonCol * w * uCookie;
    }
    // sombra dela pela luz do lustre (cresce e gira conforme ela anda)
    vec3 toL = uLampPos - P;
    float dl = length(toL);
    float lk = clamp(dot(uLampCol, vec3(0.333)) * 0.05 / (dl * dl), 0.0, 1.0);
    if (lk > 0.01) col *= mix(1.0, aniShadow(P, toL / dl, dl - 0.05), uLampShadow * lk);
  }
  col += texture2D(tVol, vUv).rgb;
  gl_FragColor = vec4(col, 1.0);
}`;

const moteVert = /* glsl */ `
attribute vec4 seed;
uniform float uTime;
uniform vec3 uAniPush; // x, z da Ani e quanto ela empurra (velocidade)
uniform float uPx;
varying float vA;
varying vec3 vC;
${COMMON}
void main() {
  vec3 p = position;
  float tt = uTime * (0.6 + seed.w * 0.5);
  // flutua devagar, cada grão no seu ritmo
  p += vec3(sin(tt * 0.31 + seed.x * 6.28), sin(tt * 0.23 + seed.y * 6.28) * 0.6 - 0.02 * uTime * seed.z, cos(tt * 0.27 + seed.z * 6.28)) * 0.12;
  p.y = mod(p.y, 2.7) + 0.05;
  // abre caminho quando ela passa
  vec2 dv = p.xz - uAniPush.xy;
  float dd = length(dv);
  if (p.y < 1.75) p.xz += dv / max(dd, 1e-3) * smoothstep(0.45, 0.0, dd) * (0.08 + uAniPush.z * 0.12);
  float t;
  vec2 wxy;
  float win = windowLight(p, t, wxy) * exp(-t * 0.25);
  float r;
  float cone = lampCone(p, r) / (1.0 + r * r * 2.0);
  float lampK = clamp(dot(uLampCol, vec3(0.333)) * 0.08, 0.0, 1.0);
  vC = uMoonCol * win * 2.2 + vec3(1.0, 0.78, 0.55) * cone * lampK * 1.2;
  vA = (0.35 + 0.65 * sin(uTime * (1.5 + seed.y * 2.0) + seed.x * 30.0)) * (win + cone * lampK);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = seed.z > 0.85 ? 2.0 : 1.0; // pixel de poeira (alguns grãos maiores)
}`;

const moteFrag = /* glsl */ `
varying float vA;
varying vec3 vC;
void main() {
  if (vA < 0.02) discard;
  gl_FragColor = vec4(vC * vA, 1.0);
}`;

export function createCinema(room, ani) {
  const c = room.cine;
  const shared = {
    uMoonDir: { value: new THREE.Vector3() },
    uMoonCol: { value: new THREE.Color() },
    uWin: { value: c.win.clone() },
    uWinZ: { value: c.winZ },
    uMull: { value: c.mull.clone() },
    uOpen: { value: new THREE.Vector2(-9, 9) },
    uLampPos: { value: c.lamp.clone() },
    uLampCol: { value: new THREE.Color(0, 0, 0) },
    uLampCos: { value: 0.55 },
    tAni: { value: ani.tex },
    uAniOn: { value: 0 },
    uAniPos: { value: new THREE.Vector3() },
    uAniSize: { value: new THREE.Vector2(1, 1) },
    uAniUV: { value: new THREE.Vector3(0, 1, 1) },
    uAniFoot: { value: 0 },
  };

  const passUniforms = {
    ...shared,
    tScene: { value: null },
    tDepth: { value: null },
    tVol: { value: null },
    uProjInv: { value: new THREE.Matrix4() },
    uCamWorld: { value: new THREE.Matrix4() },
    uRes: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uHaze: { value: new THREE.Color(0, 0, 0) },
    uVol: { value: 1 },
    uCookie: { value: 1 },
    uLampShadow: { value: 0.6 },
    uLampVol: { value: 0.05 },
  };
  const mat = (frag) => new THREE.ShaderMaterial({ vertexShader: passVert, fragmentShader: frag, depthTest: false, depthWrite: false, toneMapped: false, uniforms: passUniforms });
  const pass = { volume: mat(volFrag), composite: mat(compFrag), uniforms: passUniforms };

  // poeira: grãos espalhados pelo ar do quarto
  const N = 420;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    pos.set([-2.7 + Math.random() * 5.5, 0.05 + Math.random() * 2.6, -2.35 + Math.random() * 2.9], i * 3);
    seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 4));
  const moteMat = new THREE.ShaderMaterial({
    vertexShader: moteVert,
    fragmentShader: moteFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { ...shared, uTime: { value: 0 }, uAniPush: { value: new THREE.Vector3(99, 99, 0) }, uPx: { value: 360 } },
  });
  const motes = new THREE.Points(geo, moteMat);
  motes.frustumCulled = false;

  const moonDir = new THREE.Vector3();
  let push = 0;
  let lastX = 0, lastZ = 0;

  return {
    pass,
    motes,
    // chamado todo quadro pela cena
    update(dt, t, { rows = 360, aniVisible = true } = {}) {
      const u = shared;
      // luar
      c.moon.target.updateMatrixWorld();
      moonDir.copy(c.moon.target.position).sub(c.moon.position).normalize();
      u.uMoonDir.value.copy(moonDir);
      u.uMoonCol.value.copy(c.moon.color).multiplyScalar(c.moon.intensity * c.beamGain);
      u.uOpen.value.copy(c.open);
      // lustre
      u.uLampCol.value.copy(c.ceiling.color).multiplyScalar(c.ceiling.intensity);
      // Ani (o sprite dela é a "máscara" da sombra)
      const m = ani.mesh;
      u.uAniOn.value = aniVisible && m.visible ? 1 : 0;
      u.uAniPos.value.copy(m.position);
      const FW = ani.cellW, FH = ani.cellH;
      u.uAniSize.value.set(FW * Math.abs(m.scale.x), FH * m.scale.y);
      u.uAniUV.value.set(ani.tex.offset.x, ani.tex.repeat.x, Math.sign(m.scale.x) || 1);
      u.uAniFoot.value = ani.footFrac;
      // poeira
      const sp = Math.hypot(m.position.x - lastX, m.position.z - lastZ) / Math.max(dt, 1e-3);
      lastX = m.position.x;
      lastZ = m.position.z;
      push += (Math.min(sp, 2) - push) * Math.min(1, dt * 4);
      moteMat.uniforms.uTime.value = t;
      moteMat.uniforms.uAniPush.value.set(u.uAniOn.value ? m.position.x : 99, m.position.z, push);
      moteMat.uniforms.uPx.value = rows;
    },
    set haze(col) {
      pass.uniforms.uHaze.value.copy(col);
    },
    get uniforms() {
      return pass.uniforms;
    },
  };
}
