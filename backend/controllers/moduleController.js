const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Add module to course
// @route   POST /api/modules
// @access  Private/Admin/Mentor
exports.addModule = async (req, res) => {
    try {
        const course = await Course.findById(req.body.courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check ownership
        if (course.mentorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const moduleItem = await Module.create(req.body);

        // Update module count in course
        course.modulesCount = await Module.countDocuments({ courseId: course._id });
        await course.save();

        // Notify students enrolled in this course via groups
        const Group = require('../models/Group');
        const Notification = require('../models/Notification');
        const groups = await Group.find({ courseId: course._id });

        for (const group of groups) {
            if (group.students && group.students.length > 0) {
                const notifications = group.students.map(studentId => ({
                    recipient: studentId,
                    sender: req.user._id,
                    title: 'New Module Added',
                    message: `A new module "${moduleItem.title}" has been added to ${course.title}. Check it out!`,
                    type: 'course',
                    targetUrl: `/student/courses/${course._id}`
                }));
                await Notification.insertMany(notifications, { ordered: false }).catch(err => console.error("Notification broadcast error:", err));
            }
        }

        res.status(201).json({ success: true, data: moduleItem });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get modules for a course
// @route   GET /api/modules/:courseId
// @access  Public
exports.getModulesByCourse = async (req, res) => {
    try {
        const modules = await Module.find({ courseId: req.params.courseId }).sort('order');
        res.status(200).json({ success: true, count: modules.length, data: modules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private
exports.updateModule = async (req, res) => {
    try {
        let moduleItem = await Module.findById(req.params.id);

        if (!moduleItem) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        moduleItem = await Module.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: moduleItem });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private
exports.deleteModule = async (req, res) => {
    try {
        const moduleItem = await Module.findById(req.params.id);

        if (!moduleItem) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const courseId = moduleItem.courseId;
        await moduleItem.deleteOne();

        // Update module count
        const course = await Course.findById(courseId);
        if (course) {
            course.modulesCount = await Module.countDocuments({ courseId });
            await course.save();
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
