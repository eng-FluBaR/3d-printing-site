/* ==================== 3D ВИЗУАЛИЗАТОР И УПРАВЛЕНИЕ НА ФАЙЛОВЕ ==================== */

let scene, camera, renderer, controls;
let currentModel = null;
let fileLoaded = false;
let animationId = null;

// Инициализация на 3D сцена
function initThreeJS() {
    const container = document.getElementById('modelViewer');
    
    if (!container) {
        console.error('Контейнер modelViewer не намерен!');
        return;
    }

    console.log('Инициализиране на Three.js...');
    console.log('Контейнер размер:', container.clientWidth, 'x', container.clientHeight);

    // Изчистване на предишния renderer, ако съществува
    if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
    }

    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x667eea);
    scene.fog = new THREE.Fog(0x667eea, 1000, 10);

    // Размери на контейнера
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    console.log('Създаване на камера и renderer с размер:', width, 'x', height);

    // Камера
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 150);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    
    // Изчистване на контейнера преди добавяне
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    console.log('Renderer добавен към контейнер');

    // Осветление
    const light1 = new THREE.DirectionalLight(0xffffff, 1.0);
    light1.position.set(100, 100, 100);
    light1.castShadow = true;
    light1.shadow.mapSize.width = 2048;
    light1.shadow.mapSize.height = 2048;
    light1.userData.originalIntensity = 1.0; // Запазване на оригиналната интензитет
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-100, -100, -100);
    light2.userData.originalIntensity = 0.5;
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    ambientLight.userData.originalIntensity = 0.7;
    scene.add(ambientLight);

    // Простотна контрола вместо OrbitControls
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
        update: function() {
            if (this.autoRotate) {
                if (currentModel) {
                    currentModel.rotation.y += (this.autoRotateSpeed * Math.PI / 180 / 60);
                }
            }
        }
    };

    domElement.addEventListener('mousedown', function(e) {
        controls.isDragging = true;
        controls.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    domElement.addEventListener('mousemove', function(e) {
        if (controls.isDragging && currentModel) {
            const deltaX = e.clientX - controls.previousMousePosition.x;
            const deltaY = e.clientY - controls.previousMousePosition.y;

            currentModel.rotation.y += deltaX * 0.005;
            currentModel.rotation.x += deltaY * 0.005;

            controls.previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    domElement.addEventListener('mouseup', function() {
        controls.isDragging = false;
    });

    domElement.addEventListener('mouseleave', function() {
        controls.isDragging = false;
    });

    domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(scale);
    });

    return controls;
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const container = document.getElementById('modelViewer');
    if (!container || !renderer || !camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Обработка на качен файл
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.querySelector('.drop-zone');
    const modelViewer = document.getElementById('modelViewer');

    // Three.js 3D вече не се инициализира по подразбиране за оптимизация
    let viewerInitialized = false;

    // Клик за качване
    fileInput.addEventListener('change', handleFileSelect);

    // Drag и drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleFileDrop);

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = '#e6ecff';
        dropZone.style.borderColor = '#764ba2';
    }

    function handleDragLeave(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = '#f0f4ff';
        dropZone.style.borderColor = '#667eea';
    }

    function handleFileDrop(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = '#f0f4ff';
        dropZone.style.borderColor = '#667eea';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            processFile(files[0]);
        }
    }

    function processFile(file) {
        // Валидация на файл
        const validTypes = ['model/stl', 'application/sla', 'model/obj', 'text/plain'];
        const validExtensions = ['.stl', '.obj'];
        const fileName = file.name.toLowerCase();
        
        const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        if (!isValidExtension) {
            alert('Моля, качете STL или OBJ файл!');
            return;
        }

        // Показване на информация за файла
        const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = fileSize;
        document.getElementById('fileInfo').style.display = 'block';

        // Инициализация на 3D визуализатора, ако още не е инициализирана
        if (!viewerInitialized) {
            initThreeJS();
            viewerInitialized = true;
        }

        // Зареждане на файл
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                if (fileName.endsWith('.stl')) {
                    loadSTLFile(e.target.result, file.name);
                } else if (fileName.endsWith('.obj')) {
                    loadOBJFile(e.target.result, file.name);
                }
            } catch (error) {
                console.error('Грешка при зареждане на файл:', error);
                alert('Грешка при зареждане на файл!');
            }
        };
        reader.readAsArrayBuffer(file);

        // Автоматично изчисляване на цена на основата на размера на файла
        estimatePriceFromFile(file.size);
    }
});

