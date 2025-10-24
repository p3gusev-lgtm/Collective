// ===== СИСТЕМНЫЕ УТИЛИТЫ ОБЪЕКТА 3826 =====

// Функция безопасного добавления сообщения с обработкой ошибок
function safeAddMessage(text, sender = 'ОПЕРАТОР', files = []) {
    try {
        if (!text && files.length === 0) {
            throw new Error("СООБЩЕНИЕ НЕ МОЖЕТ БЫТЬ ПУСТЫМ");
        }
        
        if (text && text.length > 256) {
            throw new Error("ПРЕВЫШЕН ЛИМИТ ДЛИНЫ СООБЩЕНИЯ (256 СИМВОЛОВ)");
        }
        
        addMessageToDOM(text, sender, files);
        saveMessageToStorage(text, sender, files);
        
    } catch (error) {
        console.error("СИСТЕМНАЯ ОШИБКА:", error.message);
        showSystemAlert(`ОШИБКА: ${error.message}`);
    }
}

// Функция добавления сообщения в DOM
function addMessageToDOM(text, sender, files = []) {
    const messageDiv = document.createElement('div');
    
    // Определяем приоритет сообщения
    const isPriority = text && (text.includes('СРОЧНО') || text.includes('ВАЖНО') || text.includes('ТРЕВОГА'));
    messageDiv.className = isPriority ? 'message message-priority-high' : 'message';
    
    // Добавляем класс, если есть вложения
    if (files && files.length > 0) {
        messageDiv.classList.add('message-has-attachments');
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Создаем элементы вручную для правильной обработки переносов
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    timeElement.textContent = `[${timeString}]`;

    const senderElement = document.createElement('div');
    senderElement.className = 'message-sender';
    senderElement.textContent = `${sender}:`;

    const textElement = document.createElement('div');
    textElement.className = 'message-text';
    textElement.textContent = text || ''; // textContent сохраняет переносы

    messageDiv.appendChild(timeElement);
    messageDiv.appendChild(senderElement);
    messageDiv.appendChild(textElement);
    
    // Добавляем файлы, если они есть
    if (files && files.length > 0) {
        const filesElement = document.createElement('div');
        filesElement.className = 'message-files';
        
        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'message-file';
            
            const fileIcon = document.createElement('span');
            fileIcon.className = 'message-file-icon';
            fileIcon.textContent = getFileIcon(getFileCategory(file.type));
            
            const fileLink = document.createElement('span');
            fileLink.className = 'message-file-link';
            fileLink.textContent = file.name;
            fileLink.onclick = function() {
                downloadFile(file);
            };
            
            const fileSize = document.createElement('span');
            fileSize.className = 'message-file-size';
            fileSize.textContent = `(${formatFileSize(file.size)})`;
            
            fileElement.appendChild(fileIcon);
            fileElement.appendChild(fileLink);
            fileElement.appendChild(fileSize);
            filesElement.appendChild(fileElement);
        });
        
        messageDiv.appendChild(filesElement);
    }
    
    // Анимация появления сообщения
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    
    messagesContainer.appendChild(messageDiv);
    
    // Запуск анимации
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 100);
    
    // Ограничиваем количество видимых сообщений
    limitVisibleMessages();
}

// Функция для сохранения сообщений в системное хранилище
function saveMessageToStorage(text, sender, files = []) {
    const savedMessages = localStorage.getItem('chatMessages_3826');
    let messages = [];
    
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    }
    
    // Сохраняем информацию о файлах
    const fileData = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        data: null // Мы не сохраняем сами файлы в localStorage из-за ограничений размера
    }));
    
    messages.push({
        text: text,
        sender: sender,
        timestamp: new Date().toISOString(),
        priority: text && (text.includes('СРОЧНО') || text.includes('ВАЖНО')),
        hasAttachments: files.length > 0,
        attachments: fileData
    });
    
    // Ограничиваем историю 100 сообщениями
    if (messages.length > 100) {
        messages = messages.slice(-50);
    }
    
    localStorage.setItem('chatMessages_3826', JSON.stringify(messages));
}

// Функция для скачивания файла
function downloadFile(file) {
    // Если file уже является File объектом (из прикрепленных файлов)
    if (file instanceof File) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } 
    // Если file это объект из архива (с полем data)
    else if (file.data) {
        // Создаем Blob из Data URL
        const byteString = atob(file.data.split(',')[1]);
        const mimeString = file.data.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
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

// Функция для загрузки сообщений из системного хранилища
function loadMessagesFromStorage() {
    const savedMessages = localStorage.getItem('chatMessages_3826');
    if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        
        // Очищаем контейнер полностью
        messagesContainer.innerHTML = '';
        
        // Загружаем только сообщения от ОПЕРАТОРА
        messages.forEach(function(message) {
            if (message.sender === 'ОПЕРАТОР') {
                const date = new Date(message.timestamp);
                const timeString = date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                addMessageWithMetadata(message.text, message.sender, timeString, message.priority);
            }
        });
        
        // Ограничиваем количество видимых сообщений после загрузки
        limitVisibleMessages();
    }
}

