const EnrollmentRequest = require('../models/EnrollmentRequest');
const Course = require('../models/Course');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

// @desc    Get enrollment request status for a specific course
// @route   GET /api/enrollments/status/:courseId
// @access  Private/Student
exports.getStudentRequestStatus = async (req, res) => {
    try {
        const request = await EnrollmentRequest.findOne({
            studentId: req.user._id,
            courseId: req.params.courseId
        });
        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all requests for a mentor
// @route   GET /api/enrollments/mentor
// @access  Private/Mentor
exports.getMentorRequests = async (req, res) => {
    try {
        const requests = await EnrollmentRequest.find({ mentorId: req.user._id, status: 'pending' })
            .populate('studentId', 'name email profileImage')
            .populate('courseId', 'title');
        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve or reject request
// @route   PUT /api/enrollments/:id
// @access  Private/Mentor
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await EnrollmentRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Check ownership
        if (request.mentorId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        request.status = status;
        await request.save();

        if (status === 'approved') {
            // Find course and group
            const course = await Course.findById(request.courseId);
            const group = await Group.findOne({ courseId: course._id });

            if (group) {
                if (!group.students.includes(request.studentId)) {
                    group.students.push(request.studentId);
                    await group.save();

                    course.studentsCount = group.students.length;
                    await course.save();
                }
            }

            // Notify Student
            await Notification.create({
                recipient: request.studentId,
                sender: req.user._id,
                title: 'Enrollment Approved!',
                message: `You have been accepted into the course: ${course.title}. Welcome!`,
                type: 'success',
                targetUrl: `/student/courses/${course._id}`
            });
        } else {
            // Notify Student of rejection
            const course = await Course.findById(request.courseId);
            await Notification.create({
                recipient: request.studentId,
                sender: req.user._id,
                title: 'Enrollment Update',
                message: `Your request to join ${course.title} was not accepted at this time.`,
                type: 'info'
            });
        }

        res.status(200).json({ success: true, message: `Request ${status} successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
