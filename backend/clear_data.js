const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const Course = require('./models/Course');
const Module = require('./models/Module');
const Group = require('./models/Group');

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        await Course.deleteMany({});
        await Module.deleteMany({});
        await Group.deleteMany({});

        console.log('Successfully cleared all courses, modules, and groups.');
        console.log('Your database is now fresh and ready for dynamic creation through the portal!');
        process.exit();
    } catch (err) {
        console.error('Error clearing data:', err);
        process.exit(1);
    }
};

clearData();
