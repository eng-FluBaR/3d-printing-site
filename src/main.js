/**
 * Main Entry Point - Главна точка на входа за приложението
 */

// Импортиране на Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Импортиране на глобални стилове
import './styles/main.scss';
import { initMobileMenu, activateCurrentPage } from './modules/menu.js';
import { initRoleSystem } from './modules/roles.js';
import { initCalculator } from './modules/calculator.js';
import { init3DViewer } from './modules/viewer3d.js';

// Импортиране на page-specific модули
import { initIndexPage } from './pages/index/index.js';
import { initCalculatorPage } from './pages/calculator/calculator.js';
import { initServicesPage } from './pages/services/services.js';
import { initGalleryPage } from './pages/gallery/gallery.js';
import { initAboutPage } from './pages/about/about.js';
import { initContactPage } from './pages/contact/contact.js';

// Импортиране на page-specific стилове
import './pages/index/index.scss';
import './pages/calculator/calculator.scss';
import './pages/services/services.scss';
import './pages/gallery/gallery.scss';
import './pages/about/about.scss';
import './pages/contact/contact.scss';

// Импортиране на глобални стилове
import './styles/main.scss';

// Инициализация на приложението
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 3D PrintLab приложението е стартирано');
    
    // Инициализация на глобални компоненти
    initMobileMenu();
    activateCurrentPage();
    initRoleSystem();
    initCalculator();
    init3DViewer();
    
    // Инициализация на page-specific компоненти базирано на текущата страница
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/index') || currentPath.endsWith('/')) {
        initIndexPage();
    } else if (currentPath.includes('/calculator')) {
        initCalculatorPage();
    } else if (currentPath.includes('/services')) {
        initServicesPage();
    } else if (currentPath.includes('/gallery')) {
        initGalleryPage();
    } else if (currentPath.includes('/about')) {
        initAboutPage();
    } else if (currentPath.includes('/contact')) {
        initContactPage();
    }
    
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
