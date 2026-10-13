import * as THREE from 'three';
import './style.css';

const layers = [
  { id: 'roof', name: '屋盖与开口', kicker: 'ROOF', description: '外缘的钢结构围合出开放的椭圆形屋面，中部保留大面积开口。', color: '#b8792f', symbol: 'roof' },
  { id: 'steel', name: '主钢结构', kicker: 'STEEL FRAME', description: '交错的箱形钢构件组成独立的外部结构体系，形成“鸟巢”立面。', color: '#b84228', symbol: 'steel' },
  { id: 'bowl', name: '碗状看台', kicker: 'SEATING BOWL', description: '多层看台围合比赛空间，层层退台让观众席朝向场地集中。', color: '#356a9f', symbol: 'bowl' },
  { id: 'ring', name: '环形通道', kicker: 'CONCOURSE', description: '看台外侧的环形空间连接入口、观众席与疏散路径。', color: '#6f8a84', symbol: 'ring' },
  { id: 'pitch', name: '比赛场地', kicker: 'FIELD', description: '场地是整个空间关系的中心，视觉、动线与看台均围绕它组织。', color: '#6d927d', symbol: 'pitch' },
  { id: 'ground', name: '基础与地面', kicker: 'GROUND', description: '地下基础和地面平台承接上部结构，将建筑重量传递至地基。', color: '#8f8274', symbol: 'ground' }
];

const layerList = document.querySelector('#layer-list');
layers.forEach((layer, index) => {
  const item = document.createElement('div');
  item.className = `layer-item${index === 0 ? ' selected' : ''}`;
  item.dataset.layer = layer.id;
  item.innerHTML = `<span class="layer-index">${String(index + 1).padStart(2, '0')}</span><span class="layer-symbol symbol-${layer.symbol}"></span><span class="layer-name">${layer.name}</span><button class="visibility-toggle" type="button" aria-label="显示或隐藏${layer.name}" aria-pressed="true"></button>`;
  layerList.appendChild(item);
});

const detailCount = document.querySelector('#detail-count');
const detailKicker = document.querySelector('#detail-kicker');
const detailTitle = document.querySelector('#detail-title');
const detailDescription = document.querySelector('#detail-description');
const setDetail = (index) => {
  const layer = layers[index];
  detailCount.textContent = `${String(index + 1).padStart(2, '0')} / 06`;
  detailKicker.textContent = layer.kicker;
  detailTitle.textContent = layer.name;
  detailDescription.textContent = layer.description;
};
setDetail(0);
const selectLayer = (index) => {
  selectedLayer = index;
  document.querySelectorAll('.layer-item').forEach((el) => el.classList.remove('selected'));
  document.querySelector(`[data-layer="${layers[index].id}"]`).classList.add('selected');
  setDetail(index);
};

const sceneElement = document.querySelector('#scene');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
camera.position.set(8.4, 6.5, 10.7);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneElement.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#fff9e9', '#b9b1a7', 2.15));
const keyLight = new THREE.DirectionalLight('#fff9ed', 4.6);
keyLight.position.set(5, 9, 5);
keyLight.castShadow = true;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight('#b6d3f3', 1.2);
fillLight.position.set(-6, 4, -7);
scene.add(fillLight);

const root = new THREE.Group();
root.rotation.y = -0.35;
root.rotation.x = 0.08;
scene.add(root);
const modelGroups = Object.fromEntries(layers.map((layer) => [layer.id, new THREE.Group()]));
Object.values(modelGroups).forEach((group) => root.add(group));

const material = (color, roughness = .76, metalness = .04) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const steel = material('#9e7b5b', .54, .4);
const steelLight = material('#c7a37d', .46, .5);
const darkSteel = material('#5d4d42', .58, .5);
const blue = material('#315b82');
const green = material('#63866f');
const groundMat = material('#887c6f');
const edgeMat = new THREE.LineBasicMaterial({ color: '#815b43', transparent: true, opacity: .38 });

const ellipsePoints = (rx, rz, y, segments = 96, offset = 0) => {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t + offset) * rx, y, Math.sin(t + offset) * rz));
  }
  return points;
};
const ellipseTube = (rx, rz, y, tube, materialIn, offset = 0) => {
  const curve = new THREE.CatmullRomCurve3(ellipsePoints(rx, rz, y, 128, offset), true);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 128, tube, 8, true), materialIn);
};
const addEllipseLine = (parent, rx, rz, y, materialIn = edgeMat, offset = 0) => {
  const geo = new THREE.BufferGeometry().setFromPoints(ellipsePoints(rx, rz, y, 128, offset));
  parent.add(new THREE.Line(geo, materialIn));
};

