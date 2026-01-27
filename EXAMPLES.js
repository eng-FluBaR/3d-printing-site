/**
 * ПРИМЕРЫ ЗА РАЗШИРЯВАНЕ НА ПРОЕКТА
 * 
 * Този файл съдържа примери как да разширите вашия 3D PrintLab проект
 * със нови модули и функционалности
 */

// ============================================================
// ПРИМЕР 1: Добавяне на Нов Модул - Управление на Корзина
// ============================================================

/*
// src/modules/cart.js

let cart = [];

export function initCart() {
    loadCartFromStorage();
    updateCartUI();
}

export function addToCart(item) {
    cart.push({
        id: Date.now(),
        name: item.name,
        price: item.price,
        quantity: 1,
        timestamp: new Date()
    });
    saveCartToStorage();
    updateCartUI();
}

export function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartUI();
}

export function getCart() {
    return cart;
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    cart = saved ? JSON.parse(saved) : [];
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

export function getTotalPrice() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
*/

// Използване в main.js:
/*
import { initCart, addToCart } from './modules/cart.js';

document.addEventListener('DOMContentLoaded', function() {
    initCart();
});

// На бутон click:
// addToCart({ name: 'Печат', price: 25.00 });
*/

// ============================================================
// ПРИМЕР 2: Интеграция с API - Фетч на Данни
// ============================================================

/*
// src/modules/api.js

const API_BASE = 'https://api.3dprintlab.bg/api';

export async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        if (!response.ok) throw new Error('Грешка при фетчване');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
}

export async function submitOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    } catch (error) {
        console.error('Order Error:', error);
        return null;
    }
}

export async function getUserProfile() {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Profile Error:', error);
        return null;
    }
}
*/

// ============================================================
// ПРИМЕР 3: Добавяне на Нотификации
// ============================================================

/*
// src/modules/notifications.js

export function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer') || createContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alert);
    
    // Автоматично скриване след 5 секунди
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function createContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        width: 400px;
        max-width: 90%;
    `;
    document.body.appendChild(container);
    return container;
}

// Използване:
// showNotification('Успешно добавено!', 'success');
// showNotification('Възникна грешка!', 'danger');
// showNotification('Предупреждение!', 'warning');
*/

// ============================================================
// ПРИМЕР 4: Добавяне на Form Validation
// ============================================================

/*
// src/modules/validation.js

export const validators = {
    email: (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    },
    
    phone: (value) => {
        const regex = /^[0-9\-\+\s\(\)]{7,}$/;
        return regex.test(value);
    },
    
    password: (value) => {
        return value.length >= 8;
    },
    
    required: (value) => {
        return value && value.trim().length > 0;
    },
    
    minLength: (value, length) => {
        return value && value.length >= length;
    },
    
    maxLength: (value, length) => {
        return value && value.length <= length;
    }
};

export function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    let isValid = true;
    
    Object.keys(rules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const value = field.value;
        const fieldRules = rules[fieldName];
        
        fieldRules.forEach(rule => {
            const isValid = rule.validator(value);
            
            if (!isValid) {
                showFieldError(field, rule.message);
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });
    });
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const feedback = field.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
}
*/

// ============================================================
// ПРИМЕР 5: Состояние Приложения (State Management)
// ============================================================

/*
// src/modules/store.js

const initialState = {
    user: null,
    cart: [],
    orders: [],
    loading: false,
    error: null,
    theme: localStorage.getItem('theme') || 'light'
};

let state = { ...initialState };
const listeners = [];

export function getState() {
    return { ...state };
}

export function setState(updates) {
    state = { ...state, ...updates };
    notifyListeners();
}

export function subscribe(listener) {
    listeners.push(listener);
    return () => {
        listeners.splice(listeners.indexOf(listener), 1);
    };
}

function notifyListeners() {
    listeners.forEach(listener => listener(state));
}

export const actions = {
    setUser(user) {
        setState({ user });
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    addToCart(item) {
        const cart = state.cart;
        const existing = cart.find(i => i.id === item.id);
        
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        
        setState({ cart });
    },
    
    setLoading(loading) {
        setState({ loading });
    },
    
    setError(error) {
        setState({ error });
    }
};
*/

// ============================================================
// ПРИМЕР 6: Аналитика и Tracking
// ============================================================

/*
// src/modules/analytics.js

export function trackPageView(pageName) {
    console.log(`Посетена страница: ${pageName}`);
    // Изпрати към analytics сервис
}

export function trackEvent(eventName, eventData) {
    console.log(`Събитие: ${eventName}`, eventData);
    // Изпрати към analytics сервис
}

export function trackPrint(printDetails) {
    trackEvent('print_calculated', {
        material: printDetails.material,
        weight: printDetails.weight,
        technology: printDetails.technology,
        timestamp: new Date()
    });
}

// Използване:
// trackPageView('calculator');
// trackEvent('button_click', { button: 'submit' });
// trackPrint({ material: 'PLA', weight: 100, technology: 'FDM' });
*/

// ============================================================
// ПРИМЕР 7: Dark Mode / Theme Toggle
// ============================================================

/*
// src/modules/theme.js

export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

export function toggleTheme() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Обновяване на икона
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Използване:
// initTheme();
// Добави бутон: <button id="themeToggle" onclick="toggleTheme()">🌙</button>
*/

// ============================================================
// ПРИМЕР 8: Кеширане на Данни
// ============================================================

/*
// src/modules/cache.js

const CACHE_PREFIX = '3dprintlab_cache_';
const DEFAULT_TTL = 3600000; // 1 час в ms

export function setCacheItem(key, value, ttl = DEFAULT_TTL) {
    const data = {
        value,
        expires: Date.now() + ttl
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
}

export function getCacheItem(key) {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    
    if (!cached) return null;
    
    const { value, expires } = JSON.parse(cached);
    
    if (Date.now() > expires) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
    }
    
    return value;
}

export function clearCache(key) {
    if (key) {
        localStorage.removeItem(CACHE_PREFIX + key);
    } else {
        // Изчисти всичко
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(k);
            }
        });
    }
}
*/

// ============================================================
// ИНСТРУКЦИИ ЗА ИНТЕГРАЦИЯ
// ============================================================

/*
За интеграция на който и да е модул:

1. Създайте файл в `src/modules/`
2. Експортирайте функциите с `export`
3. Импортирайте в `src/main.js`
4. Инициализирайте в DOMContentLoaded слушател

Пример:

// src/modules/myFeature.js
export function initMyFeature() {
    console.log('Feature started!');
}

// src/main.js
import { initMyFeature } from './modules/myFeature.js';

document.addEventListener('DOMContentLoaded', function() {
    initMyFeature();
});
*/

console.log('Примерните модули са готови за копиране и адаптиране!');
