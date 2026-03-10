const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Private (Student)
exports.chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Please provide a message" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                success: true,
                data: "I'm your Neural Guide! To optimize your learning, first enroll in a course (Request -> Approval). Once cleared, you can access the Focus Mode (with AI biometric tracking), join synchronized Study Groups, download shared Resource Nodes, and use the AI Smart Plan to orchestrate your weekly study matrix. (Note: AI is in sync-sim mode as API key is initializing)"
            });
        }

        const systemPrompt = `You are the Neural Guide, the advanced AI Assistant for Insight Learn Grid.
        You have deep knowledge of all platform features:
        
        1. ENROLLMENT: Browse 'Courses', click 'Request Enrollment'. Mentor must approve for access.
        2. FOCUS MODE: Uses AI eye-tracking. Keeps you in a "Neural Lock". If you look away, the UI will pulse with a subtle red glow. No intrusive popups.
        3. STUDY GROUPS: Automatically created per course. Once enrolled, you can chat with peers and mentors.
        4. RESOURCE HUB: A repository for files (PDFs, images) and external links shared by mentors.
        5. AI REMINDERS: Use 'AI Smart Plan' to generate a multi-day study matrix spread intelligently across a week.
        
        Personality: Futuristic, efficient, encouraging, and highly technical. Use terms like "Neural Nodes", "Syncing", "Matrix", and "Optimization".`;

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(`${systemPrompt}\n\nStudent: ${message}`);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ success: true, data: text });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ success: false, message: "AI Assistant is temporarily unavailable" });
    }
};
