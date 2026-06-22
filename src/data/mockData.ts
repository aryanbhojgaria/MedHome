export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  hospital: string;
  distance: number;
  availableToday: boolean;
  timeSlots: string[];
  avatarColor: string;
  phone: string;
  bio: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Emergency Center' | 'Medical Store';
  distance: number;
  travelTime: number;
  isOpen: boolean;
  emergencyBeds: number;
  hasICU: boolean;
  phone: string;
  address: string;
  facilities: string[];
  x: number; // canvas map relative X (0 - 100)
  y: number; // canvas map relative Y (0 - 100)
}

export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    specialization: 'Pulmonologist',
    experience: 14,
    rating: 4.9,
    hospital: 'All India Institute of Medical Sciences (AIIMS)',
    distance: 2.4,
    availableToday: true,
    timeSlots: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    avatarColor: 'from-blue-500 to-indigo-600',
    phone: '+91-11-26588500',
    bio: 'Specialist in respiratory disorders, chronic asthma management, and infectious pulmonary conditions with 14 years of clinical experience.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance',
    specialization: 'Cardiologist',
    experience: 18,
    rating: 4.8,
    hospital: 'Fortis Hiranandani Hospital',
    distance: 3.1,
    availableToday: true,
    timeSlots: ['10:00 AM', '01:30 PM', '03:00 PM', '05:30 PM'],
    avatarColor: 'from-rose-500 to-red-600',
    phone: '+91-22-68846100',
    bio: 'Renowned expert in interventional cardiology, heart failure diagnostics, and preventative cardiovascular therapies.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Elena Rostova',
    specialization: 'Neurologist',
    experience: 12,
    rating: 4.7,
    hospital: 'National Institute of Mental Health and Neurosciences (NIMHANS)',
    distance: 4.5,
    availableToday: false,
    timeSlots: ['09:30 AM', '11:00 AM', '03:30 PM'],
    avatarColor: 'from-purple-500 to-indigo-700',
    phone: '+91-80-26995000',
    bio: 'Focuses on neurological pain disorders, migraine therapy, neurodegenerative diagnostic workflows, and sleep disorders.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Amit Patel',
    specialization: 'Pediatrician',
    experience: 10,
    rating: 4.9,
    hospital: 'Safdarjung Hospital & Vardhman Mahavir Medical College',
    distance: 1.8,
    availableToday: true,
    timeSlots: ['08:30 AM', '10:30 AM', '01:00 PM', '04:00 PM'],
    avatarColor: 'from-emerald-400 to-teal-600',
    phone: '+91-11-26730000',
    bio: 'Dedicated pediatrician providing comprehensive neonatal care, childhood immunization schemes, and developmental monitoring.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Clara Fontaine',
    specialization: 'General Physician',
    experience: 8,
    rating: 4.6,
    hospital: 'Manipal Hospital Bengaluru',
    distance: 0.9,
    availableToday: true,
    timeSlots: ['11:00 AM', '12:00 PM', '02:30 PM', '06:00 PM'],
    avatarColor: 'from-sky-400 to-blue-600',
    phone: '+91-80-25024444',
    bio: 'Experienced primary care doctor specializing in chronic disease prevention, diagnostic screenings, and lifestyle medicine.'
  },
  {
    id: 'doc-6',
    name: 'Dr. Raymond Park',
    specialization: 'Gastroenterologist',
    experience: 16,
    rating: 4.8,
    hospital: 'King Edward Memorial (KEM) Hospital',
    distance: 2.4,
    availableToday: false,
    timeSlots: ['09:00 AM', '10:30 AM', '01:30 PM'],
    avatarColor: 'from-amber-500 to-orange-600',
    phone: '+91-22-24107000',
    bio: 'Specialist in digestive health, endoscopy diagnostics, inflammatory bowel diseases, and metabolic nutritional support.'
  },
  {
    id: 'doc-7',
    name: 'Dr. Sophia Lari',
    specialization: 'Dermatologist',
    experience: 11,
    rating: 4.9,
    hospital: 'Apollo Hospitals Greams Road',
    distance: 5.2,
    availableToday: true,
    timeSlots: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
    avatarColor: 'from-fuchsia-400 to-pink-600',
    phone: '+91-44-28290200',
    bio: 'Board-certified dermatologist treating clinical skin conditions, skin cancer screenings, and advanced aesthetic dermatology therapies.'
  },
  {
    id: 'doc-8',
    name: 'Dr. James Thorne',
    specialization: 'Orthopedic Surgeon',
    experience: 20,
    rating: 4.7,
    hospital: 'Seth Sukhlal Karnani Memorial (SSKM) Hospital',
    distance: 3.8,
    availableToday: true,
    timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'],
    avatarColor: 'from-cyan-500 to-teal-700',
    phone: '+91-33-22235000',
    bio: 'Senior consultant orthopedic surgeon focusing on joint replacements, reconstructive surgery, and complex sports injuries.'
  }
];

