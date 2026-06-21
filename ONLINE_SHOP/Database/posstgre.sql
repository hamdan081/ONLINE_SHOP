CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    alamat VARCHAR(100),
    kampus VARCHAR(50) NOT NULL,
    foto TEXT
);


CREATE TABLE produk (
    produk_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    nama_barang VARCHAR(100) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    harga NUMERIC(12,2),
    deskripsi VARCHAR(200),
    image TEXT,
    
    CONSTRAINT fk_produk_user
        FOREIGN KEY (user_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE
);




CREATE TABLE "Order" (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tanggal_order TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_harga NUMERIC(12,2) NOT NULL,
    status_order VARCHAR(100) NOT NULL,

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE
);




CREATE TABLE detail_order (
    detail_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    produk_id INTEGER NOT NULL,
    jumlah INTEGER NOT NULL,
    harga_satuan NUMERIC(10,2) NOT NULL,

    CONSTRAINT fk_detail_order
        FOREIGN KEY (order_id)
        REFERENCES "Order"(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_detail_produk
        FOREIGN KEY (produk_id)
        REFERENCES produk(produk_id)
        ON DELETE CASCADE
);




CREATE TABLE pembayaran (
    pembayaran_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    metode_pembayaran VARCHAR(100) NOT NULL,
    tanggal_bayar TIMESTAMP,
    status_pembayaran VARCHAR(100) NOT NULL,

    CONSTRAINT fk_pembayaran_order
        FOREIGN KEY (order_id)
        REFERENCES "Order"(order_id)
        ON DELETE CASCADE
);



CREATE TABLE chat (
    chat_id SERIAL PRIMARY KEY,
    pengirim_id INTEGER NOT NULL,
    penerima_id INTEGER NOT NULL,
    isi_pesan VARCHAR(500) NOT NULL,
    waktu_kirim TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_pengirim
        FOREIGN KEY (pengirim_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chat_penerima
        FOREIGN KEY (penerima_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE
);


SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';


SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY';

SELECT * FROM "User";
SELECT * FROM produk;
SELECT * FROM "Order";
SELECT * FROM detail_order;
SELECT * FROM pembayaran;
SELECT * FROM chat;

INSERT INTO "User" (username, password, email, kampus)
VALUES ('taufik', '12345', 'taufik@mail.com', 'Universitas X');