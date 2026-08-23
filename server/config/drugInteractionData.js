// Clinical Knowledge Base for Drug Classes, Allergy Cross-Reactivity & Drug-Drug Interactions

const DRUG_CLASSES = {
  penicillins: {
    name: 'Penicillin Antibiotics',
    allergyKeys: ['penicillin', 'amoxicillin', 'ampicillin', 'penicillins', 'beta-lactam', 'augmentin'],
    drugs: ['amoxicillin', 'ampicillin', 'penicillin', 'augmentin', 'cloxacillin', 'piperacillin', 'amoxiclav'],
    severity: 'High',
    message: 'Patient has a documented Penicillin/Beta-lactam allergy. Prescribing this drug carries a high risk of severe hypersensitivity or anaphylaxis.',
  },
  sulfa: {
    name: 'Sulfonamides / Sulfa Drugs',
    allergyKeys: ['sulfa', 'sulfonamide', 'sulfonamides', 'bactrim', 'septra', 'sulfamethoxazole'],
    drugs: ['sulfamethoxazole', 'bactrim', 'septra', 'cotrimoxazole', 'sulfadiazine', 'sulfasalazine', 'trimethoprim-sulfamethoxazole'],
    severity: 'High',
    message: 'Patient has a documented Sulfa drug allergy. Prescribing sulfonamides can lead to severe cutaneous adverse reactions (SCARs/Stevens-Johnson syndrome).',
  },
  nsaids: {
    name: 'NSAIDs (Nonsteroidal Anti-inflammatory Drugs)',
    allergyKeys: ['nsaid', 'nsaids', 'aspirin', 'ibuprofen', 'diclofenac', 'naproxen'],
    drugs: ['ibuprofen', 'aspirin', 'diclofenac', 'naproxen', 'ketorolac', 'indomethacin', 'meloxicam', 'piroxicam', 'celecoxib', 'brufen', 'combiflam'],
    severity: 'High',
    message: 'Patient is allergic to NSAIDs/Aspirin. Risk of acute bronchospasm, urticaria, or angioedema.',
  },
  cephalosporins: {
    name: 'Cephalosporin Antibiotics',
    allergyKeys: ['cephalosporin', 'cephalexin', 'ceftriaxone', 'cefixime'],
    drugs: ['cephalexin', 'ceftriaxone', 'cefixime', 'cefuroxime', 'cefotaxime', 'cefepime'],
    severity: 'Moderate',
    message: 'Patient has documented Cephalosporin allergy or potential cross-sensitivity with Beta-lactams.',
  },
  macrolides: {
    name: 'Macrolide Antibiotics',
    allergyKeys: ['macrolide', 'erythromycin', 'azithromycin', 'clarithromycin'],
    drugs: ['azithromycin', 'erythromycin', 'clarithromycin', 'roxithromycin'],
    severity: 'Moderate',
    message: 'Patient has documented Macrolide allergy. Possible hypersensitivity reaction.',
  },
  fluoroquinolones: {
    name: 'Fluoroquinolones',
    allergyKeys: ['quinolone', 'fluoroquinolone', 'ciprofloxacin', 'levofloxacin'],
    drugs: ['ciprofloxacin', 'levofloxacin', 'ofloxacin', 'norfloxacin', 'moxifloxacin'],
    severity: 'Moderate',
    message: 'Patient is allergic to Fluoroquinolones.',
  },
};

