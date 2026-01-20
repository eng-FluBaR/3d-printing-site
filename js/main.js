/* ==================== ГЛАВНИ СКРИПТОВЕ ==================== */

// ==================== УПРАВЛЕНИЕ НА МОБИЛНИЯ НАВБАР ====================
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (!hamburger || !navMenu) return;
    
    // Toggle меню при клик на hamburger
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Затвори меню при клик на линк
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Затвори меню при клик навън
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ==================== УПРАВЛЕНИЕ НА РОЛИТЕ ====================
const ROLES = {
    visitor: { name: 'Посетител', icon: '👤' },
    user: { name: 'Потребител', icon: '👨‍💻' },
    admin: { name: 'Админ', icon: '🔑' }
};

// Инициализира система на ролите
function initRoleSystem() {
    const roleBtn = document.getElementById('roleBtn');
    const roleDropdown = document.getElementById('roleDropdown');
    const roleOptions = document.querySelectorAll('.role-option');

    // Зареди запазана роля или постави default
    const savedRole = localStorage.getItem('userRole') || 'visitor';
    setCurrentRole(savedRole);

    // Toggle на dropdown
    if (roleBtn) {
        roleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            roleDropdown.classList.toggle('active');
        });
    }

    // Обработка на избор на роля
    roleOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const role = this.dataset.role;
            setCurrentRole(role);
            localStorage.setItem('userRole', role);
            roleDropdown.classList.remove('active');
            // Обнови страницата ако е нужно
            applyRolePermissions(role);
        });
    });

    // Затвори dropdown при клик навън
    document.addEventListener('click', function() {
        roleDropdown.classList.remove('active');
    });
}

// Постави текущата роля и обнови UI
function setCurrentRole(role) {
    const roleBtn = document.getElementById('roleBtn');
    const roleOptions = document.querySelectorAll('.role-option');

    // Обнови бутона
    if (roleBtn) {
        roleBtn.textContent = `${ROLES[role].icon} ${ROLES[role].name}`;
    }

    // Обнови активната опция
    roleOptions.forEach(option => {
        if (option.dataset.role === role) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Приложи пермисии
    applyRolePermissions(role);
}

// Приложи пермисии въз основа на ролята
function applyRolePermissions(role) {
    document.body.setAttribute('data-role', role);
    console.log(`Текущ режим: ${ROLES[role].name}`);
    
    // Обновлява админ панел ако е видим
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = role === 'admin' ? 'block' : 'none';
    }
    
    // Обновлява upload раздел
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
        uploadSection.style.display = (role === 'user' || role === 'admin') ? 'block' : 'none';
    }
    
    // Обновлява галерия админ функции ако функцията е налична
    if (typeof initGalleryAdmin === 'function') {
        initGalleryAdmin();
    }
    
    // Обновлява upload функции ако функцията е налична
    if (typeof updateUploadVisibility === 'function') {
        updateUploadVisibility(role);
    }
}

// Получи текущата роля
function getCurrentRole() {
    return localStorage.getItem('userRole') || 'visitor';
}

// Провери дали потребителят има определена роля
function hasRole(role) {
    return getCurrentRole() === role;
}

// Провери дали потребителят има поне една от определените роли
function hasAnyRole(...roles) {
    return roles.includes(getCurrentRole());
}

// Обработка на якорни линкове за плавно скролиране
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="#"]');
    if (link && link.hostname === window.location.hostname) {
        const hash = link.getAttribute('href');
        if (hash.includes('#')) {
            const anchorId = hash.split('#')[1];
            const targetElement = document.getElementById(anchorId);
            if (targetElement) {
                e.preventDefault();
                // Смени страницата ако е нужно
                const pathname = hash.split('#')[0];
                if (pathname && pathname !== window.location.pathname.split('/').pop()) {
                    window.location.href = hash;
                } else {
                    // Скролира до якора на същата страница
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }
});

// Филтриране на галерия
function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// Инициализира филтърите на галерия
document.addEventListener('DOMContentLoaded', function() {
    // Инициализира система на ролите
    initRoleSystem();

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const category = this.dataset.filter;
            filterGallery(category);
        });
    });

    // Обработка на контакт форма
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactForm();
        });
    }

    // Инициализира галерия със преходи
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
    });
});

