// viewer.js — logica Three.js per MC Farm Viewer
// Dipende da: three.min.js (global THREE), FARM_DATA (global da farms/*.js)

const TEXTURE_BASE = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.1/assets/minecraft/textures/block/";

const TEXTURE_MAP = {
  dirt:           "dirt",
  grass_block:    "grass_block_top",
  water:          "water_still",
  sugar_cane:     "sugar_cane",
  observer:       "observer_front",
  piston:         "piston_top_normal",
  redstone:       "redstone_dust_dot",
  glass:          "glass",
  chest:          "oak_planks",
  hopper:         "hopper_top",
  stone:          "stone",
  powered_rail:   "rail_golden",
  rail:           "rail_flat",
  lever:          "lever",
  redstone_torch: "redstone_torch",
};

const FALLBACK_COLORS = {
  dirt:           0x8B5E3C,
  grass_block:    0x5D9E3B,
  water:          0x3D6EBD,
  sugar_cane:     0x4CAF50,
  observer:       0x888888,
  piston:         0xA0845C,
  redstone:       0xCC2200,
  glass:          0xADD8E6,
  chest:          0x8B6914,
  hopper:         0x555555,
  stone:          0x808080,
  powered_rail:   0xD4A017,
  rail:           0x888888,
  lever:          0x6B4226,
  redstone_torch: 0xFF3300,
};

// ── OrbitControls minimale ───────────────────────────────────────────────────
function makeOrbitControls(camera, domElement) {
  const ctrl = {
    target: new THREE.Vector3(),
    enableDamping: true,
    dampingFactor: 0.08,
    minDistance: 2,
    maxDistance: 80,
  };

  let _sph      = new THREE.Spherical();
  let _sphDelta = new THREE.Spherical();
  let _scale    = 1;
  let _pan      = new THREE.Vector3();
  let _lmbDown  = false, _rmbDown = false;
  let _last     = { x: 0, y: 0 };
  const _offset = new THREE.Vector3();
  const _quat   = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
  const _qInv   = _quat.clone().invert();
  const _v      = new THREE.Vector3();

  ctrl.update = function() {
    _offset.copy(camera.position).sub(ctrl.target);
    _offset.applyQuaternion(_quat);
    _sph.setFromVector3(_offset);
    _sph.theta += _sphDelta.theta;
    _sph.phi   += _sphDelta.phi;
    _sph.phi    = Math.max(0.05, Math.min(Math.PI - 0.05, _sph.phi));
    _sph.radius = Math.max(ctrl.minDistance, Math.min(ctrl.maxDistance, _sph.radius * _scale));
    ctrl.target.add(_pan);
    _offset.setFromSpherical(_sph).applyQuaternion(_qInv);
    camera.position.copy(ctrl.target).add(_offset);
    camera.lookAt(ctrl.target);
    if (ctrl.enableDamping) {
      _sphDelta.theta *= (1 - ctrl.dampingFactor);
      _sphDelta.phi   *= (1 - ctrl.dampingFactor);
      _pan.multiplyScalar(1 - ctrl.dampingFactor);
    } else {
      _sphDelta.set(0, 0, 0); _pan.set(0, 0, 0);
    }
    _scale = 1;
  };

  ctrl.reset = function(cx, cy, cz, tx, ty, tz) {
    camera.position.set(cx, cy, cz);
    ctrl.target.set(tx, ty, tz);
    _sphDelta.set(0, 0, 0); _pan.set(0, 0, 0); _scale = 1;
  };

  domElement.addEventListener('mousedown', e => {
    if (e.button === 0) _lmbDown = true;
    if (e.button === 2) _rmbDown = true;
    _last = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => { _lmbDown = false; _rmbDown = false; });
  window.addEventListener('mousemove', e => {
    const dx = e.clientX - _last.x;
    const dy = e.clientY - _last.y;
    if (_lmbDown && !_rmbDown) {
      _sphDelta.theta -= dx * 0.01;
      _sphDelta.phi   -= dy * 0.01;
    }
    if (_rmbDown) {
      const f = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2 * _sph.radius / domElement.clientHeight;
      const right = _v.set(camera.matrix.elements[0], camera.matrix.elements[1], camera.matrix.elements[2]).normalize();
      const up    = new THREE.Vector3(camera.matrix.elements[4], camera.matrix.elements[5], camera.matrix.elements[6]).normalize();
      _pan.addScaledVector(right, -dx * f).addScaledVector(up, dy * f);
    }
    _last = { x: e.clientX, y: e.clientY };
  });
  domElement.addEventListener('wheel', e => {
    _scale *= e.deltaY > 0 ? 1.1 : 0.9;
    e.preventDefault();
  }, { passive: false });
  domElement.addEventListener('contextmenu', e => e.preventDefault());

  return ctrl;
}

// ── Setup scena ──────────────────────────────────────────────────────────────
const canvas   = document.getElementById('three-canvas');
const wrap     = document.getElementById('canvas-wrap');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x111111);

