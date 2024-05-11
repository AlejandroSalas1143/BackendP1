const Order = require('./order.model');
const { create, findAll, updateStatus, findById } = require('./order.actions');
const Book = require('../book/book.model');

// async function createOrder(req, res){
//     const { user, books, status } = req.body;
//     try {
//         const newOrder = await Order.create({ user, books, status });
//         res.status(201).json(newOrder);
//     } catch (error) {
//         res.status(400).json({ message: "Error creating order", error });
//     }
// };
async function createOrder(req, res) {
    console.log(req.body.books);
    const booksRequested = req.body.books; // Esto debería ser un array de IDs de libros.
    try {
        const books = await Promise.all(booksRequested.map(bookId => Book.findById(bookId).select('uploader')));

        const uploader = books[0].uploader;
        const hasDifferentUploader = books.some(book => book.uploader.toString() !== uploader.toString());

        if (hasDifferentUploader) {
            return res.status(400).json({ message: "No se pueden comprar libros de diferentes uploaders en un mismo pedido" });
        }
        
        if (uploader.toString() === req.userId) {
            return res.status(400).json({ message: "No puedes comprar tus propios libros" });
        }

        const booksWithOwners = books.map(book => ({
            book: book._id,
            owner: book.uploader,
            status: 'reserved'
        }));

        // Actualizar el estado de los libros a 'reserved'
        await Promise.all(booksWithOwners.map(book => Book.findByIdAndUpdate(book.book, { status: 'reserved' })));

        // Llamar a la acción de crear con los datos preparados
        const newOrder = await create({
            user: req.userId,
            books: booksWithOwners,
            status: req.body.status
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error while creating order:', error);
        res.status(400).json({ message: "Error creating order", error });
    }
};

async function getMyOrders(req, res) {
    try {
        // Filtrar las órdenes para obtener solo aquellas del usuario autenticado
        const orders = await findAll({ user: req.userId });
        if (orders.length === 0) {
            // Si no hay órdenes, envía un mensaje indicando que no hay pedidos realizados
            return res.status(404).json({ message: "No ha realizado ningún pedido" });
        }

        // Formatear la respuesta para mostrar solo los datos deseados
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            user: order.user._id,
            books: order.books.map(book => ({
                book: book.book._id,
                owner: book.owner
            })),
            status: order.status,
            creationDate: order.creationDate
        }));
        const totalOrders = orders.length;

        // Concatenar el campo adicional al final del array de órdenes
        const responseObj = {
            orders: formattedOrders,
            totalOrders: totalOrders
        };

        res.status(200).json(responseObj);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders", error });
    }
};

async function getOrdersToMe(req, res) {
    try {
        // Filtrar las órdenes para obtener solo aquellas del usuario autenticado
        const orders = await findAll({ "books.owner": req.userId });
        if (orders.length === 0) {
            // Si no hay órdenes, envía un mensaje indicando que no hay pedidos realizados
            return res.status(404).json({ message: "No ha recibido ningún pedido" });
        }

        // Formatear la respuesta para mostrar solo los datos deseados
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            user: order.user._id,
            books: order.books.map(book => ({
                book: book.book._id,
                owner: book.owner
            })),
            status: order.status,
            creationDate: order.creationDate
        }));
        const totalOrders = orders.length;

        // Concatenar el campo adicional al final del array de órdenes
        const responseObj = {
            orders: formattedOrders,
            totalOrders: totalOrders
        };

        res.status(200).json(responseObj);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders", error });
    }
};



async function updateOrderStatus(req, res) {
    const { _id, status } = req.body;
    console.log(_id, status);
    try {
        const order = await findById(_id);

        //console.log(order);
        if (!order) {
            return res.status(404).json({ message: "La orden no existe" });
        }
        if (req.route.path === '/MyOrders') {
            // Verificar si el usuario autenticado es el propietario de la orden
            if (order.user.toString() !== req.userId) {
                return res.status(403).json({ message: "No tiene permiso para modificar esta orden" });
            }
        } else if (req.route.path === '/OrdersReceived') {
            // Verificar si el usuario autenticado es el propietario de la orden
            const isOwner = order.books.some(book => book.owner.toString() === req.userId);
            if (!isOwner) {
                return res.status(403).json({ message: "No tiene permiso para modificar esta orden" });
            }
        }
        // Verificar el tipo de acción según el contexto (mis órdenes o órdenes que me hicieron)
        if (req.route.path === '/MyOrders') {
            // Si el contexto es "mis órdenes", solo se permite cancelar la orden
            if (status !== 'cancelled') {
                return res.status(400).json({ message: "No puede completar esta orden" });
            }
        } else if (req.route.path === '/OrdersReceived') {
            // Si el contexto es "órdenes que me hicieron", se permite cancelar o completar la orden
            if (status !== 'cancelled' && status !== 'completed') {
                return res.status(400).json({ message: "El estado de la orden no es válido" });
            }
        }

        // Actualizar el estado de la orden
        if (status === 'cancelled') {
            // Obtener los IDs de los libros en la orden
            const bookIds = order.books.map(book => book.book);

            // Actualizar el estado de los libros relacionados a "available"
            await Book.updateMany({ _id: { $in: bookIds } }, { status: 'available' });
        } else if (status === 'completed') {
            // Obtener los IDs de los libros en la orden
            const bookIds = order.books.map(book => book.book);

            // Actualizar el estado de los libros relacionados a "sold"
            await Book.updateMany({ _id: { $in: bookIds } }, { status: 'sold' });
        }

        // Actualizar el estado de la orden
        const updatedOrder = await updateStatus(_id, status);

        //const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: "Error updating order", error });
    }
};

module.exports = { createOrder, getMyOrders, updateOrderStatus, getOrdersToMe };