const ground = new THREE.Mesh(new THREE.CylinderGeometry(6.55, 6.55, .14, 96), groundMat);
ground.scale.z = .77;
ground.position.y = -.1;
ground.receiveShadow = true;
modelGroups.ground.add(ground);
const podium = new THREE.Mesh(new THREE.CylinderGeometry(5.9, 6.15, .25, 96), material('#a79a8a'));
podium.scale.z = .75;
podium.position.y = .05;
podium.receiveShadow = true;
modelGroups.ground.add(podium);
addEllipseLine(modelGroups.ground, 6.15, 4.7, .18, new THREE.LineBasicMaterial({ color: '#d2b28d', transparent: true, opacity: .75 }));

const pitch = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, .05, 96), green);
pitch.scale.z = .64;
pitch.position.y = .25;
pitch.receiveShadow = true;
modelGroups.pitch.add(pitch);
const track = new THREE.Mesh(new THREE.RingGeometry(3.45, 4.02, 96), material('#bd936c'));
track.scale.y = .64;
track.rotation.x = -Math.PI / 2;
track.position.y = .28;
modelGroups.pitch.add(track);
const fieldLines = new THREE.Group();
const line = (x, z, sx, sz) => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ color: '#d6e1d4', transparent: true, opacity: .85 }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, .315, z);
  return mesh;
};
fieldLines.add(line(0, 0, 0.025, 4.2), line(0, 0, 6.2, .025), line(-2.55, 0, .025, 3.1), line(2.55, 0, .025, 3.1));
modelGroups.pitch.add(fieldLines);

// 看台使用同心环逐级抬升，便于在拆解状态下辨认退台关系。
const bowl = new THREE.Group();
for (let i = 0; i < 6; i++) {
  const outer = 3.9 + i * .30;
  const inner = outer - .38;
  const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 96), material(i % 2 ? '#b96752' : '#d18a6c'));
  ring.scale.y = .63;
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = .43 + i * .44;
  bowl.add(ring);
}
for (let i = 0; i < 18; i++) {
  const t = (i / 18) * Math.PI * 2;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.08, .62, 1.2), blue);
  seat.position.set(Math.cos(t) * 4.65, 1.36, Math.sin(t) * 2.93);
  seat.rotation.y = -t;
  bowl.add(seat);
}
modelGroups.bowl.add(bowl);

const concourse = new THREE.Group();
concourse.add(ellipseTube(5.38, 3.48, 2.5, .16, material('#b3ada4')));
concourse.add(ellipseTube(5.55, 3.59, 1.82, .09, material('#d9d4c9')));
modelGroups.ring.add(concourse);

const steelGroup = new THREE.Group();
const outerRx = 6.15, outerRz = 4.62;
for (let i = 0; i < 54; i++) {
  const t = (i / 54) * Math.PI * 2;
  const next = ((i * 13) % 54) / 54 * Math.PI * 2 + .24;
  const p1 = new THREE.Vector3(Math.cos(t) * outerRx, .63 + (i % 3) * .025, Math.sin(t) * outerRz);
  const p2 = new THREE.Vector3(Math.cos(next) * outerRx, 5.08 + (i % 5) * .075, Math.sin(next) * outerRz);
  const curve = new THREE.LineCurve3(p1, p2);
  const beam = new THREE.Mesh(new THREE.TubeGeometry(curve, 1, i % 4 === 0 ? .105 : .072, 6), i % 3 === 0 ? steelLight : steel);
  beam.castShadow = true;
  steelGroup.add(beam);
}
for (let i = 0; i < 30; i++) {
  const t = (i / 30) * Math.PI * 2 + .08;
  const p1 = new THREE.Vector3(Math.cos(t) * outerRx, 1.05 + (i % 3) * .1, Math.sin(t) * outerRz);
  const p2 = new THREE.Vector3(Math.cos(t + .67) * 5.38, 4.3 + (i % 4) * .12, Math.sin(t + .67) * 3.52);
  const beam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(p1, p2), 1, .058, 6), darkSteel);
  steelGroup.add(beam);
}
for (let i = 0; i < 13; i++) {
  const t = (i / 13) * Math.PI * 2;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(.075, .075, 4.8), steelLight);
  bar.position.set(0, 5.1, 0);
  bar.rotation.y = t;
  bar.rotation.x = .12 * Math.sin(t);
  steelGroup.add(bar);
}
modelGroups.steel.add(steelGroup);

