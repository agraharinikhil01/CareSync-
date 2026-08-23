const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Bed = require('../models/Bed');

// Comprehensive Medical Knowledge Base for rapid, accurate clinical assistance
const MEDICAL_KNOWLEDGE = {
  fever: {
    title: 'Fever (Pyrexia / Bukhar)',
    causes: 'Viral infections (flu, common cold), bacterial infections, dengue, typhoid, malaria, or heat exhaustion.',
    symptoms: 'Body temperature above 100.4 F (38 C), chills, sweating, headache, muscle aches, fatigue.',
    homeCare: [
      'Drink plenty of fluids (water, ORS, coconut water, warm soups) to prevent dehydration.',
      'Take adequate rest and wear lightweight clothing.',
      'Use lukewarm sponge baths if temperature is high.',
      'Over-the-counter Paracetamol (500mg/650mg) can be taken as per doctor guidance. Avoid Aspirin in children or suspected dengue.'
    ],
    redFlags: 'Fever above 103 F, lasting > 3 days, severe neck stiffness, confusion, difficulty breathing, or rash - Seek immediate emergency care.',
    specialist: 'General Physician / Internal Medicine'
  },
  dengue: {
    title: 'Dengue Viral Fever',
    causes: 'Aedes mosquito bite transmission of dengue flavivirus.',
    symptoms: 'Sudden high fever, severe eye pain (behind eyes), severe joint/muscle pain (breakbone fever), skin rash, mild bleeding (gums/nose).',
    homeCare: [
      'High fluid intake (minimum 2.5 - 3 liters daily: ORS, coconut water, fresh fruit juices).',
      'Strictly avoid NSAIDs (Brufen, Ibuprofen, Aspirin) as they increase bleeding risk. Only Paracetamol is advised.',
      'Monitor Platelet count & Hematocrit daily via CBC test.'
    ],
    redFlags: 'Persistent vomiting, severe abdominal pain, bleeding gums, extreme lethargy, drop in platelets below 50,000 - Requires immediate hospital admission.',
    specialist: 'General Physician / Critical Care'
  },
  diabetes: {
    title: 'Diabetes Mellitus (High Blood Sugar / Madhumeh)',
    causes: 'Insulin deficiency (Type 1) or insulin resistance with lifestyle factors (Type 2).',
    symptoms: 'Increased thirst (polydipsia), frequent urination (polyuria), unexplained weight loss, blurred vision, slow-healing wounds.',
    homeCare: [
      'Follow a low-glycemic, high-fiber diet rich in whole grains, green vegetables, and lean protein.',
      'Engage in 30 minutes of moderate aerobic exercise (brisk walking) 5 days a week.',
      'Regular blood sugar monitoring (Fasting target: 70-100 mg/dL, Post-prandial: < 140 mg/dL).',
      'Timely adherence to prescribed medications (Metformin, Glimepiride, or Insulin).'
    ],
    redFlags: 'Blood sugar > 300 mg/dL with nausea, fruity breath, confusion (DKA), or extreme hypoglycemia (< 60 mg/dL) with sweating and trembling.',
    specialist: 'Endocrinologist / Diabetologist / General Physician'
  },
  hypertension: {
    title: 'Hypertension (High Blood Pressure / High BP)',
    causes: 'High sodium intake, lack of exercise, stress, obesity, genetics, renal disease.',
    symptoms: 'Often silent (Silent Killer). When severe: occipital morning headache, dizziness, nosebleeds, palpitations.',
    homeCare: [
      'DASH Diet: Limit daily sodium/salt intake to less than 1 teaspoon (2.3g).',
      'Eat potassium-rich foods (bananas, spinach, coconut water).',
      'Quit smoking and reduce alcohol consumption.',
      'Practice deep breathing, yoga, or meditation to lower chronic stress.'
    ],
    redFlags: 'Blood pressure above 180/120 mmHg (Hypertensive Crisis), chest tightness, severe sudden headache, blurred vision.',
    specialist: 'Cardiologist / General Physician'
  },
  chest_pain: {
    title: 'Chest Pain / Suspected Cardiac Emergency (Angina / Heart Attack)',
    causes: 'Coronary artery disease, myocardial infarction, acidity/GERD, muscle pull, panic attack.',
    symptoms: 'Crushing or squeezing chest heaviness radiating to left arm, neck, jaw, or back, sweating, shortness of breath, nausea.',
    homeCare: [
      'DO NOT DELAY: Call Emergency Helpline (108 / 112) or rush to the nearest Emergency ER immediately.',
      'Sit comfortably and loosen tight clothing.',
      'If prescribed, take sublingual Sorbitrate/Nitroglycerin under medical guidance.'
    ],
    redFlags: 'Any sudden squeezing chest pain lasting > 5 minutes is a MEDICAL EMERGENCY. Rush to Hospital Emergency ER immediately.',
    specialist: 'Cardiologist / Emergency Medicine'
  },
  cough_cold: {
    title: 'Cough, Cold & Acute Bronchitis (Khansi / Zukaam)',
    causes: 'Rhinovirus, Influenza, environmental allergens, air pollution, bacterial chest infection.',
    symptoms: 'Runny or stuffy nose, dry or productive cough, sore throat, mild body ache, sneezing.',
    homeCare: [
      'Steam inhalation with eucalyptus or menthol 2 times daily.',
      'Warm saline gargles (namak-paani) 3 times a day for sore throat relief.',
      'Honey with ginger tea (for adults and children > 1 year).',
      'Stay hydrated with warm water and herbal decoctions (Kadha).'
    ],
    redFlags: 'Coughing blood (hemoptysis), high fever > 102 F, wheezing, breathlessness, cough lasting > 3 weeks.',
    specialist: 'Pulmonologist / ENT Specialist / General Physician'
  },
  acidity: {
    title: 'Acidity & GERD (Gastroesophageal Reflux / Pet me Jalan)',
    causes: 'Spicy/oily foods, caffeine, skipping meals, lying down immediately after eating, obesity.',
    symptoms: 'Burning sensation in chest/stomach (heartburn), sour burps, bloating, indigestion.',
    homeCare: [
      'Drink cold milk or eat curd/yogurt for soothing relief.',
      'Eat smaller, frequent meals and avoid lying down for 2 hours after meals.',
      'Avoid trigger foods: deep-fried items, excessive tea/coffee, carbonated drinks, citrus.',
      'Elevate the head of your bed by 6 inches while sleeping.'
    ],
    redFlags: 'Black tarry stools, vomiting blood, difficulty swallowing (dysphagia), severe radiating pain mimicking heart attack.',
    specialist: 'Gastroenterologist / General Physician'
  },
  headache_migraine: {
    title: 'Headache & Migraine (Sir Dard)',
    causes: 'Stress, dehydration, lack of sleep, screen fatigue, skipped meals, hormonal changes.',
    symptoms: 'Throbbing pain on one or both sides of head, light/sound sensitivity, nausea, aura.',
    homeCare: [
      'Rest in a quiet, dark room with eyes closed.',
      'Place a cold compress or ice pack on the forehead or back of the neck.',
      'Stay hydrated with electrolyte water or coconut water.',
      'Avoid identified migraine triggers (bright screens, loud noises, MSG, aged cheese).'
    ],
    redFlags: 'Worst headache of your life (Thunderclap), sudden weakness on one side of face/body, slurred speech, post-head injury.',
    specialist: 'Neurologist / General Physician'
  },
  burns: {
    title: 'First Aid for Thermal Burns (Jalna)',
    causes: 'Hot liquids, steam, hot surfaces, flame contact.',
    symptoms: 'Redness, pain, blisters, skin peeling.',
    homeCare: [
      'Immediately cool the burn under running cool tap water for 15-20 minutes. DO NOT use ice or ice water.',
      'Do NOT apply toothpaste, butter, turmeric, or oils on open burns.',
      'Cover loosely with a clean, non-stick sterile gauze or bandage.',
      'Do not pop blisters to prevent bacterial infection.'
    ],
    redFlags: 'Burns on face, hands, joints, groin, or burns larger than the palm of your hand - Rush to Hospital Emergency ER.',
    specialist: 'Emergency Physician / Plastic & Burn Surgeon'
  }
};

