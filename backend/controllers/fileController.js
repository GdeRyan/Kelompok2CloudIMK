const minioClient = require('../config/minio');
const db = require('../config/db');


// === Create New Folder ===
exports.createFolder = (req, res) => {
    const { name, parentId } = req.body;
    const userId = req.userId;
    const sql = "INSERT INTO files (user_id, name, type, parent_id) VALUES (?, ?, 'folder', ?)";
    db.query(sql, [userId, name, parentId || null], (err, result) => {
        if (err) return res.status(500).json({ message: "GAGAL buat folder", error: err });
        res.json({ message: "Folder BERHASIL dibuat!", folderId: result.insertId });
    });
};

// === Upload File to Folder ===
exports.uploadFile = (req, res) => {
    const file = req.file;
    const userId = req.userId;
    const { parentId } = req.body;

    minioClient.putObject("cloudstorage", file.originalname, file.buffer, (err, objInfo) => {
        if (err) return res.status(500).json({ message: "GAGAL Upload ke MinIO", error: err });

        const sql = "INSERT INTO files (user_id, name, type, s3_key, parent_id) VALUES (?, ?, 'file', ?, ?)";
        db.query(sql, [userId, file.originalname, file.originalname, parentId || null], (err, result) => {
            if (err) return res.status(500).json({ message: "GAGAL simpan ke DB", error: err });
            res.json({ message: "File BERHASIL diupload!" });
        });
    });
};

// === List File ===
exports.listFiles = (req, res) => {
    const userId = req.userId;
    const parentId = req.query.parentId || null;
    const sql = parentId
        ? "SELECT * FROM files WHERE user_id = ? AND parent_id = ?"
        : "SELECT * FROM files WHERE user_id = ? AND parent_id IS NULL";

    db.query(sql, parentId ? [userId, parentId] : [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "GAGAL ambil data", error: err });
        res.json(results);
    });
};

// === Preview File ===
exports.getPreviewUrl = (req, res) => {
    const { fileName } = req.params;
        db.query("SELECT is_public FROM files WHERE name = ?", [fileName], (err, results) => {
        const isPublic = results[0]?.is_public;
        if (isPublic || req.userId) {
            minioClient.presignedGetObject('cloudstorage', fileName, 3600, (err, url) => {
                res.json({ url });
            });
        } else {
            res.status(403).json({ message: "File in Private" });
        }
    });
};

// === Delete File ===
exports.deleteFile = (req, res) => {
    minioClient.removeObject('cloudstorage', req.params.fileName, (err) => {
        db.query("DELETE FROM files WHERE name = ? AND user_id = ?", [req.params.fileName, req.userId], () => {
            res.json({ message: "File TERHAPUS" });
        });
    });
};

// === Delete Folder & File at once ===
exports.deleteFolder = (req, res) => {
    const { folderId } = req.params;
    db.query("DELETE FROM files WHERE parent_id = ? AND user_id = ?", [folderId, req.userId], () => {
        db.query("DELETE FROM files WHERE id = ? AND user_id = ?", [folderId, req.userId], () => {
            res.json({ message: "Folder BERHASIL dihapus!" });
        });
    });
};

// === Download File ===
exports.downloadFile = (req, res) => {
    const fileName = req.params.fileName;
    minioClient.presignedGetObject('cloudstorage', req.params.fileName, 60, (err, url) => {
        if (err) return res.status(500).json({ message: "GAGAL Download" });
        res.json({ downloadUrl: url });
    });
};

// === Rename Folder & File ===
exports.renameFileOrFolder = (req, res) => {
    const { id, newName } = req.body;
    db.query("UPDATE files SET name = ? WHERE id = ? AND user_id = ?", [newName, id, req.userId], (err) => {
        if (err) return res.status(500).json({ message: "GAGAL Rename" });
        res.json({ message: "Nama BERHASIL Diubah" });
    });
};

// === Access ===
exports.updateAccess = (req, res) => {
    const { id, isPublic } = req.body;
    db.query("UPDATE files SET is_public = ? WHERE id = ? AND user_id = ?", [isPublic, id, req.userId], (err) => {
        if (err) return res.status(500).json({ message: "GAGAL update akses" });
        res.json({ message: "Akses BERHASIL diubah" });
    });
};

