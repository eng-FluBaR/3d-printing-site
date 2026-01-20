/* ==================== УПРАВЛЕНИЕ НА ГАЛЕРИЯ ДЛЯ АДМИН ==================== */

const GALLERY_STORAGE_KEY = 'galleryItems';

// Инициализира админ панела
function initGalleryAdmin() {
    const role = getCurrentRole();
    const adminPanel = document.getElementById('adminPanel');
    
    // Показва админ панела само за админ
    if (role === 'admin' && adminPanel) {
        adminPanel.style.display = 'block';
    }
    
    // Инициализира формата
    const addGalleryForm = document.getElementById('addGalleryForm');
    if (addGalleryForm) {
        // Премахни всички стари listeners преди да добавиш нови
        const newForm = addGalleryForm.cloneNode(true);
        addGalleryForm.parentNode.replaceChild(newForm, addGalleryForm);
        
        const updatedForm = document.getElementById('addGalleryForm');
        updatedForm.addEventListener('submit', handleAddGalleryItem);
        
        // Drag-drop функционалност за файл
        const fileInput = document.getElementById('itemImage');
        const fileUpload = document.querySelector('.file-upload-admin');
        
        if (fileUpload && fileInput) {
            fileUpload.addEventListener('click', () => fileInput.click());
            fileUpload.addEventListener('dragover', handleDragOver);
            fileUpload.addEventListener('dragleave', handleDragLeave);
            fileUpload.addEventListener('drop', handleDropFile);
            fileInput.addEventListener('change', handleFileSelect);
        }
    }
    
    // Зареди и покажи снимките
    loadGalleryItems();
    
    // Генерирай пореден номер при зареждане
    generateItemNumber();
}

// Генерира пореден номер базиран на категория
function generateItemNumber() {
    const categorySelect = document.getElementById('itemCategory');
    const numberField = document.getElementById('itemNumber');
    
    if (!categorySelect || !numberField) return;
    
    const selectedCategory = categorySelect.value;
    if (!selectedCategory) return;
    
    const items = getGalleryItems();
    const categoryItems = items.filter(item => item.category === selectedCategory);
    const nextNumber = categoryItems.length + 1;
    const categoryName = getCategoryName(selectedCategory);
    
    numberField.value = `${categoryName} #${nextNumber}`;
}

// Обработва избор на файл
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayAdminImagePreview(file);
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
        const fileInput = document.getElementById('itemImage');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        fileInput.files = dataTransfer.files;
        displayAdminImagePreview(files[0]);
    }
}

// Показва преглед на снимката в админ панела
function displayAdminImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const previewContainer = document.getElementById('adminPreviewContainer');
        const previewImage = document.getElementById('adminPreviewImage');
        
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

// Премахва избраната снимка от админ панела
function removeAdminImage() {
    document.getElementById('itemImage').value = '';
    document.getElementById('adminPreviewContainer').style.display = 'none';
}

// Обработва добавяне на нова снимка
function handleAddGalleryItem(e) {
    e.preventDefault();
    
    const number = document.getElementById('itemNumber').value;
    const description = document.getElementById('itemDescription').value;
    const category = document.getElementById('itemCategory').value;
    const fileInput = document.getElementById('itemImage');
    
    if (!number || !description || !category || !fileInput.files[0]) {
        alert('❌ Моля попълни всички задължителни полета и качи снимка!');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const galleryItem = {
            id: Date.now(),
            title: number,
            description: description,
            category: category,
            image: e.target.result, // Base64 encoded image
            createdAt: new Date().toLocaleString('bg-BG')
        };
        
        // Добави към localStorage
        let items = getGalleryItems();
        items.push(galleryItem);
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
        
        // Добави към HTML галерия
        addItemToGallery(galleryItem);
        addItemToAdminList(galleryItem);
        
        // Очисти формата
        document.getElementById('addGalleryForm').reset();
        removeAdminImage();
        generateItemNumber(); // Преизчисли номера
        
        alert('✅ Снимката е добавена успешно!');
    };
    
    reader.readAsDataURL(fileInput.files[0]);
}

// Добави елемент към HTML галерия
function addItemToGallery(item) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Проверка дали елемента вече е добавен
    if (document.getElementById(`gallery-item-${item.id}`)) {
        return;
    }
    
    const itemEl = document.createElement('div');
    itemEl.className = `gallery-item ${item.category}`;
    itemEl.dataset.category = item.category;
    itemEl.id = `gallery-item-${item.id}`;
    itemEl.style.opacity = '0';
    itemEl.style.transform = 'scale(0.8)';
    itemEl.style.transition = 'all 0.3s ease';
    
    itemEl.innerHTML = `
        <div class="gallery-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"></div>
        <div class="gallery-info">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `;
    
    galleryGrid.appendChild(itemEl);
    
    // Анимирай появата
    setTimeout(() => {
        itemEl.style.opacity = '1';
        itemEl.style.transform = 'scale(1)';
    }, 10);
}

