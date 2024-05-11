const Order = require('./order.model');

async function create(orderData){
    return await Order.create(orderData);
};

async function findAll(filter){
    return await Order.find(filter).populate('user books.book');
};

async function findById(orderId){
    return await Order.findById(orderId);
}


async function updateStatus(orderId, status){
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
};

module.exports = { create, findAll, updateStatus, findById };