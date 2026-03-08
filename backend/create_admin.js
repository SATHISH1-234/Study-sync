const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const dns = require('dns');

// Set DNS servers to Cloudflare (1.1.1.1) and Google (8.8.8.8)
dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4']);

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const email = 'admin@sip.com';
        await User.deleteOne({ email });
        console.log('Existing admin cleared.');

        const admin = await User.create({
            name: 'SIP Admin',
            email,
            password: 'admin123',
            role: 'admin',
            district: 'Tamil Nadu'
        });

        console.log('Admin account created successfully!');
        console.log('Email: admin@sip.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