// @desc    Process AI Assistant query with Medical & Hospital Real-Time Context
// @route   POST /api/ai/chat
// @access  Public
const handleAIChat = async (req, res, next) => {
  try {
    const { query, language = 'auto', userRole = 'patient', userName } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a message or question.' });
    }

    const q = query.toLowerCase().trim();

    // 1. Fetch live Hospital Context from MongoDB
    const [doctors, beds] = await Promise.all([
      DoctorProfile.find().populate('userId', 'name email phone').limit(10),
      Bed.find().populate('patientId', 'name')
    ]);

    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(b => b.isOccupied).length;
    const vacantBeds = totalBeds - occupiedBeds;
    const icuAvailable = beds.filter(b => b.type === 'ICU' && !b.isOccupied).length;

    // Detect Language: Hindi/Hinglish vs English
    const isHindi = language === 'hi' || /bukhar|dawa|dard|khansi|ilaaj|aspataal|doctor|kaise|kya|batao|karna|chahiye|pet|sir|namaste|sehat|ilaj/.test(q);

    let answer = '';
    let category = 'general';
    let suggestions = [];

    // --- CASE A: HOSPITAL SPECIFIC QUESTIONS ---

    // A1: Doctors & Specialists List
    if (/doctor|specialist|physician|cardiologist|neurologist|pediatrician|surgeon|appointment|consultation/i.test(q) && (/who|which|list|available|kaun|batao|naam|timings|fee/i.test(q) || /doctor/i.test(q))) {
      category = 'hospital_doctors';
      if (isHindi) {
        answer = `### 👨‍⚕️ CareSync Hospital Ke Upalabdh Doctors & Specialists:\n\n`;
        answer += `Hamare hospital me top medical specialists uplabdh hain:\n\n`;
        doctors.forEach((d, idx) => {
          const docName = d.userId?.name || 'Dr. Specialist';
          answer += `${idx + 1}. **${docName}** - *${d.specialization}* (${d.department}) | Fee: ₹${d.consultationFee}\n`;
        });
        answer += `\n📅 **Appointment Booking:** Aap portal ke **"Book Appointment"** tab se 1-click me online slot book kar sakte hain ya reception counter par walk-in consultation le sakte hain.`;
      } else {
        answer = `### 👨‍⚕️ Available Doctors & Specialists at CareSync Hospital:\n\n`;
        answer += `Our hospital hosts top certified healthcare specialists:\n\n`;
        doctors.forEach((d, idx) => {
          const docName = d.userId?.name || 'Dr. Specialist';
          answer += `${idx + 1}. **${docName}** - *${d.specialization}* (${d.department}) | Tariff: ₹${d.consultationFee}\n`;
        });
        answer += `\n📅 **How to Book:** Navigate to the **"Book Appointment"** sidebar tab in your portal to reserve a slot directly with real-time collision checks.`;
      }
      suggestions = ['How to book appointment?', 'Hospital Ward & Bed status', 'Emergency Helpline'];
    }

    // A2: Bed & Ward Availability
    else if (/bed|ward|icu|room|admit|admission|occupancy|khali|floor/i.test(q) && (/available|status|how many|kitne|book|kaise|overview/i.test(q) || /bed/i.test(q))) {
      category = 'hospital_beds';
      if (isHindi) {
        answer = `### 🛏️ Hospital Ward & Bed Live Status:\n\n`;
        answer += `- **Total Hospital Beds:** ${totalBeds} Beds (4 Active Floors)\n`;
        answer += `- 🟢 **Available / Khali Beds:** **${vacantBeds} Beds** (Immediate Admission Ready)\n`;
        answer += `- 🔴 **Occupied Beds:** ${occupiedBeds} Beds\n`;
        answer += `- 🫀 **ICU Critical Care Standby:** **${icuAvailable} Units Ready** (Ventilator & Life-support)\n\n`;
        answer += `🏢 **Hospital Floors:**\n`;
        answer += `1. **Ground Floor:** Trauma & Emergency ER (₹1200/day)\n`;
        answer += `2. **1st Floor:** Intensive Care Unit (ICU) (₹4500/day)\n`;
        answer += `3. **2nd Floor:** General Medical Ward (₹800/day)\n`;
        answer += `4. **3rd Floor:** VIP Executive Deluxe Suites (₹3500/day)\n\n`;
        answer += `👉 **Booking:** Patient portal me **"Hospital Beds & Ward Map"** tab par jakar live 4-floor plan dekh sakte hain aur bed book kar sakte hain!`;
      } else {
        answer = `### 🛏️ Live Hospital Ward & Bed Inventory Overview:\n\n`;
        answer += `- **Total Hospital Capacity:** ${totalBeds} Beds across 4 Floors\n`;
        answer += `- 🟢 **Currently Available:** **${vacantBeds} Beds** (Ready for Admission)\n`;
        answer += `- 🔴 **Occupied Patient Load:** ${occupiedBeds} Beds\n`;
        answer += `- 🫀 **ICU Critical Life-Support Readiness:** **${icuAvailable} Ready Units**\n\n`;
        answer += `🏢 **Ward Floor Plan Architecture:**\n`;
        answer += `1. **Ground Floor:** Trauma & Emergency ER (₹1200/day)\n`;
        answer += `2. **1st Floor:** Intensive Care Unit (ICU) (₹4500/day)\n`;
        answer += `3. **2nd Floor:** General Inpatient Ward (₹800/day)\n`;
        answer += `4. **3rd Floor:** VIP & Executive Suites (₹3500/day)\n\n`;
        answer += `👉 **Self-Service Booking:** Navigate to the **"Hospital Beds & Ward Map"** tab to view the live grid and reserve a room.`;
      }
      suggestions = ['Available Doctors', 'Emergency QR Passport', 'How to Pay Bills'];
    }

    // A3: Emergency SOS QR Passport
    else if (/emergency|passport|sos|accident|qr|golden hour|trauma|blood group/i.test(q)) {
      category = 'emergency_passport';
      if (isHindi) {
        answer = `### 🚨 Emergency QR Life-Saving Health Passport:\n\n`;
        answer += `CareSync HMS me har patient ko ek **Digital Emergency Health Passport** milta hai:\n\n`;
        answer += `1. **Zero-Login Emergency Profile:** Kisi bhi accident ya emergency me koi bhi paramedic ya bystander QR scan karke bina login kiye patient ka **Blood Group, Drug Allergies** aur chronic illness dekh sakta hai.\n`;
        answer += `2. **1-Click GPS SOS Alert:** Screen par **"Send GPS SOS Alert"** dabate hi patient ke emergency contact ko Google Maps location ke sath alert chala jata hai.\n`;
        answer += `3. **Printable Pocket ID:** Patient apne portal ke **"Health Profile & EHR"** tab se pocket wallet ID card print kar sakta hai.`;
      } else {
        answer = `### 🚨 Emergency QR Life-Saving Health Passport:\n\n`;
        answer += `CareSync HMS equips every registered patient with an intelligent **Emergency Health Passport**:\n\n`;
        answer += `1. **Zero-Login Paramedic Scan (/emergency/:patientId):** Allows first responders to instantly access critical Blood Group, Severe Allergies, and Chronic Ailments in under 500ms.\n`;
        answer += `2. **1-Click GPS SOS SMS Dispatch:** Sends exact Google Maps accident coordinates to the emergency contact with a single tap.\n`;
        answer += `3. **Printable Wallet ID Card:** Printable directly from the **"Health Profile & EHR"** tab.`;
      }
      suggestions = ['Available Doctors', 'Ward Bed Status', 'Billing & Payment'];
    }

    // A4: Billing, Payments & Invoices
    else if (/bill|payment|invoice|pay|upi|card|currency|counterless/i.test(q)) {
      category = 'hospital_billing';
      if (isHindi) {
        answer = `### 💳 Multi-Currency Billing & Mobile Counterless Checkout:\n\n`;
        answer += `1. **Mobile Payment QR:** Har hospital bill par dynamic QR code hota hai. Aap apne smartphone se scan karke bina counter line me khade hue instant UPI / Card se payment kar sakte hain.\n`;
        answer += `2. **6 Global Currencies:** Aap INR (₹), USD ($), EUR (€), GBP (£), AED aur JPY me live rates dekh sakte hain.\n`;
        answer += `3. **GST Tax Invoice:** Payment complete hote hi official printable receipt generate ho jati hai.`;
      } else {
        answer = `### 💳 Multi-Currency Billing & Mobile QR Checkout:\n\n`;
        answer += `1. **Counterless Mobile Checkout (/pay/:invoiceId):** Scan the dynamic QR code printed on your bill with any smartphone to pay instantly via UPI, Credit Card, or Net Banking.\n`;
        answer += `2. **6 Global Currency Switcher:** Seamlessly view and settle bills in INR (₹), USD ($), EUR (€), GBP (£), AED, or JPY.\n`;
        answer += `3. **Instant Official Receipts:** Download GST-compliant itemized receipts immediately after payment.`;
      }
      suggestions = ['Available Doctors', 'Ward Bed Status', 'Book Appointment'];
    }

    // --- CASE B: MEDICAL & DISEASE LOOKUP ---
    else {
      let matchedKey = null;

      if (/fever|bukhar|temperature|tapman/i.test(q)) matchedKey = 'fever';
      else if (/dengue|platelet|breakbone/i.test(q)) matchedKey = 'dengue';
      else if (/diabetes|sugar|madhumeh|glucose|insulin/i.test(q)) matchedKey = 'diabetes';
      else if (/bp|blood pressure|hypertension|high bp/i.test(q)) matchedKey = 'hypertension';
      else if (/chest pain|heart attack|heart|angina|chhati me dard/i.test(q)) matchedKey = 'chest_pain';
      else if (/cough|cold|khansi|zukaam|throat|gala|bronchitis/i.test(q)) matchedKey = 'cough_cold';
      else if (/acid|acidity|gas|heartburn|pet me jalan|bloating|gerd/i.test(q)) matchedKey = 'acidity';
      else if (/headache|migraine|sir dard|sir me dard/i.test(q)) matchedKey = 'headache_migraine';
      else if (/burn|jalna|jala|blister/i.test(q)) matchedKey = 'burns';

      if (matchedKey && MEDICAL_KNOWLEDGE[matchedKey]) {
        const med = MEDICAL_KNOWLEDGE[matchedKey];
        category = 'medical_condition';

        if (isHindi) {
          answer = `### 🩺 ${med.title} - Jankari & First Aid:\n\n`;
          answer += `**📌 Kaaran (Causes):** ${med.causes}\n\n`;
          answer += `**🔍 Lakshyan (Symptoms):** ${med.symptoms}\n\n`;
          answer += `**🏠 Gharelu Dekhbhal & Upchaar (Home Care):**\n`;
          med.homeCare.forEach(h => {
            answer += `- ${h}\n`;
          });
          answer += `\n**⚠️ Khatre Ke Sanket (Emergency Red Flags):** ${med.redFlags}\n\n`;
          answer += `👨‍⚕️ **Paramarsh Specialist:** ${med.specialist}\n\n`;
          answer += `*⚕️ Disclaimer: Yeh jankari keval sahayata ke liye hai. Gambhir sthiti me turant doctor se consult karein.*`;
        } else {
          answer = `### 🩺 ${med.title} - Clinical Guide & Care:\n\n`;
          answer += `**📌 Primary Causes:** ${med.causes}\n\n`;
          answer += `**🔍 Key Symptoms:** ${med.symptoms}\n\n`;
          answer += `**🏠 Recommended Home Care & First Aid:**\n`;
          med.homeCare.forEach(h => {
            answer += `- ${h}\n`;
          });
          answer += `\n**⚠️ Emergency Red Flags (Seek Immediate Care):** ${med.redFlags}\n\n`;
          answer += `👨‍⚕️ **Recommended Specialist:** ${med.specialist}\n\n`;
          answer += `*⚕️ Clinical Disclaimer: This information is for educational assistance. Always consult a qualified physician for personalized diagnosis and prescription.*`;
        }
        suggestions = ['Available Doctors for this', 'Hospital Ward & Bed Status', 'Book Appointment'];
      } else {
        // General AI Medical Query Response
        category = 'general_medical';
        if (isHindi) {
          answer = `### 🩺 CareSync AI Medical Assistant:\n\n`;
          answer += `Aapne pucha: *"${query}"*\n\n`;
          answer += `**📌 Swasthya Margdarshan & Sujhav:**\n`;
          answer += `1. **Pani & Hydration:** Din me 2.5 se 3 liter saaf paani piyein aur poshtik aahar lein.\n`;
          answer += `2. **Aaram:** Sharir ko pura aaram dein aur bhari physical stress se bachein.\n`;
          answer += `3. **Niyamit Dawa:** Bina doctor ki salah ke koi bhi heavy antibiotics ya steroid na lein.\n`;
          answer += `4. **Lakshano par Nazar:** Agar takleef 48 ghante se jyada rahe ya tez dard ho, toh turant specialist se consult karein.\n\n`;
          answer += `🏥 **CareSync Hospital Me Suvidha:**\n`;
          answer += `- Hamare paas sabhi bimariyon ke top specialist doctors uplabdh hain.\n`;
          answer += `- 24/7 Trauma ER & ICU Critical Care units active hain.\n\n`;
          answer += `*⚕️ Kripya kisi bhi dawa ko shuru karne se pehle hamare doctor se paramarsh lein.*`;
        } else {
          answer = `### 🩺 CareSync AI Health Assistant:\n\n`;
          answer += `Regarding your query: *"${query}"*\n\n`;
          answer += `**📌 Recommended Health Guidance:**\n`;
          answer += `1. **Hydration & Nutrition:** Maintain adequate fluid intake and consume a balanced, easily digestible diet.\n`;
          answer += `2. **Adequate Rest:** Allow the body sufficient sleep and avoid strenuous exertion.\n`;
          answer += `3. **Avoid Self-Medication:** Do not take prescription antibiotics or strong painkillers without a doctor's evaluation.\n`;
          answer += `4. **Monitoring:** If symptoms persist for more than 48 hours or worsen, seek professional medical consultation.\n\n`;
          answer += `🏥 **CareSync Hospital Resources Available:**\n`;
          answer += `- 24/7 Emergency ER, ICU life support, and multi-specialty consultation.\n`;
          answer += `- You can book an appointment with our specialist doctors directly via the portal.\n\n`;
          answer += `*⚕️ Clinical Disclaimer: This AI assistant provides general information and does not replace in-person clinical diagnosis.*`;
        }
        suggestions = ['Available Doctors', 'Ward Bed Status', 'Emergency SOS Passport'];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        answer,
        category,
        suggestions,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get contextual AI prompt suggestions by role
// @route   GET /api/ai/suggestions
// @access  Public
const getAISuggestions = async (req, res, next) => {
  try {
    const suggestions = [
      { id: '1', label: '🤒 Fever & Infection Care', query: 'What to do in high fever and body ache?' },
      { id: '2', label: '👨‍⚕️ Available Doctors', query: 'Which doctors are currently available at the hospital?' },
      { id: '3', label: '🛏️ Ward Bed Availability', query: 'How many beds and ICU units are currently available?' },
      { id: '4', label: '💳 How to Pay Bills', query: 'How to pay hospital bill using mobile QR code?' },
      { id: '5', label: '🚨 Emergency SOS Passport', query: 'How does the Emergency Health Passport QR work?' },
      { id: '6', label: '🩸 Diabetes & Diet Tips', query: 'Give me healthy diet and blood sugar control tips' }
    ];

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleAIChat,
  getAISuggestions
};
