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

router.get('/mentor/:mentorId', protect, authorize('admin', 'mentor'), getMentorCourses);
router.post('/:id/enroll', protect, enrollCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('admin', 'mentor'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;
