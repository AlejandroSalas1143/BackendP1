const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, updateOrderStatus, getOrdersToMe, deleteOrder } = require('./order.controller');
const verifyToken  = require('../auth/auth.jwt');

router.post('/', verifyToken, createOrder);
router.get('/MyOrders/:_id?', verifyToken, getMyOrders);
router.get('/OrdersReceived/:_id?', verifyToken, getOrdersToMe);
router.put('/MyOrders', verifyToken, updateOrderStatus);
router.put('/OrdersReceived', verifyToken, updateOrderStatus);
router.delete('/MyOrders/:_id', verifyToken, deleteOrder);
router.delete('/OrdersReceived/:_id', verifyToken, deleteOrder);

module.exports = router;
