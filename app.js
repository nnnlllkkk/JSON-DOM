// ====== ПЕРЕМЕННЫЕ ======

// Массив всех книг
let books = [];

// Элементы DOM
const tableBody = document.getElementById('table-body');
const countEl = document.getElementById('count');
const totalCountEl = document.getElementById('total-count');
const searchInput = document.getElementById('search');
const form = document.getElementById('book-form');

// ====== ФУНКЦИИ ======

// Загрузить книги из API
async function loadBooks() {
    try {
        const newBooks = await window.generateBooks(8);
        books = newBooks;
        saveToLocalStorage();
        render();
        alert('Книги загружены!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка загрузки книг');
    }
}

// Сохранить в LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('books', JSON.stringify(books));
}

// Загрузить из LocalStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('books');
    if (saved) {
        books = JSON.parse(saved);
        return true;
    }
    return false;
}

// Отобразить книги в таблице
function render() {
    // Очистить таблицу
    tableBody.innerHTML = '';
    
    // Получить поисковый запрос
    const query = searchInput.value.toLowerCase().trim();
    
    // Отфильтровать книги
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
    
    // Создать строки таблицы
    filteredBooks.forEach(book => {
        const row = document.createElement('tr');
        row.dataset.id = book.id;
        
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre || '-'}</td>
            <td>${book.year || '-'}</td>
            <td>${book.rating ? book.rating.toFixed(1) : '-'}</td>
            <td>
                <button class="edit" data-id="${book.id}">✏️</button>
                <button class="delete" data-id="${book.id}">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Обновить счетчики
    countEl.textContent = filteredBooks.length;
    totalCountEl.textContent = books.length;
}

// Заполнить форму для редактирования
function fillForm(book) {
    document.getElementById('book-id').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('genre').value = book.genre || '';
    document.getElementById('year').value = book.year || '';
    document.getElementById('rating').value = book.rating || '';
}

// Очистить форму
function clearForm() {
    form.reset();
    document.getElementById('book-id').value = '';
}

// Экспорт в JSON
function exportToJSON() {
    if (books.length === 0) {
        alert('Нет книг для экспорта');
        return;
    }
    
    // Создать JSON строку
    const jsonString = JSON.stringify(books, null, 2);
    
    // Создать файл для скачивания
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Создать ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books.json';
    a.click();
    
    // Очистить URL
    URL.revokeObjectURL(url);
    
    alert(`Экспортировано ${books.length} книг`);
}

// ====== ОБРАБОТЧИКИ СОБЫТИЙ ======

// Загрузка книг по кнопке
document.getElementById('reload').addEventListener('click', loadBooks);

// Экспорт по кнопке
document.getElementById('export').addEventListener('click', exportToJSON);

// Очистить все книги
document.getElementById('clear-all').addEventListener('click', () => {
    if (books.length === 0) {
        alert('Нет книг для удаления');
        return;
    }
    
    if (confirm(`Удалить все книги (${books.length} шт.)?`)) {
        books = [];
        saveToLocalStorage();
        render();
        alert('Все книги удалены');
    }
});

// Поиск в реальном времени
searchInput.addEventListener('input', render);

// Сортировка по клику на заголовок
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const sortField = th.dataset.sort;
        
        // Простая сортировка
        books.sort((a, b) => {
            const aVal = a[sortField] || '';
            const bVal = b[sortField] || '';
            return aVal.toString().localeCompare(bVal.toString());
        });
        
        render();
    });
});

// Обработчик кликов в таблице (делегирование)
tableBody.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    // Удаление
    if (e.target.classList.contains('delete')) {
        if (confirm('Удалить книгу?')) {
            books = books.filter(b => b.id !== id);
            saveToLocalStorage();
            render();
            alert('Книга удалена');
        }
    }
    
    // Редактирование
    if (e.target.classList.contains('edit')) {
        fillForm(book);
    }
});

// Отправка формы
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Получить данные из формы
    const bookId = document.getElementById('book-id').value;
    const bookData = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null,
        rating: document.getElementById('rating').value ? parseFloat(document.getElementById('rating').value) : null
    };
    
    // Проверка обязательных полей
    if (!bookData.title || !bookData.author) {
        alert('Заполните название и автора');
        return;
    }
    
    // Проверка рейтинга
    if (bookData.rating !== null && (bookData.rating < 0 || bookData.rating > 5)) {
        alert('Рейтинг должен быть от 0 до 5');
        return;
    }
    
    if (bookId) {
        // Редактировать существующую книгу
        const index = books.findIndex(b => b.id === bookId);
        if (index !== -1) {
            books[index] = { ...books[index], ...bookData };
            alert('Книга обновлена');
        }
    } else {
        // Добавить новую книгу
        books.push({
            id: crypto.randomUUID(),
            ...bookData
        });
        alert('Книга добавлена');
    }
    
    // Сохранить и отобразить
    saveToLocalStorage();
    clearForm();
    render();
});

// Кнопка отмены
document.getElementById('cancel').addEventListener('click', clearForm);

// ====== ЗАПУСК ПРИЛОЖЕНИЯ ======

// Загрузить сохраненные книги при старте
if (loadFromLocalStorage()) {
    render();
} else {
    // Если нет сохраненных книг, загрузить демо
    loadBooks();
}