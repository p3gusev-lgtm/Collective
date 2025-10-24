// ===== ОСНОВНАЯ ФУНКЦИОНАЛЬНОСТЬ СОВЕТСКОГО МЕССЕНДЖЕРА =====

let messageForm;
let messagesContainer;
let textarea;
let charCounter;
let messageCounter;

// Функция инициализации системы
function init() {
    messageForm = document.getElementById('messageForm');
    messagesContainer = document.getElementById('messagesContainer');
    textarea = messageForm.querySelector('textarea');
    charCounter = document.getElementById('charCount');
    messageCounter = document.getElementById('messageCounter');
    
    // Инициализация системных компонентов
    initSystem();
    loadMessagesFromStorage();
    setupEventListeners();
    scrollToBottom();
}

// Инициализация системных функций
function initSystem() {
    updateSystemDate();
    updateMessageCounter();
    
    // Запуск системных анимаций
    setInterval(updateSystemDate, 60000); // Обновлять время каждую минуту
}

// Обновление системной даты и времени
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

// Обновление счетчика сообщений
function updateMessageCounter() {
    const messages = messagesContainer.querySelectorAll('.message');
    const systemMessages = messagesContainer.querySelectorAll('.system-message');
    const totalMessages = messages.length + systemMessages.length;
    messageCounter.textContent = `СООБЩЕНИЙ: ${totalMessages}`;
}

function setupEventListeners() {
    // Обработчик отправки формы
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const messageText = textarea.value.trim();
        
        if (messageText) {
            // Всегда используем "ОПЕРАТОР" как отправителя
            safeAddMessage(messageText, 'ОПЕРАТОР');
            textarea.value = '';
            updateCharCounter();
            scrollToBottom();
            updateMessageCounter();
            
            // setTimeout(generateSystemResponse, 2000);
        }
    });
    
    // Обработка клавиш в текстовом поле - исправленная версия
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            // Ctrl+Enter - отправка сообщения
            e.preventDefault();
            messageForm.dispatchEvent(new Event('submit'));
        }
        // Enter без Ctrl - обычный перенос строки
    });
    
    // Счетчик символов
    textarea.addEventListener('input', updateCharCounter);
}

// Обновление счетчика символов
function updateCharCounter() {
    const count = textarea.value.length;
    charCounter.textContent = count;
    
    // Изменение цвета при приближении к лимиту
    if (count > 200) {
        charCounter.style.color = 'var(--color-red)';
    } else if (count > 150) {
        charCounter.style.color = 'var(--color-yellow)';
    } else {
        charCounter.style.color = 'var(--color-text-dim)';
    }
}

// Генерация системного ответа
function generateSystemResponse() {
    const responses = [
        "СООБЩЕНИЕ ПРИНЯТО. ОЖИДАЙТЕ ОБРАБОТКИ.",
        "ИНФОРМАЦИЯ ЗАФИКСИРОВАНА В СИСТЕМНОМ ЖУРНАЛЕ.",
        "ПЕРЕДАЧА ПОДТВЕРЖДЕНА. КАНАЛ СВЯЗИ СТАБИЛЕН.",
        "СООБЩЕНИЕ ПРОЧИТАНО СИСТЕМОЙ КОНТРОЛЯ.",
        "ДАННЫЕ ПЕРЕДАВАТЬ С СОБЛЮДЕНИЕМ РЕЖИМА СЕКРЕТНОСТИ."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const systemDiv = document.createElement('div');
    systemDiv.className = 'system-message';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    systemDiv.innerHTML = `
        <div class="message-time">[${timeString}]</div>
        <div class="message-text">
            <span class="system-prefix">СИСТЕМА:</span> ${randomResponse}
        </div>
    `;
    
    messagesContainer.appendChild(systemDiv);
    scrollToBottom();
    updateMessageCounter();
}

// Функция добавления сообщения
function addMessage(text, sender = 'ОПЕРАТОР') {
    safeAddMessage(text, sender);
}

// Функция прокрутки к последнему сообщению
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Инициализация системы при загрузке DOM
document.addEventListener('DOMContentLoaded', init);