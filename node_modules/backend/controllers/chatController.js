const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

// @desc    Send a message (Individual or Group)
// @route   POST /api/chat/send
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { recipient, groupId, content, messageType, fileUrl, fileName } = req.body;
        const senderId = req.user._id;

        if (!content && !fileUrl) {
            return res.status(400).json({ success: false, message: 'Message content or file is required' });
        }

        const message = await Message.create({
            sender: senderId,
            recipient,
            groupId,
            content,
            messageType: messageType || 'text',
            fileUrl,
            fileName
        });

        // Create Notifications
        if (groupId) {
            const group = await Group.findById(groupId);
            if (group) {
                // Notify all students in the group except the sender
                const recipients = group.students.filter(id => id.toString() !== senderId.toString());

                // Add mentor to recipients if they are not the sender
                if (group.mentorId.toString() !== senderId.toString()) {
                    recipients.push(group.mentorId);
                }

                if (recipients.length > 0) {
                    const notifications = recipients.map(recvId => ({
                        recipient: recvId,
                        sender: senderId,
                        title: `New Message in ${group.groupName}`,
                        message: content ? (content.substring(0, 50) + (content.length > 50 ? '...' : '')) : 'Sent a file',
                        type: 'chat',
                        targetUrl: '/chat'
                    }));
                    await Notification.insertMany(notifications);
                }
            }
        } else if (recipient) {
            await Notification.create({
                recipient,
                sender: senderId,
                title: 'New Private Message',
                message: content ? (content.substring(0, 50) + (content.length > 50 ? '...' : '')) : 'Sent a file',
                type: 'chat',
                targetUrl: '/chat'
            });
        }

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name profileImage')
            .populate('recipient', 'name')
            .populate('groupId', 'groupName');

        res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for a group
// @route   GET /api/chat/group/:groupId
// @access  Private
exports.getGroupMessages = async (req, res) => {
    try {
        const messages = await Message.find({ groupId: req.params.groupId })
            .populate('sender', 'name profileImage')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for an individual chat
// @route   GET /api/chat/individual/:userId
// @access  Private
exports.getIndividualMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: otherUserId },
                { sender: otherUserId, recipient: myId }
            ]
        })
            .populate('sender', 'name profileImage')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get recent chats (List of people/groups you talked to)
// @route   GET /api/chat/recent
// @access  Private
exports.getRecentChats = async (req, res) => {
    try {
        const myId = req.user._id;

        // This is a simplified way to get recent chats
        const messages = await Message.find({
            $or: [{ sender: myId }, { recipient: myId }, { groupId: { $in: await Group.find({ students: myId }).distinct('_id') } }]
        })
            .sort({ createdAt: -1 })
            .limit(50);

        // Deduplicate and format as a "WhatsApp list"
        // In a real app, this would be more optimized with aggregation
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get shared resources (images/files) for a chat
// @route   GET /api/chat/resources/:id
// @access  Private
exports.getSharedResources = async (req, res) => {
    try {
        const id = req.params.id;
        const resources = await Message.find({
            $or: [
                { groupId: id, messageType: { $in: ['image', 'file'] } },
                { recipient: id, sender: req.user._id, messageType: { $in: ['image', 'file'] } },
                { recipient: req.user._id, sender: id, messageType: { $in: ['image', 'file'] } }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
