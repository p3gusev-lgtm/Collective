// ===== СИСТЕМА УПРАВЛЕНИЯ ЛИЧНЫМ ДЕЛОМ =====

let operatorData = {};
let activityStats = {};

// Инициализация системы
function initPersonalBusiness() {
    initSystem();
    loadOperatorData();
    loadActivityStats();
    setupEventListeners();
    updateDisplay();
    generateActivityChart();
}

// Инициализация системных функций
function initSystem() {
    updateSystemDate();
    setInterval(updateSystemDate, 60000);
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
    
    // Обновляем время последней активности
    document.getElementById('lastActivity').textContent = 'СЕЙЧАС';
}

// Загрузка данных оператора
function loadOperatorData() {
    const savedData = localStorage.getItem('operatorData_3826');
    
    if (savedData) {
        operatorData = JSON.parse(savedData);
    } else {
        // Данные по умолчанию
        operatorData = {
            lastName: 'ПЕТРОВ',
            firstName: 'ИВАН',
            middleName: 'СЕРГЕЕВИЧ',
            rank: 'МАЙОР',
            position: 'СТАРШИЙ ОПЕРАТОР',
            department: 'ОТДЕЛ КОММУНИКАЦИЙ',
            operatorId: 'OP-3826-001',
            registrationDate: '15.08.1985',
            status: 'АКТИВЕН'
        };
        saveOperatorData();
    }
}

// Сохранение данных оператора
function saveOperatorData() {
    localStorage.setItem('operatorData_3826', JSON.stringify(operatorData));
}

// Загрузка статистики активности
function loadActivityStats() {
    const savedStats = localStorage.getItem('activityStats_3826');
    
    if (savedStats) {
        activityStats = JSON.parse(savedStats);
    } else {
        // Статистика по умолчанию
        activityStats = {
            messagesSent: 0,
            filesUploaded: 0,
            sessionsCount: 1,
            workTime: 0,
            dailyActivity: generateDefaultActivity()
        };
        saveActivityStats();
    }
}

// Генерация активности по умолчанию
function generateDefaultActivity() {
    const activity = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        activity[dateKey] = Math.floor(Math.random() * 50) + 10;
    }
    
    return activity;
}

// Сохранение статистики
function saveActivityStats() {
    localStorage.setItem('activityStats_3826', JSON.stringify(activityStats));
}

// Обновление счетчиков сообщений и файлов
function updateActivityCounters() {
    // Обновляем счетчик сообщений из чата
    const chatMessages = localStorage.getItem('chatMessages_3826');
    if (chatMessages) {
        const messages = JSON.parse(chatMessages);
        activityStats.messagesSent = messages.filter(msg => msg.sender === 'ОПЕРАТОР').length;
    }
    
    // Обновляем счетчик файлов из архива
    const archivedFiles = localStorage.getItem('protocols_3826');
    if (archivedFiles) {
        const files = JSON.parse(archivedFiles);
        activityStats.filesUploaded = files.length;
    }
    
    saveActivityStats();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Модальное окно смены пароля
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPassword = document.getElementById('cancelPassword');
    const passwordForm = document.getElementById('passwordForm');
    const newPasswordInput = document.getElementById('newPassword');
    
    changePasswordBtn.addEventListener('click', () => {
        passwordModal.style.display = 'block';
    });
    
    closePasswordModal.addEventListener('click', () => {
        passwordModal.style.display = 'none';
        passwordForm.reset();
    });
    
    cancelPassword.addEventListener('click', () => {
        passwordModal.style.display = 'none';
        passwordForm.reset();
    });
    
    // Обработчик силы пароля
    newPasswordInput.addEventListener('input', updatePasswordStrength);
    
    // Обработчик отправки формы
    passwordForm.addEventListener('submit', handlePasswordChange);
    
    // Другие кнопки действий
    document.getElementById('exportDataBtn').addEventListener('click', exportPersonalData);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearPersonalHistory);
    document.getElementById('emergencyBtn').addEventListener('click', activateEmergencyProtocol);
    
    // Закрытие модального окна при клике вне его
    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) {
            passwordModal.style.display = 'none';
            passwordForm.reset();
        }
    });
}

// Обновление отображения данных
function updateDisplay() {
    updateActivityCounters();
    
    // Персональные данные
    document.getElementById('lastName').textContent = operatorData.lastName;
    document.getElementById('firstName').textContent = operatorData.firstName;
    document.getElementById('middleName').textContent = operatorData.middleName;
    document.getElementById('rank').textContent = operatorData.rank;
    document.getElementById('position').textContent = operatorData.position;
    document.getElementById('department').textContent = operatorData.department;
    
    // Системные данные
    document.getElementById('operatorId').textContent = operatorData.operatorId;
    document.getElementById('regDate').textContent = operatorData.registrationDate;
    
    // Статистика
    document.getElementById('messagesSent').textContent = activityStats.messagesSent;
    document.getElementById('filesUploaded').textContent = activityStats.filesUploaded;
    document.getElementById('sessionsCount').textContent = activityStats.sessionsCount;
    document.getElementById('workTime').textContent = formatWorkTime(activityStats.workTime);
}