export const mockHospitals: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Apex General Hospital',
    type: 'Hospital',
    distance: 2.4,
    travelTime: 8,
    isOpen: true,
    emergencyBeds: 14,
    hasICU: true,
    phone: '+1 (555) 911-0022',
    address: '450 Health Parkway, Sector 4',
    facilities: ['24/7 ICU', 'Trauma Care', 'CT Scan & MRI', 'Ambulance Support'],
    x: 40,
    y: 35
  },
  {
    id: 'hosp-2',
    name: 'Metro Cardiac Institute',
    type: 'Emergency Center',
    distance: 3.1,
    travelTime: 11,
    isOpen: true,
    emergencyBeds: 6,
    hasICU: true,
    phone: '+1 (555) 911-4477',
    address: '102 Heart Beat Lane, Downtown',
    facilities: ['Cath Lab', 'Coronary ICU', '24/7 Cardiac ER', 'Defibrillation Station'],
    x: 75,
    y: 20
  },
  {
    id: 'hosp-3',
    name: 'MedHome Family Clinic',
    type: 'Clinic',
    distance: 0.9,
    travelTime: 3,
    isOpen: true,
    emergencyBeds: 2,
    hasICU: false,
    phone: '+1 (555) 234-8899',
    address: '12 Neighborhood Boulevard, Sector 1',
    facilities: ['General Outpatient', 'Vaccinations', 'Pharmacy Outlet', 'First Aid'],
    x: 25,
    y: 65
  },
  {
    id: 'hosp-4',
    name: 'NeuroLife Health Center',
    type: 'Hospital',
    distance: 4.5,
    travelTime: 15,
    isOpen: true,
    emergencyBeds: 8,
    hasICU: true,
    phone: '+1 (555) 911-5588',
    address: '88 Brainwave Court, North District',
    facilities: ['Neurology ICU', 'EEG & Sleep Lab', 'Stroke Triage Unit'],
    x: 80,
    y: 70
  },
  {
    id: 'hosp-5',
    name: 'Care & Cure Medicals',
    type: 'Medical Store',
    distance: 0.5,
    travelTime: 2,
    isOpen: true,
    emergencyBeds: 0,
    hasICU: false,
    phone: '+1 (555) 888-2211',
    address: '22 Market St, Sector 1',
    facilities: ['24-Hour Prescriptions', 'Emergency Medicines', 'Medical Devices'],
    x: 35,
    y: 80
  },
  {
    id: 'hosp-6',
    name: 'City Urgent Care Center',
    type: 'Emergency Center',
    distance: 1.5,
    travelTime: 5,
    isOpen: true,
    emergencyBeds: 12,
    hasICU: true,
    phone: '+1 (555) 911-0909',
    address: '90 Express Bypass, West Gate',
    facilities: ['Triage Center', 'Minor Surgery', 'Ambulance Fleet', 'X-Ray Lab'],
    x: 15,
    y: 25
  }
];

export const translationLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' }
];

