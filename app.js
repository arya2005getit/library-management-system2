const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let books = [
    {
        bookId: '1',
        bookTitle: 'The Alchemist',
        bookAuthor: 'Paulo Coelho',
        bookCategory: 'Fiction',
        bookStatus: 'Available'
    },
    {
        bookId: '2',
        bookTitle: 'Wings of Fire',
        bookAuthor: 'A. P. J. Abdul Kalam',
        bookCategory: 'Autobiography',
        bookStatus: 'Issued'
    },
    {
        bookId: '3',
        bookTitle: 'Clean Code',
        bookAuthor: 'Robert C. Martin',
        bookCategory: 'Programming',
        bookStatus: 'Available'
    }
];

app.get('/', (req, res) => {
    res.render('home', { data: books, success: null, error: null });
});

app.post('/', (req, res) => {
    const validation = validateBook(req.body, books, true);
    if (validation.error) {
        return res.status(400).render('home', {
            data: books,
            success: null,
            error: validation.error
        });
    }

    const newBook = {
        bookId: validation.data.bookId,
        bookTitle: validation.data.bookTitle,
        bookAuthor: validation.data.bookAuthor,
        bookCategory: validation.data.bookCategory,
        bookStatus: validation.data.bookStatus
    };

    books.push(newBook);
    res.render('home', {
        data: books,
        success: 'Book added successfully.',
        error: null
    });
});

app.post('/delete', (req, res) => {
    const requestedBookId = req.body.bookId;
    if (!requestedBookId) {
        return res.status(400).render('home', {
            data: books,
            success: null,
            error: 'Book ID is required.'
        });
    }

    const bookExists = books.some(book => book.bookId === requestedBookId);
    if (!bookExists) {
        return res.status(404).render('home', {
            data: books,
            success: null,
            error: 'Book not found.'
        });
    }

    books = books.filter(book => book.bookId !== requestedBookId);
    res.render('home', {
        data: books,
        success: 'Book deleted successfully.',
        error: null
    });
});

app.post('/update', (req, res) => {
    const bookExists = books.some(book => book.bookId === req.body.bookId);
    if (!bookExists) {
        return res.status(404).render('home', {
            data: books,
            success: null,
            error: 'Book not found.'
        });
    }

    const validation = validateBook(req.body, books, false);
    if (validation.error) {
        return res.status(400).render('home', {
            data: books,
            success: null,
            error: validation.error
        });
    }

    books.forEach(book => {
        if (book.bookId === req.body.bookId) {
            book.bookTitle = validation.data.bookTitle;
            book.bookAuthor = validation.data.bookAuthor;
            book.bookCategory = validation.data.bookCategory;
            book.bookStatus = validation.data.bookStatus;
        }
    });

    res.render('home', {
        data: books,
        success: 'Book updated successfully.',
        error: null
    });
});

function validateBook(body, books, requireUniqueId) {
    const bookId = typeof body.bookId === 'string' ? body.bookId.trim() : '';
    const bookTitle = typeof body.bookTitle === 'string' ? body.bookTitle.trim() : '';
    const bookAuthor = typeof body.bookAuthor === 'string' ? body.bookAuthor.trim() : '';
    const bookCategory = typeof body.bookCategory === 'string' ? body.bookCategory.trim() : '';
    const bookStatus = typeof body.bookStatus === 'string' ? body.bookStatus.trim() : '';

    if (!bookId || !bookTitle || !bookAuthor || !bookCategory || !bookStatus) {
        return { error: 'All book fields are required.' };
    }
    if (bookId.length > 20) {
        return { error: 'Book ID must contain 20 characters or fewer.' };
    }
    if (bookTitle.length > 100 || bookAuthor.length > 100 || bookCategory.length > 50) {
        return { error: 'Book title or author exceeds the allowed length; category must contain 50 characters or fewer.' };
    }
    if (!['Available', 'Issued'].includes(bookStatus)) {
        return { error: 'Book status must be Available or Issued.' };
    }
    if (requireUniqueId && books.some(book => book.bookId.toLowerCase() === bookId.toLowerCase())) {
        return { error: 'A book with this ID already exists.' };
    }

    return {
        data: { bookId, bookTitle, bookAuthor, bookCategory, bookStatus }
    };
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