const scene  = new THREE.Scene();
scene.fog = new THREE.Fog(0x111111, 40, 90);

const camera   = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
const controls = makeOrbitControls(camera, canvas);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(10, 20, 10);
scene.add(dir);

// ── Texture loader ───────────────────────────────────────────────────────────
const tlLoader = new THREE.TextureLoader();
const texCache = {};

function loadTex(blockId) {
  if (texCache[blockId]) return texCache[blockId];
  const file = TEXTURE_MAP[blockId] || blockId;
  const tex  = tlLoader.load(TEXTURE_BASE + file + ".png");
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  texCache[blockId] = tex;
  return tex;
}

// ── Blocchi ──────────────────────────────────────────────────────────────────
const blockGroup = new THREE.Group();
scene.add(blockGroup);
const matCache  = {};
let wireframeOn = false;

function getMat(blockId) {
  const key = blockId;
  if (matCache[key]) return matCache[key];
  const isGlass = blockId === 'glass';
  const isWater = blockId === 'water';

  let m;
  if (isGlass) {
    m = new THREE.MeshLambertMaterial({ map: loadTex(blockId), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
  } else if (isWater) {
    m = new THREE.MeshLambertMaterial({ color: FALLBACK_COLORS.water, transparent: true, opacity: 0.6 });
  } else {
    m = new THREE.MeshLambertMaterial({ map: loadTex(blockId) });
    // fallback colore se texture fallisce
    loadTex(blockId).addEventListener && loadTex(blockId).addEventListener('error', () => {
      m.map = null; m.color.setHex(FALLBACK_COLORS[blockId] ?? 0xaaaaaa); m.needsUpdate = true;
    });
  }
  matCache[key] = m;
  return m;
}

const boxGeom = new THREE.BoxGeometry(1, 1, 1);

function buildScene(maxLayer) {
  while (blockGroup.children.length) blockGroup.remove(blockGroup.children[0]);

  const layers  = FARM_DATA.layers;
  const showTo  = (maxLayer === undefined || maxLayer >= layers.length - 1) ? layers.length - 1 : maxLayer;

  layers.forEach((layer2d, ly) => {
    if (ly > showTo) return;
    layer2d.forEach((row, rz) => {
      row.forEach((blockId, rx) => {
        if (!blockId) return;
        const mesh = new THREE.Mesh(boxGeom, getMat(blockId));
        mesh.position.set(rx, ly, rz);
        mesh.userData = { blockId, x: rx, y: ly, z: rz };
        if (wireframeOn) mesh.material.wireframe = true;
        blockGroup.add(mesh);
      });
    });
  });
}

function addGrid() {
  const s  = FARM_DATA.size;
  const sz = Math.max(s.x, s.z) + 4;
  const g  = new THREE.GridHelper(sz, sz, 0x2a2a2a, 0x222222);
  g.position.set(s.x / 2 - 0.5, -0.51, s.z / 2 - 0.5);
  scene.add(g);
}

function resetCamera() {
  const s = FARM_DATA.size;
  controls.reset(s.x / 2 + 12, 10, s.z / 2 + 12, s.x / 2, 2, s.z / 2);
}

// ── Controlli UI ─────────────────────────────────────────────────────────────
const slider     = document.getElementById('layer-slider');
const layerLabel = document.getElementById('layer-label');

function setLayerLabel(v) {
  const max = FARM_DATA.layers.length - 1;
  layerLabel.textContent = parseInt(v) >= max ? 'Tutti' : 'Layer ' + v;
}

slider.addEventListener('input', e => {
  setLayerLabel(e.target.value);
  buildScene(parseInt(e.target.value));
});

document.getElementById('btn-wireframe').addEventListener('click', function() {
  wireframeOn = !wireframeOn;
  this.classList.toggle('active', wireframeOn);
  blockGroup.children.forEach(m => { if (m.material) m.material.wireframe = wireframeOn; });
});

document.getElementById('btn-reset-cam').addEventListener('click', resetCamera);

// ── Tooltip ──────────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();
const tooltip   = document.getElementById('tooltip');

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
  mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(blockGroup.children);
  if (hits.length) {
    const d   = hits[0].object.userData;
    const mat = FARM_DATA.materials.find(m => m.id === d.blockId);
    tooltip.textContent    = `${mat ? mat.name : d.blockId}  (${d.x}, ${d.y}, ${d.z})`;
    tooltip.style.display  = 'block';
    tooltip.style.left     = (e.clientX - r.left + 14) + 'px';
    tooltip.style.top      = (e.clientY - r.top  -  8) + 'px';
  } else {
    tooltip.style.display = 'none';
  }
});
canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