// Обработка на контакт форма
function handleContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    // Събиране на данни от форма
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Простична валидация
    if (!name || !email || !subject || !message) {
        showMessage('Моля, попълнете всички задължителни полета!', 'error');
        return;
    }

    // Валидация на email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Моля, въведете валиден email адрес!', 'error');
        return;
    }

    // Симулация на изпращане (в реалност бихме изпратили на сървър)
    showMessage('✓ Вашето съобщение е успешно изпратено! Ще ви свържем скоро.', 'success');
    
    // Изчистване на форма
    setTimeout(() => {
        form.reset();
        formMessage.style.display = 'none';
    }, 3000);
}

// Показване на съобщение
function showMessage(text, type) {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.textContent = text;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }
}

// Плавно скролиране към елементи
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Активна навигация при скролиране
window.addEventListener('scroll', function() {
    const scrollPos = window.scrollY;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Добавяне на active клас на текущата секция
    if (scrollPos < 500) {
        navLinks[0].classList.add('active');
    }
});

// Анимация на числа при загрузка на страница
function animateNumbers() {
    const statBoxes = document.querySelectorAll('.stat-box h3');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = parseInt(target.textContent);
                let currentValue = 0;
                const increment = Math.ceil(finalValue / 50);

                const counter = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        target.textContent = finalValue + '+';
                        clearInterval(counter);
                    } else {
                        target.textContent = currentValue + '+';
                    }
                }, 30);

                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statBoxes.forEach(box => observer.observe(box));
}

// Стартиране на анимация на числата
document.addEventListener('DOMContentLoaded', function() {
    animateNumbers();
});

// Допълнителни интерактивни елементи
function addInteractivity() {
    // Хоувър ефект на карти
    const cards = document.querySelectorAll('.service-card, .project-card, .package');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Стартиране на интерактивност
document.addEventListener('DOMContentLoaded', addInteractivity);

// Функция за отворяне на модални прозорци при клик на галерия (опционално)
function setupGalleryModal() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('.gallery-info h3').textContent;
            const description = this.querySelector('.gallery-info p').textContent;
            console.log('Клик на галерия: ' + title);
            // Тук можеш да добавиш модален прозорец
        });
    });
}

// Зареди избрани проекти на начална страница
function loadFeaturedProjects() {
    const gridElement = document.getElementById('featuredProjectsGrid');
    if (!gridElement) return;
    
    const galleryItems = getGalleryItems();
    
    if (galleryItems.length === 0) {
        // Ако няма качени снимки, скрий секцията
        const section = gridElement.closest('.featured-projects');
        if (section) {
            section.style.display = 'none';
        }
        return;
    }
    
    // Показ на начални избрани проекти
    displayRandomProjects();
    
    // Ротация на проектите всеки 6 секунди
    setInterval(rotateProjects, 6000);
}

// Функция за показване на случайни проекти
function displayRandomProjects() {
    const gridElement = document.getElementById('featuredProjectsGrid');
    if (!gridElement) return;
    
    const galleryItems = getGalleryItems();
    
    if (galleryItems.length === 0) return;
    
    // Избери до 4 случайни различни проекта
    const shuffled = [...galleryItems].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    
    // Добави fade-out анимация преди смяна
    const cards = gridElement.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
    });
    
    // Изчакай анимацията и сменете съдържанието
    setTimeout(() => {
        gridElement.innerHTML = '';
        
        selected.forEach((item, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.style.opacity = '0';
            projectCard.style.transform = 'translateY(20px)';
            projectCard.innerHTML = `
                <div class="project-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"></div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            `;
            gridElement.appendChild(projectCard);
            
            // Анимирай появата на всяка карта със закъснение
            setTimeout(() => {
                projectCard.style.transition = 'all 0.6s ease-out';
                projectCard.style.opacity = '1';
                projectCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
}

// Функция за ротация на проектите
function rotateProjects() {
    displayRandomProjects();
}

// Получава всички снимки от localStorage
function getGalleryItems() {
    const stored = localStorage.getItem('galleryItems');
    return stored ? JSON.parse(stored) : [];
}

document.addEventListener('DOMContentLoaded', setupGalleryModal);
document.addEventListener('DOMContentLoaded', loadFeaturedProjects);
document.addEventListener('DOMContentLoaded', initMobileMenu);
