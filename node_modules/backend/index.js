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
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

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

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the SIP Backend API' });
});

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to be accessible on your local network
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Accessible at: http://localhost:${PORT}`);
});
