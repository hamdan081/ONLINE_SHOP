const express = require('express');
const router = express.Router();
const chatController = require('../Controlerr/chatController');

// Send chat message
router.post('/send', chatController.sendChat);

// Retrieve chat history between two users
router.get('/history/:userA/:userB', chatController.getChatHistory);

module.exports = router;
