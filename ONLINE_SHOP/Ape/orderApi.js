const express = require('express');
const router = express.Router();
const orderController = require('../Controlerr/orderController');

// Place new checkout order
router.post('/', orderController.createOrder);

// Retrieve transaction history for a specific customer
router.get('/user/:userId', orderController.getOrdersByUser);

// Retrieve all customer orders (Admin dashboard overview)
router.get('/all', orderController.getAllOrders);

module.exports = router;
