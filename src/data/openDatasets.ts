export interface HfrFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Lab' | 'Pharmacy';
  state: string;
  district: string;
  ownership: 'Public' | 'Private';
  licenseNumber: string;
  rating: number;
  isOpen: boolean;
  emergencyBeds: number;
  phone: string;
  address: string;
  facilities: string[];
  x: number; // relative map placement coordinates (0-100)
  y: number; // relative map placement coordinates (0-100)
}

export interface DiseaseMapping {
  symptoms: string[];
  condition: string;
  severity: 'Low' | 'Moderate' | 'Urgent';
  specialist: string;
  confidence: number;
  description: string;
  precautions: string[];
  clinicalNote: string;
}

// ABDM Health Facility Registry representation populated with real-world Indian medical centers
export const abdmHfrFacilities: HfrFacility[] = [
  {
    id: 'hfr-1',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    type: 'Hospital',
    state: 'Delhi',
    district: 'New Delhi',
    ownership: 'Public',
    licenseNumber: 'HFR-DL-2022-00453',
    rating: 4.9,
    isOpen: true,
    emergencyBeds: 45,
    phone: '+91-11-26588500',
    address: 'Ansari Nagar, New Delhi - 110029',
    facilities: ['24/7 ICU & Trauma Care', 'Organ Transplant Unit', 'Pediatrics Division', 'CT & MRI Diagnostics'],
    x: 40,
    y: 35
  },
  {
    id: 'hfr-2',
    name: 'Safdarjung Hospital & Vardhman Mahavir Medical College',
    type: 'Hospital',
    state: 'Delhi',
    district: 'New Delhi',
    ownership: 'Public',
    licenseNumber: 'HFR-DL-2022-01994',
    rating: 4.4,
    isOpen: true,
    emergencyBeds: 30,
    phone: '+91-11-26730000',
    address: 'Ansari Nagar East, New Delhi - 110029',
    facilities: ['Burns & Plastic Surgery', '24/7 Emergency Wing', 'Maternity Triage Unit', 'Blood Bank'],
    x: 35,
    y: 30
  },
  {
    id: 'hfr-3',
    name: 'Fortis Hiranandani Hospital',
    type: 'Hospital',
    state: 'Maharashtra',
    district: 'Mumbai Suburbs',
    ownership: 'Private',
    licenseNumber: 'HFR-MH-2023-99882',
    rating: 4.8,
    isOpen: true,
    emergencyBeds: 18,
    phone: '+91-22-68846100',
    address: 'Mini Sea Shore Road, Sector 10, Vashi, Navi Mumbai - 400703',
    facilities: ['Cardiac Cath Lab', 'Coronary ICU', '24/7 Stroke Management', 'Ambulance Dispatch'],
    x: 75,
    y: 20
  },
  {
    id: 'hfr-4',
    name: 'King Edward Memorial (KEM) Hospital',
    type: 'Hospital',
    state: 'Maharashtra',
    district: 'Mumbai City',
    ownership: 'Public',
    licenseNumber: 'HFR-MH-2021-00344',
    rating: 4.5,
    isOpen: true,
    emergencyBeds: 25,
    phone: '+91-22-24107000',
    address: 'Acharya Donde Marg, Parel, Mumbai - 400012',
    facilities: ['Outpatient Department', 'General ICU Services', 'Infectious Disease Triage', 'Dialysis Hub'],
    x: 80,
    y: 25
  },
  {
    id: 'hfr-5',
    name: 'Manipal Hospital Bengaluru',
    type: 'Hospital',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    ownership: 'Private',
    licenseNumber: 'HFR-KA-2022-88112',
    rating: 4.8,
    isOpen: true,
    emergencyBeds: 22,
    phone: '+91-80-25024444',
    address: '98 HAL Airport Road, Kodihalli, Bengaluru - 560017',
    facilities: ['Neurology ICU', 'Emergency Cardiac Care', 'Neonatal ICU', 'Advanced Pathology'],
    x: 25,
    y: 65
  },
  {
    id: 'hfr-6',
    name: 'National Institute of Mental Health and Neurosciences (NIMHANS)',
    type: 'Hospital',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    ownership: 'Public',
    licenseNumber: 'HFR-KA-2021-00211',
    rating: 4.9,
    isOpen: true,
    emergencyBeds: 15,
    phone: '+91-80-26995000',
    address: 'Hosur Road, Lakkasandra, Wilson Garden, Bengaluru - 560029',
    facilities: ['Neurological ICU', 'Psychiatric Emergency Care', 'EEG & Sleep Laboratories', 'Stroke Unit'],
    x: 30,
    y: 70
  },
  {
    id: 'hfr-7',
    name: 'Apollo Hospitals Greams Road',
    type: 'Hospital',
    state: 'Tamil Nadu',
    district: 'Chennai',
    ownership: 'Private',
    licenseNumber: 'HFR-TN-2022-77443',
    rating: 4.7,
    isOpen: true,
    emergencyBeds: 20,
    phone: '+91-44-28290200',
    address: '21 Greams Lane, Off Greams Road, Chennai - 600006',
    facilities: ['Interventional Cardiology', 'Organ Transplant Program', 'Trauma ER', 'Robotic Surgery'],
    x: 85,
    y: 75
  },
  {
    id: 'hfr-8',
    name: 'Seth Sukhlal Karnani Memorial (SSKM) Hospital',
    type: 'Hospital',
    state: 'West Bengal',
    district: 'Kolkata',
    ownership: 'Public',
    licenseNumber: 'HFR-WB-2021-09831',
    rating: 4.3,
    isOpen: true,
    emergencyBeds: 28,
    phone: '+91-33-22235000',
    address: '244 Acharya Jagadish Chandra Bose Road, Kolkata - 700020',
    facilities: ['Critical Care Medicine', 'Neonatal ICU', 'Trauma Surgery Center', 'Therapeutic Dialysis'],
    x: 15,
    y: 25
  },
  {
    id: 'hfr-9',
    name: 'Apollo Diagnostics Lab',
    type: 'Lab',
    state: 'Delhi',
    district: 'New Delhi',
    ownership: 'Private',
    licenseNumber: 'HFR-DL-2023-LAB88',
    rating: 4.6,
    isOpen: true,
    emergencyBeds: 0,
    phone: '+91-11-40405050',
    address: 'Sector 5, Dwarka, New Delhi - 110075',
    facilities: ['NABL Accredited Tests', 'Home Collection Service', 'Lipid & Thyroid Profiling', 'CBC Testing'],
    x: 45,
    y: 40
  },
  {
    id: 'hfr-10',
    name: 'Apollo Pharmacy Store',
    type: 'Pharmacy',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    ownership: 'Private',
    licenseNumber: 'HFR-KA-2023-PHR11',
    rating: 4.7,
    isOpen: true,
    emergencyBeds: 0,
    phone: '+91-80-45671122',
    address: 'Koramangala 4th Block, Bengaluru - 560034',
    facilities: ['24-Hour Medicines', 'Prescription Verification', 'Vaccines Storage', 'Medical Devices'],
    x: 20,
    y: 60
  }
];

