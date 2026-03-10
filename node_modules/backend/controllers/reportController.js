const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a report/query
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
    try {
        const { title, message } = req.body;
        const report = await Report.create({
            sender: req.user._id,
            title,
            message
        });

        // Notify Admin
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.create({
                recipient: admin._id,
                sender: req.user._id,
                title: 'New Support Query',
                message: `${req.user.name} sent a new query: ${title}`,
                type: 'warning',
                targetUrl: '/admin/reports'
            });
        }

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('sender', 'name email role').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Respond to report (Admin)
// @route   PUT /api/reports/:id
// @access  Private/Admin
exports.respondToReport = async (req, res) => {
    try {
        const { reply } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        report.reply = reply;
        report.status = 'resolved';
        await report.save();

        // Notify Sender
        await Notification.create({
            recipient: report.sender,
            sender: req.user._id,
            title: 'Support Query Resolved',
            message: `Admin responded to your query: "${report.title}". Message: ${reply}`,
            type: 'success',
            targetUrl: req.user.role === 'mentor' ? '/mentor' : '/student'
        });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }
        await report.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
