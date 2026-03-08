const express = require('express');
const { getNotifications, markAllAsRead, broadcastNotification } = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../utils/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.post('/broadcast', protect, broadcastNotification);

module.exports = router;
