// ===== ОСНОВНАЯ ФУНКЦИОНАЛЬНОСТЬ СОВЕТСКОГО МЕССЕНДЖЕРА =====

let messageForm;
let messagesContainer;
let textarea;
let charCounter;
let messageCounter;
let fileAttachmentSection;
let attachFileBtn;
let fileAttachmentInput;
let attachedFilesList;

// Массив для хранения прикрепленных файлов
let attachedFiles = [];

// Флаг для отслеживания активности секции файлов
let isFileSectionActive = false;

// Инициализация системы
function init() {
    messageForm = document.getElementById('messageForm');
    messagesContainer = document.getElementById('messagesContainer');
    textarea = messageForm.querySelector('textarea');
    charCounter = document.getElementById('charCount');
    messageCounter = document.getElementById('messageCounter');
    fileAttachmentSection = document.getElementById('fileAttachmentSection');
    attachFileBtn = document.getElementById('attachFileBtn');
    fileAttachmentInput = document.getElementById('fileAttachment');
    attachedFilesList = document.getElementById('attachedFilesList');
    
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
        
        if (messageText || attachedFiles.length > 0) {
            // Всегда используем "ОПЕРАТОР" как отправителя
            safeAddMessage(messageText, 'ОПЕРАТОР', attachedFiles);
            textarea.value = '';
            updateCharCounter();
            clearAttachedFiles();
            scrollToBottom();
            updateMessageCounter();
            
            // ЗАКОММЕНТИРОВАТЬ системный ответ
            // setTimeout(generateSystemResponse, 2000);
        }
    });
    
    // Обработка клавиш в текстовом поле
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
    
    // Обработчики для прикрепления файлов
    attachFileBtn.addEventListener('click', function() {
        fileAttachmentInput.click();
    });
    
    fileAttachmentInput.addEventListener('change', handleFileAttachment);
    
    // Показать секцию прикрепления файлов при фокусе на textarea
    textarea.addEventListener('focus', function() {
        showFileAttachmentSection();
    });
    
    // Обработчик для закрытия секции файлов при клике вне ее
    document.addEventListener('click', function(e) {
        if (!fileAttachmentSection.contains(e.target) && 
            e.target !== textarea && 
            !textarea.contains(e.target)) {
            hideFileAttachmentSection();
        }
    });
    
    // Предотвращаем закрытие секции при клике внутри нее
    fileAttachmentSection.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Показать секцию прикрепления файлов
function showFileAttachmentSection() {
    fileAttachmentSection.classList.add('active');
    isFileSectionActive = true;
}

// Скрыть секцию прикрепления файлов (только если нет прикрепленных файлов)
function hideFileAttachmentSection() {
    if (attachedFiles.length === 0) {
        fileAttachmentSection.classList.remove('active');
        isFileSectionActive = false;
    }
}

// Обработка прикрепления файлов
function handleFileAttachment(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        // Проверяем размер файла (максимум 5 МБ)
        if (file.size > 5 * 1024 * 1024) {
            showSystemAlert(`ФАЙЛ "${file.name}" ПРЕВЫШАЕТ ЛИМИТ 5 МБ`, 'error');
            return;
        }
        
        // Добавляем файл в массив
        attachedFiles.push(file);
        
        // Добавляем файл в список отображения
        addFileToAttachmentList(file);
    });
    
    // Сбрасываем input
    event.target.value = '';
    
    // Показываем секцию прикрепления файлов
    showFileAttachmentSection();
}

// Добавление файла в список прикрепленных
function addFileToAttachmentList(file) {
    const fileElement = document.createElement('div');
    fileElement.className = 'attached-file';
    
    const fileIcon = getFileIcon(getFileCategory(file.type));
    
    fileElement.innerHTML = `
        <div class="attached-file-info">
            <span class="attached-file-icon">${fileIcon}</span>
            <span class="attached-file-name">${file.name}</span>
            <span class="attached-file-size">${formatFileSize(file.size)}</span>
        </div>
        <button type="button" class="remove-attachment" data-filename="${file.name}">×</button>
    `;
    
    attachedFilesList.appendChild(fileElement);
    
    // Обработчик удаления файла
    fileElement.querySelector('.remove-attachment').addEventListener('click', function(e) {
        e.stopPropagation(); // Предотвращаем всплытие
        const fileName = this.getAttribute('data-filename');
        removeAttachedFile(fileName);
        fileElement.remove();
    });
}

// Удаление прикрепленного файла
function removeAttachedFile(fileName) {
    attachedFiles = attachedFiles.filter(file => file.name !== fileName);
    
    // Скрываем секцию, если файлов нет
    if (attachedFiles.length === 0) {
        hideFileAttachmentSection();
    }
}

// Очистка прикрепленных файлов
function clearAttachedFiles() {
    attachedFiles = [];
    attachedFilesList.innerHTML = '';
    hideFileAttachmentSection();
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
function addMessage(text, sender = 'ОПЕРАТОР', files = []) {
    safeAddMessage(text, sender, files);
}

// Функция прокрутки к последнему сообщению
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Вспомогательные функции для работы с файлами
function getFileCategory(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'document';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('text')) return 'text';
    return 'other';
}

function getFileIcon(category) {
    const icons = {
        image: '🖼',
        audio: '🎵',
        video: '🎬',
        document: '📄',
        text: '📝',
        other: '📁'
    };
    return icons[category] || '📁';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Б';
    
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Инициализация системы при загрузке DOM
document.addEventListener('DOMContentLoaded', init);