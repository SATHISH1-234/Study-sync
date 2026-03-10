const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        const count = await User.countDocuments();
        console.log('User count:', count);
        const users = await User.find().limit(5);
        console.log('Users:', users.map(u => u.email));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