// Добави елемент към админ списък
function addItemToAdminList(item) {
    const adminList = document.getElementById('adminGalleryList');
    if (!adminList) return;
    
    // Проверка дали елемента вече е добавен
    if (document.getElementById(`admin-item-${item.id}`)) {
        return;
    }
    
    const itemEl = document.createElement('div');
    itemEl.className = 'admin-gallery-item';
    itemEl.id = `admin-item-${item.id}`;
    
    itemEl.innerHTML = `
        <div class="admin-gallery-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"></div>
        <div class="admin-gallery-info">
            <h4>${item.title}</h4>
            <p><strong>Категория:</strong> ${getCategoryName(item.category)}</p>
            <p>${item.description}</p>
            <small style="color: #999;">Добавено: ${item.createdAt}</small>
            <div class="admin-gallery-actions">
                <button class="btn-edit" onclick="editGalleryItem(${item.id})">✏️ Редактирай</button>
                <button class="btn-delete" onclick="deleteGalleryItem(${item.id})">🗑️ Премахни</button>
            </div>
        </div>
    `;
    
    adminList.appendChild(itemEl);
}

// Заредене на всички снимки от localStorage
function loadGalleryItems() {
    const items = getGalleryItems();
    items.forEach(item => {
        // Провери дали елемента вече не е добавен
        if (!document.getElementById(`gallery-item-${item.id}`)) {
            addItemToGallery(item);
        }
        if (!document.getElementById(`admin-item-${item.id}`)) {
            addItemToAdminList(item);
        }
    });
}

// Получава всички снимки от localStorage
function getGalleryItems() {
    const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Редактирај снимка
function editGalleryItem(id) {
    const items = getGalleryItems();
    const item = items.find(i => i.id === id);
    
    if (!item) return;
    
    const newDescription = prompt('Ново описание:', item.description);
    if (newDescription === null) return;
    
    // Обнови в localStorage
    item.description = newDescription;
    item.updatedAt = new Date().toLocaleString('bg-BG');
    
    const updatedItems = items.map(i => i.id === id ? item : i);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedItems));
    
    // Обнови в HTML
    updateItemInGallery(item);
    updateItemInAdminList(item);
    
    alert('✅ Снимката е редактирана успешно!');
}

// Обновя елемент в HTML галерия
function updateItemInGallery(item) {
    const itemEl = document.getElementById(`gallery-item-${item.id}`);
    if (itemEl) {
        itemEl.innerHTML = `
            <div class="gallery-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"></div>
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        `;
    }
}

// Обновя елемент в админ списък
function updateItemInAdminList(item) {
    const itemEl = document.getElementById(`admin-item-${item.id}`);
    if (itemEl) {
        itemEl.innerHTML = `
            <div class="admin-gallery-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"></div>
            <div class="admin-gallery-info">
                <h4>${item.title}</h4>
                <p><strong>Категория:</strong> ${getCategoryName(item.category)}</p>
                <p>${item.description}</p>
                <small style="color: #999;">Обновено: ${item.updatedAt || item.createdAt}</small>
                <div class="admin-gallery-actions">
                    <button class="btn-edit" onclick="editGalleryItem(${item.id})">✏️ Редактирай</button>
                    <button class="btn-delete" onclick="deleteGalleryItem(${item.id})">🗑️ Премахни</button>
                </div>
            </div>
        `;
    }
}

// Премахват снимка
function deleteGalleryItem(id) {
    if (!confirm('Сигурен ли си че искаш да премахнеш тази снимка?')) {
        return;
    }
    
    // Намери категорията на елемента преди премахване
    let items = getGalleryItems();
    const deletedItem = items.find(i => i.id === id);
    const categoryOfDeleted = deletedItem ? deletedItem.category : null;
    
    // Премахни от localStorage
    items = items.filter(i => i.id !== id);
    
    // Пренумерирай елементите в същата категория
    if (categoryOfDeleted) {
        const categoryItems = items.filter(i => i.category === categoryOfDeleted);
        const categoryName = getCategoryName(categoryOfDeleted);
        
        categoryItems.forEach((item, index) => {
            item.title = `${categoryName} #${index + 1}`;
        });
    }
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
    
    // Премахни от HTML
    const galleryItemEl = document.getElementById(`gallery-item-${id}`);
    if (galleryItemEl) {
        galleryItemEl.style.opacity = '0';
        galleryItemEl.style.transform = 'scale(0.8)';
        setTimeout(() => galleryItemEl.remove(), 300);
    }
    
    const adminItemEl = document.getElementById(`admin-item-${id}`);
    if (adminItemEl) {
        adminItemEl.style.opacity = '0';
        adminItemEl.style.transform = 'scale(0.8)';
        setTimeout(() => adminItemEl.remove(), 300);
    }
    
    // Обнови всички елементи в категорията с новите номера
    if (categoryOfDeleted) {
        const categoryItems = items.filter(i => i.category === categoryOfDeleted);
        categoryItems.forEach(item => {
            updateItemInGallery(item);
            updateItemInAdminList(item);
        });
    }
    
    alert('✅ Снимката е премахната успешно!');
}

// Вспомагателна функция за имена на категории
function getCategoryName(category) {
    const names = {
        'spare-parts': 'Резервни Части',
        'cutters': 'Резци за Сладки',
        'decorations': 'Декорации',
        'toys': 'Играчки'
    };
    return names[category] || category;
}

// Инициализира при зареждане на страницата
document.addEventListener('DOMContentLoaded', initGalleryAdmin);
