const { throwCustomError } = require("../utils/functions");
const { createBookMongo, getBookMongo, deleteBookMongo, findAvailableBooksNotUploadedByUser,findBookById, updateBookById, findBooksByUploader } = require("./book.actions");
//const user = require("../user/user.model");
const Book = require("./book.model");

async function readBookConFiltros(params, query) {
    const { bookId } = params;

    const { title, author, genre, publisher, publicationDate, price, status, description, enabled } = query;

    if (bookId) {
        const book = await getBookMongo({ _id: bookId });
        return book ? [book] : []; 
    }

    const queryMongo = {
        ...(title && { title: { $regex: title, $options: "i" } }),
        ...(author && { author: { $regex: author, $options: "i" } }),
        ...(genre && { genre }),
        ...(publisher && { publisher: { $regex: publisher, $options: "i" } }),
        ...(publicationDate && { publicationDate: { $gte: new Date(publicationDate) } }),
        ...(price && { price: { $gte: parseFloat(price) } }),
        ...(status && { status }),
        ...(description && { description: { $regex: description, $options: "i" } }),
        ...(enabled !== undefined ? { enabled: enabled === 'true' } : { enabled: true })
    };

    const resultadosBusqueda = await getBookMongo(queryMongo);
    return resultadosBusqueda;
};

async function createBook(datos) {
    const { uploader, title, author, genre, publisher, publicationDate, price, status, description } = datos;

    const BookSimilar = await getBookMongo({ genre });

    const BookCreado = await createBookMongo(datos);

    return BookCreado;
};


async function updateBook(req, res){
    console.log(req.params);
    const { bookId } = req.params;  
    console.log('bookId', bookId);
    const userId = req.userId;  
    const bookUpdates = req.body;  

    try {
        const book = await findBookById(bookId);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.uploader.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to edit this book" });
        }

        const updatedBook = await updateBookById(bookId, bookUpdates);

        res.json(updatedBook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

async function deleteBookHandler(req, res) {
    const { id } = req.params;  
    const userId = req.userId;
    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        if (book.uploader.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Operación no permitida. Solo el uploader puede eliminar el libro.' });
        }

        const softDeleteBook = await deleteBookMongo(id);
        return res.status(200).json({ message: 'Libro eliminado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al realizar soft delete del libro', error: error.message });
    }
};

async function getAvailableBooks(req, res){
    try {
        const { bookId } = req.params;
        const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : true;
        if (bookId) {
            const book = await findSpecificAvailableBookNotUploadedByUser(req.userId, bookId, enabled);
            if (!book) {
                return res.status(404).json({ message: 'Libro no encontrado o no disponible' });
            }
            res.status(200).json(book);
        } else {
            const books = await findAvailableBooksNotUploadedByUser(req.userId, enabled);
            res.status(200).json(books);
        }

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los libros disponibles', error: error });
    }
};
async function getMyBooks(req, res){
    try {
        const { bookId } = req.params;
        const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : true;
        if (bookId) {
            const book = await findSpecificBookByUploader(req.userId, bookId, enabled);
            if (!book) {
                return res.status(404).json({ message: 'Libro no encontrado o no disponible' });
            }
            res.status(200).json(book);
        } else {
            const books = await findBooksByUploader(req.userId, enabled);
            res.status(200).json(books);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los libros disponibles', error: error });
    }
};

module.exports = {
    readBookConFiltros,
    createBook,
    updateBook,
    deleteBookHandler,
    getAvailableBooks,
    getMyBooks
}