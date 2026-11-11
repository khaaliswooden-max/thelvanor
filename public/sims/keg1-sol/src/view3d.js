// Schematic 3D reconstruction of Keg-1 SOL, driven by simulation state.
// Layout follows CAD rev E (engineering review only): 5-gal keg, one narrow
// rolled aluminium strip on the inner wall carrying three boards stacked
// long-axis vertical, PV panel fixed at 30 deg on its own stand, power plant
// (MPPT + battery) OUTSIDE the keg, four temperature probes.
// This is a schematic, not the CAD model: proportions are indicative.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';

const C = {
  bg: 0x1a1c20, steel: 0x9aa3ab, steelDark: 0x5b6770, orange: 0xe8650a,
  panelGlass: 0x16242f, panelCell: 0x1d3a4d, plate: 0x8a94a6,
  nodeCase: 0x2a2d33, battery: 0x25302a, mppt: 0x262a31,
  load: 0x5b9cf6, ok: 0x3fbf74, amber: 0xd99a1b, red: 0xe5534b,
  grid: 0x2e3137, gridMinor: 0x25272c,
};

function tempColor(tC) {
  // -10°C (blue) .. 90°C (red)
  const x = Math.min(1, Math.max(0, (tC + 10) / 100));
  const c = new THREE.Color();
  c.setHSL(0.62 - 0.62 * x, 0.85, 0.45 + 0.1 * x);
  return c;
}

function makeLabel(text, scale = 1) {
  const cv = document.createElement('canvas');
  cv.width = 320; cv.height = 56;
  const g = cv.getContext('2d');
  g.font = '500 24px "IBM Plex Mono",ui-monospace,monospace';
  g.fillStyle = '#f2f2f0';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 160, 28);
  const tex = new THREE.CanvasTexture(cv);
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const s = new THREE.Sprite(m);
  s.scale.set(0.30 * scale, 0.0525 * scale, 1);
  return s;
}

