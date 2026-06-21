const express = require('express');
const router = express.Router();
const db = require('../Database/db');

// Get payment status for order
router.get('/order/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await db.query('SELECT * FROM pembayaran WHERE order_id = $1', [orderId]);
        res.status(200).json({ success: true, payment: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat status pembayaran.' });
    }
});

module.exports = router;
