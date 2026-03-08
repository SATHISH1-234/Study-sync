const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a module title']
    },
    description: {
        type: String
    },
    videoEmbedLink: {
        type: String
    },
    resources: [{
        type: String // Links to PDF or other resources
    }],
    order: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Module', moduleSchema);
