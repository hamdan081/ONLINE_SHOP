const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./Database/db');

// Import APIs
const userApi = require('./Ape/userApi');
const produkApi = require('./Ape/produkApi');
const orderApi = require('./Ape/orderApi');
const pembayaranApi = require('./Ape/pembayaranApi');
const chatApi = require('./Ape/chatApi');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API Routes
app.use('/api/users', userApi);
app.use('/api/products', produkApi);
app.use('/api/orders', orderApi);
app.use('/api/payments', pembayaranApi);
app.use('/api/chats', chatApi);

// Serve uploaded files (product images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Auto-seed Database on startup
async function seedDatabase() {
    try {
        // 1. Ensure a default user exists for foreign key constraints (user_id = 1)
        const checkUser = await db.query('SELECT user_id FROM "User" WHERE user_id = 1');
        if (checkUser.rows.length === 0) {
            await db.query(`
                INSERT INTO "User" (user_id, username, password, email, kampus) 
                VALUES (1, 'taufik', '12345', 'taufik@mail.com', 'Universitas X')
                ON CONFLICT (email) DO NOTHING
            `);
            console.log('[+] Database Seed: User default taufik berhasil ditambahkan.');
        }

        // Set SEED_DEFAULT_PRODUCTS=true to create demo products.
        // Otherwise, remove legacy demo products while preserving user-created data.
        const seedDefaultProducts = process.env.SEED_DEFAULT_PRODUCTS === 'true';

        if (seedDefaultProducts) {
            // 2. Check if products are empty
            const checkProducts = await db.query('SELECT COUNT(*) FROM produk');
            const count = parseInt(checkProducts.rows[0].count);

        if (count === 0) {
            console.log('[*] Database Seed: Tabel produk kosong. Memulai seeding...');

            const productsData = [
                {
                    name: 'Wireless Headphone',
                    category: 'Aksesoris',
                    price: 450000,
                    image: 'Assect/Img/headphone.png',
                    desc: 'Nikmati pengalaman audio tanpa batas dengan headphone nirkabel premium ini. Dilengkapi dengan driver audio berkualitas tinggi, peredam kebisingan aktif (ANC), bantalan telinga yang empuk untuk kenyamanan sepanjang hari, serta daya tahan baterai hingga 30 jam pemakaian terus-menerus.'
                },
                {
                    name: 'Portable Speaker',
                    category: 'Audio',
                    price: 320000,
                    image: 'Assect/Img/speaker.png',
                    desc: 'Bawa pesta ke mana saja dengan speaker bluetooth portabel kami. Dilengkapi suara stereo 360 derajat, bass mendalam yang bertenaga, ketahanan air bersertifikat IPX7 yang aman untuk kolam renang, dan konektivitas nirkabel jarak jauh dengan daya baterai tahan hingga 12 jam.'
                },
                {
                    name: 'Smartwatch',
                    category: 'Wearables',
                    price: 790000,
                    image: 'Assect/Img/smartwatch.png',
                    desc: 'Pantau kesehatan dan tetap terhubung setiap saat dengan smartwatch modern kami. Memiliki sensor detak jantung 24/7, monitor kadar oksigen darah, pelacakan tidur cerdas, mode olahraga lengkap, layar AMOLED yang jernih di bawah sinar matahari, serta notifikasi panggilan dan pesan secara langsung.'
                },
                {
                    name: 'Action Camera',
                    category: 'Kamera',
                    price: 1250000,
                    image: 'Assect/Img/camera.png',
                    desc: 'Abadikan petualangan ekstrem Anda dalam resolusi 4K Ultra HD yang tajam. Dilengkapi dengan stabilisasi video gyro canggih, lensa sudut ultra lebar 170 derajat, case pelindung tahan air hingga kedalaman 30 meter, serta koneksi Wi-Fi bawaan untuk berbagi momen secara instan.'
                },
                {
                    name: 'Sepatu Sneakers',
                    category: 'Sepatu',
                    price: 560000,
                    image: 'Assect/Img/sneakers.png',
                    desc: 'Langkah kasual penuh gaya dengan sepatu sneakers premium. Terbuat dari material breathable mesh berkualitas tinggi, sol luar berbahan karet lentur yang antiselip, serta insole dengan busa memori tebal yang memberikan kenyamanan ekstra untuk dipakai berjalan jauh sepanjang hari.'
                },
                {
                    name: 'Tas Ransel',
                    category: 'Tas',
                    price: 410000,
                    image: 'Assect/Img/backpack.png',
                    desc: 'Tas ransel komuter minimalis dengan daya tahan luar biasa. Didesain secara ergonomis dengan kompartemen empuk khusus untuk laptop ukuran hingga 15.6 inci, kantong botol minum di sisi luar, saku rahasia di bagian belakang, serta bahan kanvas antiair yang melindungi barang berharga Anda.'
                }
            ];

            const insertQuery = `
                INSERT INTO produk (user_id, nama_barang, kategori, harga, deskripsi, image) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `;

            for (const item of productsData) {
                await db.query(insertQuery, [1, item.name, item.category, item.price, item.desc, item.image]);
            }
            console.log('[+] Database Seed: 6 Produk berhasil dimasukkan ke tabel produk.');
        } else {
            console.log(`[+] Database Seed: Tabel produk terisi dengan ${count} produk.`);
        }
        } else {
            // 2. Clean up default seeded products from the database (run once to clear existing default seeds)
            const deleteResult = await db.query(`
            DELETE FROM produk
            WHERE image IN (
                'Assect/Img/headphone.png',
                'Assect/Img/speaker.png',
                'Assect/Img/smartwatch.png',
                'Assect/Img/camera.png',
                'Assect/Img/sneakers.png',
                'Assect/Img/backpack.png'
            )
            `);
            if (deleteResult.rowCount > 0) {
                console.log(`[+] Database Cleanup: Berhasil menghapus ${deleteResult.rowCount} produk bawaan.`);
            }
        }
    } catch (err) {
        console.error('[-] Error saat database seeding:', err.message);
    }
}

// Start Server
app.listen(PORT, async () => {
    console.log(`[+] Server backend berjalan di http://localhost:${PORT}`);
    await seedDatabase();
});