// Качване на STL файл
function loadSTLFile(arrayBuffer, fileName) {
    try {
        const geometry = parseSTL(arrayBuffer);
        
        if (!geometry || geometry.attributes.position.count === 0) {
            throw new Error('Невалидна геометрия');
        }

        geometry.computeBoundingBox();
        geometry.center();
        geometry.computeVertexNormals();

        // Премахване на стария модел
        if (currentModel && scene) {
            scene.remove(currentModel);
        }

        // Създаване на нов модел със подобрени материали
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff9a56,
            emissive: 0x333333,
            shininess: 100,
            side: THREE.DoubleSide,
            flatShading: false
        });
        
        modelMaterial = material; // Запазване на материала за последващи промени
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Мащабиране
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 80 / maxDim;
        mesh.scale.multiplyScalar(scale);

        scene.add(mesh);
        currentModel = mesh;
        fileLoaded = true;

        // Поправяне на камерата
        camera.position.z = 150;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 3;

        // Скриване на съобщението
        const viewerMessage = document.getElementById('viewerMessage');
        const modelViewer = document.getElementById('modelViewer');
        if (viewerMessage) viewerMessage.style.display = 'none';
        if (modelViewer) modelViewer.style.display = 'block';

        console.log('STL файл успешно зареден:', fileName);
    } catch (error) {
        console.error('Грешка при парсване на STL:', error);
        alert('Грешка при парсване на STL файл: ' + error.message);
    }
}

// Парсване на STL
function parseSTL(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const isASCII = isASCIISTL(arrayBuffer);

    if (isASCII) {
        return parseASCIISTL(arrayBuffer);
    } else {
        return parseBinarySTL(arrayBuffer);
    }
}

function isASCIISTL(arrayBuffer) {
    const view = new Uint8Array(arrayBuffer);
    const header = new TextDecoder().decode(view.slice(0, 5));
    return header.toLowerCase() === 'solid';
}

