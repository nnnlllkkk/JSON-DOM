
const SUBJECTS = ["fantasy", "science", "history", "biography", "romance", "mystery"];
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
async function generateBooks(count = 10) {
    try {
        const subject = randomItem(SUBJECTS);
        const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка запроса');
        
        const data = await response.json();
        
        if (!data.works || !Array.isArray(data.works)) {
            throw new Error('Нет данных о книгах');
        }
        const books = data.works
            .filter(book => book.title && book.authors?.length)
            .slice(0, count)
            .map(book => ({
                id: crypto.randomUUID(),
                title: book.title,
                author: book.authors.map(a => a.name).join(", "),
                genre: subject,
                year: book.first_publish_year || null,
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1))
            }));
        
        return books;
        
    } catch (error) {
        console.error('Ошибка:', error);
        // Возвращаем демо-книги если API не работает
        return [
            {
                id: crypto.randomUUID(),
                title: "1984",
                author: "Джордж Оруэлл",
                genre: "Фантастика",
                year: 1949,
                rating: 4.8
            },
            {
                id: crypto.randomUUID(),
                title: "Мастер и Маргарита",
                author: "Михаил Булгаков",
                genre: "Классика",
                year: 1967,
                rating: 4.9
            }
        ];
    }
}

// Делаем функцию глобальной
window.generateBooks = generateBooks;
