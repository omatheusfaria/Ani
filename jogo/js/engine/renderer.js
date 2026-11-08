import * as THREE from 'three';

// Renderizador pixel art: desenha a cena 3D em baixa resolução e aplica um
// pós-processamento (brilho, aberração cromática, granulado, vinheta, glitch,
// dithering e transições). O CSS amplia o canvas sem suavização.
//
// Cadeia (estilo "cinema"):
//   1. cena → rt (cor HDR + profundidade)
//   2. passe de luz da cena (opcional: scene.userData.lightPass) → rtLit
//      lightPass = { volume, composite }: o "volume" (feixes, névoa) é
//      calculado em meia resolução e desfocado (luz macia, sem serrilhado);
//      o "composite" junta cena + volume + luz nas superfícies. Os dois
//      recebem a profundidade e as matrizes da câmera
//   3. bloom largo: brilho → 1/4 da resolução → blur gaussiano (2 passadas)
//   4. final: bloom + gradação de cor (lift/gain, saturação, contraste)
//      + exposição + tone mapping + vinheta + granulado + dithering
//
// Passe nítido (opcional: scene.userData.hd = { layer, active }):
//   objetos na camada `layer` (ex.: a tela do celular) são desenhados de novo em
//   resolução cheia e entram no final por cima do pixel art. Onde o passe
//   pixelado gravou alfa < 0.5 (a própria tela, ver markHD) o nítido aparece;
//   onde algo passou na frente (o dedo), o alfa é 1 e o pixel art fica.
//   Recebe a mesma gradação/vinheta/fade, mas sem granulado e sem dithering.

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
uniform sampler2D tGlow;
uniform float uGlow;
uniform vec3 uLift;
uniform vec3 uGain;
uniform float uSat;
uniform float uContrast;
uniform float uFlash;
uniform vec3 uFlashColor;
uniform float uBars;
uniform sampler2D tHD;
uniform sampler2D tMask;
uniform float uHD;
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
  // bloom largo (halo das luzes, como lente de cinema)
  col += texture2D(tGlow, uv).rgb * uGlow;
  col *= uTint;

  // passe nítido por cima (tela do celular), recortado pelo que está na frente
  float hk = 0.0;
  if (uHD > 0.5) {
    vec4 hd = texture2D(tHD, uv);
    hk = hd.a * (1.0 - step(0.5, texture2D(tMask, uv).a));
    col = mix(col, hd.rgb * uTint, hk);
  }

  float v = smoothstep(0.95, 0.25, length(dir * vec2(uRes.x / uRes.y, 1.0)));
  col *= mix(1.0, v, uVignette);
  col += (hash(px + fract(uTime * 7.0) * 91.0) - 0.5) * uGrain * 0.12 * (1.0 - hk);

  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <tonemapping_fragment>
  // gradação de cor depois do tone mapping: sombras puxadas para uLift
  // (preto "leitoso", nunca chapado), luzes para uGain, saturação e contraste
  {
    vec3 c = gl_FragColor.rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, uSat);
    c = (c - 0.18) * uContrast + 0.18;
    float sh = 1.0 - smoothstep(0.0, 0.35, l);
    float hi = smoothstep(0.25, 0.9, l);
    c += uLift * sh;
    c *= mix(vec3(1.0), uGain, hi);
    gl_FragColor.rgb = max(c, 0.0);
  }
  #include <colorspace_fragment>

  float b = bayer(px);
  vec3 c = gl_FragColor.rgb;
  float levels = 40.0;
  c = mix(floor(c * levels + b * uDither) / levels, c, hk); // a interface nítida não leva pontilhado
  // Transição com dissolução em dithering.
  if (b < uFade) c = uFadeColor;
  // flash de câmera: branco liso (sem pontilhado), por cima de tudo
  c = mix(c, uFlashColor, clamp(uFlash, 0.0, 1.0));
  // faixas de cinema (cutscene): entram de cima e de baixo
  float bar = uBars * 0.11;
  if (vUv.y < bar || vUv.y > 1.0 - bar) c = vec3(0.0);
  gl_FragColor.rgb = c;
}`;

const brightFrag = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uThreshold;
varying vec2 vUv;
void main() {
  vec3 c = vec3(0.0);
  for (int y = -1; y <= 2; y++) for (int x = -1; x <= 2; x++) c += texture2D(tSrc, vUv + vec2(float(x) - 0.5, float(y) - 0.5) * uTexel).rgb;
  c = min(c / 16.0, vec3(2.5)); // lâmpada encostada na cúpula não vira um sol
  float l = max(c.r, max(c.g, c.b));
  gl_FragColor = vec4(c * smoothstep(uThreshold, uThreshold + 0.6, l), 1.0);
}`;

