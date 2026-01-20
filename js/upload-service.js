/* ==================== УПРАВЛЕНИЕ НА КАЧВАНЕ НА РАБОТИ ==================== */

const UPLOADS_STORAGE_KEY = 'userUploads';

// Инициализира секцията за качване
function initUploadSection() {
    const role = getCurrentRole();
    const uploadSection = document.getElementById('uploadSection');
    
    // Показва upload раздел само за user и admin
    if (uploadSection) {
        uploadSection.style.display = (role === 'user' || role === 'admin') ? 'block' : 'none';
    }
    
    // Инициализира формата
    const uploadForm = document.getElementById('uploadWorkForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
        
        // Drag-drop функционалност
        const fileInput = document.getElementById('workImage');
        const fileUpload = document.querySelector('.file-upload');
        
        if (fileUpload && fileInput) {
            fileUpload.addEventListener('click', () => fileInput.click());
            fileUpload.addEventListener('dragover', handleDragOver);
            fileUpload.addEventListener('dragleave', handleDragLeave);
            fileUpload.addEventListener('drop', handleDropFile);
            fileInput.addEventListener('change', handleFileSelect);
        }
    }
}

// Обработва избор на файл
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayImagePreview(file);
    }
}

// Обработва drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
}

// Обработва drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
}

// Обработва drop на файл
function handleDropFile(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = document.getElementById('workImage');
        fileInput.files = files;
        displayImagePreview(files[0]);
    }
}

// Показва преглед на снимката
function displayImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

// Премахва избраната снимка
function removeUploadImage() {
    document.getElementById('workImage').value = '';
    document.getElementById('previewContainer').style.display = 'none';
}

// Обработва подаване на формата
function handleUploadSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('workTitle').value.trim();
    const category = document.getElementById('workCategory').value;
    const description = document.getElementById('workDescription').value.trim();
    const author = document.getElementById('workAuthor').value.trim();
    const fileInput = document.getElementById('workImage');
    
    if (!title || !category || !description || !fileInput.files[0]) {
        alert('❌ Моля попълни всички задължителни полета и качи снимка!');
        return;
    }
    
    // Прочитай файла
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const upload = {
            id: Date.now(),
            title: title,
            category: category,
            description: description,
            author: author || 'Анонимен',
            image: e.target.result, // Base64 encoded image
            createdAt: new Date().toLocaleString('bg-BG')
        };
        
        // Добави към localStorage
        let uploads = getUploads();
        uploads.push(upload);
        localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(uploads));
        
        // Добави към галерия в gallery.html
        // (ако сме на services страница, снимката ще се появи при редирект към галерия)
        
        // Покажи успешност
        showUploadSuccess();
        
        // Очисти формата
        document.getElementById('uploadWorkForm').reset();
        removeUploadImage();
        
        setTimeout(() => {
            alert('✅ Твоята работа е успешно качена! Тя ще бъде видима в галерията.');
        }, 500);
    };
    
    reader.readAsDataURL(fileInput.files[0]);
}

// Показва съобщение за успех
function showUploadSuccess() {
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.style.display = 'block';
    
    // Скрий след 5 секунди
    setTimeout(() => {
        uploadStatus.style.display = 'none';
    }, 5000);
}

// Получава всички качени работи
function getUploads() {
    const stored = localStorage.getItem(UPLOADS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Обновлява роля и показва/скрива upload раздел
function updateUploadVisibility(role) {
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
        uploadSection.style.display = (role === 'user' || role === 'admin') ? 'block' : 'none';
    }
}

// Инициализира при зареждане на страницата
document.addEventListener('DOMContentLoaded', function() {
    initUploadSection();
    
    // Преразглеждане на upload раздела при смяна на роля
    // (това ще бъде обработено в applyRolePermissions в main.js)
});
