/* ==================== УПРАВЛЕНИЕ НА КАЛКУЛАТОР ДЛЯ АДМИН ==================== */

const MATERIALS_KEY = 'calculatorMaterials';
const PROCESSING_KEY = 'calculatorProcessing';
const FEES_KEY = 'calculatorFees';

// Инициализира админ панел на калкулатор
function initCalculatorAdmin() {
    const role = getCurrentRole();
    const adminPanel = document.getElementById('calculatorAdminPanel');
    
    if (role === 'admin' && adminPanel) {
        adminPanel.style.display = 'block';
    }
    
    // Зареди съществуващи данни
    loadMaterials();
    loadProcessing();
    loadTechnologyFees();
}

// ==================== УПРАВЛЕНИЕ НА МАТЕРИАЛИ ====================

// Добави нов материал
function addMaterial() {
    const name = document.getElementById('materialName').value.trim();
    const price = parseFloat(document.getElementById('materialPrice').value);
    const time = parseFloat(document.getElementById('materialTime').value);
    const id = document.getElementById('materialId').value.trim().toLowerCase();
    
    if (!name || !price || !time || !id) {
        alert('❌ Моля попълни всички полета!');
        return;
    }
    
    if (isNaN(price) || isNaN(time)) {
        alert('❌ Цената и времето трябва да бъдат числа!');
        return;
    }
    
    let materials = getMaterials();
    
    // Провери дали вече съществува
    if (materials.find(m => m.id === id)) {
        alert('❌ Материал с този ID вече съществува!');
        return;
    }
    
    materials.push({
        id: id,
        name: name,
        price: price,
        time: time
    });
    
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
    clearMaterialForm();
    loadMaterials();
    updateCalculatorMaterials();
    alert('✅ Материал добавен успешно!');
}

// Изтрий материал
function deleteMaterial(id) {
    if (!confirm('Сигурен ли си че искаш да премахнеш този материал?')) {
        return;
    }
    
    let materials = getMaterials();
    materials = materials.filter(m => m.id !== id);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
    
    loadMaterials();
    updateCalculatorMaterials();
    alert('✅ Материал премахнат успешно!');
}

// Зареди и покажи материали
function loadMaterials() {
    const listElement = document.getElementById('materialsList');
    if (!listElement) return;
    
    const materials = getMaterials();
    listElement.innerHTML = '';
    
    if (materials.length === 0) {
        listElement.innerHTML = '<p style="grid-column: 1 / -1; color: #999;">Няма добавени материали. Добави някой!</p>';
        return;
    }
    
    materials.forEach(material => {
        const card = document.createElement('div');
        card.style.cssText = 'border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; background: white;';
        card.innerHTML = `
            <h5 style="margin: 0 0 0.5rem 0;">${material.name}</h5>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                <strong>Цена:</strong> ${material.price.toFixed(2)} лв/г<br>
                <strong>Време:</strong> ${material.time.toFixed(1)} часа/100г<br>
                <strong>ID:</strong> <code>${material.id}</code>
            </p>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <button class="btn btn-small" onclick="editMaterial('${material.id}')">✏️ Редактирай</button>
                <button class="btn btn-danger btn-small" onclick="deleteMaterial('${material.id}')">🗑️ Изтрий</button>
            </div>
        `;
        listElement.appendChild(card);
    });
}

// Редактирай материал (попълни формата)
function editMaterial(id) {
    const materials = getMaterials();
    const material = materials.find(m => m.id === id);
    
    if (!material) return;
    
    document.getElementById('materialName').value = material.name;
    document.getElementById('materialPrice').value = material.price;
    document.getElementById('materialTime').value = material.time;
    document.getElementById('materialId').value = material.id;
    document.getElementById('materialId').disabled = true;
    
    // Смени бутона
    const btn = document.querySelector('[onclick="addMaterial()"]');
    btn.textContent = '💾 Обнови материал';
    btn.onclick = function() { updateMaterial(id); };
}

// Обнови материал
function updateMaterial(id) {
    const name = document.getElementById('materialName').value.trim();
    const price = parseFloat(document.getElementById('materialPrice').value);
    const time = parseFloat(document.getElementById('materialTime').value);
    
    if (!name || !price || !time) {
        alert('❌ Моля попълни всички полета!');
        return;
    }
    
    let materials = getMaterials();
    const index = materials.findIndex(m => m.id === id);
    
    if (index === -1) return;
    
    materials[index] = {
        id: id,
        name: name,
        price: price,
        time: time
    };
    
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
    clearMaterialForm();
    loadMaterials();
    updateCalculatorMaterials();
    alert('✅ Материал обновен успешно!');
}

