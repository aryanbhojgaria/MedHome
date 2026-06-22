export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  diagnosis: string;
  state: string;
  admissionDate: string;
  dischargeDate: string | null;
  billAmount: number;
  status: 'Admitted' | 'Discharged';
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  date: string;
  metrics: {
    name: string;
    value: number;
    unit: string;
    range: string;
    status: 'Normal' | 'Warning' | 'Critical';
  }[];
}

export interface AppointmentRecord {
  id: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  time: string;
  patientName: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

// Seedable Linear Congruential Generator for reproducible mockup data
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min));
  }
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length)];
  }
}

// Indian Name Databanks
const indianFirstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sunita', 'Rahul', 'Neha', 'Rohit', 'Kavita', 'Anil', 'Sanjay',
  'Deepak', 'Aarav', 'Ananya', 'Arjun', 'Divya', 'Karan', 'Meera', 'Nikhil', 'Pooja', 'Rohan',
  'Siddharth', 'Shreya', 'Vikram', 'Aditi', 'Harish', 'Jyoti', 'Manish', 'Nisha', 'Vijay', 'Kiran'
];

const indianLastNames = [
  'Sharma', 'Patel', 'Verma', 'Das', 'Nair', 'Sen', 'Gupta', 'Kumar', 'Singh', 'Rao',
  'Joshi', 'Mehta', 'Mishra', 'Choudhury', 'Banerjee', 'Reddy', 'Pillai', 'Roy', 'Prasad', 'Kapoor',
  'Iyer', 'Bose', 'Deshmukh', 'Chatterjee', 'Dutta', 'Gowda', 'Menon', 'Jha', 'Trivedi', 'Bhat'
];

const diagnosesList = [
  'Dengue Hemorrhagic Fever', 'Malaria (Plasmodium)', 'Enteric Fever (Typhoid)', 'Pulmonary Tuberculosis',
  'COVID-19 / SARI', 'Acute Cholera / Gastroenteritis', 'Essential Hypertension', 'Type 2 Diabetes Mellitus',
  'Acute Bronchial Asthma', 'Coronary Artery Disease'
];

const statesList = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
const bloodGroupsList: ('A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-')[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Generate exactly 10,000 patient records deterministically
export function generatePatientDataset(count = 10000): PatientRecord[] {
  const rng = new SeededRandom(42); // Fixed seed for identical hackathon demo rows
  const dataset: PatientRecord[] = [];

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 180); // Date window covering past 180 days

  for (let i = 1; i <= count; i++) {
    const age = rng.nextInt(3, 88);
    const gender: 'Male' | 'Female' | 'Other' = rng.next() > 0.52 ? 'Male' : rng.next() > 0.95 ? 'Other' : 'Female';
    const first = rng.pick(indianFirstNames);
    const last = rng.pick(indianLastNames);
    const bloodGroup = rng.pick(bloodGroupsList);
    const diagnosis = rng.pick(diagnosesList);
    const state = rng.pick(statesList);
    const status: 'Admitted' | 'Discharged' = rng.next() > 0.15 ? 'Discharged' : 'Admitted';

    // Admission Date
    const offsetDays = rng.nextInt(0, 180);
    const adDate = new Date(baseDate.getTime());
    adDate.setDate(adDate.getDate() + offsetDays);
    const adDateStr = adDate.toISOString().split('T')[0];

    // Discharge Date
    let dcDateStr: string | null = null;
    let bill = rng.nextInt(8500, 320000);
    
    if (status === 'Discharged') {
      const stayDays = rng.nextInt(2, 18);
      const dcDate = new Date(adDate.getTime());
      dcDate.setDate(dcDate.getDate() + stayDays);
      dcDateStr = dcDate.toISOString().split('T')[0];
    } else {
      bill = Math.floor(bill * 0.4); // Less billed yet
    }

    dataset.push({
      id: `PT-${String(i).padStart(5, '0')}`,
      name: `${first} ${last}`,
      age,
      gender,
      bloodGroup,
      diagnosis,
      state,
      admissionDate: adDateStr,
      dischargeDate: dcDateStr,
      billAmount: bill,
      status
    });
  }

  return dataset;
}

// Generate realistic synthetic Lab Reports
export function generateLabReports(patientId: string, patientName: string): LabReport[] {
  const rng = new SeededRandom(parseInt(patientId.replace('PT-', '')) || 1);
  
  const dates = ['2026-06-18', '2026-05-10', '2026-03-24'];
  const reportList: LabReport[] = [];

  // CBC Lab report
  const platelet = rng.nextInt(80000, 350000);
  const plateletStatus = platelet < 150000 ? (platelet < 100000 ? 'Critical' : 'Warning') : 'Normal';
  
  reportList.push({
    id: `LAB-CBC-${patientId}`,
    patientId,
    patientName,
    testName: 'Complete Blood Count (CBC) Panel',
    date: dates[0],
    metrics: [
      { name: 'Hemoglobin (Hb)', value: parseFloat((11 + rng.next() * 5).toFixed(1)), unit: 'g/dL', range: '12.0 - 16.0', status: 'Normal' },
      { name: 'White Blood Cells (WBC)', value: rng.nextInt(4000, 11000), unit: 'cells/mcL', range: '4,000 - 11,000', status: 'Normal' },
      { name: 'Platelet Count', value: platelet, unit: 'cells/mcL', range: '150,000 - 450,000', status: plateletStatus }
    ]
  });

  // Basic Lipid Panel
  const chol = rng.nextInt(150, 260);
  const cholStatus = chol > 200 ? (chol > 240 ? 'Critical' : 'Warning') : 'Normal';

  reportList.push({
    id: `LAB-LIP-${patientId}`,
    patientId,
    patientName,
    testName: 'Lipid Profile Test',
    date: dates[1],
    metrics: [
      { name: 'Total Cholesterol', value: chol, unit: 'mg/dL', range: '125 - 200', status: cholStatus },
      { name: 'Triglycerides', value: rng.nextInt(90, 180), unit: 'mg/dL', range: '< 150', status: 'Normal' }
    ]
  });

  return reportList;
}

// Generate realistic simulated Appointment Records
export function generateAppointmentRecords(patientId: string, patientName: string): AppointmentRecord[] {
  const rng = new SeededRandom(parseInt(patientId.replace('PT-', '')) || 1);
  const timeline: AppointmentRecord[] = [];

  const doctors = [
    { name: 'Dr. Sarah Jenkins', specialty: 'Pulmonologist', hosp: 'AIIMS Delhi' },
    { name: 'Dr. Marcus Vance', specialty: 'Cardiologist', hosp: 'Fortis Mumbai' },
    { name: 'Dr. Clara Fontaine', specialty: 'General Physician', hosp: 'Manipal Hospital Bengaluru' },
    { name: 'Dr. Elena Rostova', specialty: 'Neurologist', hosp: 'KEM Hospital Mumbai' }
  ];

  const times = ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'];
  const dates = ['2026-06-15', '2026-05-02', '2026-04-18', '2026-03-10'];

  for (let i = 0; i < 3; i++) {
    const doc = rng.pick(doctors);
    timeline.push({
      id: `APT-HIST-${patientId}-${i}`,
      doctorName: doc.name,
      specialization: doc.specialty,
      hospital: doc.hosp,
      date: dates[i],
      time: rng.pick(times),
      patientName,
      status: i === 0 ? 'Completed' : 'Completed' // historical ones
    });
  }

  return timeline;
}
