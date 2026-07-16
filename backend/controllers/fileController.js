const minioClient = require('../config/minio');
const db = require('../config/db');
const BUCKET = 'cloudstorage';

exports.createFolder = (req, res) => {
    const { name, parentId } = req.body;
    const userId = req.userId;
    if (!name) return res.status(400).json({ message: 'Nama folder wajib diisi' });

    const sql = "INSERT INTO files (user_id, name, type, parent_id) VALUES (?, ?, 'folder', ?)";
    db.query(sql, [userId, name, parentId || null], (err, result) => {
        if (err) return res.status(500).json({ message: 'GAGAL buat folder', error: err });
        res.json({ message: 'Folder BERHASIL dibuat!', folderId: result.insertId });
    });
};

exports.uploadFile = (req, res) => {
    const file = req.file;
    const userId = req.userId;
    const { parentId } = req.body;
    if (!file) return res.status(400).json({ message: 'File tidak ditemukan' });

    const s3Key = `${userId}_${Date.now()}_${file.originalname}`;
    minioClient.putObject(BUCKET, s3Key, file.buffer, file.size, (err) => {
        if (err) return res.status(500).json({ message: 'GAGAL Upload ke MinIO', error: err });

        const sql = "INSERT INTO files (user_id, name, type, s3_key, parent_id) VALUES (?, ?, 'file', ?, ?)";
        db.query(sql, [userId, file.originalname, s3Key, parentId || null], (err, result) => {
            if (err) return res.status(500).json({ message: 'GAGAL simpan ke DB', error: err });
            res.json({ message: 'File BERHASIL diupload!', fileId: result.insertId });
        });
    });
};

exports.listFiles = (req, res) => {
    const userId = req.userId;
    const parentId = req.query.parentId || null;
    const sql = parentId
        ? 'SELECT * FROM files WHERE user_id = ? AND parent_id = ?'
        : 'SELECT * FROM files WHERE user_id = ? AND parent_id IS NULL';

    db.query(sql, parentId ? [userId, parentId] : [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'GAGAL ambil data', error: err });
        res.json(results);
    });
};

exports.getPreviewUrl = (req, res) => {
    const { fileName } = req.params;
    db.query('SELECT is_public, s3_key FROM files WHERE name = ?', [fileName], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'File tidak ditemukan' });
        const file = results[0];
        if (file.is_public || req.userId) {
            minioClient.presignedGetObject(BUCKET, file.s3_key, 3600, (err, url) => {
                if (err) return res.status(500).json({ message: 'GAGAL buat preview URL' });
                res.json({ url });
            });
        } else {
            res.status(403).json({ message: 'File in Private' });
        }
    });
};

exports.deleteFile = (req, res) => {
    const { fileName } = req.params;
    db.query('SELECT s3_key, type FROM files WHERE name = ? AND user_id = ?', [fileName, req.userId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'File tidak ditemukan' });
        const file = results[0];

        if (file.type === 'file' && file.s3_key) {
            minioClient.removeObject(BUCKET, file.s3_key, () => {});
        }
        db.query('DELETE FROM files WHERE name = ? AND user_id = ?', [fileName, req.userId], () => {
            res.json({ message: 'File TERHAPUS' });
        });
    });
};

exports.deleteFolder = (req, res) => {
    const { folderId } = req.params;
    db.query('SELECT s3_key FROM files WHERE parent_id = ? AND user_id = ? AND type = "file"', [folderId, req.userId], (err, files) => {
        if (files) {
            files.forEach(f => {
                if (f.s3_key) minioClient.removeObject(BUCKET, f.s3_key, () => {});
            });
        }
        db.query('DELETE FROM files WHERE parent_id = ? AND user_id = ?', [folderId, req.userId], () => {
            db.query('DELETE FROM files WHERE id = ? AND user_id = ?', [folderId, req.userId], () => {
                res.json({ message: 'Folder BERHASIL dihapus!' });
            });
        });
    });
};

exports.downloadFile = (req, res) => {
    const fileName = req.params.fileName;
    db.query('SELECT s3_key FROM files WHERE name = ? AND user_id = ?', [fileName, req.userId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'File tidak ditemukan' });
        minioClient.presignedGetObject(BUCKET, results[0].s3_key, 60, (err, url) => {
            if (err) return res.status(500).json({ message: 'GAGAL Download' });
            res.json({ downloadUrl: url });
        });
    });
};

exports.renameFileOrFolder = (req, res) => {
    const { id, newName } = req.body;
    if (!id || !newName) return res.status(400).json({ message: 'ID dan nama baru wajib diisi' });

    db.query('UPDATE files SET name = ? WHERE id = ? AND user_id = ?', [newName, id, req.userId], (err) => {
        if (err) return res.status(500).json({ message: 'GAGAL Rename' });
        res.json({ message: 'Nama BERHASIL Diubah' });
    });
};

exports.updateAccess = (req, res) => {
    const { id, isPublic } = req.body;
    db.query('UPDATE files SET is_public = ? WHERE id = ? AND user_id = ?', [isPublic ? 1 : 0, id, req.userId], (err) => {
        if (err) return res.status(500).json({ message: 'GAGAL update akses' });
        res.json({ message: 'Akses BERHASIL diubah' });
    });
};

exports.searchFiles = (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const sql = 'SELECT * FROM files WHERE user_id = ? AND name LIKE ?';
    db.query(sql, [req.userId, `%${q}%`], (err, results) => {
        if (err) return res.status(500).json({ message: 'GAGAL cari file' });
        res.json(results);
    });
};
