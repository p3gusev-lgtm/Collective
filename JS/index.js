// ===== СИСТЕМА АУТЕНТИФИКАЦИИ ОБЪЕКТА 3826 =====

let currentForm = 'login';
let operatorCounter = 1;

// Инициализация системы
function initLoginSystem() {
    initSystem();
    setupEventListeners();
    loadExistingOperators();
    updateSystemDate();
}

// Инициализация системных функций
function initSystem() {
    setInterval(updateSystemDate, 60000);
    setInterval(updateSystemStatus, 2000);
}

// Обновление системной даты
function updateSystemDate() {
    const now = new Date();
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateString = now.toLocaleDateString('ru-RU', options);
    document.getElementById('currentDate').textContent = dateString.toUpperCase();
}

// Обновление статуса системы
function updateSystemStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    if (statusIndicator) {
        statusIndicator.style.opacity = statusIndicator.style.opacity === '0.7' ? '1' : '0.7';
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение между формами
    document.getElementById('showRegisterForm').addEventListener('click', showRegisterForm);
    document.getElementById('showLoginForm').addEventListener('click', showLoginForm);
    
    // Обработчики форм
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegistration);
    
    // Переключение видимости пароля
    document.getElementById('loginPasswordToggle').addEventListener('click', togglePasswordVisibility);
    document.getElementById('regPasswordToggle').addEventListener('click', togglePasswordVisibility);
    document.getElementById('regConfirmPasswordToggle').addEventListener('click', togglePasswordVisibility);
    
    // Проверка силы пароля
    document.getElementById('regPassword').addEventListener('input', checkPasswordStrength);
    
    // Автогенерация идентификатора при выборе должности
    document.getElementById('regPosition').addEventListener('change', generateOperatorId);
}

// Загрузка существующих операторов
function loadExistingOperators() {
    const operators = JSON.parse(localStorage.getItem('operators_3826') || '[]');
    operatorCounter = operators.length + 1;
}

// Показать форму регистрации
function showRegisterForm() {
    document.getElementById('loginFormContainer').classList.remove('active');
    document.getElementById('registerFormContainer').classList.add('active');
    currentForm = 'register';
    clearSystemMessages();
}

// Показать форму входа
function showLoginForm() {
    document.getElementById('registerFormContainer').classList.remove('active');
    document.getElementById('loginFormContainer').classList.add('active');
    currentForm = 'login';
    clearSystemMessages();
}

// Переключение видимости пароля
function togglePasswordVisibility(event) {
    const toggle = event.target;
    const input = toggle.parentElement.querySelector('input[type="password"], input[type="text"]');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁';
    }
}

// Проверка силы пароля
function checkPasswordStrength() {
    const password = document.getElementById('regPassword').value;
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let text = 'СЛАБЫЙ';
    let className = 'weak';
    
    // Проверка длины
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    
    // Проверка сложности
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength >= 4) {
        text = 'СИЛЬНЫЙ';
        className = 'strong';
    } else if (strength >= 2) {
        text = 'СРЕДНИЙ';
        className = 'medium';
    }
    
    strengthBar.className = 'strength-level ' + className;
    strengthText.textContent = text;
}

// Генерация ID оператора
function generateOperatorId() {
    const position = document.getElementById('regPosition').value;
    if (position) {
        const id = `OP-3826-${operatorCounter.toString().padStart(3, '0')}`;
        showSystemAlert(`ВАШ ИДЕНТИФИКАТОР: ${id}`, 'info');
    }
}

// Обработка входа
function handleLogin(event) {
    event.preventDefault();
    
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    
    // Валидация
    if (!identifier || !password) {
        showSystemAlert('ЗАПОЛНИТЕ ВСЕ ПОЛЯ', 'error');
        return;
    }
    
    // Проверка формата идентификатора
    if (!/^OP-3826-\d{3}$/.test(identifier)) {
        showSystemAlert('НЕВЕРНЫЙ ФОРМАТ ИДЕНТИФИКАТОРА', 'error');
        return;
    }
    
    // Поиск оператора
    const operators = JSON.parse(localStorage.getItem('operators_3826') || '[]');
    const operator = operators.find(op => op.id === identifier && op.password === password);
    
    if (operator) {
        // Сохраняем текущего оператора
        localStorage.setItem('currentOperator_3826', JSON.stringify(operator));
        showSystemAlert('ДОСТУП РАЗРЕШЕН. ПЕРЕНАПРАВЛЕНИЕ...', 'success');
        
        // Перенаправление на главную страницу
        setTimeout(() => {
            window.location.href = 'PERSONALbusiness.html';
        }, 2000);
    } else {
        showSystemAlert('НЕВЕРНЫЙ ИДЕНТИФИКАТОР ИЛИ КОД ДОСТУПА', 'error');
    }
}