const DRUG_DRUG_INTERACTIONS = [
  {
    pair: ['warfarin', 'aspirin'],
    severity: 'High',
    category: 'Hematologic / Bleeding Risk',
    description: 'Concurrent use of Warfarin with Aspirin dramatically amplifies major gastrointestinal and systemic bleeding risk.',
    recommendation: 'Avoid combination unless strictly monitored for target INR. Consider alternative analgesic like Paracetamol.',
  },
  {
    pair: ['warfarin', 'ibuprofen'],
    severity: 'High',
    category: 'Hematologic / Bleeding Risk',
    description: 'NSAIDs like Ibuprofen increase anticoagulant effect and cause GI mucosal damage when combined with Warfarin.',
    recommendation: 'Use Paracetamol/Acetaminophen for mild-to-moderate pain management.',
  },
  {
    pair: ['clopidogrel', 'omeprazole'],
    severity: 'Moderate',
    category: 'Efficacy Reduction',
    description: 'Omeprazole significantly reduces the antiplatelet bioactivation of Clopidogrel (CYP2C19 inhibition).',
    recommendation: 'Consider Pantoprazole or H2-blockers (e.g. Famotidine) as safer alternatives.',
  },
  {
    pair: ['metformin', 'contrast'],
    severity: 'High',
    category: 'Renal / Lactic Acidosis',
    description: 'Iodinated radiocontrast agents combined with Metformin can precipitate acute renal impairment and fatal lactic acidosis.',
    recommendation: 'Withhold Metformin 48 hours prior to and post contrast administration.',
  },
  {
    pair: ['lisinopril', 'spironolactone'],
    severity: 'High',
    category: 'Electrolyte Disorder',
    description: 'Concurrent ACE inhibitor (Lisinopril/Ramipril) and Potassium-sparing diuretic causes life-threatening Hyperkalemia.',
    recommendation: 'Monitor serum potassium and renal function closely.',
  },
  {
    pair: ['tramadol', 'fluoxetine'],
    severity: 'High',
    category: 'Central Nervous System',
    description: 'Combined serotonergic agents increase risk of Serotonin Syndrome and reduce seizure threshold.',
    recommendation: 'Avoid combination. Consider non-serotonergic analgesic regimens.',
  },
  {
    pair: ['amoxicillin', 'methotrexate'],
    severity: 'Moderate',
    category: 'Toxicity Amplification',
    description: 'Penicillins decrease the renal clearance of Methotrexate, elevating serum levels and bone marrow toxicity.',
    recommendation: 'Monitor complete blood count (CBC) and Methotrexate levels closely.',
  },
  {
    pair: ['ciprofloxacin', 'theophylline'],
    severity: 'High',
    category: 'Metabolic Toxicity',
    description: 'Ciprofloxacin inhibits Theophylline clearance by up to 50%, risking cardiac arrhythmias and neurotoxicity.',
    recommendation: 'Reduce Theophylline dose or use an alternative non-quinolone antibiotic.',
  },
];

/**
 * Check a list of prescribed medicines against patient allergies and other medicines
 */
const evaluatePrescriptionSafety = (patientAllergies = [], proposedMedicines = []) => {
  const allergyWarnings = [];
  const interactionWarnings = [];

  const normalizedAllergies = (patientAllergies || []).map((a) => a.toLowerCase().trim());
  const cleanMedicineNames = proposedMedicines
    .map((m) => (typeof m === 'string' ? m : m.name || ''))
    .filter(Boolean)
    .map((m) => m.toLowerCase().trim());

  // 1. Evaluate Allergy Conflicts
  cleanMedicineNames.forEach((medStr) => {
    // Check against each drug class
    Object.values(DRUG_CLASSES).forEach((drugClass) => {
      const isMatchDrug = drugClass.drugs.some((d) => medStr.includes(d) || d.includes(medStr));

      if (isMatchDrug) {
        const isAllergic = normalizedAllergies.some((allergy) =>
          drugClass.allergyKeys.some((k) => allergy.includes(k) || k.includes(allergy))
        );

        if (isAllergic) {
          if (!allergyWarnings.some((w) => w.medicine.toLowerCase() === medStr)) {
            allergyWarnings.push({
              medicine: medStr,
              drugClass: drugClass.name,
              severity: drugClass.severity,
              patientAllergy: patientAllergies.join(', '),
              message: drugClass.message,
            });
          }
        }
      }
    });

    // Also direct string match against allergies
    normalizedAllergies.forEach((allergy) => {
      if (allergy && (medStr.includes(allergy) || allergy.includes(medStr))) {
        if (!allergyWarnings.some((w) => w.medicine.toLowerCase() === medStr)) {
          allergyWarnings.push({
            medicine: medStr,
            drugClass: 'Direct Allergen Match',
            severity: 'High',
            patientAllergy: allergy,
            message: `Patient has a specific documented allergy to "${allergy}".`,
          });
        }
      }
    });
  });

  // 2. Evaluate Drug-to-Drug Interactions
  for (let i = 0; i < cleanMedicineNames.length; i++) {
    for (let j = i + 1; j < cleanMedicineNames.length; j++) {
      const medA = cleanMedicineNames[i];
      const medB = cleanMedicineNames[j];

      DRUG_DRUG_INTERACTIONS.forEach((interaction) => {
        const [key1, key2] = interaction.pair;
        const matches1 = (medA.includes(key1) && medB.includes(key2)) || (medA.includes(key2) && medB.includes(key1));

        if (matches1) {
          interactionWarnings.push({
            drugs: [medA, medB],
            pair: interaction.pair,
            severity: interaction.severity,
            category: interaction.category,
            description: interaction.description,
            recommendation: interaction.recommendation,
          });
        }
      });
    }
  }

  const isSafe = allergyWarnings.length === 0 && interactionWarnings.length === 0;

  return {
    isSafe,
    allergyWarningsCount: allergyWarnings.length,
    interactionWarningsCount: interactionWarnings.length,
    allergyWarnings,
    interactionWarnings,
    checkedAt: new Date().toISOString(),
  };
};

module.exports = {
  DRUG_CLASSES,
  DRUG_DRUG_INTERACTIONS,
  evaluatePrescriptionSafety,
};
