const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);

router.post('/create-folder', authMiddleware, fileController.createFolder);

router.get('/list', authMiddleware, fileController.listFiles);

router.get('/search', authMiddleware, fileController.searchFiles);

router.get('/preview/:fileName', authMiddleware, fileController.getPreviewUrl);

router.delete('/delete/:fileName', authMiddleware, fileController.deleteFile);

router.delete('/delete-folder/:folderId', authMiddleware, fileController.deleteFolder);

router.get('/download/:fileName', authMiddleware, fileController.downloadFile);

router.patch('/rename', authMiddleware, fileController.renameFileOrFolder);

router.patch('/update-access', authMiddleware, fileController.updateAccess);

module.exports = router;
