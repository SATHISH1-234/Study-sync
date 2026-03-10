const StudySession = require('../models/StudySession');

// @desc    Record a study session
// @route   POST /api/sessions
// @access  Private (Student)
exports.recordSession = async (req, res) => {
    try {
        const { courseId, duration, focusScore, cameraActive } = req.body;
        const studentId = req.user._id;

        const session = await StudySession.create({
            studentId,
            courseId: courseId || 'none', // Handle cases where no specific course is selected
            duration,
            focusScore,
            cameraActive
        });

        // Notify student about their session summary
        const Notification = require('../models/Notification');
        await Notification.create({
            recipient: studentId,
            sender: studentId,
            title: 'Focus Session Synced',
            message: `Neural optimization complete! Duration: ${duration}min. Focus Score: ${focusScore}%`,
            type: focusScore > 80 ? 'success' : 'info',
            targetUrl: '/student/progress'
        });

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student sessions
// @route   GET /api/sessions/student
// @access  Private (Student)
exports.getStudentSessions = async (req, res) => {
    try {
        const sessions = await StudySession.find({ studentId: req.user._id })
            .populate('courseId', 'title')
            .sort({ date: -1 });
        res.status(200).json({ success: true, count: sessions.length, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