const roof = new THREE.Group();
roof.add(ellipseTube(5.78, 4.3, 5.16, .105, steelLight));
roof.add(ellipseTube(3.58, 2.34, 5.16, .09, darkSteel));
for (let i = 0; i < 34; i++) {
  const t = (i / 34) * Math.PI * 2;
  const p1 = new THREE.Vector3(Math.cos(t) * 5.76, 5.16, Math.sin(t) * 4.29);
  const p2 = new THREE.Vector3(Math.cos(t + .06) * 3.61, 5.16, Math.sin(t + .06) * 2.36);
  roof.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(p1, p2), 1, .045, 5), steelLight));
}
const roofDeck = new THREE.Mesh(new THREE.RingGeometry(3.65, 5.5, 96), new THREE.MeshStandardMaterial({ color: '#cfcbc1', side: THREE.DoubleSide, transparent: true, opacity: .18, roughness: 1 }));
roofDeck.scale.z = .73;
roofDeck.scale.y = .73;
roofDeck.rotation.x = -Math.PI / 2;
roofDeck.position.y = 5.13;
roof.add(roofDeck);
modelGroups.roof.add(roof);

const defaultVisibility = Object.fromEntries(layers.map((l) => [l.id, true]));
const targetPositions = Object.fromEntries(layers.map((l) => [l.id, new THREE.Vector3()]));
const explodeDirections = {
  roof: new THREE.Vector3(0, 2.2, 0),
  steel: new THREE.Vector3(0, 1.05, 0),
  bowl: new THREE.Vector3(0, .25, 0),
  ring: new THREE.Vector3(0, -.1, 0),
  pitch: new THREE.Vector3(0, -.25, 0),
  ground: new THREE.Vector3(0, -1.05, 0)
};

let exploded = 0;
let sectioned = false;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedLayer = 0;
let drag = false, moved = false, lastX = 0, lastY = 0;
let yaw = -0.35, pitchAngle = .08, zoom = 1;
const minPitch = -.35, maxPitch = .8;

// 剖切仅裁剪模型，不裁剪页面背景；所有构件共用同一世界坐标平面。
const sectionPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
renderer.localClippingEnabled = true;
root.traverse((object) => {
  if (!object.isMesh) return;
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  materials.forEach((item) => { item.clippingPlanes = [sectionPlane]; item.clipShadows = true; });
});
sectionPlane.constant = 100;
const setSection = (enabled) => {
  sectioned = enabled;
  sectionPlane.constant = enabled ? 0 : 100;
};

const setSize = () => {
  const { width, height } = sceneElement.getBoundingClientRect();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
};
window.addEventListener('resize', setSize);
setSize();

const updateTargets = () => {
  layers.forEach((layer) => {
    const group = modelGroups[layer.id];
    const direction = explodeDirections[layer.id];
    targetPositions[layer.id].copy(direction).multiplyScalar(exploded / 100);
    group.visible = defaultVisibility[layer.id];
    group.position.lerp(targetPositions[layer.id], .18);
  });
};

const updateCamera = () => {
  root.rotation.y += (yaw - root.rotation.y) * .12;
  root.rotation.x += (pitchAngle - root.rotation.x) * .12;
  const fit = Math.max(1, (0.86 / camera.aspect) * 1.45);
  const distance = 16.5 * fit / zoom;
  camera.position.set(Math.sin(.85) * distance, 6.8 * fit / zoom, Math.cos(.85) * distance);
  camera.lookAt(0, 2.2, 0);
};

const updateLabels = () => {
  const labels = document.querySelectorAll('.model-label');
  root.updateMatrixWorld(true);
  labels.forEach((label) => {
    const layer = label.dataset.layer;
    const group = modelGroups[layer];
    const anchor = new THREE.Vector3(0, layer === 'ground' ? 0 : layer === 'pitch' ? .5 : 4.8, 0);
    anchor.applyMatrix4(group.matrixWorld);
    anchor.project(camera);
    const x = (anchor.x * .5 + .5) * sceneElement.clientWidth;
    const y = (-anchor.y * .5 + .5) * sceneElement.clientHeight;
    label.style.transform = `translate(${x}px, ${y}px)`;
    label.classList.toggle('visible', layer === layers[selectedLayer].id && defaultVisibility[layer]);
  });
};

