/**
 * CareSync Clinical Voice NLP Parser
 * Extracts structured medical data from doctor's natural speech dictation
 */

// Common generic and branded drugs list for entity recognition
const KNOWN_DRUGS = [
  'Paracetamol', 'Dolo', 'Dolo 650', 'Amoxicillin', 'Augmentin', 'Azithromycin',
  'Metformin', 'Glycomet', 'Pantoprazole', 'Pan 40', 'Omeprazole', 'Cetirizine',
  'Atorvastatin', 'Rosuvastatin', 'Telmisartan', 'Amlodipine', 'Ibuprofen', 'Combiflam',
  'Ciprofloxacin', 'Ofloxacin', 'Levofloxacin', 'Montelukast', 'Aceclofenac',
  'Tramadol', 'Metoprolol', 'Losartan', 'Spironolactone', 'Warfarin', 'Aspirin',
  'Ecosprin', 'Clopidogrel', 'Cefixime', 'Ceftriaxone', 'Doxycycline', 'Ranitidine',
  'ORS Solution', 'B-Complex', 'Vitamin D3', 'Multivitamin', 'Zincovit'
];

/**
 * Parses raw speech transcript into structured clinical prescription fields
 * @param {string} text - Raw speech dictation transcript
 * @returns {object} Structured prescription payload
 */
export const parseClinicalDictation = (text = '') => {
  if (!text || typeof text !== 'string') {
    return {
      diagnosis: '',
      symptoms: '',
      medicines: [],
      tests: [],
      advice: '',
    };
  }

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. EXTRACT DIAGNOSIS
  let diagnosis = '';
  const diagMatch = raw.match(/(?:diagnosis(?:\s+is)?|diagnosed(?:\s+with)?|patient(?:\s+has|\s+presents\s+with|\s+suffering\s+from))\s+([a-zA-Z0-9\s,-]+?)(?=(?:\.|\b(?:prescribe|medicines|symptoms|advice|recommend|tests|rx)\b|$))/i);
  if (diagMatch && diagMatch[1]) {
    diagnosis = diagMatch[1].trim().replace(/^[:\s-]+|[:\s-]+$/g, '');
  }

  // 2. EXTRACT SYMPTOMS
  let symptoms = '';
  const sympMatch = raw.match(/(?:symptoms(?:\s+are|\s+include)?|complaining\s+of|complains\s+of|presented\s+with)\s+([a-zA-Z0-9\s,-]+?)(?=(?:\.|\b(?:diagnosis|prescribe|medicines|advice|recommend|tests|rx)\b|$))/i);
  if (sympMatch && sympMatch[1]) {
    symptoms = sympMatch[1].trim().replace(/^[:\s-]+|[:\s-]+$/g, '');
  } else if (!diagnosis && (lower.includes('fever') || lower.includes('cough') || lower.includes('pain') || lower.includes('headache'))) {
    symptoms = raw.split(/(?:prescribe|medicine|give|tab|tablet)/i)[0]?.trim() || '';
  }

  // 3. EXTRACT MEDICINES
  const medicines = [];
  
  // Split into sentences or clauses
  const clauses = raw.split(/(?:,|\.|\band\b|\balso\b|\bthen\b)/i);

  // Helper to extract frequency
  const extractFrequency = (str) => {
    const s = str.toLowerCase();
    if (s.includes('1-1-1') || s.includes('three times') || s.includes('thrice') || s.includes('tds')) return 'Three times daily (1-1-1)';
    if (s.includes('1-0-1') || s.includes('two times') || s.includes('twice') || s.includes('bd') || s.includes('bid')) return 'Twice daily (1-0-1)';
    if (s.includes('0-0-1') || s.includes('once at night') || s.includes('before sleep') || s.includes('bedtime') || s.includes('hs')) return 'Once at night (0-0-1)';
    if (s.includes('1-0-0') || s.includes('once daily morning') || s.includes('in the morning')) return 'Once in morning (1-0-0)';
    if (s.includes('once daily') || s.includes('once a day') || s.includes('od')) return 'Once daily (0-0-1)';
    if (s.includes('sos') || s.includes('as needed') || s.includes('when required')) return 'As needed (SOS)';
    return 'Twice daily (1-0-1)';
  };

  // Helper to extract duration
  const extractDuration = (str) => {
    const match = str.match(/(\d+)\s*(days?|weeks?|months?)/i);
    if (match) return `${match[1]} ${match[2].toLowerCase()}`;
    return '5 days';
  };

  // Helper to extract instructions
  const extractInstructions = (str) => {
    const s = str.toLowerCase();
    if (s.includes('before meals') || s.includes('before food') || s.includes('empty stomach') || s.includes('before breakfast')) return 'Before meals / Empty stomach';
    if (s.includes('after meals') || s.includes('after food') || s.includes('with food')) return 'After meals';
    if (s.includes('with water') || s.includes('warm water')) return 'With warm water';
    return 'After meals';
  };

  // Helper to extract dosage
  const extractDosage = (str) => {
    const match = str.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|ml|gm|g|iu|units?|tablets?|capsules?|drops?)/i);
    if (match) return `${match[1]}${match[2].toLowerCase()}`;
    return '1 tablet';
  };

  // Search for drug occurrences
  for (const drug of KNOWN_DRUGS) {
    const regex = new RegExp(`\\b${drug}\\b`, 'i');
    if (regex.test(raw)) {
      // Find matching context around this drug
      const matchIdx = raw.search(regex);
      const subContext = raw.substring(matchIdx, Math.min(raw.length, matchIdx + 120));

      const dosage = extractDosage(subContext);
      const frequency = extractFrequency(subContext);
      const duration = extractDuration(subContext);
      const instructions = extractInstructions(subContext);

      // Avoid duplicates
      if (!medicines.some(m => m.name.toLowerCase() === drug.toLowerCase())) {
        medicines.push({
          name: drug,
          dosage,
          frequency,
          duration,
          instructions,
        });
      }
    }
  }

  // Fallback generic pattern if no known drug was found in dictionary
  if (medicines.length === 0) {
    const genericMeds = raw.match(/(?:prescribe|give|tab|tablet|cap|capsule|syrup)\s+([A-Za-z0-9\s]+?)(?=(?:for\s+\d+|once|twice|thrice|\.|\band\b|$))/gi);
    if (genericMeds) {
      genericMeds.forEach((item) => {
        const clean = item.replace(/(?:prescribe|give|tab|tablet|cap|capsule|syrup)\s+/i, '').trim();
        if (clean.length > 2) {
          medicines.push({
            name: clean.split(' ')[0],
            dosage: extractDosage(clean),
            frequency: extractFrequency(clean),
            duration: extractDuration(clean),
            instructions: extractInstructions(clean),
          });
        }
      });
    }
  }

  // 4. EXTRACT LAB TESTS
  const tests = [];
  const testKeywords = [
    'CBC', 'Complete Blood Count', 'Blood Test', 'Lipid Profile', 'Liver Function Test', 'LFT',
    'Kidney Function Test', 'KFT', 'Chest X-Ray', 'X-Ray', 'ECG', 'Electrocardiogram',
    'HbA1c', 'Blood Sugar Test', 'Urine Routine', 'Thyroid Profile', 'Ultrasound', 'CT Scan'
  ];

  testKeywords.forEach((test) => {
    if (new RegExp(`\\b${test}\\b`, 'i').test(raw)) {
      if (!tests.includes(test)) tests.push(test);
    }
  });

  // 5. EXTRACT DIET & ADVICE
  let advice = '';
  const advMatch = raw.match(/(?:advice|recommend|counseling|suggested|diet|instructions?)\s*[:\s]+([a-zA-Z0-9\s,.-]+?)(?=$)/i);
  if (advMatch && advMatch[1]) {
    advice = advMatch[1].trim().replace(/^[:\s-]+|[:\s-]+$/g, '');
  } else {
    advice = 'Take prescribed medication on schedule, maintain proper hydration, and get adequate rest.';
  }

  return {
    diagnosis: diagnosis || (symptoms ? `Acute ${symptoms}` : ''),
    symptoms: symptoms || '',
    medicines: medicines.length > 0 ? medicines : [
      { name: '', dosage: '1 tablet', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'After meals' }
    ],
    tests,
    advice,
  };
};

