/**
 * three-scene.js — 3D background (Three.js)
 * Partikel emas · ring wireframe · parallax kursor
 */
import * as THREE from 'three';

const GOLD = 0xe8d5a3;
const GOLD_DIM = 0xc9a227;
const TERRA = 0xa85a3a;

export class WeddingBackground3D {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      particleCount: options.particleCount ?? (window.innerWidth < 768 ? 280 : 720),
      showRings: options.showRings !== false,
      fogNear: options.fogNear ?? 4,
      fogFar: options.fogFar ?? 14,
      ...options,
    };

    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.clock = new THREE.Clock();
    this.running = true;
    this.meshes = [];
    this.rafId = null;

    this._init();
    this._bindEvents();
    this._animate();
  }

  _init() {
    const { clientWidth: w, clientHeight: h } = this.container;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0705, 0.08);

    this.camera = new THREE.PerspectiveCamera(50, w / h || 1, 0.1, 30);
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.classList.add('three-canvas');

    this.scene.add(new THREE.AmbientLight(0xfff5e6, 0.35));
    const pl1 = new THREE.PointLight(GOLD, 1.2, 20);
    pl1.position.set(3, 2, 4);
    this.scene.add(pl1);
    const pl2 = new THREE.PointLight(TERRA, 0.6, 16);
    pl2.position.set(-4, -2, 3);
    this.scene.add(pl2);

    this._createParticles();
    if (this.options.showRings) this._createRings();
    this._createFloatingShapes();
  }

  _createParticles() {
    const count = this.options.particleCount;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi) - 2;
      scales[i] = Math.random() * 0.8 + 0.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const mat = new THREE.PointsMaterial({
      color: GOLD,
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  _createRings() {
    const rings = [
      { r: 1.8, tube: 0.012, rot: [0.4, 0.2, 0] },
      { r: 2.4, tube: 0.008, rot: [0.8, -0.3, 0.5] },
      { r: 3.1, tube: 0.006, rot: [-0.2, 0.6, 0.3] },
    ];

    rings.forEach((cfg, i) => {
      const geo = new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: i === 0 ? GOLD : GOLD_DIM,
        transparent: true,
        opacity: 0.35 - i * 0.06,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(...cfg.rot);
      mesh.userData.spin = 0.08 + i * 0.04;
      mesh.userData.axis = i % 2 === 0 ? 'y' : 'x';
      this.scene.add(mesh);
      this.meshes.push(mesh);
    });
  }

  _createFloatingShapes() {
    const ico = new THREE.IcosahedronGeometry(0.55, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: GOLD_DIM,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const mesh = new THREE.Mesh(ico, mat);
    mesh.position.set(-2.2, 0.8, -1);
    mesh.userData.float = { y: 0.3, speed: 0.7 };
    this.scene.add(mesh);
    this.meshes.push(mesh);

    const oct = new THREE.OctahedronGeometry(0.35, 0);
    const mat2 = mat.clone();
    mat2.opacity = 0.18;
    const mesh2 = new THREE.Mesh(oct, mat2);
    mesh2.position.set(2.5, -1.1, -0.5);
    mesh2.userData.float = { y: 0.4, speed: 1.1 };
    this.scene.add(mesh2);
    this.meshes.push(mesh2);
  }

  _bindEvents() {
    this._onResize = () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (!w || !h) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    this._onMouse = e => {
      const rect = this.container.getBoundingClientRect();
      this.targetMouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.targetMouse.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    this._onVisibility = () => {
      this.running = document.visibilityState === 'visible';
      if (this.running && !this.rafId) this._animate();
    };

    window.addEventListener('resize', this._onResize);
    window.addEventListener('mousemove', this._onMouse);
    document.addEventListener('visibilitychange', this._onVisibility);
    this.resizeObserver = new ResizeObserver(this._onResize);
    this.resizeObserver.observe(this.container);
  }

  _animate() {
    if (!this.running) {
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(() => this._animate());
    const t = this.clock.getElapsedTime();

    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.04;

    this.camera.position.x = this.mouse.x * 0.45;
    this.camera.position.y = this.mouse.y * 0.35;
    this.camera.lookAt(0, 0, 0);

    if (this.particles) {
      this.particles.rotation.y = t * 0.04;
      this.particles.rotation.x = Math.sin(t * 0.15) * 0.05;
    }

    this.meshes.forEach((m, i) => {
      if (m.userData.spin) {
        m.rotation[m.userData.axis] += m.userData.spin * 0.01;
        m.rotation.z = Math.sin(t * 0.3 + i) * 0.1;
      }
      if (m.userData.float) {
        m.position.y += Math.sin(t * m.userData.float.speed + i) * 0.0008;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  fadeOut(duration = 1) {
    return new Promise(resolve => {
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / (duration * 1000), 1);
        this.renderer.domElement.style.opacity = String(1 - p);
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  destroy() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouse);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.resizeObserver?.disconnect();

    this.particles?.geometry.dispose();
    this.particles?.material.dispose();
    this.meshes.forEach(m => {
      m.geometry.dispose();
      m.material.dispose();
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

window.initWedding3D = (container, options) => {
  if (!container) return null;
  return new WeddingBackground3D(container, options);
};

window.dispatchEvent(new CustomEvent('wedding3d-ready'));
