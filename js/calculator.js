/* ==================== КАЛКУЛАТОР СКРИПТ ==================== */

function calculatePrice() {
    // Получаване на стойностите от формата
    const materialSelect = document.getElementById('material');
    const weightInput = document.getElementById('weight');
    const technologySelect = document.getElementById('technology');
    const postprocessingSelect = document.getElementById('postprocessing');
    const quantityInput = document.getElementById('quantity');

    // Получаване на цена и време от селектори
    const materialPrice = parseFloat(materialSelect.options[materialSelect.selectedIndex].dataset.price);
    const materialTime = parseFloat(materialSelect.options[materialSelect.selectedIndex].dataset.time);
    const weight = parseFloat(weightInput.value) || 100;
    const technologyFee = parseFloat(technologySelect.options[technologySelect.selectedIndex].dataset.fee);
    const postprocessingCost = parseFloat(postprocessingSelect.options[postprocessingSelect.selectedIndex].dataset.cost);
    const quantity = parseInt(quantityInput.value) || 1;

    // Изчисления
    const materialCost = (materialPrice * weight);
    const printCost = technologyFee;
    const postCost = postprocessingCost;
    
    // Отстъпка за количество
    let quantityDiscount = 1;
    if (quantity >= 5) quantityDiscount = 0.9; // 10% отстъпка
    if (quantity >= 10) quantityDiscount = 0.8; // 20% отстъпка
    if (quantity >= 20) quantityDiscount = 0.7; // 30% отстъпка

    const totalPrice = (materialCost + printCost + postCost) * quantity * quantityDiscount;
    const pricePerUnit = totalPrice / quantity;

    // Изчисляване на време
    const printTimeHours = (materialTime * weight) / 100;
    const totalTime = printTimeHours * quantity;

    // Обновяване на резултатите
    document.getElementById('materialCost').textContent = (materialCost * quantity * quantityDiscount).toFixed(2) + ' лв';
    document.getElementById('printCost').textContent = (printCost * quantity * quantityDiscount).toFixed(2) + ' лв';
    document.getElementById('postCost').textContent = (postCost * quantity * quantityDiscount).toFixed(2) + ' лв';
    document.getElementById('quantityFactor').textContent = quantity + ' x';
    
    if (quantityDiscount < 1) {
        document.getElementById('quantityFactor').textContent = quantity + ' x (Отстъпка: ' + ((1 - quantityDiscount) * 100) + '%)';
    }

    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2) + ' лв';
    document.getElementById('printTime').textContent = printTimeHours.toFixed(1) + ' часа';

    // Добавяне на съобщение с детайли
    console.log('Отпечатана цена за 1 единица: ' + pricePerUnit.toFixed(2) + ' лв');
}

// Инициализация на калкулатора при зареждане на страница
document.addEventListener('DOMContentLoaded', function() {
    // Инициалното изчисление
    calculatePrice();

    // Обновяване на калкулатора при промяна на полетата
    document.getElementById('material').addEventListener('change', calculatePrice);
    document.getElementById('weight').addEventListener('input', calculatePrice);
    document.getElementById('technology').addEventListener('change', calculatePrice);
    document.getElementById('postprocessing').addEventListener('change', calculatePrice);
    document.getElementById('quantity').addEventListener('input', calculatePrice);

    // Добавяне на валидация
    const weightInput = document.getElementById('weight');
    const quantityInput = document.getElementById('quantity');

    weightInput.addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
        if (this.value > 5000) this.value = 5000;
    });

    quantityInput.addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
        if (this.value > 100) this.value = 100;
    });
});

// Експорт на резултатите
function exportCalculation() {
    const material = document.getElementById('material').options[document.getElementById('material').selectedIndex].text;
    const weight = document.getElementById('weight').value;
    const technology = document.getElementById('technology').options[document.getElementById('technology').selectedIndex].text;
    const totalPrice = document.getElementById('totalPrice').textContent;
    const printTime = document.getElementById('printTime').textContent;

    const data = `
Резултат от Калкулатор 3D Печат:
================================
Дата: ${new Date().toLocaleDateString('bg-BG')}

Материал: ${material}
Тегло: ${weight}гр
Технология: ${technology}
Обща цена: ${totalPrice}
Време печат: ${printTime}

================================
Генерирано от 3D PrintLab
    `;

    // Копиране в клипборд
    navigator.clipboard.writeText(data).then(() => {
        alert('Резултатите са копирани в клипборда!');
    });
}

// Добавяне на бутон за експорт (опционално)
// Може да се добави в HTML-а:
// <button onclick="exportCalculation()">Експортирай Резултат</button>
