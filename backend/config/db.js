const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456789',
    database: process.env.DB_NAME || 'cloud_storage'
});

db.connect(err => {
    if (err) console.error('GAGAL Terhubung Database:', err);
    else console.log('Database Terhubung');
});

module.exports = db;