const blurFrag = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 uDir;
varying vec2 vUv;
void main() {
  float w[5];
  w[0] = 0.227; w[1] = 0.1945; w[2] = 0.1216; w[3] = 0.054; w[4] = 0.0162;
  vec3 c = texture2D(tSrc, vUv).rgb * w[0];
  for (int i = 1; i < 5; i++) {
    c += texture2D(tSrc, vUv + uDir * float(i)).rgb * w[i];
    c += texture2D(tSrc, vUv - uDir * float(i)).rgb * w[i];
  }
  gl_FragColor = vec4(c, 1.0);
}`;

const copyFrag = /* glsl */ `
uniform sampler2D tSrc;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(tSrc, vUv); }`;

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
    this.rt.depthTexture = new THREE.DepthTexture(1, 1, THREE.FloatType);
    const half = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    this.rtLit = new THREE.WebGLRenderTarget(1, 1, { ...half, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.rtGlowA = new THREE.WebGLRenderTarget(1, 1, half);
    this.rtVolA = new THREE.WebGLRenderTarget(1, 1, half);
    this.rtVolB = new THREE.WebGLRenderTarget(1, 1, half);
    this.rtGlowB = new THREE.WebGLRenderTarget(1, 1, half);

    // Efeitos controlados pelas cenas.
    this.fx = {
      fade: 1, fadeColor: new THREE.Color(0, 0, 0),
      vignette: 0.45, aberration: 0.002, grain: 0.06, glitch: 0,
      bloom: 0.8, dither: 0.8, tint: new THREE.Color(1, 1, 1),
      shakeX: 0, shakeY: 0,
      // cinema: bloom largo, exposição e gradação (as cenas mexem; padrão neutro)
      glow: 0.35, glowThreshold: 0.9, exposure: 1,
      lift: new THREE.Color(0, 0, 0), gain: new THREE.Color(1, 1, 1), saturation: 1, contrast: 1,
      // flash de câmera (0..1, liso) e faixas de cinema (0..1)
      flash: 0, flashColor: new THREE.Color(1, 0.98, 0.94), bars: 0,
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
        tGlow: { value: this.rtGlowA.texture },
        uGlow: { value: 0 },
        uLift: { value: new THREE.Color() },
        uGain: { value: new THREE.Color(1, 1, 1) },
        uSat: { value: 1 },
        uContrast: { value: 1 },
        uFlash: { value: 0 },
        uFlashColor: { value: new THREE.Color(1, 1, 1) },
        uBars: { value: 0 },
        tHD: { value: null },
        tMask: { value: null },
        uHD: { value: 0 },
      },
    });
    const pass = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, toneMapped: false });
    this.brightMat = pass(brightFrag, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 0.9 } });
    this.blurMat = pass(blurFrag, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.copyMat = pass(copyFrag, { tSrc: { value: null } });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    const quad = new THREE.Mesh(geo, this.post);
    quad.frustumCulled = false;
    this.postScene = new THREE.Scene();
    this.postScene.add(quad);
    this.postCam = new THREE.Camera();
    this.quad = quad;

    this.hdOn = false;
    this.rtHD = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  // Material da camada pixelada que marca onde o passe nítido deve aparecer (grava alfa 0)
  static markHD(material) {
    material.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', 'gl_FragColor = vec4( outgoingLight, 0.0 );');
    };
    material.customProgramCacheKey = () => 'markHD';
    material.needsUpdate = true;
    return material;
  }

  // liga/desliga o canvas em resolução cheia (só quando a cena pede o passe nítido)
  setHD(on) {
    if (on === this.hdOn) return;
    this.hdOn = on;
    this.resize();
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
    if (this.hdOn) {
      // canvas em resolução cheia: o pixel art é ampliado no final, o passe nítido não
      this.gl.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      this.gl.setSize(window.innerWidth, window.innerHeight, false);
      const db = this.gl.getDrawingBufferSize(new THREE.Vector2());
      if (!this.rtHD) {
        this.rtHD = new THREE.WebGLRenderTarget(db.x, db.y, { type: THREE.HalfFloatType, depthBuffer: true, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
      } else this.rtHD.setSize(db.x, db.y);
    } else {
      this.gl.setPixelRatio(1);
      this.gl.setSize(this.w, this.h, false);
    }
    this.rt.setSize(this.w, this.h);
    this.rtLit.setSize(this.w, this.h);
    const gw = Math.max(1, Math.ceil(this.w / 4)), gh = Math.max(1, Math.ceil(this.h / 4));
    this.rtGlowA.setSize(gw, gh);
    const vw = Math.max(1, Math.ceil(this.w / 2)), vh = Math.max(1, Math.ceil(this.h / 2));
    this.rtVolA.setSize(vw, vh);
    this.rtVolB.setSize(vw, vh);
    this.rtGlowB.setSize(gw, gh);
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
    const hd = scene.userData?.hd;
    this.setHD(!!hd?.active);
    this.gl.setRenderTarget(this.rt);
    this.gl.render(scene, camera);

    // passe nítido: só a camada hd, em resolução cheia, fundo transparente
    if (this.hdOn) {
      const bg = scene.background;
      const auto = this.gl.shadowMap.autoUpdate;
      const prevMask = camera.layers.mask;
      const cc = this.gl.getClearColor(new THREE.Color());
      const ca = this.gl.getClearAlpha();
      scene.background = null;
      this.gl.shadowMap.autoUpdate = false;
      camera.layers.set(hd.layer);
      this.gl.setClearColor(0x000000, 0);
      this.gl.setRenderTarget(this.rtHD);
      this.gl.clear();
      this.gl.render(scene, camera);
      camera.layers.mask = prevMask;
      this.gl.setClearColor(cc, ca);
      this.gl.shadowMap.autoUpdate = auto;
      scene.background = bg;
    }

    // passe de luz da cena (feixes, névoa...) ou cópia simples
    const fx = this.fx;
    const lp = scene.userData?.lightPass;
    let lit = this.rt.texture;
    if (lp) {
      const common = (m, w, h) => {
        const lu = m.uniforms;
        lu.tScene.value = this.rt.texture;
        lu.tDepth.value = this.rt.depthTexture;
        lu.uProjInv.value.copy(camera.projectionMatrixInverse);
        lu.uCamWorld.value.copy(camera.matrixWorld);
        lu.uRes.value.set(w, h);
        lu.uTime.value = time;
      };
      if (lp.volume) {
        // ar iluminado em meia resolução + blur gaussiano (2 passadas): luz macia
        common(lp.volume, this.rtVolA.width, this.rtVolA.height);
        this.blit(lp.volume, this.rtVolA);
        const tx = 1 / this.rtVolA.width, ty = 1 / this.rtVolA.height;
        for (const r of [1, 1.8]) {
          this.blurMat.uniforms.tSrc.value = this.rtVolA.texture;
          this.blurMat.uniforms.uDir.value.set(tx * r, 0);
          this.blit(this.blurMat, this.rtVolB);
          this.blurMat.uniforms.tSrc.value = this.rtVolB.texture;
          this.blurMat.uniforms.uDir.value.set(0, ty * r);
          this.blit(this.blurMat, this.rtVolA);
        }
        lp.composite.uniforms.tVol.value = this.rtVolA.texture;
      }
      common(lp.composite, this.w, this.h);
      this.blit(lp.composite, this.rtLit);
      lit = this.rtLit.texture;
    }

    // bloom largo: brilho em 1/4 + blur em duas direções (duas vezes = halo macio)
    if (fx.glow > 0.001) {
      const bm = this.brightMat.uniforms;
      bm.tSrc.value = lit;
      bm.uTexel.value.set(1 / this.w, 1 / this.h);
      bm.uThreshold.value = fx.glowThreshold;
      this.blit(this.brightMat, this.rtGlowA);
      const tx = 1 / this.rtGlowA.width, ty = 1 / this.rtGlowA.height;
      for (const r of [1, 2]) {
        this.blurMat.uniforms.tSrc.value = this.rtGlowA.texture;
        this.blurMat.uniforms.uDir.value.set(tx * r, 0);
        this.blit(this.blurMat, this.rtGlowB);
        this.blurMat.uniforms.tSrc.value = this.rtGlowB.texture;
        this.blurMat.uniforms.uDir.value.set(0, ty * r);
        this.blit(this.blurMat, this.rtGlowA);
      }
    }
    this.gl.setRenderTarget(null);

    const u = this.post.uniforms;
    u.tDiffuse.value = lit;
    u.uGlow.value = fx.glow;
    u.uLift.value.copy(fx.lift);
    u.uGain.value.copy(fx.gain);
    u.uSat.value = fx.saturation;
    u.uContrast.value = fx.contrast;
    this.gl.toneMappingExposure = 1.05 * fx.exposure;
    u.uTime.value = time;
    u.uFade.value = fx.fade;
    u.uFadeColor.value.copy(fx.fadeColor);
    u.uFlash.value = fx.flash;
    u.uFlashColor.value.copy(fx.flashColor);
    u.uBars.value = fx.bars;
    u.uVignette.value = fx.vignette;
    u.uAberration.value = fx.aberration;
    u.uGrain.value = fx.grain;
    u.uGlitch.value = fx.glitch;
    u.uBloom.value = fx.bloom;
    u.uDither.value = fx.dither;
    u.uTint.value.copy(fx.tint);
    u.uShake.value.set(Math.round(fx.shakeX), Math.round(fx.shakeY));
    u.uHD.value = this.hdOn ? 1 : 0;
    u.tHD.value = this.hdOn ? this.rtHD.texture : null;
    u.tMask.value = this.rt.texture;
    this.quad.material = this.post;
    this.gl.render(this.postScene, this.postCam);
  }

  // desenha um passe de tela cheia num alvo
  blit(material, target) {
    this.quad.material = material;
    this.gl.setRenderTarget(target);
    this.gl.render(this.postScene, this.postCam);
  }
}