// Обработка регистрации
function handleRegistration(event) {
    event.preventDefault();
    
    const lastName = document.getElementById('regLastName').value;
    const firstName = document.getElementById('regFirstName').value;
    const middleName = document.getElementById('regMiddleName').value;
    const rank = document.getElementById('regRank').value;
    const position = document.getElementById('regPosition').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const agreement = document.getElementById('securityAgreement').checked;
    
    // Валидация
    if (!lastName || !firstName || !middleName || !rank || !position || !password) {
        showSystemAlert('ЗАПОЛНИТЕ ВСЕ ОБЯЗАТЕЛЬНЫЕ ПОЛЯ', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showSystemAlert('КОДЫ ДОСТУПА НЕ СОВПАДАЮТ', 'error');
        return;
    }
    
    if (password.length < 6) {
        showSystemAlert('МИНИМАЛЬНАЯ ДЛИНА КОДА ДОСТУПА - 6 СИМВОЛОВ', 'error');
        return;
    }
    
    if (!agreement) {
        showSystemAlert('ПОДТВЕРДИТЕ ОЗНАКОМЛЕНИЕ С РЕЖИМОМ СЕКРЕТНОСТИ', 'error');
        return;
    }
    
    // Создание оператора
    const operatorId = `OP-3826-${operatorCounter.toString().padStart(3, '0')}`;
    const operator = {
        id: operatorId,
        lastName: lastName.toUpperCase(),
        firstName: firstName.toUpperCase(),
        middleName: middleName.toUpperCase(),
        rank: rank,
        position: position,
        password: password,
        registrationDate: new Date().toLocaleDateString('ru-RU'),
        status: 'АКТИВЕН'
    };
    
    // Сохранение оператора
    const operators = JSON.parse(localStorage.getItem('operators_3826') || '[]');
    operators.push(operator);
    localStorage.setItem('operators_3826', JSON.stringify(operators));
    
    // Сохранение данных оператора для личного дела
    const operatorData = {
        lastName: operator.lastName,
        firstName: operator.firstName,
        middleName: operator.middleName,
        rank: operator.rank,
        position: operator.position,
        operatorId: operator.id,
        registrationDate: operator.registrationDate,
        status: operator.status
    };
    localStorage.setItem('operatorData_3826', JSON.stringify(operatorData));
    
    // Увеличиваем счетчик
    operatorCounter++;
    
    showSystemAlert(`УЧЕТНАЯ ЗАПИСЬ ${operatorId} УСПЕШНО АКТИВИРОВАНА`, 'success');
    
    // Очистка формы и переход к входу
    setTimeout(() => {
        document.getElementById('registerForm').reset();
        showLoginForm();
        document.getElementById('loginIdentifier').value = operatorId;
    }, 3000);
}

// Показать системное сообщение
function showSystemAlert(message, type = 'info') {
    const messagesContainer = document.getElementById('systemMessages');
    const alert = document.createElement('div');
    alert.className = `system-alert ${type === 'success' ? 'success' : ''}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    alert.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">${icons[type] || 'ℹ️'}</span>
            <span class="alert-message">${message}</span>
        </div>
    `;
    
    messagesContainer.appendChild(alert);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        alert.style.transition = 'all 0.3s ease';
        alert.style.opacity = '0';
        alert.style.height = '0';
        alert.style.margin = '0';
        alert.style.padding = '0';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

// Очистка системных сообщений
function clearSystemMessages() {
    document.getElementById('systemMessages').innerHTML = '';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initLoginSystem);