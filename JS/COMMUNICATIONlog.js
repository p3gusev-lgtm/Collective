// ===== СИСТЕМА АРХИВА СООБЩЕНИЙ =====

let archiveContainer;
let currentFilter = 'all';
let currentPage = 1;
const messagesPerPage = 50;
let allMessages = [];

// Инициализация системы архива
function initArchive() {
    archiveContainer = document.getElementById('archiveContainer');
    
    // Загрузка и отображение сообщений
    loadArchiveMessages();
    setupEventListeners();
    updateSystemDate();
    
    // Обновление времени каждую минуту
    setInterval(updateSystemDate, 60000);
}

// Загрузка сообщений из хранилища
function loadArchiveMessages() {
    const savedMessages = localStorage.getItem('chatMessages_3826');
    
    if (savedMessages) {
        allMessages = JSON.parse(savedMessages);
        allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        updateArchiveStats();
        displayMessages();
    } else {
        showNoMessages();
    }
}

// Отображение сообщений с учетом фильтра и пагинации
function displayMessages() {
    const filteredMessages = filterMessages(allMessages);
    const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    const pageMessages = filteredMessages.slice(startIndex, endIndex);
    
    archiveContainer.innerHTML = '';
    
    if (pageMessages.length === 0) {
        showNoMessages();
    } else {
        pageMessages.forEach(message => {
            addMessageToArchive(message);
        });
    }
    
    updatePaginationControls(filteredMessages.length, totalPages);
    updateDisplayCount(filteredMessages.length, pageMessages.length);
}

// Фильтрация сообщений
function filterMessages(messages) {
    switch (currentFilter) {
        case 'operator':
            return messages.filter(msg => msg.sender === 'ОПЕРАТОР');
        case 'system':
            return messages.filter(msg => msg.sender === 'СИСТЕМА');
        default:
            return messages;
    }
}

// Добавление сообщения в архив
function addMessageToArchive(message) {
    const messageDiv = document.createElement('div');
    const isSystem = message.sender === 'СИСТЕМА';
    const isPriority = message.priority;
    
    if (isSystem) {
        messageDiv.className = 'system-message';
        if (message.text.includes('Скрыто')) {
            messageDiv.classList.add('hidden-messages-indicator');
        }
    } else {
        messageDiv.className = isPriority ? 'message message-priority-high' : 'message';
    }
    
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateString = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    if (isSystem) {
        messageDiv.innerHTML = `
            <div class="message-time">[${dateString} ${timeString}]</div>
            <div class="message-text">
                <span class="system-prefix">${message.sender}:</span> ${message.text}
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-time">[${dateString} ${timeString}]</div>
            <div class="message-sender">${message.sender}:</div>
            <div class="message-text">${message.text}</div>
        `;
    }
    
    archiveContainer.appendChild(messageDiv);
}

// Показать сообщение об отсутствии сообщений
function showNoMessages() {
    const noMessagesDiv = document.createElement('div');
    noMessagesDiv.className = 'system-message';
    noMessagesDiv.innerHTML = `
        <div class="message-time">[${new Date().toLocaleTimeString('ru-RU')}]</div>
        <div class="message-text">
            <span class="system-prefix">СИСТЕМА АРХИВА:</span> АРХИВ СООБЩЕНИЙ ПУСТ. ВОЗВРАЩАЙТЕСЬ НА ГЛАВНЫЙ КАНАЛ ДЛЯ НАЧАЛА СВЯЗИ.
        </div>
    `;
    archiveContainer.appendChild(noMessagesDiv);
}

// Обновление статистики архива
function updateArchiveStats() {
    document.getElementById('archiveCount').textContent = allMessages.length;
    document.getElementById('totalMessagesCounter').textContent = `СООБЩЕНИЙ В АРХИВЕ: ${allMessages.length}`;
    
    if (allMessages.length > 0) {
        const firstDate = new Date(allMessages[0].timestamp);
        const lastDate = new Date(allMessages[allMessages.length - 1].timestamp);
        
        const firstDateStr = firstDate.toLocaleDateString('ru-RU');
        const lastDateStr = lastDate.toLocaleDateString('ru-RU');
        
        document.getElementById('archivePeriod').textContent = `${firstDateStr} - ${lastDateStr}`;
    }
}

// Обновление счетчика отображаемых сообщений
function updateDisplayCount(total, displayed) {
    document.getElementById('displayedCount').textContent = displayed;
    document.getElementById('totalCount').textContent = total;
}

// Обновление элементов пагинации
function updatePaginationControls(totalMessages, totalPages) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    
    currentPageSpan.textContent = currentPage;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Скрываем пагинацию если страница одна
    document.querySelector('.archive-nav').style.display = totalPages <= 1 ? 'none' : 'flex';
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Фильтры
    document.getElementById('filterAll').addEventListener('click', () => setFilter('all'));
    document.getElementById('filterOperator').addEventListener('click', () => setFilter('operator'));
    document.getElementById('filterSystem').addEventListener('click', () => setFilter('system'));
    
    // Навигация
    document.getElementById('prevPage').addEventListener('click', goToPrevPage);
    document.getElementById('nextPage').addEventListener('click', goToNextPage);
    
    // Действия
    document.getElementById('exportArchive').addEventListener('click', exportArchive);
    document.getElementById('clearArchive').addEventListener('click', clearArchive);
}

// Установка фильтра
function setFilter(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // Обновление активной кнопки фильтра
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
    
    displayMessages();
}

// Переход на предыдущую страницу
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayMessages();
        archiveContainer.scrollTop = 0;
    }
}

// Переход на следующую страницу
function goToNextPage() {
    const filteredMessages = filterMessages(allMessages);
    const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        displayMessages();
        archiveContainer.scrollTop = 0;
    }
}

// Экспорт архива
function exportArchive() {
    if (allMessages.length === 0) {
        alert('АРХИВ ПУСТ. ЭКСПОРТ НЕВОЗМОЖЕН.');
        return;
    }
    
    let exportContent = `АРХИВ СИСТЕМЫ СВЯЗИ - Collective 3826\n`;
    exportContent += `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n`;
    exportContent += `Всего сообщений: ${allMessages.length}\n\n`;
    
    allMessages.forEach(message => {
        const date = new Date(message.timestamp);
        const dateTime = date.toLocaleString('ru-RU');
        exportContent += `[${dateTime}] ${message.sender}: ${message.text}\n`;
    });
    
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `collective_3826_archive_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Показать подтверждение
    const exportBtn = document.getElementById('exportArchive');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'ЭКСПОРТ ВЫПОЛНЕН!';
    exportBtn.style.background = 'linear-gradient(135deg, var(--color-soviet-gold), var(--color-soviet-brown))';
    
    setTimeout(() => {
        exportBtn.textContent = originalText;
        exportBtn.style.background = '';
    }, 2000);
}

// Очистка архива
function clearArchive() {
    if (confirm('ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ ПОЛНОСТЬЮ ОЧИСТИТЬ АРХИВ СООБЩЕНИЙ?\nЭТО ДЕЙСТВИЕ НЕВОЗМОЖНО ОТМЕНИТЬ.')) {
        localStorage.removeItem('chatMessages_3826');
        allMessages = [];
        currentPage = 1;
        updateArchiveStats();
        displayMessages();
        
        // Показать подтверждение
        const clearBtn = document.getElementById('clearArchive');
        const originalText = clearBtn.textContent;
        clearBtn.textContent = 'АРХИВ ОЧИЩЕН!';
        
        setTimeout(() => {
            clearBtn.textContent = originalText;
        }, 2000);
    }
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initArchive);