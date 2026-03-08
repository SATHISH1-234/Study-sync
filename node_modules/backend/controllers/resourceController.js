const Resource = require('../models/Resource');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

// @desc    Add a resource
// @route   POST /api/resources
// @access  Private (Mentor/Admin)
exports.addResource = async (req, res) => {
    try {
        const { groupId, title, fileUrl } = req.body;
        const uploadedBy = req.user._id;

        if (!groupId || !title || !fileUrl) {
            return res.status(400).json({ success: false, message: 'Group ID, title, and file URL are required' });
        }

        const resource = await Resource.create({
            groupId,
            uploadedBy,
            title,
            fileUrl
        });

        // Notify all students in the group
        const group = await Group.findById(groupId);
        if (group && group.students.length > 0) {
            const notifications = group.students.map(studentId => ({
                recipient: studentId,
                sender: uploadedBy,
                title: 'New Resource Shared',
                message: `"${title}" has been added to ${group.groupName}`,
                type: 'resource',
                targetUrl: '/student/resources'
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, data: resource });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get resources for a group
// @route   GET /api/resources/group/:groupId
// @access  Private
exports.getGroupResources = async (req, res) => {
    try {
        const resources = await Resource.find({ groupId: req.params.groupId })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all resources for a student (from all their groups)
// @route   GET /api/resources/student
// @access  Private
exports.getStudentResources = async (req, res) => {
    try {
        const groups = await Group.find({ students: req.user._id }).distinct('_id');
        const resources = await Resource.find({ groupId: { $in: groups } })
            .populate('groupId', 'groupName')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all resources uploaded by a mentor
// @route   GET /api/resources/mentor
// @access  Private (Mentor)
exports.getMentorResources = async (req, res) => {
    try {
        const resources = await Resource.find({ uploadedBy: req.user._id })
            .populate('groupId', 'groupName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
