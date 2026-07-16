const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username dan password wajib diisi' });

    const checkSql = 'SELECT id FROM users WHERE username = ?';
    db.query(checkSql, [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'GAGAL daftar', error: err });
        if (results.length > 0) return res.status(409).json({ message: 'Username sudah dipakai' });

        const hashedPassword = bcrypt.hashSync(password, 8);
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: 'GAGAL daftar', error: err });
            res.json({ message: 'User BERHASIL dibuat' });
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username dan password wajib diisi' });

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, result) => {
        if (err || result.length === 0) return res.status(401).json({ message: 'User TIDAK ditemukan' });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Password SALAH' });

        const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET || 'TOKENNYA', { expiresIn: '1h' });
        res.json({ token, username: user.username });
    });
};

exports.listUsers = (req, res) => {
    db.query('SELECT id, username FROM users', (err, results) => {
        if (err) return res.status(500).json({ message: 'GAGAL ambil daftar user' });
        res.json(results);
    });
};
