const db = require('../Database/db');

// Controller for Authentication
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username/Email dan Password wajib diisi!' 
        });
    }

    try {
        // Query the database for username or email
        const queryText = `
            SELECT user_id, username, email, alamat, kampus, foto 
            FROM "User" 
            WHERE (username = $1 OR email = $1) AND password = $2
            LIMIT 1
        `;
        const result = await db.query(queryText, [username, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username/Email atau Password salah!' 
            });
        }

        const user = result.rows[0];
        return res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                alamat: user.alamat,
                kampus: user.kampus,
                foto: user.foto || 'Assect/Img/avatar.png'
            }
        });

    } catch (error) {
        console.error('Error saat login:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan pada server. Coba beberapa saat lagi.' 
        });
    }
};

module.exports = {
    login
};
