const db = require('../Database/db');

// Send chat message
const sendChat = async (req, res) => {
    const { pengirim_id, penerima_id, isi_pesan } = req.body;
    if (!pengirim_id || !penerima_id || !isi_pesan) {
        return res.status(400).json({ success: false, message: 'Data chat tidak lengkap.' });
    }

    try {
        const queryText = `
            INSERT INTO chat (pengirim_id, penerima_id, isi_pesan) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await db.query(queryText, [pengirim_id, penerima_id, isi_pesan]);
        return res.status(201).json({ success: true, chat: result.rows[0] });
    } catch (error) {
        console.error('Error sending chat:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengirim pesan chat.' });
    }
};

// Get chat history between two users
const getChatHistory = async (req, res) => {
    const { userA, userB } = req.params;
    try {
        const queryText = `
            SELECT * FROM chat 
            WHERE (pengirim_id = $1 AND penerima_id = $2) 
               OR (pengirim_id = $2 AND penerima_id = $1)
            ORDER BY waktu_kirim ASC
        `;
        const result = await db.query(queryText, [userA, userB]);
        return res.status(200).json({ success: true, history: result.rows });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ success: false, message: 'Gagal memuat riwayat pesan.' });
    }
};

module.exports = {
    sendChat,
    getChatHistory
};