// Форматирование времени работы
function formatWorkTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
}

// Генерация графика активности
function generateActivityChart() {
    const chartContainer = document.getElementById('activityChart');
    chartContainer.innerHTML = '';
    
    const today = new Date();
    const dayNames = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const activity = activityStats.dailyActivity[dateKey] || 0;
        
        const barHeight = Math.min((activity / 60) * 100, 100);
        
        const barElement = document.createElement('div');
        barElement.className = 'chart-bar';
        barElement.style.height = `${barHeight}%`;
        barElement.innerHTML = `<div class="chart-label">${dayNames[date.getDay()]}</div>`;
        
        // Добавляем подсказку
        barElement.title = `${date.toLocaleDateString('ru-RU')}: ${activity} действий`;
        
        chartContainer.appendChild(barElement);
    }
}

// Обновление индикатора силы пароля
function updatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.querySelector('.strength-level');
    const strengthText = document.querySelector('.strength-text');
    
    let strength = 0;
    let text = 'СЛАБЫЙ';
    let color = 'var(--color-folder-red)';
    
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        text = 'СИЛЬНЫЙ';
        color = 'var(--color-stamp-blue)';
    } else if (strength >= 50) {
        text = 'СРЕДНИЙ';
        color = 'var(--color-gold)';
    }
    
    // Обновляем индикатор
    if (strengthBar) {
        strengthBar.style.setProperty('--strength-width', `${strength}%`);
        strengthBar.style.setProperty('--strength-color', color);
        strengthBar.style.width = `${strength}%`;
        strengthBar.style.background = color;
    }
    
    if (strengthText) {
        strengthText.textContent = text;
    }
}

// Обработка смены пароля
function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Проверка текущего пароля (в реальной системе здесь была бы проверка)
    if (!currentPassword) {
        showSystemAlert('ВВЕДИТЕ ТЕКУЩИЙ КОД ДОСТУПА', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showSystemAlert('НОВЫЕ КОДЫ НЕ СОВПАДАЮТ', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showSystemAlert('МИНИМАЛЬНАЯ ДЛИНА КОДА - 6 СИМВОЛОВ', 'error');
        return;
    }
    
    // В реальной системе здесь был бы запрос на сервер
    showSystemAlert('КОД ДОСТУПА УСПЕШНО ИЗМЕНЕН', 'success');
    
    document.getElementById('passwordModal').style.display = 'none';
    e.target.reset();
}

// Экспорт персональных данных
function exportPersonalData() {
    const data = {
        operator: operatorData,
        statistics: activityStats,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_data_${operatorData.operatorId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSystemAlert('ДАННЫЕ ЭКСПОРТИРОВАНЫ', 'success');
}

// Очистка личной истории
function clearPersonalHistory() {
    if (confirm('ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ ОЧИСТИТЬ ЛИЧНУЮ ИСТОРИЮ?')) {
        activityStats.messagesSent = 0;
        activityStats.filesUploaded = 0;
        activityStats.dailyActivity = generateDefaultActivity();
        saveActivityStats();
        updateDisplay();
        generateActivityChart();
        showSystemAlert('ЛИЧНАЯ ИСТОРИЯ ОЧИЩЕНА', 'success');
    }
}

// Активация аварийного протокола
function activateEmergencyProtocol() {
    if (confirm('АКТИВИРОВАТЬ АВАРИЙНЫЙ ПРОТОКОЛ?\n\nВСЕ СИСТЕМЫ БУДУТ ПЕРЕВЕДЕНЫ В РЕЖИМ КРИТИЧЕСКОЙ БЕЗОПАСНОСТИ.')) {
        showSystemAlert('АВАРИЙНЫЙ ПРОТОКОЛ АКТИВИРОВАН', 'error');
        
        // Имитация аварийного протокола
        document.body.style.animation = 'emergencyFlash 0.5s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 3000);
    }
}

// Показать системное уведомление
function showSystemAlert(message, type = 'info') {
    // Создаем стили для анимации аварийного режима
    if (!document.querySelector('#emergencyStyles')) {
        const style = document.createElement('style');
        style.id = 'emergencyStyles';
        style.textContent = `
            @keyframes emergencyFlash {
                0%, 100% { background-color: normal; }
                50% { background-color: rgba(139, 0, 0, 0.1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    const alert = document.createElement('div');
    alert.className = 'system-message';
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'error') {
        alert.style.background = 'rgba(139, 0, 0, 0.2)';
        alert.style.borderLeftColor = 'var(--color-soviet-red)';
    } else if (type === 'success') {
        alert.style.background = 'rgba(47, 79, 79, 0.2)';
        alert.style.borderLeftColor = 'var(--color-soviet-dark-gray)';
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    alert.innerHTML = `
        <div class="message-time">[${timeString}]</div>
        <div class="message-text">
            <span class="system-prefix">СИСТЕМА:</span> ${message}
        </div>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.transition = 'all 0.3s ease';
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 4000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initPersonalBusiness);