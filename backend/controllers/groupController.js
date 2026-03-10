const Group = require('../models/Group');

// @desc    Create study group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
    try {
        req.body.mentorId = req.user.id;
        const group = await Group.create(req.body);
        res.status(201).json({ success: true, data: group });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get groups for mentor
// @route   GET /api/groups/mentor/:mentorId
// @access  Private
exports.getMentorGroups = async (req, res) => {
    try {
        const groups = await Group.find({ mentorId: req.params.mentorId })
            .populate('students', 'name email profileImage')
            .populate('mentorId', 'name profileImage')
            .populate('courseId', 'title');
        res.status(200).json({ success: true, count: groups.length, data: groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student groups
// @route   GET /api/groups/student/:studentId
// @access  Private
exports.getStudentGroups = async (req, res) => {
    try {
        const groups = await Group.find({ students: { $in: [req.params.studentId] } })
            .populate('students', 'name profileImage')
            .populate('mentorId', 'name profileImage')
            .populate('courseId', 'title');
        res.status(200).json({ success: true, count: groups.length, data: groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all groups (Admin)
// @route   GET /api/groups
// @access  Private/Admin
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('students', 'name email')
            .populate('mentorId', 'name email')
            .populate('courseId', 'title');
        res.status(200).json({ success: true, count: groups.length, data: groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete group (Admin)
// @route   DELETE /api/groups/:id
// @access  Private/Admin
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }
        await group.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
