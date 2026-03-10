const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Try different paths for .env
const envPath = path.resolve(__dirname, 'backend', '.env');
dotenv.config({ path: envPath });

// Add models path
const User = require(path.resolve(__dirname, 'backend', 'models', 'User'));

const checkAdmin = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI ? 'URI set' : 'URI NOT FOUND');
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await User.findOne({ email: 'admin@sip.com' });
        if (admin) {
            console.log('✅ Admin found:', admin.email, 'Role:', admin.role);
        } else {
            console.log('❌ Admin NOT found');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error during check:', err.message);
        process.exit(1);
    }
};

checkAdmin();
