/**
 * Calculator Page Module - Функционалност на страницата с калкулатор
 */

import { initCalculator } from '../../modules/calculator.js';
import { init3DViewer } from '../../modules/viewer3d.js';

export function initCalculatorPage() {
    console.log('Calculator страница инициализирана');
    
    // Инициализиране на калкулатора
    initCalculator();
    
    // Инициализиране на 3D визуализатора
    init3DViewer();
    
    // Инициализиране на форма за качване
    setupFileUpload();
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (!uploadArea || !fileInput) return;
    
    // Щракване върху área за качване
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop функционалност
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        uploadArea.style.borderColor = '#667eea';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = '';
        uploadArea.style.borderColor = '#667eea';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    });
    
    // Промяна на файл
    fileInput.addEventListener('change', handleFileSelect);
    
    // Щракване върху бутон за качване
    uploadBtn.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            uploadFile();
        } else {
            uploadStatus.innerHTML = '<div class="alert alert-warning">Моля, изберете файл</div>';
        }
    });
    
    function handleFileSelect() {
        const file = fileInput.files[0];
        if (file) {
            uploadStatus.innerHTML = `<div class="alert alert-info">✅ Избран файл: <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)</div>`;
        }
    }
    
    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) return;
        
        uploadStatus.innerHTML = '<div class="alert alert-info">⏳ Качване в процес...</div>';
        
        // Симулирано качване (в production трябва истински API)
        setTimeout(() => {
            uploadStatus.innerHTML = `<div class="alert alert-success">✅ Файлът ${file.name} беше успешно качен!</div>`;
            
            // Если има 3D визуализатор, можем да го зареждаме
            const modelViewer = document.getElementById('modelViewer');
            if (modelViewer) {
                // Можем да добавим логика за заредност на модела в 3D визуализатора
                console.log('Модел готов за визуализация:', file.name);
            }
        }, 1500);
    }
}