function parseBinarySTL(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const triangles = view.getUint32(80, true);
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const normals = [];

    let offset = 84;
    
    for (let i = 0; i < triangles; i++) {
        const nx = view.getFloat32(offset, true);
        const ny = view.getFloat32(offset + 4, true);
        const nz = view.getFloat32(offset + 8, true);
        offset += 12;

        for (let j = 0; j < 3; j++) {
            vertices.push(
                view.getFloat32(offset, true),
                view.getFloat32(offset + 4, true),
                view.getFloat32(offset + 8, true)
            );
            normals.push(nx, ny, nz);
            offset += 12;
        }
        offset += 2; // attribute byte count
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

    return geometry;
}

function parseASCIISTL(arrayBuffer) {
    const text = new TextDecoder().decode(arrayBuffer);
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const normals = [];

    const vertexPattern = /vertex\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/g;
    const normalPattern = /normal\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\s+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/g;

    let vertexMatch;
    let normalMatch;
    let currentNormal = [0, 0, 1];
    
    const normalMatches = [...text.matchAll(normalPattern)];
    const vertexMatches = [...text.matchAll(vertexPattern)];

    let normalIndex = 0;
    let vertexIndex = 0;

    for (let i = 0; i < vertexMatches.length; i += 3) {
        if (normalIndex < normalMatches.length) {
            currentNormal = [
                parseFloat(normalMatches[normalIndex][1]),
                parseFloat(normalMatches[normalIndex][3]),
                parseFloat(normalMatches[normalIndex][5])
            ];
            normalIndex++;
        }

        for (let j = 0; j < 3; j++) {
            if (vertexIndex < vertexMatches.length) {
                const match = vertexMatches[vertexIndex];
                vertices.push(
                    parseFloat(match[1]),
                    parseFloat(match[3]),
                    parseFloat(match[5])
                );
                normals.push(...currentNormal);
                vertexIndex++;
            }
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

    return geometry;
}

// Качване на OBJ файл (опростена версия)
function loadOBJFile(arrayBuffer, fileName) {
    try {
        const text = new TextDecoder().decode(arrayBuffer);
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const normals = [];

        const lines = text.split('\n');
        const vertexList = [];
        const normalList = [];

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('v ')) {
                const parts = line.substring(2).trim().split(/\s+/);
                vertexList.push(
                    parseFloat(parts[0]) || 0,
                    parseFloat(parts[1]) || 0,
                    parseFloat(parts[2]) || 0
                );
            } else if (line.startsWith('vn ')) {
                const parts = line.substring(3).trim().split(/\s+/);
                normalList.push(
                    parseFloat(parts[0]) || 0,
                    parseFloat(parts[1]) || 0,
                    parseFloat(parts[2]) || 0
                );
            } else if (line.startsWith('f ')) {
                const parts = line.substring(2).trim().split(/\s+/);
                for (let i = 0; i < parts.length - 2; i++) {
                    for (let j = 0; j < 3; j++) {
                        const part = parts[j === 0 ? 0 : j + i];
                        const indices = part.split('/');
                        const vIndex = (parseInt(indices[0]) - 1) * 3;
                        
                        if (vIndex >= 0 && vIndex < vertexList.length) {
                            vertices.push(
                                vertexList[vIndex],
                                vertexList[vIndex + 1],
                                vertexList[vIndex + 2]
                            );

                            if (indices[2] && vertexList.length > 0) {
                                const nIndex = (parseInt(indices[2]) - 1) * 3;
                                if (nIndex >= 0 && nIndex < normalList.length) {
                                    normals.push(
                                        normalList[nIndex],
                                        normalList[nIndex + 1],
                                        normalList[nIndex + 2]
                                    );
                                } else {
                                    normals.push(0, 0, 1);
                                }
                            } else {
                                normals.push(0, 0, 1);
                            }
                        }
                    }
                }
            }
        }

        if (vertices.length === 0) {
            throw new Error('Няма валидни вертекси в OBJ файл');
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        if (normals.length > 0) {
            geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
        } else {
            geometry.computeVertexNormals();
        }
        
        geometry.computeBoundingBox();
        geometry.center();

        if (currentModel && scene) {
            scene.remove(currentModel);
        }

        const material = new THREE.MeshPhongMaterial({
            color: 0xff9a56,
            emissive: 0x333333,
            shininess: 100,
            side: THREE.DoubleSide,
            flatShading: false
        });
        
        modelMaterial = material; // Запазване на материала за последващи промени
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 80 / maxDim;
        mesh.scale.multiplyScalar(scale);

        scene.add(mesh);
        currentModel = mesh;
        fileLoaded = true;

        camera.position.z = 150;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 3;

        const viewerMessage = document.getElementById('viewerMessage');
        const modelViewer = document.getElementById('modelViewer');
        if (viewerMessage) viewerMessage.style.display = 'none';
        if (modelViewer) modelViewer.style.display = 'block';

        console.log('OBJ файл успешно зареден:', fileName);
    } catch (error) {
        console.error('Грешка при парсване на OBJ:', error);
        alert('Грешка при парсване на OBJ файл: ' + error.message);
    }
}

// Оценка на цена на основата на размера на файла
function estimatePriceFromFile(fileSize) {
    // Приблизителна корелация между размера на файла и теглото на модела
    // STL/OBJ файл от ~50KB обикновено съответства на ~10-50 грамове
    const fileSizeInMB = fileSize / 1024 / 1024;
    
    // Формула: теглото (г) = размер на файла (KB) * 0.05 до 0.2
    // Това е приблизително на основата на типични 3D модели
    const estimatedWeight = Math.max(10, Math.min(5000, fileSize / 1024 * 0.1));

    // Автоматично попълване на теглото
    document.getElementById('weight').value = Math.round(estimatedWeight);
    
    // Автоматично изчисляване на цена
    calculatePrice();
}

// ==================== УПРАВЛЕНИЕ НА ВИЗУАЛНИ НАСТРОЙКИ ====================

let modelMaterial = null;
let lightIntensityMultiplier = 1;

// Превключване на панела за настройки
function toggleViewerPanel() {
    const panel = document.getElementById('viewerPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

// Предварени опции за модели
function applyPreset(presetName) {
    const presets = {
        standard: {
            modelColor: '#ff9a56',
            bgColor: '#667eea',
            lightIntensity: 1.0,
            shininess: 100,
            emissive: 0x333333
        },
        highcontrast: {
            modelColor: '#ff4444',
            bgColor: '#ffffff',
            lightIntensity: 1.5,
            shininess: 180,
            emissive: 0x000000
        },
        metallic: {
            modelColor: '#c0c0c0',
            bgColor: '#333333',
            lightIntensity: 1.3,
            shininess: 200,
            emissive: 0x1a1a1a
        },
        matte: {
            modelColor: '#8b7355',
            bgColor: '#e8e8e8',
            lightIntensity: 0.8,
            shininess: 20,
            emissive: 0x222222
        }
    };

    const preset = presets[presetName] || presets.standard;
    
    document.getElementById('modelColor').value = preset.modelColor;
    document.getElementById('bgColor').value = preset.bgColor;
    document.getElementById('lightIntensity').value = preset.lightIntensity;
    document.getElementById('shininess').value = preset.shininess;
    
    updateLightValue(preset.lightIntensity);
    updateShininessValue(preset.shininess);
    
    updateModelColor(preset.modelColor);
    updateBackgroundColor(preset.bgColor);
    updateLightIntensity(preset.lightIntensity);
    updateShininess(preset.shininess);

    // Маркиране на активния бутон
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Обновяване на цвета на модела
function updateModelColor(colorHex) {
    if (!modelMaterial) return;

    const color = new THREE.Color(colorHex);
    modelMaterial.color.set(color);
    
    // Автоматично коригиране на емисивния цвят на основата на цвета
    const brightness = (color.r + color.g + color.b) / 3;
    const emissiveIntensity = Math.floor(brightness * 50);
    modelMaterial.emissive.set(new THREE.Color(colorHex).multiplyScalar(0.3));
    
    console.log('Цвят на модела обновен:', colorHex);
}

// Обновяване на цвета на фона
function updateBackgroundColor(colorHex) {
    if (!scene) return;

    const color = new THREE.Color(colorHex);
    scene.background.set(color);
    
    // Обновяване на мъгла
    if (scene.fog) {
        scene.fog.color.set(color);
    }
    
    console.log('Цвят на фона обновен:', colorHex);
}

// Обновяване на интензитета на осветлението
function updateLightIntensity(value) {
    lightIntensityMultiplier = parseFloat(value);
    updateLightValue(value);
    
    // Обновяване на всички светлини в сцената
    if (scene) {
        scene.children.forEach(child => {
            if (child instanceof THREE.Light) {
                child.intensity = child.userData.originalIntensity * lightIntensityMultiplier;
            }
        });
    }
    
    console.log('Интензитет на осветление:', Math.round(lightIntensityMultiplier * 100) + '%');
}

// Обновяване на показване на стойност на осветление
function updateLightValue(value) {
    const lightValue = document.getElementById('lightValue');
    if (lightValue) {
        lightValue.textContent = Math.round(parseFloat(value) * 100) + '%';
    }
}

// Обновяване на блясък на материала
function updateShininess(value) {
    if (!modelMaterial) return;

    const shininessValue = parseInt(value);
    modelMaterial.shininess = shininessValue;
    updateShininessValue(shininessValue);
    
    console.log('Блясък обновен:', shininessValue);
}

// Обновяване на показване на стойност на блясък
function updateShininessValue(value) {
    const shininessDisplay = document.getElementById('shininessValue');
    if (shininessDisplay) {
        shininessDisplay.textContent = value;
    }
}

// Превключване на автоматична ротация
function toggleAutoRotate() {
    const checkbox = document.getElementById('autoRotate');
    if (controls) {
        controls.autoRotate = checkbox ? checkbox.checked : false;
        console.log('Автоматична ротация:', controls.autoRotate ? 'включена' : 'изключена');
    }
}

// Пресет визуални настройки
function resetVisualizationSettings() {
    const modelColor = document.getElementById('modelColor');
    const bgColor = document.getElementById('bgColor');
    const lightIntensity = document.getElementById('lightIntensity');
    const shininess = document.getElementById('shininess');
    const autoRotate = document.getElementById('autoRotate');
    
    if (modelColor) modelColor.value = '#ff9a56';
    if (bgColor) bgColor.value = '#667eea';
    if (lightIntensity) lightIntensity.value = 1.0;
    if (shininess) shininess.value = 100;
    if (autoRotate) autoRotate.checked = true;
    
    updateLightValue(1.0);
    updateShininessValue(100);
    
    // Премахване на активния класс от всички бутони
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Изчистване на файл
function clearFile() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const viewerMessage = document.getElementById('viewerMessage');
    const modelViewer = document.getElementById('modelViewer');
    const viewerPanel = document.getElementById('viewerPanel');
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.style.display = 'none';
    if (viewerMessage) viewerMessage.style.display = 'flex';
    if (modelViewer) modelViewer.style.display = 'none';
    if (viewerPanel) viewerPanel.style.display = 'none';
    
    if (currentModel && scene) {
        scene.remove(currentModel);
        currentModel = null;
    }
    
    modelMaterial = null;
    fileLoaded = false;
    
    // Resseting визуални настройки
    resetVisualizationSettings();
}
