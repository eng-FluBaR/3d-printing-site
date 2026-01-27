/**
 * 3D Viewer Module - Управление на 3D визуализатор
 */

let scene, camera, renderer, controls;
let currentModel = null;
let fileLoaded = false;
let animationId = null;

export function init3DViewer() {
    const container = document.getElementById('modelViewer');
    
    if (!container) {
        console.warn('Контейнер modelViewer не намерен!');
        return;
    }

    initThreeJS();
    setupFileUpload();
}

function initThreeJS() {
    const container = document.getElementById('modelViewer');
    
    console.log('Инициализиране на Three.js...');
    console.log('Контейнер размер:', container.clientWidth, 'x', container.clientHeight);

    // Изчистване на предишния renderer
    if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
    }

    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd4d4d4);

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    console.log('Създаване на камера и renderer с размер:', width, 'x', height);

    // Камера
    camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 2000);
    camera.position.set(0, 0, 150);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, precision: 'highp' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    console.log('Renderer добавен към контейнер');

    // Осветление
    const light1 = new THREE.DirectionalLight(0xffffff, 1.5);
    light1.position.set(150, 100, 100);
    light1.castShadow = true;
    light1.shadow.mapSize.width = 4096;
    light1.shadow.mapSize.height = 4096;
    light1.userData.originalIntensity = 1.5;
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x6688ff, 0.8);
    light2.position.set(-150, -100, -100);
    light2.userData.originalIntensity = 0.8;
    scene.add(light2);

    const light3 = new THREE.DirectionalLight(0xffffff, 0.6);
    light3.position.set(0, 150, 0);
    light3.userData.originalIntensity = 0.6;
    scene.add(light3);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    ambientLight.userData.originalIntensity = 0.9;
    scene.add(ambientLight);

    // Контрола
    controls = createSimpleControls(camera, renderer.domElement);

    // Анимационен цикъл
    animate();
    
    console.log('Three.js инициализирана успешно');
}

function createSimpleControls(camera, domElement) {
    const controls = {
        enableDamping: true,
        dampingFactor: 0.05,
        autoRotate: true,
        autoRotateSpeed: 2,
        isDragging: false,
        previousMousePosition: { x: 0, y: 0 },
        minZoom: 30,
        maxZoom: 1000,
        zoomSpeed: 50,

        update: function() {
            if (this.enableDamping && this.isDragging) {
                this.autoRotate = false;
            } else if (!this.isDragging) {
                this.autoRotate = true;
            }

            if (this.autoRotate) {
                if (scene.children[0]) {
                    scene.children[0].rotation.y += this.autoRotateSpeed * 0.001;
                }
            }
        }
    };

    let isMouseDown = false;

    domElement.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        controls.isDragging = true;
        controls.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    domElement.addEventListener('mousemove', (e) => {
        if (isMouseDown && scene.children[0]) {
            const deltaX = e.clientX - controls.previousMousePosition.x;
            const deltaY = e.clientY - controls.previousMousePosition.y;

            scene.children[0].rotation.y += deltaX * 0.01;
            scene.children[0].rotation.x += deltaY * 0.01;

            controls.previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    domElement.addEventListener('mouseup', () => {
        isMouseDown = false;
        controls.isDragging = false;
    });

    domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? 1 : -1;
        camera.position.z += zoomDelta * controls.zoomSpeed;
        camera.position.z = Math.max(controls.minZoom, Math.min(controls.maxZoom, camera.position.z));
    }, { passive: false });

    return controls;
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }

    renderer.render(scene, camera);
}

function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');

    if (!fileInput || !uploadBtn) return;

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadModel(file);
        }
    });
}

function loadModel(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const data = e.target.result;

        if (file.name.toLowerCase().endsWith('.stl')) {
            const geometry = new window.STLLoader.STLGeometry(data);
            loadGeometry(geometry);
        } else if (file.name.toLowerCase().endsWith('.obj')) {
            console.log('OBJ формат - изискува OBJLoader');
        }

        fileLoaded = true;
        console.log('Модел заредени:', file.name);
    };

    reader.readAsArrayBuffer(file);
}

function loadGeometry(geometry) {
    // Премахни стари модели
    const objectsToRemove = scene.children.filter(obj => obj instanceof THREE.Mesh);
    objectsToRemove.forEach(obj => scene.remove(obj));

    geometry.computeBoundingBox();
    geometry.center();
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        emissive: 0x111111,
        shininess: 200,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);
}

export function reset3DViewer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    scene = null;
    camera = null;
    renderer = null;
    currentModel = null;
    fileLoaded = false;
}
