import * as THREE from 'three';

// Renderizador pixel art: desenha a cena 3D em baixa resolução e aplica um
// pós-processamento (brilho, aberração cromática, granulado, vinheta, glitch,
// dithering e transições). O CSS amplia o canvas sem suavização.

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const frag = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 uRes;
uniform float uTime;
uniform float uFade;
uniform vec3 uFadeColor;
uniform float uVignette;
uniform float uAberration;
uniform float uGrain;
uniform float uGlitch;
uniform float uBloom;
uniform float uDither;
uniform vec3 uTint;
uniform vec2 uShake;
varying vec2 vUv;

float bayer(vec2 p) {
  ivec2 i = ivec2(mod(p, 4.0));
  int idx = i.x + i.y * 4;
  float m[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return (m[idx] + 0.5) / 16.0;
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = vUv + uShake / uRes;
  vec2 px = floor(vUv * uRes);

  if (uGlitch > 0.001) {
    float row = floor(px.y / 3.0);
    float h = hash(vec2(row, floor(uTime * 24.0)));
    if (h < uGlitch * 0.4) uv.x += (hash(vec2(row, uTime)) - 0.5) * 0.12 * uGlitch;
  }

  vec2 dir = uv - 0.5;
  float ab = uAberration + uGlitch * 0.012;
  vec3 col;
  col.r = texture2D(tDiffuse, uv + dir * ab).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - dir * ab).b;

  // Brilho (bloom) barato: amostras em anel das partes mais claras.
  vec3 bl = vec3(0.0);
  vec2 texel = 1.0 / uRes;
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5236;
    vec2 d = vec2(cos(a), sin(a));
    bl += max(texture2D(tDiffuse, uv + d * 2.0 * texel).rgb - 0.7, 0.0);
    bl += max(texture2D(tDiffuse, uv + d * 5.0 * texel).rgb - 0.7, 0.0) * 0.6;
  }
  col += bl / 19.2 * uBloom;
  col *= uTint;

  float v = smoothstep(0.95, 0.25, length(dir * vec2(uRes.x / uRes.y, 1.0)));
  col *= mix(1.0, v, uVignette);
  col += (hash(px + fract(uTime * 7.0) * 91.0) - 0.5) * uGrain * 0.12;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>

  float b = bayer(px);
  vec3 c = gl_FragColor.rgb;
  float levels = 40.0;
  c = floor(c * levels + b * uDither) / levels;
  // Transição com dissolução em dithering.
  if (b < uFade) c = uFadeColor;
  gl_FragColor.rgb = c;
}`;

export class PixelRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.gl.setPixelRatio(1);
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.05;
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = THREE.BasicShadowMap;

    this.targetRows = 360; // linhas de pixels na vertical
    this.rt = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: true,
    });

    // Efeitos controlados pelas cenas.
    this.fx = {
      fade: 1, fadeColor: new THREE.Color(0, 0, 0),
      vignette: 0.45, aberration: 0.002, grain: 0.06, glitch: 0,
      bloom: 0.8, dither: 0.8, tint: new THREE.Color(1, 1, 1),
      shakeX: 0, shakeY: 0,
    };

    this.post = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tDiffuse: { value: this.rt.texture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uFade: { value: 1 },
        uFadeColor: { value: new THREE.Color() },
        uVignette: { value: 0 },
        uAberration: { value: 0 },
        uGrain: { value: 0 },
        uGlitch: { value: 0 },
        uBloom: { value: 0 },
        uDither: { value: 0 },
        uTint: { value: new THREE.Color(1, 1, 1) },
        uShake: { value: new THREE.Vector2() },
      },
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    const quad = new THREE.Mesh(geo, this.post);
    quad.frustumCulled = false;
    this.postScene = new THREE.Scene();
    this.postScene.add(quad);
    this.postCam = new THREE.Camera();

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  setRows(rows) {
    this.targetRows = rows;
    this.resize();
  }

  resize() {
    const s = Math.max(1, Math.round(window.innerHeight / this.targetRows));
    this.scale = s;
    this.w = Math.max(1, Math.floor(window.innerWidth / s));
    this.h = Math.max(1, Math.floor(window.innerHeight / s));
    this.gl.setSize(this.w, this.h, false);
    this.rt.setSize(this.w, this.h);
    this.post.uniforms.uRes.value.set(this.w, this.h);
  }

  render(scene, camera, time) {
    if (camera.isPerspectiveCamera) {
      const aspect = this.w / this.h;
      if (Math.abs(camera.aspect - aspect) > 1e-4) {
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      }
    }
    this.gl.setRenderTarget(this.rt);
    this.gl.render(scene, camera);
    this.gl.setRenderTarget(null);

    const u = this.post.uniforms;
    const fx = this.fx;
    u.uTime.value = time;
    u.uFade.value = fx.fade;
    u.uFadeColor.value.copy(fx.fadeColor);
    u.uVignette.value = fx.vignette;
    u.uAberration.value = fx.aberration;
    u.uGrain.value = fx.grain;
    u.uGlitch.value = fx.glitch;
    u.uBloom.value = fx.bloom;
    u.uDither.value = fx.dither;
    u.uTint.value.copy(fx.tint);
    u.uShake.value.set(Math.round(fx.shakeX), Math.round(fx.shakeY));
    this.gl.render(this.postScene, this.postCam);
  }
}
