const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    completedModules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],
    progressPercentage: {
        type: Number,
        default: 0
    },
    lastWatchedModule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }
});

module.exports = mongoose.model('Progress', progressSchema);
