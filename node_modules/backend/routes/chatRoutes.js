const express = require('express');
const {
    sendMessage,
    getGroupMessages,
    getIndividualMessages,
    getRecentChats,
    getSharedResources
} = require('../controllers/chatController');

const router = express.Router();

const { protect } = require('../utils/authMiddleware');
const upload = require('../utils/upload');

router.get('/recent', protect, getRecentChats);
router.post('/send', protect, sendMessage);
router.post('/upload', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    res.status(200).json({
        success: true,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype.split('/')[0] === 'image' ? 'image' : 'file'
    });
});
router.get('/group/:groupId', protect, getGroupMessages);
router.get('/individual/:userId', protect, getIndividualMessages);
router.get('/resources/:id', protect, getSharedResources);

module.exports = router;
