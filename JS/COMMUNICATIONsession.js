// ===== ОСНОВНАЯ ФУНКЦИОНАЛЬНОСТЬ СОВЕТСКОГО МЕССЕНДЖЕРА =====

let messageForm;
let messagesContainer;
let textarea;
let charCounter;
let messageCounter;
let fileAttachmentSection;
let attachFileBtn;
let attachedFilesList;

// Элементы модального окна
let archiveModal;
let modalFilesContainer;
let closeModal;
let confirmSelection;

// Массив для хранения прикрепленных файлов
let attachedFiles = [];
// Массив для хранения выбранных файлов в модальном окне
let selectedArchiveFiles = [];

// Инициализация системы
function init() {
    messageForm = document.getElementById('messageForm');
    messagesContainer = document.getElementById('messagesContainer');
    textarea = messageForm.querySelector('textarea');
    charCounter = document.getElementById('charCount');
    messageCounter = document.getElementById('messageCounter');
    fileAttachmentSection = document.getElementById('fileAttachmentSection');
    attachFileBtn = document.getElementById('attachFileBtn');
    attachedFilesList = document.getElementById('attachedFilesList');
    
    // Элементы модального окна
    archiveModal = document.getElementById('archiveModal');
    modalFilesContainer = document.getElementById('modalFilesContainer');
    closeModal = document.getElementById('closeModal');
    confirmSelection = document.getElementById('confirmSelection');
    
    // Инициализация системных компонентов
    initSystem();
    loadMessagesFromStorage();
    setupEventListeners();
    scrollToBottom();
    
    // Показываем секцию прикрепления файлов постоянно
    fileAttachmentSection.style.display = 'block';
}

// Инициализация системных функций
function initSystem() {
    updateSystemDate();
    updateMessageCounter();
    
    // Запуск системных анимаций
    setInterval(updateSystemDate, 60000);
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
        }
    });
    
    // Обработка клавиш в текстовом поле
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            messageForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // Счетчик символов
    textarea.addEventListener('input', updateCharCounter);
    
    // Обработчики для прикрепления файлов
    attachFileBtn.addEventListener('click', openArchiveModal);
    
    // Обработчики модального окна
    closeModal.addEventListener('click', closeArchiveModal);
    confirmSelection.addEventListener('click', confirmFileSelection);
    
    // Закрытие модального окна при клике вне его
    archiveModal.addEventListener('click', function(e) {
        if (e.target === archiveModal) {
            closeArchiveModal();
        }
    });
}

// Открытие модального окна с архивом файлов
function openArchiveModal() {
    loadArchiveFiles();
    archiveModal.style.display = 'block';
}

// Закрытие модального окна
function closeArchiveModal() {
    archiveModal.style.display = 'none';
    selectedArchiveFiles = [];
}

// Загрузка файлов из архива в модальное окно
function loadArchiveFiles() {
    const archivedFiles = getArchivedFiles();
    modalFilesContainer.innerHTML = '';
    
    if (archivedFiles.length === 0) {
        modalFilesContainer.innerHTML = `
            <div class="no-files-message">
                АРХИВ ПУСТ. ЗАГРУЗИТЕ ФАЙЛЫ В РАЗДЕЛЕ "ДОКУМЕНТАЦИЯ ОБЪЕКТА"
            </div>
        `;
        return;
    }
    
    archivedFiles.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = 'modal-file-item';
        fileElement.innerHTML = `
            <input type="checkbox" class="modal-file-checkbox" data-file-id="${file.id}">
            <span class="modal-file-icon">${getFileIcon(file.category)}</span>
            <div class="modal-file-name">${file.name}</div>
            <div class="modal-file-type">${getFileTypeText(file.category)}</div>
            <div class="modal-file-size">${formatFileSize(file.size)}</div>
        `;
        
        // Обработчик выбора файла
        fileElement.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('.modal-file-checkbox');
                checkbox.checked = !checkbox.checked;
            }
            
            const checkbox = this.querySelector('.modal-file-checkbox');
            if (checkbox.checked) {
                this.classList.add('selected');
            } else {
                this.classList.remove('selected');
            }
        });
        
        modalFilesContainer.appendChild(fileElement);
    });
}

// Получение файлов из архива
function getArchivedFiles() {
    try {
        const storedFiles = localStorage.getItem('protocols_3826');
        return storedFiles ? JSON.parse(storedFiles) : [];
    } catch (error) {
        console.error('Ошибка загрузки файлов из архива:', error);
        return [];
    }
}

// Подтверждение выбора файлов из архива
function confirmFileSelection() {
    const selectedCheckboxes = modalFilesContainer.querySelectorAll('.modal-file-checkbox:checked');
    const archivedFiles = getArchivedFiles();
    
    selectedCheckboxes.forEach(checkbox => {
        const fileId = checkbox.getAttribute('data-file-id');
        const fileData = archivedFiles.find(file => file.id === fileId);
        
        if (fileData && !attachedFiles.find(f => f.id === fileId)) {
            // Создаем File-like объект из данных архива
            const file = dataURLtoFile(fileData.data, fileData.name, fileData.type);
            file.id = fileData.id; // Сохраняем ID для отслеживания
            file.category = fileData.category;
            
            attachedFiles.push(file);
            addFileToAttachmentList(file);
        }
    });
    
    closeArchiveModal();
    showSystemAlert(`ДОБАВЛЕНО ФАЙЛОВ: ${selectedCheckboxes.length}`, 'success');
}

// Преобразование Data URL в File объект
function dataURLtoFile(dataurl, filename, mimeType) {
    const arr = dataurl.split(',');
    const mime = mimeType || arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    const file = new File([u8arr], filename, { type: mime });
    return file;
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
        <button type="button" class="remove-attachment" data-fileid="${file.id}">×</button>
    `;
    
    attachedFilesList.appendChild(fileElement);
    
    // Обработчик удаления файла
    fileElement.querySelector('.remove-attachment').addEventListener('click', function(e) {
        e.stopPropagation();
        const fileId = this.getAttribute('data-fileid');
        removeAttachedFile(fileId);
        fileElement.remove();
    });
}

// Удаление прикрепленного файла
function removeAttachedFile(fileId) {
    attachedFiles = attachedFiles.filter(file => file.id !== fileId);
}

// Очистка прикрепленных файлов
function clearAttachedFiles() {
    attachedFiles = [];
    attachedFilesList.innerHTML = '';
}

// Обновление счетчика символов
function updateCharCounter() {
    const count = textarea.value.length;
    charCounter.textContent = count;
    
    if (count > 200) {
        charCounter.style.color = 'var(--color-red)';
    } else if (count > 150) {
        charCounter.style.color = 'var(--color-yellow)';
    } else {
        charCounter.style.color = 'var(--color-text-dim)';
    }
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

function getFileTypeText(category) {
    const types = {
        image: 'ИЗОБРАЖЕНИЕ',
        audio: 'АУДИО',
        video: 'ВИДЕО',
        document: 'ДОКУМЕНТ',
        text: 'ТЕКСТ',
        other: 'ФАЙЛ'
    };
    return types[category] || 'ФАЙЛ';
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