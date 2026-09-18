const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Hospital = require('../models/Hospital');

// Hospital name templates for districts/cities
const HOSPITAL_TEMPLATES = [
  '{district} District Civil Hospital & Trauma Centre',
  '{city} Super Specialty Hospital & Research Institute',
  'Sanjeevani Multi-Specialty Hospital, {city}',
  '{district} Apex Institute of Medical Sciences',
  'LifeLine Emergency & Critical Care Hospital, {city}',
  '{city} City General Hospital',
  'Apollo Health & Multi-Specialty Clinic, {city}',
  'Fortis Escorts Care Centre, {city}',
  'Max Healthcare Multi-Specialty, {district}',
  'Medanta Heart & Emergency Institute, {city}',
  '{district} Community Health & Trauma Centre',
  'Sunrise Multi-Specialty Hospital, {city}',
  'CareSync Apex Hospital, {city}',
  '{city} Medical College & Associated Hospital',
  'Holy Cross Multi-Specialty Hospital, {district}',
];

const DEPARTMENTS_LIST = [
  ['Emergency Medicine', 'General Surgery', 'Cardiology', 'Orthopedics', 'Pediatrics'],
  ['Emergency Medicine', 'Neurology', 'Cardiology', 'Pulmonology', 'Intensive Care'],
  ['Emergency Medicine', 'Pediatrics', 'Obstetrics & Gynecology', 'General Medicine'],
  ['Emergency Medicine', 'Cardiology', 'Orthopedics', 'Nephrology', 'Dermatology'],
  ['Emergency Medicine', 'Oncology', 'General Surgery', 'Radiology', 'Pathology'],
];

const parseCsvSimple = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(obj);
  }
  return rows;
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedKaggleData = async () => {
  try {
    await connectDB();
    console.log('🔗 Connected to MongoDB Atlas');

    const anonymizedPath = path.resolve(__dirname, '../../data/kaggle_hospitals/Hospitals In India (Anonymized).csv');
    const namedPath = path.resolve(__dirname, '../../data/kaggle_hospitals_named/HospitalsInIndia.csv');

    console.log('📖 Reading Kaggle datasets...');
    const anonymizedRows = parseCsvSimple(anonymizedPath);
    const namedRows = parseCsvSimple(namedPath);

    console.log(`📊 Found ${anonymizedRows.length} rows with coordinates, and ${namedRows.length} named hospitals.`);

    // Group named hospitals by city lowercase
    const namedByCity = new Map();
    for (const h of namedRows) {
      const cityKey = (h.City || '').trim().toLowerCase();
      if (!namedByCity.has(cityKey)) {
        namedByCity.set(cityKey, []);
      }
      namedByCity.get(cityKey).push(h);
    }

    const hospitalDocs = [];
    const usedNames = new Set();

    let nameIndex = 0;
    for (const row of anonymizedRows) {
      const lat = parseFloat(row.Latitude);
      const lng = parseFloat(row.Longitude);

      // Validate India coordinate boundaries
      if (isNaN(lat) || isNaN(lng) || lat < 6.0 || lat > 38.0 || lng < 68.0 || lng > 98.0) {
        continue;
      }

      const city = (row.City || 'New Delhi').trim();
      const state = (row.State || 'Delhi').trim();
      const district = (row.District || city).trim();

      // Find real hospital name or format realistic template
      let hospitalName = '';
      const cityKey = city.toLowerCase();
      if (namedByCity.has(cityKey) && namedByCity.get(cityKey).length > 0) {
        const candidate = namedByCity.get(cityKey).shift();
        if (candidate.Hospital && !usedNames.has(candidate.Hospital)) {
          hospitalName = candidate.Hospital.trim();
        }
      }

      if (!hospitalName) {
        const template = HOSPITAL_TEMPLATES[nameIndex % HOSPITAL_TEMPLATES.length];
        nameIndex++;
        hospitalName = template.replace('{city}', city).replace('{district}', district);
        if (usedNames.has(hospitalName)) {
          hospitalName = `${hospitalName} - Unit ${Math.floor(nameIndex / HOSPITAL_TEMPLATES.length) + 1}`;
        }
      }

      usedNames.add(hospitalName);

      const rating = parseFloat(row.Rating) || (4.0 + Math.random() * 0.9);
      const reviews = parseInt(row['Number of Reviews'], 10) || getRandomInt(50, 800);

      const genTotal = getRandomInt(40, 220);
      const genAvail = getRandomInt(5, Math.floor(genTotal * 0.45));

      const icuTotal = getRandomInt(10, 45);
      const icuAvail = getRandomInt(1, Math.floor(icuTotal * 0.4));

      const emTotal = getRandomInt(6, 25);
      const emAvail = getRandomInt(1, Math.floor(emTotal * 0.5));

      // Freshness: between 3 and 75 minutes ago
      const minutesAgo = getRandomInt(3, 75);
      const lastUpdate = new Date(Date.now() - minutesAgo * 60 * 1000);

      const slug = hospitalName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 18);

      hospitalDocs.push({
        name: hospitalName,
        email: `info.${slug || 'hospital'}.${getRandomInt(100, 999)}@caresync.org`,
        phone: `+91 ${getRandomInt(70000, 99999)} ${getRandomInt(10000, 99999)}`,
        emergencyPhone: `+91 ${getRandomInt(70000, 99999)} ${getRandomInt(10000, 99999)}`,
        address: `${district}, ${city}, ${state}`,
        city: city,
        state: state,
        pincode: `${getRandomInt(110001, 850000)}`,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        hospitalType: getRandomInt(0, 3) === 0 ? 'District Hospital' : 'Super-Specialty Hospital',
        verificationStatus: 'VERIFIED',
        emergencyAvailable: Math.random() > 0.1, // 90% have 24/7 emergency
        ambulanceAvailable: true,
        bloodBankAvailable: Math.random() > 0.25,
        pharmacyAvailable: true,
        diagnosticAvailable: true,
        operatingHours: '24/7 Emergency & Trauma Services',
        departments: DEPARTMENTS_LIST[getRandomInt(0, DEPARTMENTS_LIST.length - 1)],
        capacitySummary: {
          general: { total: genTotal, available: genAvail },
          icu: { total: icuTotal, available: icuAvail },
          emergency: { total: emTotal, available: emAvail },
        },
        rating: Math.min(5, Math.max(3.5, parseFloat(rating.toFixed(1)))),
        totalReviews: reviews,
        lastStatusUpdate: lastUpdate,
      });
    }

    console.log(`🚀 Prepared ${hospitalDocs.length} valid Indian hospitals across ${namedByCity.size} cities.`);

    // Keep existing hospitals that have appointments or references, but avoid duplicates by name
    const existingHospitals = await Hospital.find({}, 'name').lean();
    const existingNameSet = new Set(existingHospitals.map((h) => h.name.toLowerCase().trim()));

    const toInsert = hospitalDocs.filter((h) => !existingNameSet.has(h.name.toLowerCase().trim()));
    console.log(`📦 Filtering duplicates: ${toInsert.length} new hospitals will be inserted.`);

    // Batch insert in chunks of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);
      await Hospital.insertMany(chunk, { ordered: false });
      console.log(`✅ Seeded batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(toInsert.length / CHUNK_SIZE)} (${chunk.length} hospitals)`);
    }

    const totalInDb = await Hospital.countDocuments();
    console.log(`🎉 Seeding complete! Total hospitals now in MongoDB Atlas: ${totalInDb}`);

    // Ensure 2dsphere index is created
    await Hospital.collection.createIndex({ location: '2dsphere' });
    console.log('📍 2dsphere spatial index verified.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedKaggleData();