// Indian Healthcare Symptom-Disease Mapping Database
export const indianSymptomDiseaseMappings: DiseaseMapping[] = [
  {
    symptoms: ['sudden high fever', 'joint pain', 'muscle pain', 'severe headache', 'retro-orbital pain', 'eye pain', 'skin rash', 'bleeding gums'],
    condition: 'Dengue Hemorrhagic Fever',
    severity: 'Urgent',
    specialist: 'General Physician / Infectious Diseases Specialist',
    confidence: 94,
    description: 'A mosquito-borne viral disease caused by the Aedes aegypti mosquito, highly prevalent in post-monsoon months in India. Causes severe drop in blood platelet counts.',
    precautions: [
      'Monitor platelet counts daily (Complete Blood Count test).',
      'Stay completely hydrated - drink ORS, coconut water, or fresh fluids.',
      'Take paracetamol for fever control.',
      'Seek immediate emergency care if bleeding symptoms or persistent vomiting occurs.'
    ],
    clinicalNote: '⚠️ CLINICAL CONTRAINDICATION: Do NOT administer Aspirin, Ibuprofen, or other NSAIDs under any circumstances, as they significantly amplify internal bleeding and hemorrhagic risks.'
  },
  {
    symptoms: ['high fever', 'chills', 'shivering', 'profuse sweating', 'headache', 'body ache', 'nausea', 'vomiting', 'fatigue'],
    condition: 'Malaria (Plasmodium falciparum/vivax)',
    severity: 'Urgent',
    specialist: 'General Physician / Internal Medicine Specialist',
    confidence: 92,
    description: 'An infectious disease transmitted by the female Anopheles mosquito, common across tropical regions in India. Vivax causes cyclical fever relapses while falciparum is potentially cerebral.',
    precautions: [
      'Complete a blood smear examination (thick and thin films) for parasite detection.',
      'Take prescribed anti-malarial therapies (e.g. ACT or Chloroquine) as scheduled.',
      'Sleep under insecticide-treated bed nets.',
      'Ensure complete bed rest and stay hydrated.'
    ],
    clinicalNote: '⚠️ CLINICAL WARNING: Severe falciparum malaria can trigger jaundice, acute renal failure, and cerebral malaria (delirium or seizures), requiring immediate IV anti-malarial hospital therapies.'
  },
  {
    symptoms: ['sustained high fever', 'step ladder fever', 'abdominal pain', 'stomach ache', 'constipation', 'diarrhea', 'headache', 'rose colored spots', 'extreme fatigue'],
    condition: 'Enteric Fever (Typhoid)',
    severity: 'Moderate',
    specialist: 'Gastroenterologist / Internal Medicine',
    confidence: 88,
    description: 'A bacterial infection caused by Salmonella typhi, contracted through contaminated food or drinking water. Common in urban and semi-urban Indian populations with sanitation gaps.',
    precautions: [
      'Perform a Widal test or blood culture for diagnostic confirmation.',
      'Stick to a bland, soft, non-spicy diet (rice, curd, soft bananas).',
      'Complete the entire course of prescribed antibiotics to prevent relapses or chronic carriage.',
      'Drink strictly boiled or bottled drinking water.'
    ],
    clinicalNote: '⚠️ CLINICAL WARNING: Untreated enteric fever can cause intestinal perforation or severe hemorrhages after the second week of fever, requiring urgent surgical triage.'
  },
  {
    symptoms: ['prolonged cough', 'cough with bloody sputum', 'chest pain', 'low grade fever', 'night sweats', 'unexplained weight loss', 'fatigue', 'loss of appetite'],
    condition: 'Pulmonary Tuberculosis (TB)',
    severity: 'Urgent',
    specialist: 'Pulmonologist / Chest Specialist',
    confidence: 90,
    description: 'A bacterial disease caused by Mycobacterium tuberculosis, spreading via respiratory aerosols. India accounts for the largest share of global TB cases. Targeted by the national NTEP scheme.',
    precautions: [
      'Undergo a sputum acid-fast bacilli (AFB) smear and GeneXpert diagnostic test.',
      'Enroll in the national DOTS therapy scheme (Directly Observed Therapy).',
      'Wear masks and practice respiratory hygiene to protect family members.',
      'Maintain nutritional intake with protein-rich supplements.'
    ],
    clinicalNote: '⚠️ CLINICAL ADVISORY: Strict adherence to anti-tubercular medication (AKT) is mandatory. Incomplete therapies risk drug resistance (MDR/XDR-TB), which is complex and difficult to treat.'
  },
  {
    symptoms: ['shortness of breath', 'dry cough', 'high fever', 'sore throat', 'loss of smell', 'loss of taste', 'fatigue', 'runny nose', 'chest congestion'],
    condition: 'COVID-19 / Severe Acute Respiratory Infection (SARI)',
    severity: 'Moderate',
    specialist: 'Pulmonologist / General Physician',
    confidence: 89,
    description: 'An acute viral infection of the respiratory tract. Symptom overlaps between standard Influenza and COVID variants require rapid screening.',
    precautions: [
      'Monitor oxygen saturation (SpO2) using a pulse oximeter every 6 hours.',
      'Isolate immediately in a well-ventilated room.',
      'Perform an RT-PCR test or rapid antigen screening.',
      'Visit a hospital ER if SpO2 drops below 94% or chest pain worsens.'
    ],
    clinicalNote: '⚠️ CLINICAL WARNING: Rapid onset of acute respiratory distress syndrome (ARDS) is possible. Keep emergency numbers and ambulance dispatches ready.'
  },
  {
    symptoms: ['severe watery stool', 'rice water stools', 'vomiting', 'severe dehydration', 'muscle cramps', 'dry mouth', 'rapid heart rate', 'sunken eyes'],
    condition: 'Acute Cholera / Gastroenteritis',
    severity: 'Urgent',
    specialist: 'Gastroenterologist / General Physician',
    confidence: 91,
    description: 'A bacterial infection causing severe acute watery diarrhea, transmitted via fecal-oral contamination of water or food. Highly risk-prone during flooding seasons.',
    precautions: [
      'Administer Oral Rehydration Salts (ORS) continuously (one glass for every loose stool).',
      'Avoid solid foods until vomiting stops, then start soft, easily digestible fluids.',
      'Seek clinical evaluation for anti-microbial support and IV fluids.',
      'Ensure strict hand hygiene and food safety guidelines.'
    ],
    clinicalNote: '⚠️ CLINICAL CRITICAL: Acute cholera causes rapid dehydration and electrolyte collapse within hours. Unmanaged fluid loss in pediatric or geriatric patients is life-threatening.'
  }
];

// Helper to lookup diseases
export function matchDiseaseBySymptoms(inputQuery: string): DiseaseMapping | null {
  const query = inputQuery.toLowerCase().trim();
  
  // Scoring matches
  let bestMatch: DiseaseMapping | null = null;
  let highestScore = 0;

  for (const mapping of indianSymptomDiseaseMappings) {
    let score = 0;
    for (const symptom of mapping.symptoms) {
      if (query.includes(symptom)) {
        score += 1;
      }
    }

    if (score > highestScore && score >= 2) { // Need at least 2 matching symptom keywords
      highestScore = score;
      bestMatch = mapping;
    }
  }

  return bestMatch;
}