// Очисти форма на материали
function clearMaterialForm() {
    document.getElementById('materialName').value = '';
    document.getElementById('materialPrice').value = '';
    document.getElementById('materialTime').value = '';
    document.getElementById('materialId').value = '';
    document.getElementById('materialId').disabled = false;
    
    const btn = document.querySelector('[onclick="addMaterial()"]');
    btn.textContent = '➕ Добави материал';
    btn.onclick = function() { addMaterial(); };
}

// Получи материали от localStorage
function getMaterials() {
    const stored = localStorage.getItem(MATERIALS_KEY);
    return stored ? JSON.parse(stored) : getDefaultMaterials();
}

// Начални материали
function getDefaultMaterials() {
    return [
        { id: 'pla', name: 'PLA', price: 0.5, time: 1.2 },
        { id: 'abs', name: 'ABS', price: 0.6, time: 1.5 },
        { id: 'petg', name: 'PETG', price: 0.7, time: 1.3 },
        { id: 'tpu', name: 'TPU Гъвкав', price: 1.0, time: 2.0 },
        { id: 'resin', name: 'Смола SLA', price: 2.0, time: 0.5 },
        { id: 'nylon', name: 'Найлон SLS', price: 1.5, time: 1.8 }
    ];
}

// ==================== УПРАВЛЕНИЕ НА ОБРАБОТКА ====================

// Добави нова обработка
function addProcessing() {
    const type = document.getElementById('processingType').value.trim();
    const cost = parseFloat(document.getElementById('processingCost').value);
    const id = document.getElementById('processingId').value.trim().toLowerCase();
    
    if (!type || !cost || !id) {
        alert('❌ Моля попълни всички полета!');
        return;
    }
    
    if (isNaN(cost)) {
        alert('❌ Цената трябва да е число!');
        return;
    }
    
    let processing = getProcessing();
    
    if (processing.find(p => p.id === id)) {
        alert('❌ Обработка с този ID вече съществува!');
        return;
    }
    
    processing.push({
        id: id,
        type: type,
        cost: cost
    });
    
    localStorage.setItem(PROCESSING_KEY, JSON.stringify(processing));
    clearProcessingForm();
    loadProcessing();
    updateCalculatorProcessing();
    alert('✅ Обработка добавена успешно!');
}

// Изтрий обработка
function deleteProcessing(id) {
    if (!confirm('Сигурен ли си че искаш да премахнеш този вид обработка?')) {
        return;
    }
    
    let processing = getProcessing();
    processing = processing.filter(p => p.id !== id);
    localStorage.setItem(PROCESSING_KEY, JSON.stringify(processing));
    
    loadProcessing();
    updateCalculatorProcessing();
    alert('✅ Обработка премахната успешно!');
}

// Зареди и покажи обработка
function loadProcessing() {
    const listElement = document.getElementById('processingList');
    if (!listElement) return;
    
    const processing = getProcessing();
    listElement.innerHTML = '';
    
    if (processing.length === 0) {
        listElement.innerHTML = '<p style="grid-column: 1 / -1; color: #999;">Няма добавена обработка. Добави някоя!</p>';
        return;
    }
    
    processing.forEach(proc => {
        const card = document.createElement('div');
        card.style.cssText = 'border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; background: white;';
        card.innerHTML = `
            <h5 style="margin: 0 0 0.5rem 0;">${proc.type}</h5>
            <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                <strong>Цена:</strong> ${proc.cost.toFixed(2)} лв<br>
                <strong>ID:</strong> <code>${proc.id}</code>
            </p>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <button class="btn btn-small" onclick="editProcessing('${proc.id}')">✏️ Редактирай</button>
                <button class="btn btn-danger btn-small" onclick="deleteProcessing('${proc.id}')">🗑️ Изтрий</button>
            </div>
        `;
        listElement.appendChild(card);
    });
}

// Редактирай обработка
function editProcessing(id) {
    const processing = getProcessing();
    const proc = processing.find(p => p.id === id);
    
    if (!proc) return;
    
    document.getElementById('processingType').value = proc.type;
    document.getElementById('processingCost').value = proc.cost;
    document.getElementById('processingId').value = proc.id;
    document.getElementById('processingId').disabled = true;
    
    const btn = document.querySelector('[onclick="addProcessing()"]');
    btn.textContent = '💾 Обнови обработка';
    btn.onclick = function() { updateProcessing(id); };
}

// Обнови обработка
function updateProcessing(id) {
    const type = document.getElementById('processingType').value.trim();
    const cost = parseFloat(document.getElementById('processingCost').value);
    
    if (!type || !cost) {
        alert('❌ Моля попълни всички полета!');
        return;
    }
    
    let processing = getProcessing();
    const index = processing.findIndex(p => p.id === id);
    
    if (index === -1) return;
    
    processing[index] = {
        id: id,
        type: type,
        cost: cost
    };
    
    localStorage.setItem(PROCESSING_KEY, JSON.stringify(processing));
    clearProcessingForm();
    loadProcessing();
    updateCalculatorProcessing();
    alert('✅ Обработка обновена успешно!');
}

