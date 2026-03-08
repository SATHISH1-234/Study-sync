const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Private (Student)
exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Please provide a message" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                success: true,
                data: "I'm your Insight Learn Grid Assistant! To help you with enrollment, first find a course you like in the 'Courses' section, then click 'Request Enrollment'. Once the mentor approves your request, you'll get a notification and full access to the videos and study groups. (Note: AI is currently in demo mode as API key is missing)"
            });
        }

        const systemPrompt = `You are the Official Assistant for Insight Learn Grid, a high-tech learning platform. 
        Your goal is to guide students on how to ENROLL in courses.
        
        ENROLLMENT PROCESS:
        1. Discover: Students browse courses on the 'Courses' page.
        2. Request: On a course details page, they click 'Request Enrollment'.
        3. Pending: The request goes to the Mentor for approval. The content stays locked until approved.
        4. Approval: Once the Mentor approves, the student gets a notification and immediate access to:
           - Course Videos
           - Study Groups / Chat
           - Shared Resources
        
        Be friendly, professional, and concise. Always mention the "Request -> Approval" workflow as it's the core of how this platform works.`;

        const prompt = `${systemPrompt}\n\nStudent: ${message}\nAI:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ success: true, data: text });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ success: false, message: "AI Assistant is temporarily unavailable" });
    }
};