// Функция добавления сообщения с метаданными
function addMessageWithMetadata(text, sender, timeString, isPriority = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isPriority ? 'message message-priority-high' : 'message';
    
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    timeElement.textContent = `[${timeString}]`;
    
    const senderElement = document.createElement('div');
    senderElement.className = 'message-sender';
    senderElement.textContent = `${sender}:`;
    
    const textElement = document.createElement('div');
    textElement.className = 'message-text';
    textElement.textContent = text;
    
    messageDiv.appendChild(timeElement);
    messageDiv.appendChild(senderElement);
    messageDiv.appendChild(textElement);
    
    messagesContainer.appendChild(messageDiv);
}

// Функция показа системного предупреждения
function showSystemAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'system-message';
    alertDiv.style.background = 'rgba(255, 51, 51, 0.2)';
    alertDiv.style.borderLeftColor = 'var(--color-red)';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    alertDiv.innerHTML = `
        <div class="message-time">[${timeString}]</div>
        <div class="message-text">
            <span class="system-prefix">СИСТЕМА КОНТРОЛЯ:</span> ${message}
        </div>
    `;
    
    messagesContainer.appendChild(alertDiv);
    scrollToBottom();
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.transition = 'all 0.5s ease';
            alertDiv.style.opacity = '0';
            alertDiv.style.height = '0';
            alertDiv.style.margin = '0';
            alertDiv.style.padding = '0';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 500);
        }
    }, 5000);
}

// Функция очистки системного журнала
function clearSystemLog() {
    if (confirm("ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ ОЧИСТИТЬ СИСТЕМНЫЙ ЖУРНАЛ?")) {
        messagesContainer.innerHTML = '';
        localStorage.removeItem('chatMessages_3826');
        updateMessageCounter();
    }
}

// Функция экспорта системного журнала
function exportSystemLog() {
    const messages = [];
    const messageElements = messagesContainer.querySelectorAll('.message, .system-message');
    
    messageElements.forEach(element => {
        const time = element.querySelector('.message-time').textContent;
        const sender = element.querySelector('.message-sender') ? 
                      element.querySelector('.message-sender').textContent : 'СИСТЕМА';
        const text = element.querySelector('.message-text').textContent;
        
        messages.push(`${time} ${sender} ${text}`);
    });
    
    const logContent = messages.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_log_3826_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Функция ограничения количества видимых сообщений
function limitVisibleMessages() {
    const allMessages = messagesContainer.querySelectorAll('.message');
    const maxVisibleMessages = 10; // Максимальное количество видимых сообщений
    
    if (allMessages.length > maxVisibleMessages) {
        // Скрываем старые сообщения, оставляя только последние maxVisibleMessages
        for (let i = 0; i < allMessages.length - maxVisibleMessages; i++) {
            allMessages[i].style.display = 'none';
        }
        
        // Показываем только последние сообщения
        for (let i = allMessages.length - maxVisibleMessages; i < allMessages.length; i++) {
            allMessages[i].style.display = 'block';
        }
        
        // Добавляем индикатор скрытых сообщений
        addHiddenMessagesIndicator(allMessages.length - maxVisibleMessages);
    }
}

// Функция добавления индикатора скрытых сообщений
function addHiddenMessagesIndicator(hiddenCount) {
    // Удаляем старый индикатор если есть
    const oldIndicator = messagesContainer.querySelector('.hidden-messages-indicator');
    if (oldIndicator) {
        oldIndicator.remove();
    }
    
    if (hiddenCount > 0) {
        const indicator = document.createElement('div');
        indicator.className = 'hidden-messages-indicator';
        indicator.innerHTML = `
            <div class="system-message">
                <div class="message-time">[${new Date().toLocaleTimeString('ru-RU')}]</div>
                <div class="message-text">
                    <span class="system-prefix">СИСТЕМА:</span> Скрыто ${hiddenCount} более старых сообщений
                </div>
            </div>
        `;
        
        // Вставляем индикатор перед первым сообщением
        const firstMessage = messagesContainer.querySelector('.message');
        if (firstMessage) {
            messagesContainer.insertBefore(indicator, firstMessage);
        }
    }
}