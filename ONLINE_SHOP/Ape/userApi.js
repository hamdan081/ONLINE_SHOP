const express = require('express');
const router = express.Router();
const authController = require('../Controlerr/authController');
const db = require('../Database/db');

// Login endpoint
router.post('/login', authController.login);

// Register endpoint
router.post('/register', async (req, res) => {
    const { username, email, password, alamat, no_hp } = req.body;

    // Validasi data wajib
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username, email, dan password wajib diisi.'
        });
    }

    if (!alamat) {
        return res.status(400).json({
            success: false,
            message: 'Alamat wajib diisi.'
        });
    }

    try {
        // Cek email duplikat
        const emailCheck = await db.query(
            'SELECT user_id FROM "User" WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email sudah digunakan.'
            });
        }

        // Insert user baru, kampus diisi "-" karena kolom NOT NULL di database
        const result = await db.query(
            `INSERT INTO "User" (username, password, email, alamat, kampus, foto)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING user_id, username, email, alamat, foto`,
            [username, password, email, alamat, '-', 'Assect/Img/avatar.png']
        );

        const user = result.rows[0];

        return res.status(201).json({
            success: true,
            message: 'Registrasi berhasil. Silakan login.',
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                alamat: user.alamat,
                foto: user.foto
            }
        });

    } catch (error) {
        console.error('Error saat register:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server. Coba beberapa saat lagi.'
        });
    }
});

// Get all users (Admin)
router.get('/all', async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, email, kampus FROM "User"');
        res.status(200).json({ success: true, users: result.rows });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ success: false });
    }
});

// Get profile details
router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'SELECT user_id, username, email, alamat, kampus, foto FROM "User" WHERE user_id = $1', 
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }
        
        const user = result.rows[0];
        res.status(200).json({ 
            success: true, 
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                alamat: user.alamat || '',
                kampus: user.kampus,
                foto: user.foto || 'Assect/Img/avatar.png'
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat profil.' });
    }
});

// Update Profile
router.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, alamat, kampus } = req.body;
    try {
        const result = await db.query(
            `UPDATE "User" 
             SET username = $1, email = $2, alamat = $3, kampus = $4 
             WHERE user_id = $5 
             RETURNING user_id, username, email, alamat, kampus, foto`,
            [username, email, alamat, kampus, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }
        res.status(200).json({ 
            success: true, 
            message: 'Profil berhasil diperbarui!',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
    }
});

module.exports = router;