export const uiTranslations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    home: 'Home',
    checker: 'Symptom Checker',
    doctors: 'Find Doctors',
    hospitals: 'Hospital Finder',
    sos: 'EMERGENCY SOS',
    dashboard: 'Dashboards',
    pitch: 'Startup Pitch',
    
    // Landing
    heroTitle: "Find the Right Doctor Before It's Too Late.",
    heroSubtitle: "AI-powered healthcare navigation that analyzes your symptoms, finds the right specialist, recommends nearby hospitals, and provides precautionary guidance in seconds.",
    btnTryAi: "Try AI Diagnosis",
    btnExplore: "Explore Features",
    doctorsCount: "Verified Doctors",
    hospitalsCount: "Hospitals Partnered",
    accuracy: "Recommendation Accuracy",
    assistance: "AI Assistance",
    
    // Features Section
    featuresTitle: "Next-Gen Healthcare Navigation Features",
    featuresSub: "Powered by deep diagnostic clinical models designed for immediate, reliable medical guidance.",
    
    // How It Works
    howItWorks: "How MedHome Works",
    step1Title: "Describe Symptoms",
    step1Desc: "Explain what you are feeling using voice or text in your native language.",
    step2Title: "AI Diagnostics",
    step2Desc: "Our deep neural networks parse descriptions to filter matching clinical attributes.",
    step3Title: "Severity Check",
    step3Desc: "Instantly measures emergency levels to classify risk (Low, Moderate, Urgent).",
    step4Title: "Specialist Matching",
    step4Desc: "Matches symptoms to disease-specific medical specialties and board-certified experts.",
    step5Title: "Hospital Routing",
    step5Desc: "Traces nearby emergency hubs, displaying real-time beds availability and routes.",
    step6Title: "Precaution Guide",
    step6Desc: "Delivers immediate safety recommendations and first-aid checklists while you wait.",

    // SOS Mode
    sosAlert: "CRITICAL SYSTEM STATE: SOS EMERGENCY ENGAGED",
    sosDesc: "MedHome is identifying the fastest emergency route and securing an ICU bed reservation.",
    emergencyHeader: "EMERGENCY CONTROLS",
    firstAid: "Instant First Aid Guidance",
    
    // App
    langSelector: "Language"
  },
  hi: {
    home: 'होम',
    checker: 'लक्षण जाँचकर्ता',
    doctors: 'डॉक्टर ढूंढें',
    hospitals: 'अस्पताल खोजक',
    sos: 'आपातकालीन SOS',
    dashboard: 'डैशबोर्ड',
    pitch: 'स्टार्टअप पिच',
    heroTitle: "इससे पहले कि बहुत देर हो जाए, सही डॉक्टर खोजें।",
    heroSubtitle: "एआई-संचालित स्वास्थ्य सेवा नेविगेशन जो आपके लक्षणों का विश्लेषण करता है, सही विशेषज्ञ को ढूंढता है, नजदीकी अस्पतालों की सिफारिश करता है, और सेकंड में एहतियाती मार्गदर्शन प्रदान करता है।",
    btnTryAi: "एआई निदान का प्रयास करें",
    btnExplore: "सुविधाओं की खोज करें",
    doctorsCount: "सत्यापित डॉक्टर",
    hospitalsCount: "अस्पताल भागीदार",
    accuracy: "सिफारिश सटीकता",
    assistance: "एआई सहायता",
    featuresTitle: "अगली पीढ़ी की स्वास्थ्य सेवा नेविगेशन विशेषताएं",
    featuresSub: "तत्काल, विश्वसनीय चिकित्सा मार्गदर्शन के लिए डिज़ाइन किए गए गहरे नैदानिक ​​नैदानिक ​​मॉडलों द्वारा संचालित।",
    howItWorks: "मेडहोम कैसे काम करता है",
    step1Title: "लक्षणों का वर्णन करें",
    step1Desc: "अपनी मातृभाषा में आवाज या पाठ का उपयोग करके बताएं कि आप कैसा महसूस कर रहे हैं।",
    step2Title: "एआई निदान",
    step2Desc: "हमारे गहन तंत्रिका नेटवर्क मिलान नैदानिक ​​विशेषताओं को फ़िल्टर करने के लिए विवरणों को पार्स करते हैं।",
    step3Title: "गंभीरता की जांच",
    step3Desc: "जोखिम को वर्गीकृत करने के लिए आपातकालीन स्तरों को तुरंत मापता है (कम, मध्यम, तत्काल)।",
    step4Title: "विशेषज्ञ मिलान",
    step4Desc: "लक्षणों को रोग-विशिष्ट चिकित्सा विशिष्टताओं और प्रमाणित विशेषज्ञों से मिलाता है।",
    step5Title: "अस्पताल मार्ग",
    step5Desc: "रीयल-टाइम बेड उपलब्धता और मार्गों को प्रदर्शित करते हुए आस-पास के आपातकालीन केंद्रों को ट्रैक करता है।",
    step6Title: "एहतियात गाइड",
    step6Desc: "आपके प्रतीक्षा करते समय तत्काल सुरक्षा सिफारिशें और प्राथमिक चिकित्सा चेकलिस्ट प्रदान करता है।",
    sosAlert: "महत्वपूर्ण आपातकालीन स्थिति: SOS सक्रिय",
    sosDesc: "मेडहोम सबसे तेज़ आपातकालीन मार्ग की पहचान कर रहा है और एक आईसीयू बेड आरक्षित कर रहा है।",
    emergencyHeader: "आपातकालीन नियंत्रण",
    firstAid: "त्वरित प्राथमिक चिकित्सा मार्गदर्शन",
    langSelector: "भाषा"
  },
  bn: {
    home: 'হোম',
    checker: 'লক্ষণ পরীক্ষক',
    doctors: 'ডাক্তার খুঁজুন',
    hospitals: 'হাসপাতাল ফাইন্ডার',
    sos: 'জরুরী SOS',
    dashboard: 'ড্যাশবোর্ড',
    pitch: 'স্টার্টআপ পিচ',
    heroTitle: "অনেক দেরি হওয়ার আগেই সঠিক ডাক্তার খুঁজে নিন।",
    heroSubtitle: "এআই-চালিত স্বাস্থ্যসেবা নেভিগেশন যা আপনার লক্ষণগুলি বিশ্লেষণ করে, সঠিক বিশেষজ্ঞ খুঁজে বের করে, কাছাকাছি হাসপাতালের সুপারিশ করে এবং সেকেন্ডের মধ্যে সতর্কতামূলক নির্দেশিকা প্রদান করে।",
    btnTryAi: "এআই রোগ নির্ণয় চেষ্টা করুন",
    btnExplore: "ফিচারগুলি জানুন",
    doctorsCount: "যাচাইকৃত ডাক্তার",
    hospitalsCount: "অংশীদার হাসপাতাল",
    accuracy: "সুপারিশের সঠিকতা",
    assistance: "এআই সহায়তা",
    featuresTitle: "নেক্সট-জেন স্বাস্থ্যসেবা নেভিগেশন ফিচারসমূহ",
    featuresSub: "তাত্ক্ষণিক এবং নির্ভরযোগ্য চিকিৎসা নির্দেশনার জন্য উন্নত ক্লিনিকাল ডায়াগনস্টিক মডেল দ্বারা চালিত।",
    howItWorks: "মেডহোম কীভাবে কাজ করে",
    step1Title: "লক্ষণ বর্ণনা করুন",
    step1Desc: "আপনার মাতৃভাষায় ভয়েস বা টেক্সটের মাধ্যমে আপনার অনুভূতি ব্যাখ্যা করুন।",
    step2Title: "এআই ডায়াগনস্টিকস",
    step2Desc: "আমাদের ডিপ নিউরাল নেটওয়ার্ক লক্ষণগুলি বিশ্লেষণ করে সঠিক ক্লিনিকাল বৈশিষ্ট্য ফিল্টার করে।",
    step3Title: "গুরুত্ব পরীক্ষা",
    step3Desc: "ঝুঁকি শ্রেণীভুক্ত করতে তাত্ক্ষণিকভাবে জরুরী অবস্থা পরিমাপ করে (কম, মাঝারি, আশঙ্কাজনক)।",
    step4Title: "বিশেষজ্ঞ ম্যাচিং",
    step4Desc: "নির্দিষ্ট রোগ-ভিত্তিক বিশেষত্বের সাথে প্রত্যয়িত চিকিৎসকদের ম্যাচ করে।",
    step5Title: "হাসপাতাল রুট",
    step5Desc: "রিয়েল-টাইম বেড প্রাপ্যতা এবং রুট সহ কাছাকাছি জরুরী হাসপাতাল ট্র্যাক করে।",
    step6Title: "সতর্কতা গাইড",
    step6Desc: "আপনি অপেক্ষা করার সময় তাত্ক্ষণিক সুরক্ষা টিপস এবং প্রাথমিক চিকিৎসা নির্দেশিকা প্রদান করে।",
    sosAlert: "জরুরী অবস্থা: SOS সক্রিয়",
    sosDesc: "মেডহোম দ্রুততম রুট এবং একটি আইসিইউ বেড সংরক্ষণ নিশ্চিত করছে।",
    emergencyHeader: "জরুরী নিয়ন্ত্রণ",
    firstAid: "তাত্ক্ষণিক প্রাথমিক চিকিৎসা নির্দেশিকা",
    langSelector: "ভাষা"
  },
  ta: {
    home: 'முகப்பு',
    checker: 'அறிகுறி கண்டறிதல்',
    doctors: 'மருத்துவர் தேடல்',
    hospitals: 'மருத்துவமனை தேடல்',
    sos: 'அவசர SOS',
    dashboard: 'டாஷ்போர்டுகள்',
    pitch: 'ஸ்டார்ட்அப் பிட்ச்',
    heroTitle: "மிகவும் தாமதமாகும் முன் சரியான மருத்துவரை கண்டறியுங்கள்.",
    heroSubtitle: "AI-இயங்கும் சுகாதார வழிசெலுத்தல் உங்கள் அறிகுறிகளை பகுப்பாய்வு செய்கிறது, சரியான நிபுணரை கண்டறியும், அருகிலுள்ள மருத்துவமனைகளை பரிந்துரைக்கும், மற்றும் நொடிகளில் முன்னெச்சரிக்கை வழிகாட்டுதலை வழங்கும்.",
    btnTryAi: "AI நோயறிதலை முயற்சிக்கவும்",
    btnExplore: "அம்சங்களை ஆராயுங்கள்",
    doctorsCount: "சரிபார்க்கப்பட்ட மருத்துவர்கள்",
    hospitalsCount: "இணைந்த மருத்துவமனைகள்",
    accuracy: "பரிந்துரை துல்லியம்",
    assistance: "AI உதவி 24/7",
    featuresTitle: "அடுத்த தலைமுறை சுகாதார அம்சங்கள்",
    featuresSub: "உடனடி, நம்பகமான மருத்துவ வழிகாட்டுதலுக்காக வடிவமைக்கப்பட்ட மேம்பட்ட மருத்துவ மாதிரிகள் மூலம் இயக்கப்படுகிறது.",
    howItWorks: "மெட்ஹோம் எவ்வாறு செயல்படுகிறது",
    step1Title: "அறிகுறிகளை விவரிக்கவும்",
    step1Desc: "உங்கள் தாய்மொழியில் குரல் அல்லது உரை மூலம் உங்கள் அறிகுறிகளை விவரிக்கவும்.",
    step2Title: "AI பகுப்பாய்வு",
    step2Desc: "எங்கள் ஆழமான நரம்பியல் நெட்வொர்க்குகள் அறிகுறிகளைப் பகுப்பாய்வு செய்து கண்டறியும்.",
    step3Title: "தீவிரத்தன்மை சோதனை",
    step3Desc: "ஆபத்து அளவை உடனடியாக மதிப்பிடுகிறது (குறைந்த, நடுத்தர, அவசரம்).",
    step4Title: "நிபுணர் பொருத்தம்",
    step4Desc: "குறிப்பிட்ட நோய் பிரிவுகளுக்கு ஏற்ப தகுதியான நிபுணர்களை இணைக்கிறது.",
    step5Title: "மருத்துவமனை வழித்தடம்",
    step5Desc: "நிகழ்நேர படுக்கை வசதி மற்றும் வரைபட வழிகளுடன் அருகிலுள்ள அவசர நிலையங்களைக் கண்டறியும்.",
    step6Title: "முன்னெச்சரிக்கை வழிகாட்டி",
    step6Desc: "நீங்கள் காத்திருக்கும் நேரத்தில் உடனடி பாதுகாப்பு மற்றும் முதலுதவி வழிமுறைகளை வழங்குகிறது.",
    sosAlert: "முக்கிய அவசரநிலை: SOS செயல்படுத்தப்பட்டது",
    sosDesc: "மெட்ஹோம் மிக விரைவான அவசர வழியைக் கண்டறிந்து ஐசியூ படுக்கையை முன்பதிவு செய்கிறது.",
    emergencyHeader: "அவசரக்கால கட்டுப்பாடுகள்",
    firstAid: "உடனடி முதலுதவி வழிகாட்டுதல்",
    langSelector: "மொழி"
  },
  te: {
    home: 'హోమ్',
    checker: 'లక్షణాల గుర్తింపు',
    doctors: 'వైద్యుల అన్వేషణ',
    hospitals: 'ఆసుపత్రుల గుర్తింపు',
    sos: 'అత్యవసర SOS',
    dashboard: 'డాష్‌బోర్డులు',
    pitch: 'స్టార్టప్ పిచ్',
    heroTitle: "చాలా ఆలస్యం కాకముందే సరైన వైద్యుడిని కనుగొనండి.",
    heroSubtitle: "AI-ఆధారిత ఆరోగ్య నావిగేషన్ మీ లక్షణాలను విశ్లేషిస్తుంది, సరైన నిపుణుడిని కనుగొంటుంది, సమీపంలోని ఆసుపత్రులను సిఫార్సు చేస్తుంది మరియు సెకన్లలో ముందస్తు మార్గదర్శకత్వాన్ని అందిస్తుంది.",
    btnTryAi: "AI నిర్ధారణను ప్రయత్నించండి",
    btnExplore: "ఫీచర్లు అన్వేషించండి",
    doctorsCount: "ధృవీకరించబడిన వైద్యులు",
    hospitalsCount: "భాగస్వామ్య ఆసుపత్రులు",
    accuracy: "సిఫార్సు ఖచ్చితత్వం",
    assistance: "AI సహాయం 24/7",
    featuresTitle: "తదుపరి తరం ఆరోగ్య నావిగేషన్ ఫీచర్లు",
    featuresSub: "తక్షణ, నమ్మకమైన వైద్య మార్గదర్శకత్వం కోసం రూపొందించబడిన అధునాతన క్లినికల్ డయాగ్నస్టిక్ మోడల్స్ ద్వారా ఆధారితం.",
    howItWorks: "మెడ్‌హోమ్ ఎలా పనిచేస్తుంది",
    step1Title: "లక్షణాలు వివరించండి",
    step1Desc: "మీ మాతృభాషలో వాయిస్ లేదా టెక్స్ట్ ద్వారా మీ లక్షణాలను వివరించండి.",
    step2Title: "AI విశ్లేషణ",
    step2Desc: "మా అధునాతన న్యూరల్ నెట్‌వర్క్‌లు లక్షణాలను విశ్లేషించి వర్గీకరిస్తాయి.",
    step3Title: "తీవ్రత తనిఖీ",
    step3Desc: "ప్రమాద స్థాయిని తక్షణమే అంచనా వేస్తుంది (తక్కువ, మధ్యస్థ, అత్యవసరం).",
    step4Title: "నిపుణుల ఎంపిక",
    step4Desc: "లక్షణాల ఆధారంగా తగిన వైద్య నిపుణులతో అనుసంధానం చేస్తుంది.",
    step5Title: "ఆసుపత్రి మార్గం",
    step5Desc: "నిజ-సమయ బెడ్ లభ్యత మరియు రూట్ మ్యాప్‌లతో సమీప అత్యవసర కేంద్రాలను చూపుతుంది.",
    step6Title: "ముందస్తు జాగ్రత్తలు",
    step6Desc: "మీరు వేచి ఉండే సమయంలో తక్షణ భద్రత మరియు ప్రథమ చికిత్స సూచనలను అందిస్తుంది.",
    sosAlert: "అత్యవసర పరిస్థితి: SOS సక్రియం చేయబడింది",
    sosDesc: "మెడ్‌హోమ్ వేగవంతమైన అత్యవసర మార్గాన్ని గుర్తించి, ICU బెడ్‌ను రిజర్వ్ చేస్తోంది.",
    emergencyHeader: "అత్యవసర నియంత్రణలు",
    firstAid: "తక్షణ ప్రథమ చికిత్స మార్గదర్శకత్వం",
    langSelector: "భాష"
  },
  mr: {
    home: 'होम',
    checker: 'लक्षण तपासक',
    doctors: 'डॉक्टर शोधा',
    hospitals: 'अस्पताल शोधक',
    sos: 'आत्त्कालीन SOS',
    dashboard: 'डॅशबोर्ड्स',
    pitch: 'स्टार्टअप पिच',
    heroTitle: "खूप उशीर होण्यापूर्वी योग्य डॉक्टर शोधा.",
    heroSubtitle: "AI-शक्तीवर चालणारे हेल्थकेअर नेव्हिगेशन जे तुमच्या लक्षणांचे विश्लेषण करते, योग्य तज्ज्ञ शोधते, जवळील रुग्णालयांची शिफारस करते आणि सेकंदात खबरदारीचे मार्गदर्शन करते.",
    btnTryAi: "AI रोगनिदान तपासा",
    btnExplore: "वैशिष्ट्ये जाणून घ्या",
    doctorsCount: "सत्यापित डॉक्टर्स",
    hospitalsCount: "भागीदार रुग्णालये",
    accuracy: "शिफारस अचूकता",
    assistance: "AI सहाय्य 24/7",
    featuresTitle: "पुढील पिढीची आरोग्य सेवा नेव्हिगेशन वैशिष्ट्ये",
    featuresSub: "त्वरित, विश्वसनीय वैद्यकीय मार्गदर्शनासाठी डिझाइन केलेल्या प्रगत क्लिनिकल डायग्नोस्टिक मॉडेलद्वारे समर्थित.",
    howItWorks: "मेडहोम कसे कार्य करते",
    step1Title: "लक्षणे वर्णन करा",
    step1Desc: "तुमच्या मातृभाषेत आवाज किंवा मजकूर वापरून तुम्हाला काय जाणवत आहे ते स्पष्ट करा.",
    step2Title: "AI निदान",
    step2Desc: "आमचे डीप न्यूरल नेटवर्क क्लिनिकल गुणधर्म फिल्टर करण्यासाठी तपशील पार्स करतात.",
    step3Title: "गंभीरता तपासणी",
    step3Desc: "जोखमीचे वर्गीकरण करण्यासाठी आत्त्कालीन पातळी त्वरित मोजते (कमी, मध्यम, तातडीचे).",
    step4Title: "तज्ज्ञ जुळवणी",
    step4Desc: "लक्षणे रोग-विशिष्ट वैद्यकीय विशेषतेशी आणि तज्ज्ञांशी जुळवून देतात.",
    step5Title: "रुग्णालय मार्ग",
    step5Desc: "रिअल-टाइम खाटांची उपलब्धता आणि मार्ग दाखवत जवळील आत्त्कालीन केंद्र शोधते.",
    step6Title: "खबरदारी मार्गदर्शक",
    step6Desc: "तुम्ही वाट पाहत असताना त्वरित सुरक्षा शिफारसी आणि प्रथमोपचार चेकलिस्ट देते.",
    sosAlert: "अति-तातडीची परिस्थिती: SOS सक्रिय",
    sosDesc: "मेडहोम सर्वात वेगवान आत्त्कालीन मार्ग शोधत आहे आणि आयसीयू बेड आरक्षित करत आहे.",
    emergencyHeader: "आत्त्कालीन नियंत्रणे",
    firstAid: "त्वरित प्रथमोपचार मार्गदर्शन",
    langSelector: "भाषा"
  }
};
