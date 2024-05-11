const Order = require('./order.model');
const { create, findAll, updateStatus, findById, softDeleteOrder } = require('./order.actions');
const Book = require('../book/book.model');

async function createOrder(req, res) {
    if (!req.body.books || !Array.isArray(req.body.books) || req.body.books.length === 0) {
        return res.status(400).json({ message: "Falta el parámetro 'books' o está vacío" });
    }
    if (!req.body.address) {
        return res.status(400).json({ message: "Falta el parámetro 'address'" });
    }
    const booksRequested = req.body.books;
    try {
        const books = await Promise.all(
            booksRequested.map(bookId =>
                Book.findById(bookId).select('uploader price status')
            )
        );
        const allAvailable = books.every(book => book.status === 'available');
        if (!allAvailable) {
            return res.status(400).json({ message: "Todos los libros deben estar disponibles para realizar un pedido" });
        }

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
            price: book.price,
            status: 'reserved'
        }));

        const total = booksWithOwners.reduce((acc, book) => acc + book.price, 0);

        await Promise.all(booksWithOwners.map(book => Book.findByIdAndUpdate(book.book, { status: 'reserved' })));

        const newOrder = await create({
            user: req.userId,
            books: booksWithOwners,
            status: req.body.status,
            address: req.body.address,
            total: total
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error while creating order:', error);
        res.status(400).json({ message: "Error creating order", error });
    }
};

