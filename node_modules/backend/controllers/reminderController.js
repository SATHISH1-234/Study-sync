const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');

// @desc    Create a study reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res) => {
    try {
        const { courseId, reminderTime, message, studentId: targetStudentId } = req.body;

        // Mentors/Admins can specify studentId, students can only set for themselves
        const studentId = (req.user.role === 'mentor' || req.user.role === 'admin')
            ? (targetStudentId || req.user._id)
            : req.user._id;

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
            sender: req.user._id,
            title: req.user.role === 'mentor' ? 'Strategic Study Node Assigned' : 'AI Study Reminder Set',
            message: req.user.role === 'mentor'
                ? `Mentor ${req.user.name} has assigned a focus node: ${message} at ${new Date(reminderTime).toLocaleString()}`
                : `You have a study session scheduled for ${new Date(reminderTime).toLocaleString()}`,
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
// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }

        // Check if reminder belongs to user
        if (reminder.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await reminder.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
