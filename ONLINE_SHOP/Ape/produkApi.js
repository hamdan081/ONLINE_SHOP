const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const productController = require('../Controlerr/productController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// File filter: only allow image types
const fileFilter = function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format gambar tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

// Middleware to handle multer errors gracefully
function handleUpload(req, res, next) {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Ukuran gambar maksimal 2MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Gagal mengupload gambar: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
}

// Retrieve all products
router.get('/', productController.getAllProducts);

// Retrieve single product details
router.get('/:id', productController.getProductById);

// Create new product (with optional image upload)
router.post('/', handleUpload, productController.createProduct);

// Update product details (with optional image upload)
router.put('/:id', handleUpload, productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
