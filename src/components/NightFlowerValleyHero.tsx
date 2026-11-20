"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";

const VALLEY_DEPTH = 140;

function valleyPathX(z: number): number {
  return Math.sin(z * 0.042) * 5.2 + Math.cos(z * 0.021) * 2.4;
}

function valleyTerrainY(x: number, z: number): number {
  const pathCenter = valleyPathX(z);
  const lateral = x - pathCenter;
  const bowl = Math.min(18, lateral * lateral * 0.046);
  const undulation =
    Math.sin(x * 0.14 + z * 0.08) * 1.15 +
    Math.cos(x * 0.07 - z * 0.11) * 0.95;
  return bowl + undulation - 3.6;
}

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement("canvas");
    const gl = probeCanvas.getContext("webgl2") || probeCanvas.getContext("webgl");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createFlowerAtlasTexture(): THREE.CanvasTexture {
  const size = 512;
  const half = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.colorSpace = THREE.SRGBColorSpace;
    return fallback;
  }

  ctx.clearRect(0, 0, size, size);

  const drawTile = (
    tx: number,
    ty: number,
    petals: number,
    innerRatio: number,
    elongation: number,
    glowTint: string
  ) => {
    const cx = tx * half + half * 0.5;
    const cy = ty * half + half * 0.5;
    const maxR = half * 0.42;

    // Soft nocturnal aura
    const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, maxR * 1.12);
    aura.addColorStop(0, glowTint);
    aura.addColorStop(0.45, "rgba(225, 240, 121, 0.24)");
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 1.12, 0, Math.PI * 2);
    ctx.fill();

    // Botanical petals
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);

      const grad = ctx.createRadialGradient(
        0,
        -maxR * 0.46,
        maxR * 0.04,
        0,
        -maxR * 0.48,
        maxR * 0.62
      );
      grad.addColorStop(0, "rgba(255, 253, 245, 0.98)");
      grad.addColorStop(0.55, "rgba(245, 239, 226, 0.85)");
      grad.addColorStop(1, "rgba(215, 226, 175, 0.08)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(
        0,
        -maxR * 0.46,
        maxR * innerRatio,
        maxR * elongation,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // Luminous stamen core
    const core = ctx.createRadialGradient(0, 0, 1, 0, 0, maxR * 0.26);
    core.addColorStop(0, "rgba(255, 255, 240, 1)");
    core.addColorStop(0.5, "rgba(225, 240, 121, 0.95)");
    core.addColorStop(1, "rgba(222, 118, 83, 0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, maxR * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawTile(0, 0, 5, 0.23, 0.44, "rgba(245, 239, 226, 0.5)");
  drawTile(1, 0, 6, 0.16, 0.48, "rgba(225, 240, 121, 0.5)");
  drawTile(0, 1, 8, 0.12, 0.46, "rgba(235, 210, 190, 0.45)");
  drawTile(1, 1, 4, 0.28, 0.4, "rgba(225, 240, 121, 0.42)");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createLeafAtlasTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.colorSpace = THREE.SRGBColorSpace;
    return fallback;
  }

  ctx.clearRect(0, 0, size, size);
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.35);

  const grad = ctx.createLinearGradient(0, -size * 0.4, 0, size * 0.4);
  grad.addColorStop(0, "rgba(182, 206, 134, 0.92)");
  grad.addColorStop(0.5, "rgba(104, 132, 76, 0.85)");
  grad.addColorStop(1, "rgba(44, 56, 32, 0.25)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.42);
  ctx.quadraticCurveTo(size * 0.28, -size * 0.12, 0, size * 0.42);
  ctx.quadraticCurveTo(-size * 0.28, -size * 0.12, 0, -size * 0.42);
  ctx.fill();

  // Central botanical vein
  ctx.strokeStyle = "rgba(225, 240, 121, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.36);
  ctx.lineTo(0, size * 0.36);
  ctx.stroke();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createSoftRayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "rgba(225, 240, 121, 0)");
    grad.addColorStop(0.28, "rgba(245, 239, 226, 0.16)");
    grad.addColorStop(0.7, "rgba(148, 178, 114, 0.08)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    ctx.globalCompositeOperation = "destination-in";
    const hMask = ctx.createLinearGradient(0, 0, 256, 0);
    hMask.addColorStop(0, "rgba(0,0,0,0)");
    hMask.addColorStop(0.5, "rgba(0,0,0,1)");
    hMask.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hMask;
    ctx.fillRect(0, 0, 256, 512);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const SplitRGBVignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVelocity: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVelocity;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float dist = length(centered);
      float shift = (0.0014 + min(uVelocity, 1.5) * 0.0022) * smoothstep(0.18, 0.85, dist);

      float r = texture2D(tDiffuse, vUv + centered * shift).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - centered * shift).b;

      vec3 col = vec3(r, g, b);

      // Subtle analog night grain
      float grain = (rand(vUv * 420.0 + fract(uTime)) - 0.5) * 0.028;
      col += grain;

      // Velocity-responsive vignette
      float vigStrength = 0.56 + min(uVelocity, 1.4) * 0.24;
      float vignette = smoothstep(0.95, 0.24, dist * (1.0 + vigStrength * 0.5));
      col *= mix(0.28, 1.0, vignette);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

class ValleyAmbientAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private chimeTimer: number | null = null;
  private isPlaying = false;
  private isMuffled = false;

  private ensureInit() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1850;
    filter.Q.value = 0.8;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.0001;

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Warm botanical nocturnal chord (D2, A2, E3, F#3, A3)
    const freqs = [73.42, 110.0, 164.81, 185.0, 220.0];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx < 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = (idx - 2) * 3.5;

      const oscGain = ctx.createGain();
      oscGain.gain.value = idx < 2 ? 0.065 : 0.022;

      // Gentle breathing LFO on amplitude
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.08 + idx * 0.031;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = oscGain.gain.value * 0.32;
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      lfo.start();
    });

    // Subtle wind hush via filtered noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.14;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 1.4;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.035;

    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(filter);
    noise.start();

    this.ctx = ctx;
    this.filter = filter;
    this.masterGain = masterGain;

    // Occasional soft pentatonic botanical harmonic shimmer
    const chimeNotes = [587.33, 659.25, 739.99, 880.0, 1174.66];
    this.chimeTimer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.filter) return;
      if (Math.random() > 0.45) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value =
        chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.018, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start(now);
      osc.stop(now + 2.9);
    }, 2400);
  }

  public toggle(): boolean {
    this.ensureInit();
    if (!this.ctx || !this.masterGain) return false;
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    this.isPlaying = !this.isPlaying;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(
      Math.max(0.0001, this.masterGain.gain.value),
      now
    );
    this.masterGain.gain.exponentialRampToValueAtTime(
      this.isPlaying ? 0.55 : 0.0001,
      now + 0.85
    );
    return this.isPlaying;
  }

  public setMuffled(muffled: boolean) {
    this.isMuffled = muffled;
    if (!this.ctx || !this.filter) return;
    const now = this.ctx.currentTime;
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setTargetAtTime(
      this.isMuffled ? 320 : 1850,
      now,
      0.26
    );
  }

  public dispose() {
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}

