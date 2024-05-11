const { throwCustomError } = require("../utils/functions");
const { createBookMongo, getBookMongo, updateBookMongo, deleteBookMongo, findAvailableBooksNotUploadedByUser,findBookById, updateBookById, findBooksByUploader } = require("./book.actions");
//const user = require("../user/user.model");
const Book = require("./book.model");

async function readBookConFiltros(query) {
    // Extrae los parámetros de consulta
    const { _id, title, author, genre, publisher, publicationDate, price, status, description, enabled } = query;

    // Construir el objeto de consulta para MongoDB
    const queryMongo = {
        ...(_id && { _id }),
        ...(title && { title: { $regex: title, $options: "i" } }),
        ...(author && { author: { $regex: author, $options: "i" } }),
        ...(genre && { genre }),
        ...(publisher && { publisher: { $regex: publisher, $options: "i" } }),
        ...(publicationDate && { publicationDate: { $gte: new Date(publicationDate) } }),
        ...(price && { price: { $gte: parseFloat(price) } }),
        ...(status && { status }),
        ...(description && { description: { $regex: description, $options: "i" } }),
        ...(enabled !== undefined ? { enabled: enabled === 'true' } : { enabled: true }) // Aplica filtro enabled según sea necesario
    };

    // Llamado a la función que interactúa con MongoDB (Asumiendo que existe getBookMongo)
    const resultadosBusqueda = await getBookMongo(queryMongo);

    return resultadosBusqueda;
}

async function createBook(datos) {
    // Extracción de los datos del cuerpo de la solicitud
    const { uploader, title, author, genre, publisher, publicationDate, price, status, description } = datos;

    // Verificación de Books similares podría ser necesaria, dependiendo de la lógica de negocio
    const BookSimilar = await getBookMongo({ genre });

    // Crear el Book en la base de datos
    const BookCreado = await createBookMongo(datos);

    return BookCreado;
}


async function updateBook(req, res){
    console.log(req.params);
    const { bookId } = req.params;  // Asume que el ID del libro viene como parámetro de URL
    console.log('bookId', bookId);
    const userId = req.userId;  // ID del usuario autenticado almacenado por verifyToken
    const bookUpdates = req.body;  // Los cambios que se quieren hacer al libro

    try {
        // Primero, encontrar el libro para asegurarse de que el usuario actual es el uploader
        const book = await findBookById(bookId);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Verificar si el usuario autenticado es el dueño del libro
        if (book.uploader.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to edit this book" });
        }

        // Si el usuario es el dueño, actualizar el libro
        const updatedBook = await updateBookById(bookId, bookUpdates);

        res.json(updatedBook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

async function deleteBookHandler(req, res) {
    const { id } = req.params;  // Asume que el ID del libro viene como parámetro de URL
    const userId = req.userId;
    try {
        const book = await Book.findById(id);
        //console.log('book', book);
        if (!book) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        // Verificar si el usuario logueado es el uploader del libro
        if (book.uploader.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Operación no permitida. Solo el uploader puede eliminar el libro.' });
        }

        // Realizar el soft delete llamando a la función específica de MongoDB
        const softDeleteBook = await deleteBookMongo(id);
        return res.status(200).json({ message: 'Libro eliminado exitosamente' });
        //return softDeleteBook;
    } catch (error) {
        return res.status(500).json({ message: 'Error al realizar soft delete del libro', error: error.message });
    }
}

async function getAvailableBooks(req, res){
    try {
        const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : true;
        const books = await findAvailableBooksNotUploadedByUser(req.userId);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los libros disponibles', error: error });
    }
};
async function getMyBooks(req, res){
    try {
        const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : true;
        const books = await findBooksByUploader(req.userId);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los libros disponibles', error: error });
    }
}
module.exports = {
    readBookConFiltros,
    createBook,
    updateBook,
    deleteBookHandler,
    getAvailableBooks,
    getMyBooks
}