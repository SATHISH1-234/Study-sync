const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

        res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Broadcast notification (Admin only)
// @route   POST /api/notifications/broadcast
// @access  Admin
exports.broadcastNotification = async (req, res) => {
    try {
        const { title, message, type, role, targetUrl } = req.body;

        // Find users to notify
        let query = {};
        if (role && role !== 'all') {
            query.role = role;
        }

        const users = await User.find(query).select('_id');

        const notifications = users.map(user => ({
            recipient: user._id,
            sender: req.user._id,
            title,
            message,
            type: type || 'info',
            targetUrl
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({ success: true, message: `Notification broadcasted to ${users.length} users` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