export default function NightFlowerValleyHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const hoverTargetRef = useRef(0);
  const audioRef = useRef<ValleyAmbientAudio | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    const heroEl = heroRef.current;
    if (!mountEl || !heroEl) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isSoftwareGl = detectSoftwareWebGL();
    const audio = new ValleyAmbientAudio();
    audioRef.current = audio;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: "high-performance",
        alpha: false,
      });
    } catch {
      const fallbackFrame = window.requestAnimationFrame(() => {
        setLoaded(true);
        setIntroReady(true);
      });
      return () => {
        window.cancelAnimationFrame(fallbackFrame);
        audio.dispose();
      };
    }

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x050607, 1);

    mountEl.innerHTML = "";
    mountEl.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050607);
    scene.fog = new THREE.FogExp2(0x050607, 0.022);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 160);
    camera.position.set(0, 1.4, 0);

    // Post-processing on GPU only; direct render on software WebGL
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let vignettePass: ShaderPass | null = null;

    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.72,
        0.55,
        0.34
      );
      composer.addPass(bloomPass);
      vignettePass = new ShaderPass(SplitRGBVignetteShader);
      composer.addPass(vignettePass);
    }

    // Procedural Textures
    const flowerAtlas = createFlowerAtlasTexture();
    const leafAtlas = createLeafAtlasTexture();
    const rayTexture = createSoftRayTexture();

    // 1. Flowers Point-Sprite Field
    const flowerCount = 3400;
    const flowerPositions = new Float32Array(flowerCount * 3);
    const flowerScales = new Float32Array(flowerCount);
    const flowerSeeds = new Float32Array(flowerCount * 4); // tileIdx, phase, colorVariant, disperseAngle
    const flowerColors = new Float32Array(flowerCount * 3);

    const palette = [
      new THREE.Color("#f5efe2"), // Fernhollow cream
      new THREE.Color("#e1f079"), // Kindsight chartreuse spark
      new THREE.Color("#b8d487"), // Moonlit sage
      new THREE.Color("#e69c7f"), // Soft terracotta petal
      new THREE.Color("#d5e2c4"), // Pale botanical mist
    ];

    for (let i = 0; i < flowerCount; i++) {
      const z = (Math.random() - 0.5) * VALLEY_DEPTH;
      const pathX = valleyPathX(z);
      // Keep a gentle walkable ribbon in the center, richer blooms on valley slopes
      const side = Math.random() < 0.5 ? -1 : 1;
      const spread = 1.4 + Math.pow(Math.random(), 1.35) * 26.0;
      const x = pathX + side * spread + (Math.random() - 0.5) * 3.0;
      const y = valleyTerrainY(x, z) + 0.35 + Math.random() * 1.15;

      flowerPositions[i * 3] = x;
      flowerPositions[i * 3 + 1] = y;
      flowerPositions[i * 3 + 2] = z;

      flowerScales[i] = 0.72 + Math.random() * 1.45;
      flowerSeeds[i * 4] = Math.floor(Math.random() * 4);
      flowerSeeds[i * 4 + 1] = Math.random() * Math.PI * 2;
      flowerSeeds[i * 4 + 2] = Math.random();
      flowerSeeds[i * 4 + 3] = Math.random() * Math.PI * 2;

      const pick =
        Math.random() < 0.36
          ? palette[0]
          : Math.random() < 0.65
          ? palette[1]
          : Math.random() < 0.82
          ? palette[2]
          : Math.random() < 0.93
          ? palette[3]
          : palette[4];

      flowerColors[i * 3] = pick.r;
      flowerColors[i * 3 + 1] = pick.g;
      flowerColors[i * 3 + 2] = pick.b;
    }

    const flowerGeo = new THREE.BufferGeometry();
    flowerGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(flowerPositions, 3)
    );
    flowerGeo.setAttribute("aScale", new THREE.BufferAttribute(flowerScales, 1));
    flowerGeo.setAttribute("aSeed", new THREE.BufferAttribute(flowerSeeds, 4));
    flowerGeo.setAttribute("aColor", new THREE.BufferAttribute(flowerColors, 3));

    const flowerMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uTravel: { value: 0 },
        uDepth: { value: VALLEY_DEPTH },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uAspect: { value: width / height },
        uHover: { value: 0 },
        uIntro: { value: 0 },
        uAtlas: { value: flowerAtlas },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTravel;
        uniform float uDepth;
        uniform float uPixelRatio;
        uniform vec2 uMouse;
        uniform float uAspect;
        uniform float uHover;
        uniform float uIntro;

        attribute float aScale;
        attribute vec4 aSeed;
        attribute vec3 aColor;

        varying vec3 vColor;
        varying float vTile;
        varying float vAlpha;
        varying float vGlow;
        varying float vRot;

        void main() {
          vec3 pos = position;

          // Seamless infinite looping along valley Z
          float halfD = uDepth * 0.5;
          float wrappedZ = mod(pos.z + uTravel + halfD, uDepth) - halfD;
          pos.z = wrappedZ;

          // Gentle nocturnal breeze sway
          float sway = sin(uTime * 0.9 + aSeed.y + pos.x * 0.25) * 0.22;
          pos.x += sway;
          pos.y += cos(uTime * 0.7 + aSeed.y) * 0.1;

          // Hover transition: disperse flowers outward into floating luminous particles
          if (uHover > 0.001) {
            float angle = aSeed.w + uTime * 0.45;
            float spread = (2.6 + aSeed.z * 7.5) * uHover;
            pos.x += cos(angle) * spread;
            pos.y += (1.2 + aSeed.z * 5.2) * uHover + sin(uTime * 1.4 + aSeed.y) * 0.6 * uHover;
            pos.z += sin(angle) * spread * 0.55;
          }

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float distZ = -mvPosition.z;

          // Bloom open as flowers approach the camera
          float bloomGrowth = smoothstep(58.0, 9.0, distZ) * smoothstep(0.6, 4.5, distZ);
          float introScale = smoothstep(0.0, 1.0, uIntro);

          vec4 clipPos = projectionMatrix * mvPosition;
          vec2 ndc = clipPos.xy / max(clipPos.w, 0.0001);

          // Screen-space mouse repulsion + proximity glow
          vec2 delta = ndc - uMouse;
          delta.x *= uAspect;
          float mDist = length(delta);
          float pushStrength = smoothstep(0.42, 0.0, mDist) * (1.0 - uHover * 0.5);
          vec2 pushDir = normalize(delta + vec2(0.0001));
          clipPos.xy += (pushDir / vec2(uAspect, 1.0)) * pushStrength * 0.14 * clipPos.w;

          gl_Position = clipPos;

          float basePoint = (195.0 * aScale * (0.28 + 0.92 * bloomGrowth) * introScale) / max(distZ, 1.4);
          // When hovered/dispersed, shrink slightly into glowing firefly pollen orbs
          float hoverSize = mix(1.0, 0.52, uHover);
          gl_PointSize = clamp(basePoint * hoverSize * uPixelRatio, 1.5, 96.0);

          float fogFade = exp(-pow(max(distZ, 0.0) * 0.025, 2.0));
          float nearFade = smoothstep(1.2, 5.2, distZ);
          vAlpha = fogFade * nearFade * introScale * mix(0.9, 1.0, pushStrength);
          vGlow = pushStrength * 1.15 + uHover * 0.75;
          vColor = mix(aColor, vec3(0.95, 0.97, 0.72), clamp(pushStrength * 0.8 + uHover * 0.45, 0.0, 1.0));
          vTile = aSeed.x;
          vRot = aSeed.y + sin(uTime * 0.35 + aSeed.z * 6.0) * 0.25;
        }
      `,
      fragmentShader: `
        uniform sampler2D uAtlas;
        uniform float uHover;

        varying vec3 vColor;
        varying float vTile;
        varying float vAlpha;
        varying float vGlow;
        varying float vRot;

        void main() {
          if (vAlpha < 0.015) discard;

          vec2 centered = gl_PointCoord - 0.5;
          float c = cos(vRot);
          float s = sin(vRot);
          vec2 rotated = mat2(c, -s, s, c) * centered + 0.5;

          float colIdx = mod(vTile, 2.0);
          float rowIdx = floor(vTile * 0.5);
          vec2 tileUv = (clamp(rotated, 0.0, 1.0) + vec2(colIdx, rowIdx)) * 0.5;

          vec4 tex = texture2D(uAtlas, tileUv);

          // Blend into luminous round particle orb during hover dispersion
          float orb = smoothstep(0.5, 0.08, length(centered));
          vec3 flowerRgb = tex.rgb * vColor * (1.0 + vGlow * 0.85);
          vec3 orbRgb = vColor * (1.35 + vGlow * 0.5);

          vec3 finalRgb = mix(flowerRgb, orbRgb, uHover * 0.78);
          float finalAlpha = mix(tex.a, orb, uHover * 0.75) * vAlpha;

          if (finalAlpha < 0.015) discard;
          gl_FragColor = vec4(finalRgb, finalAlpha);
        }
      `,
    });

    const flowerPoints = new THREE.Points(flowerGeo, flowerMat);
    flowerPoints.frustumCulled = false;
    scene.add(flowerPoints);

    // 2. Leaves & Ferns Point-Sprite Layer (deeper, olive/sage botanical ground)
    const leafCount = 2200;
    const leafPositions = new Float32Array(leafCount * 3);
    const leafScales = new Float32Array(leafCount);
    const leafSeeds = new Float32Array(leafCount * 2);

    for (let i = 0; i < leafCount; i++) {
      const z = (Math.random() - 0.5) * VALLEY_DEPTH;
      const pathX = valleyPathX(z);
      const side = Math.random() < 0.5 ? -1 : 1;
      const spread = 0.8 + Math.pow(Math.random(), 1.15) * 28.0;
      const x = pathX + side * spread;
      const y = valleyTerrainY(x, z) - 0.15 + Math.random() * 0.75;

      leafPositions[i * 3] = x;
      leafPositions[i * 3 + 1] = y;
      leafPositions[i * 3 + 2] = z;
      leafScales[i] = 0.9 + Math.random() * 1.6;
      leafSeeds[i * 2] = Math.random() * Math.PI * 2;
      leafSeeds[i * 2 + 1] = Math.random();
    }

    const leafGeo = new THREE.BufferGeometry();
    leafGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(leafPositions, 3)
    );
    leafGeo.setAttribute("aScale", new THREE.BufferAttribute(leafScales, 1));
    leafGeo.setAttribute("aSeed", new THREE.BufferAttribute(leafSeeds, 2));

    const leafMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uTravel: { value: 0 },
        uDepth: { value: VALLEY_DEPTH },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uAspect: { value: width / height },
        uHover: { value: 0 },
        uMap: { value: leafAtlas },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTravel;
        uniform float uDepth;
        uniform float uPixelRatio;
        uniform vec2 uMouse;
        uniform float uAspect;
        uniform float uHover;

        attribute float aScale;
        attribute vec2 aSeed;

        varying float vAlpha;
        varying float vRot;
        varying float vShade;

        void main() {
          vec3 pos = position;
          float halfD = uDepth * 0.5;
          pos.z = mod(pos.z + uTravel + halfD, uDepth) - halfD;
          pos.x += sin(uTime * 0.65 + aSeed.x) * 0.15;
          pos.y -= uHover * 1.4;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float distZ = -mvPosition.z;

          // Leaves grow further back than flowers
          float leafGrow = smoothstep(66.0, 22.0, distZ) * smoothstep(2.0, 9.0, distZ);

          vec4 clipPos = projectionMatrix * mvPosition;
          vec2 ndc = clipPos.xy / max(clipPos.w, 0.0001);
          vec2 delta = ndc - uMouse;
          delta.x *= uAspect;
          float push = smoothstep(0.38, 0.0, length(delta));
          clipPos.xy += (normalize(delta + vec2(0.0001)) / vec2(uAspect, 1.0)) * push * 0.09 * clipPos.w;

          gl_Position = clipPos;
          gl_PointSize = clamp((165.0 * aScale * leafGrow * uPixelRatio) / max(distZ, 2.0), 1.0, 74.0);

          float fogFade = exp(-pow(max(distZ, 0.0) * 0.028, 2.0));
          vAlpha = fogFade * leafGrow * (1.0 - uHover * 0.65) * 0.62;
          vRot = aSeed.x;
          vShade = 0.55 + aSeed.y * 0.45;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        varying float vAlpha;
        varying float vRot;
        varying float vShade;

        void main() {
          if (vAlpha < 0.015) discard;
          vec2 cUv = gl_PointCoord - 0.5;
          float c = cos(vRot);
          float s = sin(vRot);
          vec2 uv = mat2(c, -s, s, c) * cUv + 0.5;
          vec4 tex = texture2D(uMap, clamp(uv, 0.0, 1.0));
          float a = tex.a * vAlpha;
          if (a < 0.015) discard;
          gl_FragColor = vec4(tex.rgb * vShade, a);
        }
      `,
    });

    const leafPoints = new THREE.Points(leafGeo, leafMat);
    leafPoints.frustumCulled = false;
    scene.add(leafPoints);

    // 3. Drifting Luminescent Dust / Pollen Motes
    const dustCount = 520;
    const dustPos = new Float32Array(dustCount * 3);
    const dustSeeds = new Float32Array(dustCount * 2);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 44;
      dustPos[i * 3 + 1] = -2 + Math.random() * 14;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * VALLEY_DEPTH;
      dustSeeds[i * 2] = Math.random() * Math.PI * 2;
      dustSeeds[i * 2 + 1] = 0.5 + Math.random() * 1.4;
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeeds, 2));

    const dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uTravel: { value: 0 },
        uDepth: { value: VALLEY_DEPTH },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uHover: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTravel;
        uniform float uDepth;
        uniform float uPixelRatio;
        uniform float uHover;
        attribute vec2 aSeed;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          float halfD = uDepth * 0.5;
          pos.z = mod(pos.z + uTravel * 0.85 + halfD, uDepth) - halfD;
          pos.y += mod(uTime * 0.32 * aSeed.y + aSeed.x, 10.0) - 5.0;
          pos.x += sin(uTime * 0.4 + aSeed.x) * 1.2;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          float distZ = -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((38.0 * aSeed.y * (1.0 + uHover * 0.5) * uPixelRatio) / max(distZ, 1.5), 1.2, 16.0);
          float twinkle = 0.45 + 0.55 * sin(uTime * 2.2 + aSeed.x * 5.0);
          vAlpha = exp(-pow(max(distZ, 0.0) * 0.025, 2.0)) * smoothstep(1.5, 6.0, distZ) * twinkle * (0.55 + uHover * 0.35);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float soft = smoothstep(0.5, 0.05, d);
          if (soft * vAlpha < 0.01) discard;
          gl_FragColor = vec4(vec3(0.95, 0.94, 0.78), soft * vAlpha);
        }
      `,
    });

    const dustPoints = new THREE.Points(dustGeo, dustMat);
    dustPoints.frustumCulled = false;
    scene.add(dustPoints);

    // 4. Soft Volumetric Moonlight Ray Planes
    const rayGroup = new THREE.Group();
    const rayGeo = new THREE.PlaneGeometry(14, 34);
    const rayMat = new THREE.MeshBasicMaterial({
      map: rayTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const rayPlacements = [
      { x: -7, y: 8, z: -26, rotZ: -0.22 },
      { x: 4, y: 10, z: -38, rotZ: 0.16 },
      { x: 11, y: 7, z: -22, rotZ: 0.25 },
    ];
    rayPlacements.forEach((p) => {
      const m = new THREE.Mesh(rayGeo, rayMat);
      m.position.set(p.x, p.y, p.z);
      m.rotation.z = p.rotZ;
      rayGroup.add(m);
    });
    scene.add(rayGroup);

    // Interaction & flight state (zero GC allocations in loop)
    let travel = 0;
    let scrollBoost = 0;
    let hoverProgress = 0;
    let introProgress = prefersReduced ? 1 : 0;
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerSmooth = new THREE.Vector2(0, 0);
    const mouseUniform = new THREE.Vector2(9, 9);
    const mouseSmooth = new THREE.Vector2(9, 9);
    let pointerActive = false;

    const onPointerMove = (event: PointerEvent) => {
      const rect = heroEl.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= 0) return;
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      pointerTarget.set(
        THREE.MathUtils.clamp(nx, -1, 1),
        THREE.MathUtils.clamp(ny, -1, 1)
      );
      mouseUniform.set(pointerTarget.x, pointerTarget.y);
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
      pointerTarget.set(0, 0);
      mouseUniform.set(9, 9);
    };

    // Subtle virtual scroller boost from wheel/touch without blocking page scroll
    const onWheel = (event: WheelEvent) => {
      if (window.scrollY > window.innerHeight * 0.9) return;
      scrollBoost = THREE.MathUtils.clamp(
        scrollBoost + event.deltaY * 0.0085,
        -12,
        18
      );
    };

    let lastTouchY: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        lastTouchY = event.touches[0].clientY;
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (lastTouchY === null || event.touches.length === 0) return;
      const dy = lastTouchY - event.touches[0].clientY;
      lastTouchY = event.touches[0].clientY;
      scrollBoost = THREE.MathUtils.clamp(scrollBoost + dy * 0.08, -12, 18);
    };
    const onTouchEnd = () => {
      lastTouchY = null;
    };

    const onResize = () => {
      const w = mountEl.clientWidth || window.innerWidth;
      const h = mountEl.clientHeight || window.innerHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      const pr = renderer.getPixelRatio();
      flowerMat.uniforms.uPixelRatio.value = pr;
      flowerMat.uniforms.uAspect.value = w / h;
      leafMat.uniforms.uPixelRatio.value = pr;
      leafMat.uniforms.uAspect.value = w / h;
      dustMat.uniforms.uPixelRatio.value = pr;
      if (composer) composer.setSize(w, h);
      if (bloomPass) bloomPass.resolution.set(w, h);
    };

    heroEl.addEventListener("pointermove", onPointerMove, { passive: true });
    heroEl.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    heroEl.addEventListener("touchstart", onTouchStart, { passive: true });
    heroEl.addEventListener("touchmove", onTouchMove, { passive: true });
    heroEl.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let disposed = false;
    let frameId = 0;
    let firstFrameDrawn = false;
    let introDispatched = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === "function") {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const status = sync
            ? gl.getSyncParameter(sync, gl.SYNC_STATUS)
            : gl.SIGNALED;
          if (status === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    const tick = () => {
      if (disposed) return;

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;
      const elapsed = now * 0.001;

      // Intro ease
      introProgress = Math.min(1, introProgress + dt * 0.95);
      if (!introDispatched && introProgress >= 0.42) {
        introDispatched = true;
        setIntroReady(true);
      }

      // Hover transition damping (smoothly stops flight & disperses flowers)
      hoverProgress = THREE.MathUtils.damp(
        hoverProgress,
        hoverTargetRef.current,
        3.6,
        dt
      );

      // Smooth velocity + idle drift
      scrollBoost = THREE.MathUtils.damp(scrollBoost, 0, 2.8, dt);
      const idleDrift = prefersReduced ? 0.35 : 2.15;
      const flightSpeed = (idleDrift + scrollBoost) * (1.0 - hoverProgress * 0.92);
      travel += flightSpeed * dt;

      // Smooth pointer tilt and screen-space flower push
      pointerSmooth.x = THREE.MathUtils.damp(
        pointerSmooth.x,
        pointerTarget.x,
        4.2,
        dt
      );
      pointerSmooth.y = THREE.MathUtils.damp(
        pointerSmooth.y,
        pointerTarget.y,
        4.2,
        dt
      );
      if (pointerActive) {
        mouseSmooth.x = THREE.MathUtils.damp(
          mouseSmooth.x,
          mouseUniform.x,
          8.0,
          dt
        );
        mouseSmooth.y = THREE.MathUtils.damp(
          mouseSmooth.y,
          mouseUniform.y,
          8.0,
          dt
        );
      } else {
        mouseSmooth.set(9, 9);
      }

      // Camera glides along the winding valley spline
      const camX =
        Math.sin(travel * 0.036) * 2.1 + pointerSmooth.x * 1.05;
      const camY =
        1.55 + Math.cos(travel * 0.05) * 0.28 + pointerSmooth.y * 0.55;
      camera.position.set(camX, camY, 0);
      camera.lookAt(
        Math.sin((travel + 16) * 0.036) * 2.4 + pointerSmooth.x * 2.4,
        0.72 + pointerSmooth.y * 1.15,
        -22
      );

      // Subtle ray breathing
      rayGroup.position.x = Math.sin(elapsed * 0.18) * 1.6;
      rayMat.opacity = 0.34 + 0.1 * Math.sin(elapsed * 0.45) - hoverProgress * 0.12;

      // Update uniforms
      flowerMat.uniforms.uTime.value = elapsed;
      flowerMat.uniforms.uTravel.value = travel;
      flowerMat.uniforms.uHover.value = hoverProgress;
      flowerMat.uniforms.uIntro.value = introProgress;
      flowerMat.uniforms.uMouse.value.copy(mouseSmooth);

      leafMat.uniforms.uTime.value = elapsed;
      leafMat.uniforms.uTravel.value = travel;
      leafMat.uniforms.uHover.value = hoverProgress;
      leafMat.uniforms.uMouse.value.copy(mouseSmooth);

      dustMat.uniforms.uTime.value = elapsed;
      dustMat.uniforms.uTravel.value = travel;
      dustMat.uniforms.uHover.value = hoverProgress;

      if (vignettePass) {
        vignettePass.uniforms.uTime.value = elapsed;
        vignettePass.uniforms.uVelocity.value = Math.abs(scrollBoost) * 0.14;
      }

      // Pause rendering when scrolled completely past the hero to save GPU
      const heroVisible = window.scrollY < window.innerHeight * 1.2;
      if (heroVisible || !firstFrameDrawn) {
        if (composer && !isSoftwareGl) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      }

      if (!firstFrameDrawn) {
        firstFrameDrawn = true;
        setLoaded(true);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      heroEl.removeEventListener("pointermove", onPointerMove);
      heroEl.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("wheel", onWheel);
      heroEl.removeEventListener("touchstart", onTouchStart);
      heroEl.removeEventListener("touchmove", onTouchMove);
      heroEl.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);

      audio.dispose();
      audioRef.current = null;

      flowerGeo.dispose();
      flowerMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      rayGeo.dispose();
      rayMat.dispose();
      flowerAtlas.dispose();
      leafAtlas.dispose();
      rayTexture.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleToggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const playing = audio.toggle();
    setSoundOn(playing);
  };

  const handleHoverStart = () => {
    hoverTargetRef.current = 1;
    audioRef.current?.setMuffled(true);
  };

  const handleHoverStop = () => {
    hoverTargetRef.current = 0;
    audioRef.current?.setMuffled(false);
  };

  const handleExploreClick = () => {
    const target = document.getElementById("pengantar");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      id="top"
      aria-label="Beranda MotiBelajar"
      className="valley-hero"
    >
      {/* Isolated WebGL canvas mount */}
      <div
        ref={canvasMountRef}
        aria-hidden="true"
        className="absolute inset-0 z-0"
      />

      {/* Subtle top and bottom scrims for crisp editorial contrast */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(5,6,7,0.12) 0%, rgba(5,6,7,0.58) 100%)",
        }}
      />

      {/* Fernhollow-proportioned interface layer */}
      <div className={`valley-ui ${introReady ? "is-ready" : ""}`}>
        <header className="valley-header">
          <Link href="/" className="valley-logo" aria-label="MotiBelajar">
            MotiBelajar
          </Link>
          <nav aria-label="Navigasi utama" className="valley-nav">
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#peran">Peran</a>
            <Link href="/embed/courses">Ruang Publik</Link>
            <Link href="/login" className="valley-pill">
              Masuk
            </Link>
          </nav>
        </header>

        <div className="valley-center">
          <h1 className="valley-headline">Tumbuh, bukan dipaksa.</h1>
          <p className="valley-caption">
            Berakar pada rasa ingin tahu.
            <br />
            Dirancang untuk langkah berikutnya.
          </p>
          <button
            type="button"
            id="go"
            onClick={handleExploreClick}
            onPointerEnter={handleHoverStart}
            onPointerLeave={handleHoverStop}
            onFocus={handleHoverStart}
            onBlur={handleHoverStop}
            aria-label="Jelajahi ruang tumbuh MotiBelajar"
            className="valley-go"
          >
            <ArrowRight className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        <div className="valley-corner">
          <span>Geser untuk menyusuri</span>
          <span className="valley-corner-divider" aria-hidden="true" />
          <button
            type="button"
            onClick={handleToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Matikan suara ambien" : "Nyalakan suara ambien"}
            className="valley-sound"
          >
            {soundOn ? (
              <Volume2 className="h-5 w-5" strokeWidth={1.6} />
            ) : (
              <VolumeX className="h-5 w-5" strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>

      {/* Initial black veil loader that fades cleanly once 3D valley initializes */}
      <div
        aria-hidden="true"
        className={`valley-loader ${loaded ? "is-gone" : ""}`}
      >
        <span className="valley-loader-dot" />
      </div>
    </section>
  );
}
