/**
 * Role System Module - Управление на ролите (Посетител, Потребител, Админ)
 */

const ROLES = {
    visitor: { name: 'Посетител', icon: '👤' },
    user: { name: 'Потребител', icon: '👨‍💻' },
    admin: { name: 'Админ', icon: '🔑' }
};

export function initRoleSystem() {
    const roleBtn = document.getElementById('roleBtn');
    const roleDropdown = document.getElementById('roleDropdown');
    const roleOptions = document.querySelectorAll('.role-option');

    if (!roleBtn || !roleDropdown) return;

    // Зареди запазена роля или постави default
    const savedRole = localStorage.getItem('userRole') || 'visitor';
    setCurrentRole(savedRole);

    // Toggle dropdown при клик на бутон
    roleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        roleDropdown.classList.toggle('active');
    });

    // Затвори dropdown при клик навън
    document.addEventListener('click', function(e) {
        if (!roleBtn.contains(e.target) && !roleDropdown.contains(e.target)) {
            roleDropdown.classList.remove('active');
        }
    });

    // Смени роля при клик на опция
    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            const role = this.dataset.role;
            setCurrentRole(role);
            roleDropdown.classList.remove('active');
        });
    });
}

export function setCurrentRole(role) {
    if (!ROLES[role]) return;
    
    // Запази роля в localStorage
    localStorage.setItem('userRole', role);
    
    // Обнови UI
    const roleBtn = document.getElementById('roleBtn');
    if (roleBtn) {
        roleBtn.textContent = ROLES[role].icon + ' ' + ROLES[role].name;
    }

    // Обнови активна опция
    const roleOptions = document.querySelectorAll('.role-option');
    roleOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.role === role) {
            option.classList.add('active');
        }
    });

    // Прилагай роля-специфични стилове
    applyRoleStyles(role);
    
    // Излъчи custom event
    window.dispatchEvent(new CustomEvent('roleChanged', { detail: { role } }));
}

export function getCurrentRole() {
    return localStorage.getItem('userRole') || 'visitor';
}

export function isAdmin() {
    return getCurrentRole() === 'admin';
}

export function isLoggedIn() {
    return getCurrentRole() !== 'visitor';
}

function applyRoleStyles(role) {
    const body = document.body;
    body.classList.remove('role-visitor', 'role-user', 'role-admin');
    body.classList.add(`role-${role}`);
}
