// ===== СИСТЕМА УПРАВЛЕНИЯ АРХИВОМ ПРОТОКОЛОВ =====

let filesContainer;
let fileInput;
let selectedFilesContainer;
let uploadForm;
let fileCounter;
let storageLevel;
let storageText;
let archiveStats;

// Максимальный размер файла (10 МБ)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Инициализация системы
function initArchive() {
    filesContainer = document.getElementById('filesContainer');
    fileInput = document.getElementById('fileInput');
    selectedFilesContainer = document.getElementById('selectedFiles');
    uploadForm = document.getElementById('uploadForm');
    fileCounter = document.getElementById('fileCounter');
    storageLevel = document.getElementById('storageLevel');
    storageText = document.getElementById('storageText');
    archiveStats = document.getElementById('archiveStats');
    
    initSystem();
    loadFilesFromStorage();
    setupEventListeners();
}

// Инициализация системных функций
function initSystem() {
    updateSystemDate();
    updateStorageStats();
    
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
}

// Настройка обработчиков событий
function setupEventListeners() {
    fileInput.addEventListener('change', handleFileSelect);
    uploadForm.addEventListener('submit', handleFileUpload);
}

// Обработка выбора файлов
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    selectedFilesContainer.innerHTML = '';
    
    files.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
            showSystemAlert(`ФАЙЛ "${file.name}" ПРЕВЫШАЕТ ЛИМИТ 10 МБ`, 'error');
            return;
        }
        
        const fileElement = document.createElement('div');
        fileElement.className = 'selected-file';
        fileElement.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        `;
        
        selectedFilesContainer.appendChild(fileElement);
    });
}

// Обработка загрузки файлов
function handleFileUpload(event) {
    event.preventDefault();
    
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) {
        showSystemAlert('ВЫБЕРИТЕ ФАЙЛЫ ДЛЯ ЗАГРУЗКИ', 'error');
        return;
    }
    
    // Блокируем кнопку загрузки
    const uploadButton = uploadForm.querySelector('.upload-button');
    const originalText = uploadButton.innerHTML;
    uploadButton.innerHTML = '<span class="button-icon">⏳</span> ЗАГРУЗКА...';
    uploadButton.disabled = true;
    
    let uploadPromises = [];
    let validFiles = [];
    
    // Фильтруем файлы по размеру
    files.forEach(file => {
        if (file.size <= MAX_FILE_SIZE) {
            validFiles.push(file);
        } else {
            showSystemAlert(`ФАЙЛ "${file.name}" ПРЕВЫШАЕТ ЛИМИТ 10 МБ`, 'error');
        }
    });
    
    if (validFiles.length === 0) {
        resetUploadButton(uploadButton, originalText);
        return;
    }
    
    // Создаем промисы для загрузки каждого файла
    validFiles.forEach(file => {
        const promise = new Promise((resolve, reject) => {
            saveFileToStorage(file)
                .then(fileId => {
                    resolve({ success: true, fileId: fileId, fileName: file.name });
                })
                .catch(error => {
                    reject({ success: false, fileName: file.name, error: error });
                });
        });
        uploadPromises.push(promise);
    });
    
    // Ожидаем завершения всех загрузок
    Promise.all(uploadPromises.map(p => p.catch(e => e)))
        .then(results => {
            const successfulUploads = results.filter(r => r.success).length;
            const failedUploads = results.filter(r => !r.success).length;
            
            if (successfulUploads > 0) {
                showSystemAlert(`УСПЕШНО ЗАГРУЖЕНО: ${successfulUploads} ФАЙЛОВ`, 'success');
                loadFilesFromStorage();
            }
            
            if (failedUploads > 0) {
                showSystemAlert(`НЕ УДАЛОСЬ ЗАГРУЗИТЬ: ${failedUploads} ФАЙЛОВ`, 'error');
            }
            
            // Сбрасываем форму
            fileInput.value = '';
            selectedFilesContainer.innerHTML = '';
        })
        .finally(() => {
            resetUploadButton(uploadButton, originalText);
        });
}

// Сброс кнопки загрузки
function resetUploadButton(button, originalHTML) {
    button.innerHTML = originalHTML;
    button.disabled = false;
}

// Сохранение файла в хранилище (возвращает Promise)
function saveFileToStorage(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const fileData = {
                        id: generateFileId(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result,
                        uploadDate: new Date().toISOString(),
                        category: getFileCategory(file.type)
                    };
                    
                    const existingFiles = getFilesFromStorage();
                    existingFiles.push(fileData);
                    localStorage.setItem('protocols_3826', JSON.stringify(existingFiles));
                    
                    updateStorageStats();
                    resolve(fileData.id);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Ошибка чтения файла'));
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            reject(error);
        }
    });
}

// Получение файлов из хранилища
function getFilesFromStorage() {
    try {
        const storedFiles = localStorage.getItem('protocols_3826');
        return storedFiles ? JSON.parse(storedFiles) : [];
    } catch (error) {
        console.error('Ошибка чтения хранилища:', error);
        return [];
    }
}

// Загрузка файлов из хранилища
function loadFilesFromStorage() {
    const files = getFilesFromStorage();
    
    if (files.length === 0) {
        // Показываем сообщение "Архив пуст"
        const noFilesMessage = document.getElementById('noFilesMessage');
        if (noFilesMessage) {
            noFilesMessage.style.display = 'block';
        } else {
            filesContainer.innerHTML = `
                <div class="no-files" id="noFilesMessage">
                    <div class="no-files-icon">📁</div>
                    <div class="no-files-text">АРХИВ ПУСТ</div>
                    <div class="no-files-subtext">Загрузите первые протоколы для начала работы</div>
                </div>
            `;
        }
    } else {
        // Скрываем сообщение "Архив пуст"
        const noFilesMessage = document.getElementById('noFilesMessage');
        if (noFilesMessage) {
            noFilesMessage.style.display = 'none';
        }
        renderFiles(files);
    }
    
    updateFileCounter(files.length);
    updateStorageStats();
}

// Отображение файлов
function renderFiles(files) {
    filesContainer.innerHTML = '';
    
    // Сортируем файлы по дате загрузки (новые сверху)
    files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    files.forEach(file => {
        const fileCard = createFileCard(file);
        filesContainer.appendChild(fileCard);
    });
}

// Создание карточки файла
function createFileCard(file) {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    
    const uploadDate = new Date(file.uploadDate);
    const dateString = uploadDate.toLocaleDateString('ru-RU');
    const timeString = uploadDate.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    fileCard.innerHTML = `
        <div class="file-header">
            <div class="file-icon">${getFileIcon(file.category)}</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    <span class="file-type">${getFileTypeText(file.category)}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                    <span class="file-date">${dateString} ${timeString}</span>
                </div>
            </div>
        </div>
        <div class="file-actions">
            <button class="file-action-btn download" onclick="downloadFile('${file.id}')">
                📥 СКАЧАТЬ
            </button>
            <button class="file-action-btn delete" onclick="deleteFile('${file.id}')">
                🗑 УДАЛИТЬ
            </button>
        </div>
    `;
    
    return fileCard;
}

// Скачивание файла
function downloadFile(fileId) {
    const files = getFilesFromStorage();
    const file = files.find(f => f.id === fileId);
    
    if (file) {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSystemAlert(`ФАЙЛ СКАЧАН: ${file.name}`, 'success');
    } else {
        showSystemAlert('ФАЙЛ НЕ НАЙДЕН В АРХИВЕ', 'error');
    }
}

// Удаление файла
function deleteFile(fileId) {
    if (confirm('ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ЭТОТ ПРОТОКОЛ?')) {
        const files = getFilesFromStorage();
        const updatedFiles = files.filter(f => f.id !== fileId);
        
        try {
            localStorage.setItem('protocols_3826', JSON.stringify(updatedFiles));
            showSystemAlert('ПРОТОКОЛ УДАЛЕН ИЗ АРХИВА', 'success');
            loadFilesFromStorage();
        } catch (error) {
            showSystemAlert('ОШИБКА ПРИ УДАЛЕНИИ ФАЙЛА', 'error');
        }
    }
}

// Обновление счетчика файлов
function updateFileCounter(count) {
    fileCounter.textContent = `ФАЙЛОВ: ${count}`;
}

// Обновление статистики хранилища
function updateStorageStats() {
    const files = getFilesFromStorage();
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    // Условный лимит хранилища (50 МБ)
    const storageLimit = 50 * 1024 * 1024;
    const usagePercent = Math.min((totalSize / storageLimit) * 100, 100);
    
    storageLevel.style.width = `${usagePercent}%`;
    storageText.textContent = `ИСПОЛЬЗОВАНО: ${formatFileSize(totalSize)}`;
    
    // Обновление статуса архива
    if (files.length === 0) {
        archiveStats.textContent = '■ ПУСТ';
        archiveStats.style.color = 'var(--color-soviet-gray)';
    } else if (usagePercent > 90) {
        archiveStats.textContent = '■ ПЕРЕПОЛНЕН';
        archiveStats.style.color = 'var(--color-soviet-red)';
    } else {
        archiveStats.textContent = '■ АКТИВЕН';
        archiveStats.style.color = 'var(--color-soviet-dark-gray)';
    }
}

// Вспомогательные функции
function generateFileId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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

// Показать системное уведомление
function showSystemAlert(message, type = 'info') {
    // Удаляем старые уведомления
    const oldAlerts = document.querySelectorAll('.system-alert');
    oldAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `system-alert alert-${type}`;
    
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
document.addEventListener('DOMContentLoaded', initArchive);