/**
 * Calculator Module - Калкулатор за цена и време на печат
 */

export function initCalculator() {
    const materialSelect = document.getElementById('material');
    const weightInput = document.getElementById('weight');
    const technologySelect = document.getElementById('technology');
    const postprocessingSelect = document.getElementById('postprocessing');
    const quantityInput = document.getElementById('quantity');

    if (!materialSelect) return; // Не сме на страница с калкулатор

    // Инициално изчисление
    calculatePrice();

    // Обновяване на калкулатора при промяна на полетата
    materialSelect.addEventListener('change', calculatePrice);
    weightInput.addEventListener('input', calculatePrice);
    technologySelect.addEventListener('change', calculatePrice);
    postprocessingSelect.addEventListener('change', calculatePrice);
    quantityInput.addEventListener('input', calculatePrice);

    // Валидация на тегло
    weightInput.addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
        if (this.value > 5000) this.value = 5000;
    });

    // Валидация на количество
    quantityInput.addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
        if (this.value > 100) this.value = 100;
    });
}

function calculatePrice() {
    const materialSelect = document.getElementById('material');
    const weightInput = document.getElementById('weight');
    const technologySelect = document.getElementById('technology');
    const postprocessingSelect = document.getElementById('postprocessing');
    const quantityInput = document.getElementById('quantity');

    const materialPrice = parseFloat(materialSelect.options[materialSelect.selectedIndex].dataset.price) || 0;
    const materialTime = parseFloat(materialSelect.options[materialSelect.selectedIndex].dataset.time) || 0;
    const weight = parseFloat(weightInput.value) || 100;
    const technologyFee = parseFloat(technologySelect.options[technologySelect.selectedIndex].dataset.fee) || 0;
    const postprocessingCost = parseFloat(postprocessingSelect.options[postprocessingSelect.selectedIndex].dataset.cost) || 0;
    const quantity = parseInt(quantityInput.value) || 1;

    // Изчисления
    const materialCost = materialPrice * weight;
    const printCost = technologyFee;
    const postCost = postprocessingCost;
    
    // Отстъпка за количество
    let quantityDiscount = 1;
    if (quantity >= 5) quantityDiscount = 0.9;
    if (quantity >= 10) quantityDiscount = 0.8;
    if (quantity >= 20) quantityDiscount = 0.7;

    const totalPrice = (materialCost + printCost + postCost) * quantity * quantityDiscount;
    const pricePerUnit = totalPrice / quantity;

    // Изчисляване на време
    const printTimeHours = (materialTime * weight) / 100;
    const totalTime = printTimeHours * quantity;

    // Обновяване на резултатите
    const materialCostEl = document.getElementById('materialCost');
    const printCostEl = document.getElementById('printCost');
    const postCostEl = document.getElementById('postCost');
    const quantityFactorEl = document.getElementById('quantityFactor');
    const totalPriceEl = document.getElementById('totalPrice');
    const printTimeEl = document.getElementById('printTime');

    if (materialCostEl) materialCostEl.textContent = (materialCost * quantity * quantityDiscount).toFixed(2) + ' лв';
    if (printCostEl) printCostEl.textContent = (printCost * quantity * quantityDiscount).toFixed(2) + ' лв';
    if (postCostEl) postCostEl.textContent = (postCost * quantity * quantityDiscount).toFixed(2) + ' лв';
    
    if (quantityFactorEl) {
        quantityFactorEl.textContent = quantity + ' x';
        if (quantityDiscount < 1) {
            quantityFactorEl.textContent = quantity + ' x (Отстъпка: ' + ((1 - quantityDiscount) * 100) + '%)';
        }
    }

    if (totalPriceEl) totalPriceEl.textContent = totalPrice.toFixed(2) + ' лв';
    if (printTimeEl) printTimeEl.textContent = printTimeHours.toFixed(1) + ' часа';

    console.log('Отпечатана цена за 1 единица: ' + pricePerUnit.toFixed(2) + ' лв');
}
