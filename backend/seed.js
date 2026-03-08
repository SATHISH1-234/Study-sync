const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const Course = require('./models/Course');
const Module = require('./models/Module');
const Group = require('./models/Group');
const User = require('./models/User');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Find or create a Mentor
        let mentor = await User.findOne({ role: 'mentor' });
        if (!mentor) {
            mentor = await User.create({
                name: 'Insight Mentor',
                email: 'mentor@insight.com',
                password: 'password123',
                role: 'mentor'
            });
            console.log('Created Mentor for seeding');
        }

        const courses = [
            {
                title: "Mastering Modern Web Architecture",
                description: "A comprehensive guide to building robust, scalable applications. This course features a deep dive into implementation patterns and system design.",
                modules: [
                    { title: "System Design Deep Dive", description: "Analyzing architecture patterns in real applications.", videoEmbedLink: "https://www.youtube.com/embed/xTtL8E4LzTQ", order: 1 },
                    { title: "React Best Practices", description: "Efficient component design and state management.", videoEmbedLink: "https://www.youtube.com/embed/w7ejDZ8SWv8", order: 2 }
                ]
            },
            {
                title: "Database Engineering & Optimization",
                description: "Learn how to optimize queries, design schemas, and handle large-scale data migrations.",
                modules: [
                    { title: "Indexing Explained", description: "How to make your queries 100x faster.", videoEmbedLink: "https://www.youtube.com/embed/aircAruvnKk", order: 1 },
                    { title: "Sharding and Replication", description: "Scaling your database horizontally.", videoEmbedLink: "https://www.youtube.com/embed/rfscVS0vtbw", order: 2 }
                ]
            }
        ];

        for (const cData of courses) {
            const { modules, ...courseProps } = cData;

            // Cleanup existing courses with same title to avoid duplicates
            await Course.deleteMany({ title: courseProps.title });

            const course = await Course.create({ ...courseProps, mentorId: mentor._id });
            console.log(`Created Course: ${course.title}`);

            // Create associated study group
            // Cleanup existing groups with same courseId
            await Group.deleteMany({ courseId: course._id });
            await Group.create({
                groupName: `${course.title} Study Group`,
                courseId: course._id,
                mentorId: mentor._id,
                students: []
            });
            console.log(`Created Group for: ${course.title}`);

            for (const m of modules) {
                await Module.create({ ...m, courseId: course._id });
            }

            course.modulesCount = modules.length;
            await course.save();
        }

        console.log('Seeding complete! Log in as a student to explore these courses.');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
