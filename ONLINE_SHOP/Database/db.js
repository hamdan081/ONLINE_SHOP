const { Pool } = require('pg');
require('dotenv').config();

// Configuration for database connection
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres', // default db is postgres, change if needed
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
};

const pool = new Pool(dbConfig);

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('[-] Gagal menghubungkan ke database PostgreSQL:', err.message);
    } else {
        console.log('[+] Berhasil terhubung ke database PostgreSQL pada:', res.rows[0].now);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