// Очисти форма на обработка
function clearProcessingForm() {
    document.getElementById('processingType').value = '';
    document.getElementById('processingCost').value = '';
    document.getElementById('processingId').value = '';
    document.getElementById('processingId').disabled = false;
    
    const btn = document.querySelector('[onclick="addProcessing()"]');
    btn.textContent = '➕ Добави обработка';
    btn.onclick = function() { addProcessing(); };
}

// Получи обработка от localStorage
function getProcessing() {
    const stored = localStorage.getItem(PROCESSING_KEY);
    return stored ? JSON.parse(stored) : getDefaultProcessing();
}

// Начална обработка
function getDefaultProcessing() {
    return [
        { id: 'none', type: 'Без обработка', cost: 0 },
        { id: 'cleaning', type: 'Почистване', cost: 20 },
        { id: 'sanding', type: 'Шлифование', cost: 50 },
        { id: 'painting', type: 'Боядисване', cost: 80 },
        { id: 'complete', type: 'Комплетна обработка', cost: 120 }
    ];
}

// ==================== УПРАВЛЕНИЕ НА БАЗОВИ ЦЕНИ ====================

// Обнови технологични цени
function updateTechnologyFees() {
    const fdmFee = parseFloat(document.getElementById('fdmFee').value);
    const slaFee = parseFloat(document.getElementById('slaFee').value);
    const slsFee = parseFloat(document.getElementById('slsFee').value);
    
    if (isNaN(fdmFee) || isNaN(slaFee) || isNaN(slsFee)) {
        alert('❌ Всички цени трябва да бъдат числа!');
        return;
    }
    
    const fees = {
        fdm: fdmFee,
        sla: slaFee,
        sls: slsFee
    };
    
    localStorage.setItem(FEES_KEY, JSON.stringify(fees));
    updateCalculatorFees();
    alert('✅ Цени обновени успешно!');
}

// Зареди технологични цени
function loadTechnologyFees() {
    const fees = getTechnologyFees();
    document.getElementById('fdmFee').value = fees.fdm;
    document.getElementById('slaFee').value = fees.sla;
    document.getElementById('slsFee').value = fees.sls;
}

// Получи технологични цени
function getTechnologyFees() {
    const stored = localStorage.getItem(FEES_KEY);
    return stored ? JSON.parse(stored) : { fdm: 50, sla: 100, sls: 150 };
}

// ==================== ОБНОВЯВАНЕ НА КАЛКУЛАТОР ====================

// Обновя материали в калкулатор
function updateCalculatorMaterials() {
    const materialSelect = document.getElementById('material');
    if (!materialSelect) return;
    
    const materials = getMaterials();
    const currentValue = materialSelect.value;
    
    materialSelect.innerHTML = '';
    
    materials.forEach(material => {
        const option = document.createElement('option');
        option.value = material.id;
        option.setAttribute('data-price', material.price);
        option.setAttribute('data-time', material.time);
        option.textContent = `${material.name} (${material.price.toFixed(2)} лв/г, ${material.time.toFixed(1)} часа/100г)`;
        materialSelect.appendChild(option);
    });
    
    materialSelect.value = currentValue || materials[0].id;
}

// Обновя обработка в калкулатор
function updateCalculatorProcessing() {
    const processingSelect = document.getElementById('postprocessing');
    if (!processingSelect) return;
    
    const processing = getProcessing();
    const currentValue = processingSelect.value;
    
    processingSelect.innerHTML = '';
    
    processing.forEach(proc => {
        const option = document.createElement('option');
        option.value = proc.id;
        option.setAttribute('data-cost', proc.cost);
        option.textContent = `${proc.type}${proc.cost > 0 ? ` (${proc.cost} лв)` : ''}`;
        processingSelect.appendChild(option);
    });
    
    processingSelect.value = currentValue || processing[0].id;
}

// Обновя цени в калкулатор
function updateCalculatorFees() {
    const technologySelect = document.getElementById('technology');
    if (!technologySelect) return;
    
    const fees = getTechnologyFees();
    
    const options = technologySelect.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === 'fdm') {
            option.setAttribute('data-fee', fees.fdm);
            option.textContent = `FDM (базова цена ${fees.fdm} лв)`;
        } else if (option.value === 'sla') {
            option.setAttribute('data-fee', fees.sla);
            option.textContent = `SLA (базова цена ${fees.sla} лв)`;
        } else if (option.value === 'sls') {
            option.setAttribute('data-fee', fees.sls);
            option.textContent = `SLS (базова цена ${fees.sls} лв)`;
        }
    });
}

// Инициализирай при зареждане
document.addEventListener('DOMContentLoaded', function() {
    initCalculatorAdmin();
    updateCalculatorMaterials();
    updateCalculatorProcessing();
    updateCalculatorFees();
});
