
let books = [];
const tableBody = document.getElementById('table-body');
const countEl = document.getElementById('count');
const totalCountEl = document.getElementById('total-count');
const searchInput = document.getElementById('search');
const form = document.getElementById('book-form');

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
function saveToLocalStorage() {
    localStorage.setItem('books', JSON.stringify(books));
}
function loadFromLocalStorage() {
    const saved = localStorage.getItem('books');
    if (saved) {
        books = JSON.parse(saved);
        return true;
    }
    return false;
}
function render() {
    // Очистить таблицу
    tableBody.innerHTML = '';
    const query = searchInput.value.toLowerCase().trim();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
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
    countEl.textContent = filteredBooks.length;
    totalCountEl.textContent = books.length;
}
function fillForm(book) {
    document.getElementById('book-id').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('genre').value = book.genre || '';
    document.getElementById('year').value = book.year || '';
    document.getElementById('rating').value = book.rating || '';
}
function clearForm() {
    form.reset();
    document.getElementById('book-id').value = '';
}
function exportToJSON() {
    if (books.length === 0) {
        alert('Нет книг для экспорта');
        return;
    }
    const jsonString = JSON.stringify(books, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books.json';
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`Экспортировано ${books.length} книг`);
}
document.getElementById('reload').addEventListener('click', loadBooks);
document.getElementById('export').addEventListener('click', exportToJSON);
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
searchInput.addEventListener('input', render);
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const sortField = th.dataset.sort;
        books.sort((a, b) => {
            const aVal = a[sortField] || '';
            const bVal = b[sortField] || '';
            return aVal.toString().localeCompare(bVal.toString());
        });
        
        render();
    });
});
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
    if (e.target.classList.contains('edit')) {
        fillForm(book);
    }
});
form.addEventListener('submit', (e) => {
    preventDefault();
    const bookId = document.getElementById('book-id').value;
    const bookData = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null,
        rating: document.getElementById('rating').value ? parseFloat(document.getElementById('rating').value) : null
    };
    if (!bookData.title || !bookData.author) {
        alert('Заполните название и автора');
        return;
    }
    if (bookData.rating !== null && (bookData.rating < 0 || bookData.rating > 5)) {
        alert('Рейтинг должен быть от 0 до 5');
        return;
    }
    
    if (bookId) {
        const index = books.findIndex(b => b.id === bookId);
        if (index !== -1) {
            books[index] = { ...books[index], ...bookData };
            alert('Книга обновлена');
        }
    } else {
        books.push({
            id: crypto.randomUUID(),
            ...bookData
        });
        alert('Книга добавлена');
    }
    saveToLocalStorage();
    clearForm();
    render();
});
document.getElementById('cancel').addEventListener('click', clearForm);
if (loadFromLocalStorage()) {
    render();
} else {
    loadBooks();
}
