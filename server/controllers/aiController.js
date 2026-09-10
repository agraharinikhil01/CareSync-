const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Bed = require('../models/Bed');
const DoctorProfile = require('../models/DoctorProfile');

// POST /api/ai/chat
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Get live hospital context from DB
    const [doctors, availableBeds] = await Promise.all([
      DoctorProfile.find({ isAvailable: true }).populate('user', 'name'),
      Bed.countDocuments({ status: 'available' }),
    ]);

    const doctorList = doctors.map(d => `${d.user.name} (${d.specialization})`).join(', ');

    const systemContext = `You are CareSync AI Assistant for CareSync Hospital.
Current hospital status:
- Available doctors: ${doctorList || 'None currently available'}
- Available beds: ${availableBeds}
Answer in the same language the user writes in (Hindi, Hinglish, or English).
Keep answers short, friendly, and helpful. If asked about emergency, always say "Call 112".`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`${systemContext}\n\nUser: ${message}`);
    const reply = result.response.text();

    res.json({ success: true, data: { reply } });
  } catch (err) {
    // Fallback if Gemini key not set
    res.json({
      success: true,
      data: { reply: 'AI Assistant abhi available nahi hai. Please hospital helpdesk se contact karein.' },
    });
  }
};

module.exports = { chatWithAI };