/**
 * Pre-defined realistic clinical dictation scenarios for 1-click test drive
 */
export const SAMPLE_DICTATIONS = [
  {
    title: '🤒 Acute Viral Pharyngitis & High Fever',
    transcript: 'Patient Rahul presents with high fever, sore throat and dry cough for 3 days. Diagnosis is acute viral pharyngitis. Prescribe Paracetamol 650mg twice daily after food for 5 days, and Azithromycin 500mg once daily after dinner for 3 days, and Pantoprazole 40mg once in morning before meals for 5 days. Advise Complete Blood Count test. Advice: Drink plenty of warm fluids, do salt water gargles twice a day and take complete bed rest.',
  },
  {
    title: '🩸 Type-2 Diabetes & Hypertension Regimen',
    transcript: 'Patient has long standing Type 2 Diabetes Mellitus and essential Hypertension. Prescribe Metformin 500mg twice daily with meals for 30 days, and Telmisartan 40mg once daily in the morning for 30 days, and Atorvastatin 10mg once at night for 30 days. Recommend HbA1c and Lipid Profile tests. Advice: Follow strict low glycemic diabetic diet, reduce sodium intake, and walk 30 minutes daily.',
  },
  {
    title: '🫁 Acute Bronchitis with Wheezing',
    transcript: 'Patient complains of chest congestion, productive cough and breathlessness. Diagnosis is acute bronchitis. Prescribe Amoxicillin 500mg three times daily after food for 7 days, and Montelukast 10mg once at night for 10 days, and Cetirizine 10mg as needed for allergies. Recommend Chest X-Ray. Advice: Avoid cold drinks and dust exposure, use steam inhalation twice daily.',
  },
];
