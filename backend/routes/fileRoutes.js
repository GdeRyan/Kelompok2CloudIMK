const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// === Upload File ke Folder ===
router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);

// === Create Folder ===
router.post('/create-folder', authMiddleware, fileController.createFolder);

// === List File ===
router.get('/list', authMiddleware, fileController.listFiles);

// === Preview File ===
router.get('/preview/:fileName', authMiddleware, fileController.getPreviewUrl);

// === Delete File & Folder ===
router.delete('/delete/:fileName', authMiddleware, fileController.deleteFile);

// === Download File ===
router.get('/download/:fileName', authMiddleware, fileController.downloadFile);

// === Rename File ===
router.patch('/rename', authMiddleware, fileController.renameFileOrFolder);

// === Access ===
router.patch('/update-access', authMiddleware, fileController.updateAccess);

module.exports = router;