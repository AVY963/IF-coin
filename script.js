const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    1000
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('three-canvas'),
    alpha: true,
    antialias: true
});
renderer.setSize(400, 400);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Улучшенное освещение монетки:
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
topLight.position.set(0, 5, 2);
topLight.castShadow = true;
topLight.shadow.mapSize.width = 2048;
topLight.shadow.mapSize.height = 2048;
scene.add(topLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
frontLight.position.set(0, 0, 5);
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0x00ffff, 0.5); // легкий голубой оттенок для контраста
backLight.position.set(0, 0, -5);
scene.add(backLight);

const sideLight = new THREE.DirectionalLight(0xffeedd, 0.8); // теплый оттенок для бокового света
sideLight.position.set(5, 0, 0);
scene.add(sideLight);

const pivot = new THREE.Group();
scene.add(pivot);
pivot.position.set(0, 0, 0);

const loader = new THREE.GLTFLoader();
let coin;

loader.load('assets/model.glb', (gltf) => {
    coin = gltf.scene;

    const box = new THREE.Box3().setFromObject(coin);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.5 / maxDim;

    coin.position.sub(center);
    coin.scale.set(scale, scale, scale);

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

// OrbitControls уже ограничивает вращение по вертикали:
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.8;
controls.enableZoom = false;
controls.enablePan = false;
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;

function animate() {
    requestAnimationFrame(animate);
    if (pivot && !controls.isDragging) pivot.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(400, 400);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
});

// GSAP ScrollTrigger для анимации блоков при скролле
gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.about, .how-to-buy, .contacts, .chart-section').forEach(section => {
    gsap.fromTo(
        section,
        { opacity: 0, y: 50, scale: 0.95 },
        { 
          opacity: 1, y: 0, scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
              trigger: section,
              start: 'top 95%',
              end: 'top 65%',
              scrub: true
          }
        }
    );
});

// Интерактивный фон: смещение фона в зависимости от положения мыши
document.addEventListener('mousemove', (e) => {
    const xPercent = e.clientX / window.innerWidth * 100;
    const yPercent = e.clientY / window.innerHeight * 100;
    document.body.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
});

// Плавный скролл при клике по навигационным ссылкам
document.querySelectorAll('header nav a, footer nav a').forEach(link => {
  link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
          const rect = targetElem.getBoundingClientRect();
          const offset = window.innerHeight / 2 - rect.height / 2;
          const targetPosition = targetElem.getBoundingClientRect().top + window.pageYOffset;
          const scrollToPosition = targetPosition - offset;
          window.scrollTo({
              top: scrollToPosition,
              behavior: 'smooth'
          });
      }
  });
});

// Функционал для мобильного меню
const menuToggle = document.querySelector('.menu-toggle');
const header = document.querySelector('header');

if (menuToggle) {
    console.log('menuToggle');
    menuToggle.addEventListener('click', () => {
        console.log('click');
        header.classList.toggle('active');
    });
}