async function getMyOrders(req, res) {
    try {
        const { _id } = req.params;
        console.log(_id);
        const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : true;
        const status = req.query.status;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        if (_id) {
            // Buscar una orden específica si se proporciona el ID
            const order = await findById(_id);

            // Verificar si la orden existe y si pertenece al usuario autenticado
            if (!order || order.user.toString() !== req.userId) {
                return res.status(404).json({ message: "Orden no encontrada o no tiene permiso para acceder a esta orden" });
            }

            // Verificar si la orden está habilitada, si se requiere
            if (!order.enabled && enabled) {
                return res.status(403).json({ message: "Esta orden no está habilitada" });
            }

            // Devolver la orden específica
            res.status(200).json(order);
        } else {
            let filter = { user: req.userId, enabled: enabled };

            if (status) {
                filter.status = status;
            }

            if (startDate && endDate) {
                filter.creationDate = { $gte: startDate, $lte: endDate };
            } else if (startDate) {
                filter.creationDate = { $gte: startDate };
            } else if (endDate) {
                filter.creationDate = { $lte: endDate };
            }

            const orders = await findAll(filter);

            if (orders.length === 0) {
                if (status) {
                    return res.status(404).json({ message: `No hay órdenes con el estado '${status}'` });
                }
                return res.status(404).json({ message: "No ha realizado ningún pedido" });
            }

            const formattedOrders = orders.map(order => ({
                _id: order._id,
                user: order.user._id,
                books: order.books.map(book => ({
                    book: book.book._id,
                    owner: book.owner,
                    price: book.price
                })),
                status: order.status,
                total: order.total,
                creationDate: order.creationDate,
                enabled: enabled
            }));
            const totalOrders = orders.length;

            res.status(200).json({ orders: formattedOrders, totalOrders: totalOrders });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders", error });
    }
};


async function getOrdersToMe(req, res) {
    try {
        const { _id } = req.params;
        const enabled = req.query.enabled !== undefined ? req.query.enabled === 'true' : true;
        const status = req.query.status;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
        if (_id) {
            const order = await findById(_id);
            if (!order || order.books.some(book => book.owner.toString() !== req.userId)) {
                return res.status(404).json({ message: "Orden no encontrada o no tiene permiso para acceder a esta orden" });
            }
            if (order.enabled !== enabled) {
                return res.status(403).json({ message: "No tiene permiso para ver esta orden" });
            }

            // Devolver la orden específica
            res.status(200).json({
                _id: order._id,
                user: order.user._id,
                books: order.books.map(book => ({
                    book: book.book._id,
                    owner: book.owner,
                    price: book.price
                })),
                status: order.status,
                total: order.total,
                creationDate: order.creationDate,
                enabled: order.enabled
            });
        } else {
            let filter = {
                "books.owner": req.userId,
                "enabled": enabled
            };

            if (status) {
                filter.status = status;
            }

            if (startDate && endDate) {
                filter.creationDate = { $gte: startDate, $lte: endDate };
            } else if (startDate) {
                filter.creationDate = { $gte: startDate };
            } else if (endDate) {
                filter.creationDate = { $lte: endDate };
            }

            const orders = await findAll(filter);

            if (orders.length === 0) {
                if (status) {
                    return res.status(404).json({ message: `No hay órdenes con el estado '${status}'` });
                }
                return res.status(404).json({ message: "No ha realizado ningún pedido" });
            }

            const formattedOrders = orders.map(order => ({
                _id: order._id,
                user: order.user._id,
                books: order.books.map(book => ({
                    book: book.book._id,
                    owner: book.owner,
                    price: book.price
                })),
                status: order.status,
                total: order.total,
                creationDate: order.creationDate,
                enabled: enabled
            }));
            const totalOrders = orders.length;

            res.status(200).json({ orders: formattedOrders, totalOrders: totalOrders });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders", error });
    }
};




async function updateOrderStatus(req, res) {
    const { _id, status } = req.body;
    console.log(_id, status);
    try {
        const order = await findById(_id);

        if (!order || !order.enabled) {
            return res.status(404).json({ message: "La orden no existe o no está habilitada" });
        }
        if (req.route.path === '/MyOrders') {
            if (order.user.toString() !== req.userId) {
                return res.status(403).json({ message: "No tiene permiso para modificar esta orden" });
            }
        } else if (req.route.path === '/OrdersReceived') {
            const isOwner = order.books.some(book => book.owner.toString() === req.userId);
            if (!isOwner) {
                return res.status(403).json({ message: "No tiene permiso para modificar esta orden" });
            }
        }
        if (req.route.path === '/MyOrders') {
            if (status !== 'cancelled') {
                return res.status(400).json({ message: "No puede completar esta orden" });
            }
        } else if (req.route.path === '/OrdersReceived') {
            if (status !== 'cancelled' && status !== 'completed') {
                return res.status(400).json({ message: "El estado de la orden no es válido" });
            }
        }

        if (status === 'cancelled') {
            const bookIds = order.books.map(book => book.book);

            await Book.updateMany({ _id: { $in: bookIds } }, { status: 'available' });
        } else if (status === 'completed') {
            const bookIds = order.books.map(book => book.book);

            await Book.updateMany({ _id: { $in: bookIds } }, { status: 'sold', enabled: false });
        }

        const updatedOrder = await updateStatus(_id, status);

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: "Error updating order", error });
    }
};

async function deleteOrder(req, res) {
    const { _id } = req.params;

    try {
        const order = await findById(_id);

        if (!order || !order.enabled) {
            return res.status(404).json({ message: "La orden no existe o ya fue eliminada" });
        }

        if (order.status !== 'completed' && order.status !== 'cancelled') {
            return res.status(400).json({ message: "No se puede eliminar una orden en progreso" });
        }

        if (req.route.path === '/MyOrders') {
            if (order.user.toString() !== req.userId) {
                return res.status(403).json({ message: "No tiene permiso para eliminar esta orden" });
            }
        }

        if (req.route.path === '/OrdersReceived') {
            const isBookOwner = order.books.some(book => book.owner.toString() === req.userId);
            if (!isBookOwner) {
                return res.status(403).json({ message: "No tiene permiso para eliminar esta orden" });
            }
        }

        const softDeletedOrder = await softDeleteOrder(_id);
        res.status(200).json({ message: "Orden eliminada con éxito", order: softDeletedOrder });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la orden", error });
    }
}
module.exports = { createOrder, getMyOrders, updateOrderStatus, getOrdersToMe, deleteOrder };
