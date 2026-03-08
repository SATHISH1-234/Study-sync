const Progress = require('../models/Progress');
const Module = require('../models/Module');

// @desc    Update student progress for a course
// @route   POST /api/progress/update
// @access  Private (Student)
exports.updateProgress = async (req, res) => {
    try {
        const { courseId, moduleId } = req.body;
        const studentId = req.user._id;

        let progress = await Progress.findOne({ studentId, courseId });

        if (!progress) {
            progress = await Progress.create({
                studentId,
                courseId,
                completedModules: [moduleId],
                lastWatchedModule: moduleId
            });
        } else {
            if (!progress.completedModules.includes(moduleId)) {
                progress.completedModules.push(moduleId);
            }
            progress.lastWatchedModule = moduleId;
            await progress.save();
        }

        // Calculate percentage
        const totalModules = await Module.countDocuments({ courseId });
        const completedCount = progress.completedModules.length;
        progress.progressPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
        await progress.save();

        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student progress for a specific course
// @route   GET /api/progress/:courseId
// @access  Private
exports.getProgress = async (req, res) => {
    try {
        const progress = await Progress.findOne({
            studentId: req.user._id,
            courseId: req.params.courseId
        });
        res.status(200).json({ success: true, data: progress || { progressPercentage: 0, completedModules: [] } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all progress for a student
// @route   GET /api/progress/student/all
// @access  Private (Student)
exports.getAllStudentProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ studentId: req.user._id })
            .populate('courseId', 'title');
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get progress for all students in a mentor's course
// @route   GET /api/progress/mentor/overview
// @access  Private (Mentor)
exports.getMentorOverview = async (req, res) => {
    try {
        const progress = await Progress.find()
            .populate('studentId', 'name email')
            .populate('courseId', 'title mentorId');

        // Filter progress for courses belonging to this mentor
        const filtered = progress.filter(p => p.courseId && p.courseId.mentorId && p.courseId.mentorId.toString() === req.user.id);

        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
