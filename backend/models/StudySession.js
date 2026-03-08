const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    focusScore: {
        type: Number,
        default: 0
    },
    cameraActive: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('StudySession', studySessionSchema);