// ── Tabs ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ── Materiali ────────────────────────────────────────────────────────────────
const CHECKED_KEY = 'mc_farm_checked_' + FARM_DATA.name.replace(/\s+/g, '_');
let checked = JSON.parse(localStorage.getItem(CHECKED_KEY) || '[]');

function stacksStr(qty) {
  const s = Math.floor(qty / 64), r = qty % 64;
  if (s === 0) return qty + '';
  if (r === 0) return s + ' stack';
  return s + ' stack + ' + r;
}

function renderMaterials() {
  const list = document.getElementById('mat-list');
  list.innerHTML = '';
  FARM_DATA.materials.forEach(mat => {
    const isChecked = checked.includes(mat.id);
    const item      = document.createElement('div');
    item.className  = 'mat-item' + (isChecked ? ' checked' : '');
    const iconUrl   = TEXTURE_BASE + (TEXTURE_MAP[mat.id] || mat.id) + '.png';
    item.innerHTML  = `
      <img class="mat-icon" src="${iconUrl}" alt="${mat.name}" onerror="this.style.opacity='0.15'">
      <div class="mat-name">${mat.name}<small>${stacksStr(mat.qty)} (${mat.qty})</small></div>
      <div class="mat-qty">${mat.qty}</div>
      <div class="mat-check"></div>
    `;
    item.addEventListener('click', () => {
      checked = checked.includes(mat.id) ? checked.filter(c => c !== mat.id) : [...checked, mat.id];
      localStorage.setItem(CHECKED_KEY, JSON.stringify(checked));
      renderMaterials();
    });
    list.appendChild(item);
  });
  const done = checked.length, total = FARM_DATA.materials.length;
  document.getElementById('progress-text').textContent = done + ' / ' + total;
  document.getElementById('progress-bar').style.width  = (done / total * 100) + '%';
}

document.getElementById('mat-reset').addEventListener('click', () => {
  checked = []; localStorage.removeItem(CHECKED_KEY); renderMaterials();
});

// ── Steps ────────────────────────────────────────────────────────────────────
function renderSteps() {
  const list = document.getElementById('steps-list');
  list.innerHTML = '';
  FARM_DATA.steps.forEach((step, i) => {
    const item     = document.createElement('div');
    item.className = 'step-item';
    item.innerHTML = `
      <div class="step-num">${i + 1}</div>
      <div class="step-body">
        <div class="step-label">${step.label}</div>
        <div class="step-desc">${step.description}</div>
        <div class="step-layers">${step.layers.map(l => `<span class="step-layer-tag">Layer ${l}</span>`).join('')}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const maxL = Math.max(...step.layers);
      slider.value = maxL;
      setLayerLabel(maxL);
      buildScene(maxL);
    });
    list.appendChild(item);
  });
}

// ── Info ─────────────────────────────────────────────────────────────────────
function renderInfo() {
  const f     = FARM_DATA;
  const total = f.materials.reduce((s, m) => s + m.qty, 0);
  document.getElementById('info-panel').innerHTML = `
    <div class="info-row"><span>Edizione</span><span>${f.edition}</span></div>
    <div class="info-row"><span>Versione</span><span>${f.version}</span></div>
    <div class="info-row"><span>Difficoltà</span><span>${f.difficulty}</span></div>
    <div class="info-row"><span>Dimensioni</span><span>${f.size.x} × ${f.size.y} × ${f.size.z}</span></div>
    <div class="info-row"><span>Tipi blocchi</span><span>${f.materials.length}</span></div>
    <div class="info-row"><span>Blocchi totali</span><span>${total}</span></div>
    <div id="farm-desc">${f.description}</div>
  `;
}

// ── Resize ───────────────────────────────────────────────────────────────────
function onResize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

// ── Animate ──────────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
  // Verifica che FARM_DATA sia caricato
  if (typeof FARM_DATA === 'undefined') {
    document.getElementById('error-banner').style.display = 'block';
    document.getElementById('error-banner').textContent =
      'Errore: FARM_DATA non trovato. Apri il sito con un server HTTP (es: python3 -m http.server 8080)';
    return;
  }

  slider.max   = FARM_DATA.layers.length - 1;
  slider.value = FARM_DATA.layers.length - 1;
  setLayerLabel(slider.value);

  document.getElementById('farm-name').textContent    = FARM_DATA.name;
  document.getElementById('badge-edition').textContent = FARM_DATA.edition;
  document.getElementById('badge-version').textContent = FARM_DATA.version;
  document.getElementById('badge-diff').textContent    = FARM_DATA.difficulty;

  addGrid();
  buildScene();
  resetCamera();
  onResize();
  renderMaterials();
  renderSteps();
  renderInfo();
  animate();
}

init();
