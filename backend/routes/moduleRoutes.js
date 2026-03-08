const express = require('express');
const {
    addModule,
    getModulesByCourse,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');

const router = express.Router();

const { protect, authorize } = require('../utils/authMiddleware');

router.post('/', protect, authorize('admin', 'mentor'), addModule);
router.get('/:courseId', getModulesByCourse);
router.put('/:id', protect, authorize('admin', 'mentor'), updateModule);
router.delete('/:id', protect, authorize('admin', 'mentor'), deleteModule);

module.exports = router;