const animate = () => {
  requestAnimationFrame(animate);
  updateTargets();
  updateCamera();
  updateLabels();
  renderer.render(scene, camera);
};
animate();
document.querySelector('#loading').classList.add('hidden');

layers.forEach((layer, index) => {
  const item = document.querySelector(`[data-layer="${layer.id}"]`);
  item.addEventListener('click', (event) => {
    if (event.target.closest('.visibility-toggle')) return;
    selectLayer(index);
  });
  item.querySelector('.visibility-toggle').addEventListener('click', (event) => {
    event.stopPropagation();
    defaultVisibility[layer.id] = !defaultVisibility[layer.id];
    event.currentTarget.classList.toggle('off', !defaultVisibility[layer.id]);
    event.currentTarget.setAttribute('aria-pressed', String(defaultVisibility[layer.id]));
    item.classList.toggle('selected', defaultVisibility[layer.id] && selectedLayer === index);
  });
});

const range = document.querySelector('#explode-range');
range.addEventListener('input', () => {
  exploded = Number(range.value);
  setSection(false);
  document.querySelector('#explode-value').textContent = `${exploded}%`;
  document.querySelectorAll('.mode-button').forEach((button) => {
    const active = button.dataset.mode === (exploded > 0 ? 'explode' : 'whole');
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
});
document.querySelector('#restore-button').addEventListener('click', () => {
  exploded = 0; range.value = 0; document.querySelector('#explode-value').textContent = '0%';
  setSection(false); yaw = -.35; pitchAngle = .08; zoom = 1;
  layers.forEach((layer) => { defaultVisibility[layer.id] = true; const button = document.querySelector(`[data-layer="${layer.id}"] .visibility-toggle`); button.classList.remove('off'); button.setAttribute('aria-pressed', 'true'); });
  document.querySelectorAll('.mode-button').forEach((button) => { button.classList.toggle('active', button.dataset.mode === 'whole'); button.setAttribute('aria-pressed', String(button.dataset.mode === 'whole')); });
});
document.querySelectorAll('.mode-button').forEach((button) => button.addEventListener('click', () => {
  const mode = button.dataset.mode;
  document.querySelectorAll('.mode-button').forEach((b) => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  if (mode === 'whole') { exploded = 0; setSection(false); }
  if (mode === 'explode') { exploded = 65; setSection(false); }
  if (mode === 'section') { exploded = 0; setSection(true); }
  range.value = exploded; document.querySelector('#explode-value').textContent = `${exploded}%`;
}));
document.querySelector('#reset-view').addEventListener('click', () => { yaw = -.35; pitchAngle = .08; zoom = 1; });
document.querySelector('#top-view').addEventListener('click', () => { pitchAngle = .82; yaw = -.65; });

sceneElement.addEventListener('pointerdown', (event) => { drag = true; moved = false; lastX = event.clientX; lastY = event.clientY; sceneElement.setPointerCapture(event.pointerId); });
sceneElement.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const dx = event.clientX - lastX, dy = event.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
  yaw += dx * .008; pitchAngle = THREE.MathUtils.clamp(pitchAngle + dy * .006, minPitch, maxPitch);
  lastX = event.clientX; lastY = event.clientY;
});
sceneElement.addEventListener('pointerup', (event) => {
  drag = false;
  sceneElement.releasePointerCapture(event.pointerId);
  if (moved) return;
  const rect = sceneElement.getBoundingClientRect();
  pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(Object.values(modelGroups), true)[0];
  if (!hit) return;
  let object = hit.object;
  while (object.parent && object.parent !== root) object = object.parent;
  const index = layers.findIndex((layer) => modelGroups[layer.id] === object);
  if (index >= 0) selectLayer(index);
});
sceneElement.addEventListener('wheel', (event) => { event.preventDefault(); zoom = THREE.MathUtils.clamp(zoom * (event.deltaY > 0 ? .93 : 1.075), .72, 1.55); }, { passive: false });

const labelContainer = document.querySelector('#model-labels');
layers.forEach((layer) => {
  const el = document.createElement('span');
  el.className = `model-label ${layer.id === 'roof' ? 'left' : ''}`;
  el.dataset.layer = layer.id;
  el.innerHTML = `<strong>${String(layers.indexOf(layer) + 1).padStart(2, '0')}</strong><span>${layer.name}</span>`;
  labelContainer.appendChild(el);
});
