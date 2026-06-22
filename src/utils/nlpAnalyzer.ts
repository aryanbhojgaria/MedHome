export interface AnalysisResult {
  condition: string;
  severity: 'Low' | 'Moderate' | 'Urgent';
  specialist: string;
  confidence: number;
  precautions: string[];
  description: string;
}

export function analyzeSymptoms(text: string): AnalysisResult {
  const query = text.toLowerCase().trim();

  // Urgent / Cardiac cases
  if (
    query.includes('chest pain') ||
    query.includes('heart') ||
    query.includes('cardiac') ||
    query.includes('chest pressure') ||
    query.includes('left arm pain') ||
    query.includes('angina')
  ) {
    return {
      condition: 'Acute Cardiovascular Episode / Angina',
      severity: 'Urgent',
      specialist: 'Cardiologist',
      confidence: 96,
      description: 'The description of chest pain or cardiovascular distress suggests potential myocardial ischemia or cardiovascular pressure. Immediate medical evaluation is critical.',
      precautions: [
        'Rest immediately - stop all physical activity.',
        'Sit upright to ease respiration.',
        'Chew an aspirin if recommended by emergency dispatch.',
        'Call an ambulance or click SOS for routing to Metro Cardiac Institute.'
      ]
    };
  }

  // Respiratory cases
  if (
    query.includes('cough') ||
    query.includes('breath') ||
    query.includes('breathing') ||
    query.includes('asthma') ||
    query.includes('wheezing') ||
    query.includes('respiratory') ||
    query.includes('shortness of breath')
  ) {
    return {
      condition: 'Acute Respiratory Infection / Bronchitis',
      severity: 'Moderate',
      specialist: 'Pulmonologist',
      confidence: 89,
      description: 'Symptom pattern points to respiratory tract congestion or bronchial inflammation, which may require nebulization or targeted inhaler support.',
      precautions: [
        'Stay fully hydrated with warm fluids.',
        'Wear a surgical mask to prevent transmission.',
        'Use a humidifier or steam inhalation.',
        'Visit a pulmonologist if oxygen levels drop or wheezing worsens.'
      ]
    };
  }

  // Neurological cases
  if (
    query.includes('headache') ||
    query.includes('migraine') ||
    query.includes('seizure') ||
    query.includes('numbness') ||
    query.includes('paralysis') ||
    query.includes('stroke') ||
    query.includes('dizziness')
  ) {
    return {
      condition: 'Neurological Assessment / Migraine Variant',
      severity: 'Moderate',
      specialist: 'Neurologist',
      confidence: 85,
      description: 'Symptoms correlate with neurological triggers, neural pathways stimulation, or cerebrovascular spasms, warranting diagnostic MRI/EEG overview if recurrent.',
      precautions: [
        'Rest in a quiet, darkened room.',
        'Avoid all digital screens and bright lights.',
        'Drink a glass of cold water.',
        'Monitor for visual disturbances or slurred speech.'
      ]
    };
  }

  // Gastrointestinal cases
  if (
    query.includes('stomach') ||
    query.includes('vomit') ||
    query.includes('nausea') ||
    query.includes('diarrhea') ||
    query.includes('acid') ||
    query.includes('indigestion') ||
    query.includes('belly')
  ) {
    return {
      condition: 'Gastroenteritis / Acid Reflux Syndrome',
      severity: 'Moderate',
      specialist: 'Gastroenterologist',
      confidence: 82,
      description: 'Indicated patterns reflect gastrointestinal lining irritation, possible foodborne pathogens, or severe acid hypersecretion.',
      precautions: [
        'Sip Oral Rehydration Salts (ORS) or electrolyte water.',
        'Eat a strict, bland diet (bananas, rice, applesauce).',
        'Avoid dairy products, caffeine, and spicy meals.',
        'Seek clinical care if vomiting continues beyond 12 hours.'
      ]
    };
  }

  // Dermatological cases
  if (
    query.includes('skin') ||
    query.includes('rash') ||
    query.includes('itch') ||
    query.includes('allergy') ||
    query.includes('burn') ||
    query.includes('eczema')
  ) {
    return {
      condition: 'Acute Dermatological Reaction / Contact Dermatitis',
      severity: 'Low',
      specialist: 'Dermatologist',
      confidence: 90,
      description: 'Dermal irritation suggests contact allergy, localized hive triggers, or epidermal barrier breach.',
      precautions: [
        'Avoid scratching or picking at the lesions.',
        'Apply a clean, cool, damp compress.',
        'Wash the area gently with unscented soap.',
        'Note any new soaps, detergents, or food exposures.'
      ]
    };
  }

  // General infections / fever
  if (
    query.includes('fever') ||
    query.includes('flu') ||
    query.includes('cold') ||
    query.includes('sore throat') ||
    query.includes('body ache') ||
    query.includes('shivering')
  ) {
    return {
      condition: 'Viral Syndrome / Influenza-Like Illness',
      severity: 'Low',
      specialist: 'General Physician',
      confidence: 92,
      description: 'Core febrile and system symptoms indicate general systemic viral activation, common for seasonal influenza or acute viral pharyngitis.',
      precautions: [
        'Record temperature measurements every 4 hours.',
        'Ensure absolute bed rest.',
        'Hydrate continuously with warm water or herbal teas.',
        'Administer OTC antipyretics if fever crosses 101.5°F (38.6°C).'
      ]
    };
  }

  // General Consultation
  return {
    condition: 'General Symptom Analysis / Diagnostic Consult Required',
    severity: 'Low',
    specialist: 'General Physician',
      confidence: 78,
      description: 'The symptoms detailed are diffuse and require structured clinical history mapping and physical examination for diagnostic verification.',
      precautions: [
        'Maintain a log of symptom timings and severity.',
        'Avoid self-medicating with broad-spectrum antibiotics.',
        'Prioritize resting and maintaining baseline hydration.',
        'Book a routine assessment with a general physician.'
      ]
  };
}
