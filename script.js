// Инициализация Three.js сцены
const scene = new THREE.Scene();

// Настройка камеры (исправлено соотношение сторон)
const camera = new THREE.PerspectiveCamera(
  45, // Уменьшен угол обзора
  1, // Соотношение 1:1 для квадратного контейнера
  0.1,
  1000
);
camera.position.set(0, 0, 5); // Увеличено расстояние

// Инициализация рендерера (фиксированный размер)
const renderer = new THREE.WebGLRenderer({ 
  canvas: document.getElementById('three-canvas'),
  alpha: true,
  antialias: true
});
renderer.setSize(400, 400); // Жестко заданный размер
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Система освещения (без изменений)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
topLight.position.set(0, 5, 2);
topLight.castShadow = true;
topLight.shadow.mapSize.width = 2048;
topLight.shadow.mapSize.height = 2048;
scene.add(topLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 0.6);
frontLight.position.set(0, 0, 5);
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
backLight.position.set(0, 0, -5);
scene.add(backLight);

const sideLight = new THREE.DirectionalLight(0xffffff, 0.4);
sideLight.position.set(5, 0, 0);
scene.add(sideLight);

// Контейнер для вращения
const pivot = new THREE.Group();
scene.add(pivot);
pivot.position.set(0, 0, 0); // Сброс смещения

// Загрузка 3D-модели с автоцентрированием
const loader = new THREE.GLTFLoader();
let coin;

loader.load('assets/model.glb', (gltf) => {
  coin = gltf.scene;
  
  // Автоматическое центрирование и масштабирование
  const box = new THREE.Box3().setFromObject(coin);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 1.5 / maxDim; // Оптимальный масштаб
  
  coin.position.sub(center);
  coin.scale.set(scale, scale, scale);

  // Настройка материалов
  coin.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.metalness = 0.9;
        child.material.roughness = 0.3;
        child.material.envMapIntensity = 0.5;
      }
    }
  });

  pivot.add(coin);
}, undefined, (error) => {
  console.error('Ошибка загрузки модели:', error);
});

// Настройка управления (без изменений)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.8;
controls.enableZoom = false;
controls.enablePan = false;
controls.minPolarAngle = Math.PI/4;
controls.maxPolarAngle = Math.PI/2;

// Анимация (без изменений)
function animate() {
  requestAnimationFrame(animate);
  if (pivot && !controls.isDragging) pivot.rotation.y += 0.005;
  const time = Date.now() * 0.001;
  sideLight.intensity = 0.3 + Math.sin(time) * 0.1;
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Обработчик ресайза (оптимизирован)
window.addEventListener('resize', () => {
  renderer.setSize(400, 400); // Фиксированный размер
  camera.aspect = 1;
  camera.updateProjectionMatrix();
});