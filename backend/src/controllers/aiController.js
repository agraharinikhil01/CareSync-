const { GoogleGenerativeAI } = require('@google/generative-ai');
const Doctor = require('../models/Doctor');
const Bed = require('../models/Bed');

// POST /api/ai/chat
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Live hospital context injection
    const [doctors, availableBeds] = await Promise.all([
      Doctor.find({ availability: true }).populate('user', 'name'),
      Bed.countDocuments({ status: 'AVAILABLE' }),
    ]);

    const doctorList = doctors.map((d) => `Dr. ${d.user?.name} (${d.specialization})`).join(', ');

    const systemPrompt = `You are CareSync AI, an intelligent clinical support assistant for CareSync Hospital.
Hospital Live Context:
- Available Specialist Doctors: ${doctorList || 'General Duty Medical Officers'}
- Available Ward & ICU Beds: ${availableBeds} beds currently free across 4 floors.

Guidelines:
1. Respond in the same language as the user query (Hindi, Hinglish, or English).
2. Maintain a compassionate, clear, professional tone.
3. MEDICAL SAFETY RULES:
   - You MUST NOT formally diagnose serious medical diseases.
   - You must NOT replace a licensed medical doctor.
   - For severe symptoms (chest pain, severe breathlessness, head trauma, unconsciousness, heavy bleeding), ALWAYS immediately instruct the user: "Emergency medical emergency: Please call 112 immediately or rush to the nearest emergency room."
4. Provide helpful advice for hospital services, booking appointments, bed inquiries, and general wellness.`;

    let reply = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.6-flash'];

        for (const m of models) {
          try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}`);
            reply = result.response.text();
            if (reply) break;
          } catch (e) {
            // try next model
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, using clinical rule-engine fallback:', err.message);
      }
    }

    // Rule-based clinical fallback if Gemini key has access restriction
    if (!reply) {
      const lower = message.toLowerCase();
      if (lower.includes('chest pain') || lower.includes('heart') || lower.includes('saans') || lower.includes('emergency')) {
        reply = '🚨 EMERGENCY ALERT: Please call 112 immediately or visit the CareSync Hospital Emergency Trauma Ward right away. Do not delay.';
      } else if (lower.includes('doctor') || lower.includes('appointment')) {
        reply = `CareSync Hospital me available doctors: ${doctorList || 'General Physicians'}. Aap portal ke Appointments section se turant consultation book kar sakte hain.`;
      } else if (lower.includes('bed') || lower.includes('icu') || lower.includes('ward')) {
        reply = `Hospital me currently ${availableBeds} beds available hain across 4 floors (General, ICU, Private, Semi-Private). Front desk receptionist se allocation le sakte hain.`;
      } else if (lower.includes('fever') || lower.includes('bukhar') || lower.includes('cough') || lower.includes('khansi')) {
        reply = 'Bukhar ya khansi ke liye aaram karein aur hydration banaye rakhein. Agar bukhar 101°F se upar hai to turant hamare OPD Doctor se consult karein. Kripya bina doctor ke advice ke koi strong medicine na lein.';
      } else {
        reply = `Namaste! CareSync AI Assistant aapki seva me hajir hai. Hamare paas ${availableBeds} beds aur qualified specialist doctors uplabdh hain. Aap appointments, prescriptions, ya general health care ke baare me pooch sakte hain.`;
      }
    }

    res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { chatWithAI };
