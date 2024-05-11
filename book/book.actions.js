const Book = require("./book.model")

async function getBookMongo(filtros) {
    const cantidadBooks = await Book.countDocuments(filtros);
    const BooksFiltrados = await Book.find(filtros);

    return {
        resultados: BooksFiltrados,
        // paginaMax: cantidadBooks / 20,
        // paginaActual: 1,
        cantidadBooks: cantidadBooks
    };
};

async function createBookMongo(datos) {
    const BookCreado = await Book.create(datos);

    return BookCreado;
};

async function updateBookMongo(id, cambios) {
    const resultado = await Book.findByIdAndUpdate(id, cambios);

    return resultado
};

// Acción para obtener un libro por ID
async function findBookById(bookId){
    return await Book.findById(bookId);
};

// Acción para actualizar un libro por ID
async function updateBookById(bookId, bookUpdates){
    return await Book.findByIdAndUpdate(bookId, bookUpdates, { new: true });
};


async function deleteBookMongo(id) {
    return await Book.findByIdAndUpdate(
        id,
        { enabled: false },
        { new: true }
    );
};
async function findAvailableBooksNotUploadedByUser(userId, enabled = true){
    
    return await Book.find({
        uploader: { $ne: userId },
        status: 'available',
        enabled: enabled
    })
};
async function findBooksByUploader(userId, enabled = true) {
    return await Book.find({
        uploader: userId,
        enabled: enabled
    });

}
module.exports = {
    createBookMongo,
    getBookMongo,
    updateBookMongo,
    findBookById,
    updateBookById,
    deleteBookMongo,
    findAvailableBooksNotUploadedByUser,
    findBooksByUploader
};