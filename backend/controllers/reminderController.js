const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');

// @desc    Create a study reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res) => {
    try {
        const { courseId, reminderTime, message } = req.body;
        const studentId = req.user._id;

        if (!courseId || !reminderTime || !message) {
            return res.status(400).json({ success: false, message: 'Course ID, time, and message are required' });
        }

        const reminder = await Reminder.create({
            studentId,
            courseId,
            reminderTime,
            message
        });

        // Create a notification for the student
        await Notification.create({
            recipient: studentId,
            sender: studentId, // AI generated or self-set
            title: 'AI Study Reminder Set',
            message: `You have a study session scheduled for ${new Date(reminderTime).toLocaleString()}`,
            type: 'reminder',
            targetUrl: '/student/reminders'
        });

        res.status(201).json({ success: true, data: reminder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user reminders
// @route   GET /api/reminders/:userId
// @access  Private
exports.getUserReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ studentId: req.params.userId })
            .populate('courseId', 'title')
            .sort({ reminderTime: 1 });

        res.status(200).json({ success: true, count: reminders.length, data: reminders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update reminder status
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const reminder = await Reminder.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }

        res.status(200).json({ success: true, data: reminder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