export class View3D {
  // rendererFactory is injectable for headless smoke tests (no WebGL needed
  // to validate the scene graph, state mapping, and packet logic).
  constructor(container, rendererFactory = null) {
    this.container = container;
    const w = container.clientWidth || 800, h = container.clientHeight || 400;
    this.renderer = rendererFactory
      ? rendererFactory()
      : new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h);
    if (this.renderer.domElement) container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(C.bg);
    this.scene.fog = new THREE.Fog(C.bg, 2.6, 6);

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 20);
    this.camera.position.set(0.92, 0.82, 1.24);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement ?? container);
    this.controls.target = new THREE.Vector3(0.08, 0.58, 0);
    this.controls.enableDamping = true;
    // Rotate only. Wheel-zoom and pan would trap page scrolling when the app
    // sits inside the site; vertical swipes pass through to the page on touch.
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    if (this.renderer.domElement?.style) this.renderer.domElement.style.touchAction = 'pan-y';
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xa0a6b0, 0.6));
    const key = new THREE.DirectionalLight(0xfff2dd, 1.6);
    key.position.set(1.4, 2.2, 0.8);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fb0c8, 0.45);
    rim.position.set(-1.5, 0.8, -1.2);
    this.scene.add(rim);

    this._build();
    this.labels = [];
    this._labels();
    this.cutaway = false;

    this.packets = [];
    this.packetAcc = { pv: 0, batt: 0, load: 0 };

    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this._resize());
      this._ro.observe(container);
    }
  }

  _build() {
    const S = this.scene;

    // ground grid
    const grid = new THREE.GridHelper(2.4, 24, C.grid, C.gridMinor);
    grid.position.y = 0;
    S.add(grid);

    // ---- keg shell: two half cylinders so cutaway can hide the front ----
    const R = 0.108, H = 0.635, Y0 = 0.02;
    const shellMat = new THREE.MeshStandardMaterial({
      color: C.steel, metalness: 0.85, roughness: 0.35, side: THREE.DoubleSide,
    });
    this.shellFront = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, H, 48, 1, true, -Math.PI / 2, Math.PI), shellMat);
    const shellBack = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, H, 48, 1, true, Math.PI / 2, Math.PI), shellMat);
    for (const m of [this.shellFront, shellBack]) { m.position.y = H / 2 + Y0; S.add(m); }
    // rims + lid ring (orange accent, painted keg)
    const rimG = new THREE.TorusGeometry(R, 0.006, 10, 48);
    for (const y of [Y0, H + Y0]) {
      const rim = new THREE.Mesh(rimG, new THREE.MeshStandardMaterial({ color: C.orange, metalness: 0.4, roughness: 0.5 }));
      rim.rotation.x = Math.PI / 2; rim.position.y = y; S.add(rim);
    }
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.012, 48),
      new THREE.MeshStandardMaterial({ color: C.steelDark, metalness: 0.8, roughness: 0.45 }));
    lid.position.y = H + Y0 + 0.006; S.add(lid);

    // ---- PV panel: fixed 30 deg tilt on an independent four-leg stand (rev E) ----
    const TILT = Math.PI / 6, PV_Y = 0.98;
    const pv = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.012, 0.42),
      new THREE.MeshStandardMaterial({ color: C.panelGlass, metalness: 0.3, roughness: 0.25 }));
    pv.add(glass);
    // cell grid
    const cellMat = new THREE.MeshStandardMaterial({ color: C.panelCell, metalness: 0.5, roughness: 0.3, emissive: 0x12303f, emissiveIntensity: 0.4 });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
      const cell = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.004, 0.096), cellMat);
      cell.position.set(-0.2575 + i * 0.103, 0.008, -0.1575 + j * 0.105);
      pv.add(cell);
    }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.016, 0.44),
      new THREE.MeshStandardMaterial({ color: C.steelDark, metalness: 0.7, roughness: 0.4, wireframe: true }));
    pv.add(frame);
    pv.position.set(0, PV_Y, 0);
    pv.rotation.x = -TILT;
    S.add(pv);
    this.pvPanel = pv;
    // stand legs: ground to the panel underside, clear of the keg
    const legMat = new THREE.MeshStandardMaterial({ color: C.steelDark, metalness: 0.6, roughness: 0.5 });
    for (const x of [-0.27, 0.27]) for (const z of [-0.17, 0.17]) {
      const top = PV_Y + z * Math.tan(TILT) - 0.01;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, top, 8), legMat);
      leg.position.set(x, top / 2, z); S.add(leg);
    }

    // ---- internal stack: one narrow strip on the wall + 3 boards, long axis vertical ----
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.375, 0.066),
      new THREE.MeshStandardMaterial({ color: C.plate, metalness: 0.9, roughness: 0.35 }));
    plate.position.set(-R + 0.006, Y0 + 0.3725, 0);
    S.add(plate);
    this.plate = plate;

    this.nodes = [];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.085, 0.056),
        new THREE.MeshStandardMaterial({ color: C.nodeCase, metalness: 0.4, roughness: 0.6 }));
      g.add(body);
      // SoC + spacer block bridging board to strip
      const socChip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xe8650a, emissiveIntensity: 0.5 }));
      socChip.position.set(-0.012, -0.009, 0.005);
      g.add(socChip);
      g.position.set(-R + 0.03, Y0 + 0.2275 + i * 0.125, 0);
      S.add(g);
      this.nodes.push({ group: g, chip: socChip, body });
    }

    // ---- temperature probes P1..P4 ----
    this.probes = [];
    const probePos = [
      [-R + 0.012, Y0 + 0.54, 0],     // P1 on the strip, above the top board
      [-0.083, Y0 + 0.54, 0.062],     // P2 inner wall beside the strip
      [0.02, Y0 + 0.55, -0.03],       // P3 internal air near the top
      [0.19, 0.50, 0.13],             // P4 shaded outside air
    ];
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 12),
        new THREE.MeshStandardMaterial({ color: C.ok, emissive: C.ok, emissiveIntensity: 0.6 }));
      p.position.set(...probePos[i]);
      S.add(p);
      this.probes.push(p);
    }

    // ---- external power plant: battery + MPPT + fuse, beside the keg ----
    const plant = new THREE.Group();
    const battBox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.19, 0.11),
      new THREE.MeshStandardMaterial({ color: C.battery, metalness: 0.3, roughness: 0.6 }));
    battBox.position.set(0, 0.095, 0);
    plant.add(battBox);
    // SoC bar on the battery front
    this.socBarBg = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.15, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x101114 }));
    this.socBarBg.position.set(0.082, 0.095, 0);
    plant.add(this.socBarBg);
    this.socBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1, 0.048),
      new THREE.MeshStandardMaterial({ color: C.ok, emissive: C.ok, emissiveIntensity: 0.5 }));
    this.socBar.position.set(0.084, 0.02 + 0.075, 0);
    plant.add(this.socBar);
    const mpptBox = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.13, 0.08),
      new THREE.MeshStandardMaterial({ color: C.mppt, metalness: 0.4, roughness: 0.5 }));
    mpptBox.position.set(0.16, 0.065, 0);
    plant.add(mpptBox);
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 10),
      new THREE.MeshStandardMaterial({ color: C.orange, emissive: C.orange, emissiveIntensity: 0.3 }));
    fuse.rotation.z = Math.PI / 2;
    fuse.position.set(-0.13, 0.16, 0);
    plant.add(fuse);
    plant.position.set(0.34, 0, 0.16);
    S.add(plant);

    // ---- protection status ring around keg base ----
    this.statusRing = new THREE.Mesh(new THREE.TorusGeometry(R + 0.035, 0.006, 8, 64),
      new THREE.MeshBasicMaterial({ color: C.ok, transparent: true, opacity: 0.8 }));
    this.statusRing.rotation.x = Math.PI / 2;
    this.statusRing.position.y = 0.012;
    S.add(this.statusRing);

    // ---- power-flow paths (packet routes) ----
    this.paths = {
      pv: new THREE.LineCurve3(new THREE.Vector3(0.18, 0.94, 0.02), new THREE.Vector3(0.50, 0.10, 0.16)),  // panel -> MPPT
      batt: new THREE.LineCurve3(new THREE.Vector3(0.34, 0.14, 0.16), new THREE.Vector3(0.13, 0.52, 0.02)), // battery -> upper-sidewall gland
      load: new THREE.LineCurve3(new THREE.Vector3(0.13, 0.52, 0.02), new THREE.Vector3(-0.07, 0.38, 0.0)), // bus -> nodes
    };
    for (const k of Object.keys(this.paths)) {
      const pts = this.paths[k].getPoints(24);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x3d4149 }));
      S.add(line);
    }
    this.packetGeo = new THREE.SphereGeometry(0.007, 8, 8);
    this.packetMat = {
      pv: new THREE.MeshBasicMaterial({ color: C.amber }),
      batt: new THREE.MeshBasicMaterial({ color: C.ok }),
      load: new THREE.MeshBasicMaterial({ color: C.load }),
    };
  }

  _labels() {
    const defs = [
      ['PV 100 W · 30° south', 0, 1.20, 0], ['KEG-1 · 5 GAL SS', 0, 0.72, 0],
      ['3x Pi 5 on Al strip', -0.04, 0.60, 0.0], ['BATTERY 256 Wh', 0.34, 0.25, 0.16],
      ['MPPT', 0.50, 0.17, 0.16], ['P1-P4 probes', 0.26, 0.56, 0.10],
    ];
    for (const [txt, x, y, z] of defs) {
      const s = makeLabel(txt);
      s.position.set(x, y, z);
      this.scene.add(s);
      this.labels.push(s);
    }
  }

  toggleCutaway() {
    this.cutaway = !this.cutaway;
    this.shellFront.visible = !this.cutaway;
    for (const l of this.labels) l.visible = true;
    return this.cutaway;
  }
  toggleLabels() {
    const v = !this.labels[0].visible;
    for (const l of this.labels) l.visible = v;
    return v;
  }

  // row: one telemetry row; flow rates in W for packet pacing
  setState(row) {
    if (!row) return;
    // node colors / chip glow
    for (let i = 0; i < 3; i++) {
      const t = row[`t_node${i}_c`];
      const u = row[`node${i}_util`] ?? 0;
      this.nodes[i].body.material.color = tempColor(t);
      this.nodes[i].chip.material.emissive = tempColor(t);
      this.nodes[i].chip.material.emissiveIntensity = 0.25 + 0.75 * Math.min(1, u);
    }
    this.plate.material.color = tempColor(row.t_plate_c);
    // probes
    const pt = [row.t_plate_c, row.t_wall_c, (row.t_plate_c + row.t_wall_c) / 2, row.t_amb_c];
    for (let i = 0; i < 4; i++) {
      const c = tempColor(pt[i]);
      this.probes[i].material.color = c; this.probes[i].material.emissive = c;
    }
    // battery bar
    const soc = Math.min(1, Math.max(0, row.soc));
    this.socBar.scale.y = Math.max(0.001, soc * 0.15);
    this.socBar.position.y = 0.02 + (soc * 0.15) / 2;
    const sc = soc <= 0.2 ? C.red : soc <= 0.4 ? C.amber : C.ok;
    this.socBar.material.color.setHex(sc); this.socBar.material.emissive.setHex(sc);
    // status ring
    const ringColor = row.brownout ? C.red : row.protection_state !== 'normal' ? C.red
      : row.thermal_throttle ? C.amber : row.fault_active ? C.amber : C.ok;
    this.statusRing.material.color.setHex(ringColor);
    // panel glow by irradiance
    const pvGlow = Math.min(1, (row.pv_power_w ?? 0) / 100);
    this.pvPanel.children.forEach(ch => {
      if (ch.material && ch.material.emissive) ch.material.emissiveIntensity = 0.15 + 0.85 * pvGlow;
    });
    this._flow = { pv: row.pv_power_w ?? 0, batt: Math.max(0, row.batt_out_w ?? 0), load: row.device_power_w ?? 0 };
  }

  _spawnPackets(dtReal) {
    // packet rate proportional to watts (1 packet/s ~ 12 W)
    for (const k of ['pv', 'batt', 'load']) {
      const rate = (this._flow?.[k] ?? 0) / 12;
      this.packetAcc[k] += rate * dtReal;
      while (this.packetAcc[k] >= 1) {
        this.packetAcc[k] -= 1;
        const m = new THREE.Mesh(this.packetGeo, this.packetMat[k]);
        m.userData = { path: this.paths[k], t: 0 };
        this.scene.add(m);
        this.packets.push(m);
      }
    }
  }

  render(dtReal = 0.016) {
    this._spawnPackets(dtReal);
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.userData.t += dtReal * 0.7;
      if (p.userData.t >= 1) {
        this.scene.remove(p); this.packets.splice(i, 1); continue;
      }
      p.position.copy(p.userData.path.getPoint(p.userData.t));
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
