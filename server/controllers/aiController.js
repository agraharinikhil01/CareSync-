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
    let reply = '';
    
    // Try current supported models with graceful fallback
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.6-flash'];
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(`${systemContext}\n\nUser query: ${message}`);
        reply = result.response.text();
        if (reply) break;
      } catch (err) {
        // try next model
      }
    }

    if (!reply) {
      // Intelligent rule-based clinical response fallback
      const lower = message.toLowerCase();
      if (lower.includes('doctor') || lower.includes('dr')) {
        reply = `Hospital me available doctors: ${doctorList || 'General Physician'}. Aap appointment tab se book kar sakte hain.`;
      } else if (lower.includes('bed') || lower.includes('ward')) {
        reply = `CareSync Hospital me currently ${availableBeds} beds available hain. Receptionist se check-in kara sakte hain.`;
      } else if (lower.includes('bukhar') || lower.includes('fever') || lower.includes('pain') || lower.includes('dard')) {
        reply = `Bukhar/Dard ke liye rest lein, hydrated rahein aur Paracetamol 500mg le sakte hain agar doctor ne recommend kiya ho. Kripya OPD me doctor se consult karein. Emergency me 112 par call karein.`;
      } else {
        reply = `Namaste! CareSync Hospital AI Assistant aapki seva me hajir hai. Hamare paas ${availableBeds} beds aur qualified doctors uplabdh hain. Aap appointments, beds ya clinical guidance ke baare me pooch sakte hain.`;
      }
    }

    res.json({ success: true, data: { reply } });
  } catch (err) {
    res.json({
      success: true,
      data: { reply: 'Namaste! CareSync AI active hai. Doctor appointment aur hospital jankari ke liye portals check karein.' },
    });
  }
};

module.exports = { chatWithAI };
