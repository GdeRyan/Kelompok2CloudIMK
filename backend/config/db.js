const mysql = require('mysql2');

// === MySql ===
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'cloud_storage'
});

// === Connection ===
db.connect(err =>{
    if (err) console.error(" :( GAGAL Terhubung Database:", err);
    else console.log("Database Terhubung :)");
});

module.exports = db;