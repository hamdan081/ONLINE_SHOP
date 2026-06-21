const db = require('../Database/db');

// Create a new checkout transaction
const createOrder = async (req, res) => {
    const { user_id, items, total_harga, metode_pembayaran } = req.body;

    if (!items || items.length === 0 || !total_harga) {
        return res.status(400).json({
            success: false,
            message: 'Data pesanan tidak lengkap.'
        });
    }

    const userIdVal = user_id || 1; // Default to user 1 (taufik)
    
    // Start transactional query
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert into "Order" table
        const orderQuery = `
            INSERT INTO "Order" (user_id, total_harga, status_order)
            VALUES ($1, $2, 'Diproses')
            RETURNING order_id, tanggal_order
        `;
        const orderResult = await client.query(orderQuery, [userIdVal, total_harga]);
        const { order_id, tanggal_order } = orderResult.rows[0];

        // 2. Insert into detail_order table
        const detailQuery = `
            INSERT INTO detail_order (order_id, produk_id, jumlah, harga_satuan)
            VALUES ($1, $2, $3, $4)
        `;

        for (const item of items) {
            // Check if product exists, or map string key (like 'headphone') to a product_id.
            // If the key is not numeric, we try to find the product by name, or fallback.
            let productId = parseInt(item.id);
            let unitPrice = item.price / item.qty;

            if (isNaN(productId)) {
                // Find product ID by matching partial string
                const prodSearch = await client.query('SELECT produk_id, harga FROM produk WHERE nama_barang ILIKE $1 LIMIT 1', [`%${item.name}%`]);
                if (prodSearch.rows.length > 0) {
                    productId = prodSearch.rows[0].produk_id;
                    unitPrice = prodSearch.rows[0].harga;
                } else {
                    // Fallback to inserting a default product ID if database empty
                    productId = 1; 
                }
            }

            await client.query(detailQuery, [order_id, productId, item.qty, unitPrice]);
        }

        // 3. Insert into pembayaran table
        const paymentQuery = `
            INSERT INTO pembayaran (order_id, metode_pembayaran, tanggal_bayar, status_pembayaran)
            VALUES ($1, $2, CURRENT_TIMESTAMP, 'Lunas')
        `;
        await client.query(paymentQuery, [order_id, metode_pembayaran || 'Transfer Bank']);

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dicheckout!',
            orderId: order_id,
            tanggal: tanggal_order
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saat processing checkout transaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memproses checkout pesanan.'
        });
    } finally {
        client.release();
    }
};

// Get order history by user
const getOrdersByUser = async (req, res) => {
    const { userId } = req.params;
    const userIdVal = parseInt(userId) || 1;

    try {
        const queryText = `
            SELECT o.order_id, o.tanggal_order, o.total_harga, o.status_order,
                   d.jumlah, d.harga_satuan, p.nama_barang, p.image
            FROM "Order" o
            JOIN detail_order d ON o.order_id = d.order_id
            JOIN produk p ON d.produk_id = p.produk_id
            WHERE o.user_id = $1
            ORDER BY o.tanggal_order DESC
        `;
        const result = await db.query(queryText, [userIdVal]);

        // Group rows by order_id
        const ordersMap = {};
        result.rows.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    id: 'TX-' + row.order_id,
                    date: new Date(row.tanggal_order).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                    total: parseFloat(row.total_harga),
                    status: row.status_order,
                    items: []
                };
            }
            ordersMap[row.order_id].items.push({
                name: row.nama_barang,
                qty: row.jumlah,
                price: parseFloat(row.harga_satuan) * row.jumlah
            });
        });

        return res.status(200).json({
            success: true,
            history: Object.values(ordersMap)
        });
    } catch (error) {
        console.error('Error fetching order history:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil riwayat transaksi.'
        });
    }
};

// Get all orders (Admin Dashboard)
const getAllOrders = async (req, res) => {
    try {
        const queryText = `
            SELECT o.order_id, o.tanggal_order, o.total_harga, o.status_order,
                   u.username, string_agg(p.nama_barang || ' (x' || d.jumlah || ')', ', ') as items_summary
            FROM "Order" o
            JOIN "User" u ON o.user_id = u.user_id
            JOIN detail_order d ON o.order_id = d.order_id
            JOIN produk p ON d.produk_id = p.produk_id
            GROUP BY o.order_id, o.tanggal_order, o.total_harga, o.status_order, u.username
            ORDER BY o.tanggal_order DESC
        `;
        const result = await db.query(queryText);

        const orders = result.rows.map(row => ({
            id: 'TX-' + row.order_id,
            customer: row.username,
            date: new Date(row.tanggal_order).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            total: parseFloat(row.total_harga),
            status: row.status_order,
            itemsSummary: row.items_summary
        }));

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching admin orders list:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pesanan admin.'
        });
    }
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getAllOrders
};
