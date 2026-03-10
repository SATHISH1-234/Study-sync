const express = require('express');
const {
    getCourses,
    getCourse,
    getMentorCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse
} = require('../controllers/courseController');

const router = express.Router();

const { protect, authorize } = require('../utils/authMiddleware');

router
    .route('/')
    .get(getCourses)
    .post(protect, authorize('admin', 'mentor'), createCourse);

router.get('/check-title', protect, async (req, res) => {
    try {
        const { title } = req.query;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
        const exists = await Course.exists({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } });
        res.status(200).json({ success: true, exists: !!exists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/mentor/:mentorId', protect, authorize('admin', 'mentor'), getMentorCourses);
router.post('/:id/enroll', protect, enrollCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('admin', 'mentor'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;
