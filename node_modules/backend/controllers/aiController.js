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

        const systemPrompt = `You are the SIP Guide, a helpful and friendly AI assistant for the Insight Learn Grid platform.
        You help students navigate the website and explain how it works:
        
        1. HOW TO ENROLL: Go to the 'Courses' page and click 'Request Enrollment'. You'll need to wait for the teacher (mentor) to approve you.
        2. FOCUS MODE: This helps you study without distractions. It uses your camera to check if you're paying attention. If you look away, the screen will gently glow red to remind you to focus.
        3. STUDY GROUPS: Once you're in a course, you'll be added to a group where you can chat with other students and your teacher.
        4. RESOURCES: This is where you can find and download study materials like PDFs or links shared by your teacher.
        5. REMINDERS: Use the 'AI Smart Plan' to create a simple study schedule that fits your week.
        
        Personality: Helpful, friendly, clear, and easy to understand. Avoid using overly technical or robotic words. Use normal words that a student would understand.`;

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
