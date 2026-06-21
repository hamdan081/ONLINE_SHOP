const db = require('../Database/db');

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM produk ORDER BY produk_id ASC');
        return res.status(200).json({
            success: true,
            products: result.rows
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data produk.'
        });
    }
};

// Get single product by id
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM produk WHERE produk_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }
        return res.status(200).json({
            success: true,
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail produk.'
        });
    }
};

// Create a new product (Admin)
const createProduct = async (req, res) => {
    const { user_id, nama_barang, kategori, harga, deskripsi, image } = req.body;
    
    if (!nama_barang || !harga) {
        return res.status(400).json({
            success: false,
            message: 'Nama barang dan harga wajib diisi!'
        });
    }

    try {
        const queryText = `
            INSERT INTO produk (user_id, nama_barang, kategori, harga, deskripsi, image) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;
        // Fallback user ID to 1 (taufik) if not provided
        const userIdVal = user_id || 1;

        // Priority: uploaded files > body image field > default
        let imgVal = 'Assect/Img/headphone.png';
        if (req.files && req.files.length > 0) {
            // Use first image as primary, store all paths as JSON
            const imagePaths = req.files.map(file => '/uploads/products/' + file.filename);
            imgVal = JSON.stringify(imagePaths);
        } else if (image) {
            imgVal = image;
        }

        const result = await db.query(queryText, [userIdVal, nama_barang, kategori, harga, deskripsi || '', imgVal]);
        return res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan!',
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menambahkan produk.'
        });
    }
};

// Update product (Admin)
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nama_barang, kategori, harga, deskripsi, image } = req.body;

    try {
        const check = await db.query('SELECT * FROM produk WHERE produk_id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }

        const current = check.rows[0];

        // Priority: uploaded files > body image field > existing image in DB
        let imgVal = current.image;
        if (req.files && req.files.length > 0) {
            // Store all file paths as JSON
            const imagePaths = req.files.map(file => '/uploads/products/' + file.filename);
            imgVal = JSON.stringify(imagePaths);
        } else if (image) {
            imgVal = image;
        }

        const queryText = `
            UPDATE produk 
            SET nama_barang = $1, kategori = $2, harga = $3, deskripsi = $4, image = $5 
            WHERE produk_id = $6 
            RETURNING *
        `;
        const result = await db.query(queryText, [
            nama_barang || current.nama_barang,
            kategori || current.kategori,
            harga !== undefined ? harga : current.harga,
            deskripsi !== undefined ? deskripsi : current.deskripsi,
            imgVal,
            id
        ]);

        return res.status(200).json({
            success: true,
            message: 'Produk berhasil diperbarui!',
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui produk.'
        });
    }
};

// Delete product (Admin)
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM produk WHERE produk_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Produk berhasil dihapus.'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus produk.'
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
