const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dns = require('dns');

// Set DNS servers to resolve MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const seedSimpleUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        // 1. Reset Admin
        const adminEmail = 'admin@sip.com';
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            admin.password = 'admin123';
            admin.role = 'admin';
            await admin.save();
            console.log('✅ Admin Reset: admin@sip.com / admin123');
        } else {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'admin'
            });
            console.log('✅ Admin Created: admin@sip.com / admin123');
        }

        // 2. Create Simple Student
        const studentEmail = 'student@sip.com';
        let student = await User.findOne({ email: studentEmail });
        if (student) {
            student.password = 'student123';
            student.role = 'student';
            await student.save();
            console.log('✅ Student Reset: student@sip.com / student123');
        } else {
            await User.create({
                name: 'John Student',
                email: studentEmail,
                password: 'student123',
                role: 'student'
            });
            console.log('✅ Student Created: student@sip.com / student123');
        }

        // 3. Create Simple Mentor
        const mentorEmail = 'mentor@sip.com';
        let mentor = await User.findOne({ email: mentorEmail });
        if (mentor) {
            mentor.password = 'mentor123';
            mentor.role = 'mentor';
            await mentor.save();
            console.log('✅ Mentor Reset: mentor@sip.com / mentor123');
        } else {
            await User.create({
                name: 'Expert Mentor',
                email: mentorEmail,
                password: 'mentor123',
                role: 'mentor'
            });
            console.log('✅ Mentor Created: mentor@sip.com / mentor123');
        }

        console.log('\n🚀 All nodes synchronized. You can now login with these credentials.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync Failed:', err.message);
        process.exit(1);
    }
};

seedSimpleUsers();
