const Course = require('../models/Course');
const Group = require('../models/Group');
const EnrollmentRequest = require('../models/EnrollmentRequest');
const Module = require('../models/Module');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('mentorId', 'name');
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: true, message: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('mentorId', 'name');
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get courses by mentor
// @route   GET /api/courses/mentor/:mentorId
// @access  Private/Admin/Mentor
exports.getMentorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ mentorId: req.params.mentorId }).populate('mentorId', 'name');
        if (!courses || courses.length === 0) {
            return res.status(404).json({ success: false, message: `No courses found for mentor with ID ${req.params.mentorId}` });
        }
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        // Add user to req.body (assuming mentorId is the logged-in user if they are mentor/admin)
        req.body.mentorId = req.user._id;

        const course = await Course.create(req.body);

        // Automatically create a study group for this course
        await Group.create({
            groupName: `${course.title} Study Group`,
            courseId: course._id,
            mentorId: req.user._id,
            students: []
        });

        // Notify all students about the new course
        const students = await User.find({ role: 'student' }).select('_id');
        if (students.length > 0) {
            const notifications = students.map(student => ({
                recipient: student._id,
                sender: req.user._id,
                title: 'New Course Available!',
                message: `Check out our new course: ${course.title} by ${req.user.name}`,
                type: 'course',
                targetUrl: `/student/courses/${course._id}`
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Find the group associated with this course
        const group = await Group.findOne({ courseId: course._id });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Study group not found for this course' });
        }

        // Check if already enrolled in group
        if (group.students.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        // Check if request already exists
        const existingRequest = await EnrollmentRequest.findOne({
            studentId: req.user.id,
            courseId: course._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'Enrollment request already sent and pending' });
        }

        // Create enrollment request
        await EnrollmentRequest.create({
            studentId: req.user._id,
            courseId: course._id,
            mentorId: course.mentorId
        });

        // Notify Mentor
        await Notification.create({
            recipient: course.mentorId,
            sender: req.user._id,
            title: 'New Enrollment Request',
            message: `${req.user.name} wants to join your course: ${course.title}`,
            type: 'course',
            targetUrl: '/mentor/requests'
        });

        res.status(200).json({ success: true, message: 'Enrollment request sent to mentor' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin/Mentor
exports.updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Make sure user is course owner or admin
        if (course.mentorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this course' });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.mentorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this course' });
        }

        // Cascading delete: Modules and Groups
        await Module.deleteMany({ courseId: req.params.id });
        await Group.deleteMany({ courseId: req.params.id });
        await course.deleteOne();

        res.status(200).json({ success: true, message: 'Course and associated data deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
