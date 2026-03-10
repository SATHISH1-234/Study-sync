const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dns = require('dns');
const connectDB = require('./config/db');

// Set DNS servers to resolve MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
    try {
        const User = require('./models/User');
        // Check by email to prevent duplicate key errors if role changed
        const adminEmail = 'admin@sip.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                name: 'System Administrator',
                email: adminEmail,
                password: 'adminpassword123',
                role: 'admin'
            });
            console.log('🛡️  Neural Index: Admin Account Initialized [admin@sip.com]');
        } else if (adminExists.role !== 'admin') {
            adminExists.role = 'admin';
            await adminExists.save();
            console.log('🛡️  Neural Index: User elevated to Admin Clearance [admin@sip.com]');
        } else {
            console.log('🛡️  Neural Index: Admin Node Active [admin@sip.com]');
        }
    } catch (err) {
        console.error('❌ Neural Index: Admin Seeding Failed ->', err.message);
    }
});

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the SIP Backend API' });
});

// Health Check Route for waking up Render
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to be accessible on your local network
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Accessible at: http://localhost:${PORT}`);
});
