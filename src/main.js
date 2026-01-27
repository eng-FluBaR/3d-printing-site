/**
 * Main Entry Point - Главна точка на входа за приложението
 */

// Импортиране на модули
import { initMobileMenu, activateCurrentPage } from './modules/menu.js';
import { initRoleSystem } from './modules/roles.js';
import { initCalculator } from './modules/calculator.js';
import { init3DViewer } from './modules/viewer3d.js';

// Импортиране на стилове
import './styles/main.scss';

// Инициализация на приложението
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 3D PrintLab приложението е стартирано');
    
    // Инициализация на компоненти
    initMobileMenu();
    activateCurrentPage();
    initRoleSystem();
    initCalculator();
    init3DViewer();
    
    // Слушане на промени в ролята
    window.addEventListener('roleChanged', (e) => {
        console.log('Роля променена на:', e.detail.role);
    });
});

// Експортиране на публични функции за конзола
window.app = {
    getCurrentRole: () => localStorage.getItem('userRole') || 'visitor',
    setRole: (role) => {
        localStorage.setItem('userRole', role);
        window.dispatchEvent(new CustomEvent('roleChanged', { detail: { role } }));
    }
};

console.log('Използвайте window.app.getCurrentRole() и window.app.setRole(role) в конзолата');
