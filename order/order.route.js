const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, updateOrderStatus, getOrdersToMe } = require('./order.controller');
const verifyToken  = require('../auth/auth.jwt');

router.post('/', verifyToken, createOrder);
router.get('/MyOrders', verifyToken, getMyOrders);
router.get('/OrdersReceived', verifyToken, getOrdersToMe);
router.put('/MyOrders', verifyToken, updateOrderStatus);
router.put('/OrdersReceived', verifyToken, updateOrderStatus);

module.exports = router;
