import { supabase } from './supabaseClient';

// Connection status cache
let connectionChecked = false;
let isSupabaseOnline = false;

// Basic offline check helper
export async function checkSupabaseConnection(): Promise<boolean> {
  if (connectionChecked) return isSupabaseOnline;
  try {
    const { count, error } = await supabase.from('hospitals').select('*', { count: 'exact', head: true });
    isSupabaseOnline = !error && count !== null;
  } catch (e) {
    isSupabaseOnline = false;
  }
  connectionChecked = true;
  return isSupabaseOnline;
}

// ----------------------------------------------------
// Hospitals Table Integration
// ----------------------------------------------------
export interface DbHospital {
  id: string;
  name: string;
  type: string;
  state: string;
  district: string;
  ownership: string;
  licenseNumber: string;
  rating: number;
  isOpen: boolean;
  emergencyBeds: number;
  phone: string;
  address: string;
  facilities: string[];
  x: number; // relative map placement coordinates (0-100)
  y: number; // relative map placement coordinates (0-100)
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export async function fetchHospitals(): Promise<DbHospital[]> {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      isSupabaseOnline = true;
      return data.map((h, index) => {
        // Project real India latitude (8 to 38) and longitude (68 to 98) to 0-100 relative SVG coordinates
        const lat = Number(h.latitude) || 20;
        const lng = Number(h.longitude) || 78;
        
        let x = ((lng - 68) / (98 - 68)) * 100;
        let y = (1 - (lat - 8) / (38 - 8)) * 100;

        // Clamp values to prevent pins overflow from map container
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));

        // Deduce hospital type based on name or index
        let type = 'Hospital';
        if (h.name.toLowerCase().includes('clinic')) type = 'Clinic';
        else if (h.name.toLowerCase().includes('lab') || h.name.toLowerCase().includes('diagnostics')) type = 'Lab';
        else if (h.name.toLowerCase().includes('pharmacy') || h.name.toLowerCase().includes('medicals')) type = 'Pharmacy';
        else if (index % 4 === 1) type = 'Clinic';
        else if (index % 4 === 2) type = 'Lab';
        else if (index % 4 === 3) type = 'Pharmacy';

        const facilitiesList = [
          '24/7 ICU & General Triage',
          type === 'Hospital' ? 'Trauma Center & ER' : (type === 'Lab' ? 'Clinical Pathology' : 'Medicines Dispensation'),
          'ABDM Health Locker Sync'
        ];

        return {
          id: String(h.id),
          name: h.name || `Health Facility #${h.id}`,
          type,
          state: h.state || 'Delhi',
          district: h.city || 'New Delhi',
          ownership: index % 3 === 0 ? 'Private' : 'Public',
          licenseNumber: `HFR-IN-${100000 + Number(h.id)}`,
          rating: Number(h.rating) || 4.2,
          isOpen: true,
          emergencyBeds: h.emergency_available ? 25 : 0,
          phone: h.phone || '+91-11-26588500',
          address: h.address || `${h.city}, ${h.state}`,
          facilities: facilitiesList,
          x,
          y,
          latitude: lat,
          longitude: lng
        };
      });
    }
  } catch (e) {
    console.warn('Supabase hospitals query failed:', e);
  }
  isSupabaseOnline = false;
  return [];
}

// ----------------------------------------------------
// Doctors Table Integration
// ----------------------------------------------------
export interface DbDoctor {
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
  qualification: string;
}

export async function fetchDoctors(): Promise<DbDoctor[]> {
  try {
    const { data: doctorsData, error: docErr } = await supabase
      .from('doctors')
      .select('*')
      .order('id', { ascending: true });

    if (docErr) throw docErr;

    // Fetch hospitals to map hospital_id to hospital name in-memory
    const { data: hospitalsData } = await supabase
      .from('hospitals')
      .select('id, name');

    const hospMap = new Map();
    if (hospitalsData) {
      hospitalsData.forEach(h => hospMap.set(h.id, h.name));
    }

    if (doctorsData && doctorsData.length > 0) {
      isSupabaseOnline = true;
      return doctorsData.map((d, index) => {
        const hospitalName = hospMap.get(d.hospital_id) || 'All India Institute of Medical Sciences (AIIMS)';
        
        // Colors mapping based on specialization
        const spec = d.specialization || 'General Physician';
        let avatarColor = 'from-blue-550 to-indigo-650';
        if (spec.includes('Cardio')) avatarColor = 'from-rose-500 to-red-600';
        else if (spec.includes('Neuro')) avatarColor = 'from-purple-500 to-indigo-700';
        else if (spec.includes('Pediatric') || spec.includes('ENT')) avatarColor = 'from-emerald-400 to-teal-650';
        else if (spec.includes('Dermato')) avatarColor = 'from-fuchsia-400 to-pink-650';
        else if (spec.includes('Gastro')) avatarColor = 'from-amber-500 to-orange-600';

        return {
          id: String(d.id),
          name: d.name || `Dr. Practitioner #${d.id}`,
          specialization: spec,
          experience: Number(d.experience) || 5,
          rating: Number(d.rating) || 4.5,
          hospital: hospitalName,
          distance: Number((1.2 + (index % 10) * 0.7).toFixed(1)),
          availableToday: d.available_today !== undefined ? d.available_today : true,
          timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
          avatarColor,
          phone: '+91-11-26588500',
          bio: `${d.qualification || 'MBBS'} with ${d.experience || 5} years of specialized experience in ${spec}.`,
          qualification: d.qualification || 'MBBS'
        };
      });
    }
  } catch (e) {
    console.warn('Supabase doctors query failed:', e);
  }
  isSupabaseOnline = false;
  return [];
}

// ----------------------------------------------------
// Appointments Table Integration
// ----------------------------------------------------
export interface DbAppointment {
  id: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: string;
  time: string;
  patientName: string;
  approved?: boolean;
}

export async function fetchAppointments(): Promise<DbAppointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        doctors (
          name,
          specialization,
          hospitals (
            name
          )
        ),
        users:user_id (
          full_name
        )
      `)
      .order('id', { ascending: false });

    if (error) throw error;
    if (data) {
      isSupabaseOnline = true;
      return data.map((a: any) => {
        const docInfo = Array.isArray(a.doctors) ? a.doctors[0] : a.doctors;
        const hospInfo = docInfo?.hospitals;
        const hospName = Array.isArray(hospInfo) ? hospInfo[0]?.name : hospInfo?.name;
        const userInfo = Array.isArray(a.users) ? a.users[0] : a.users;

        return {
          id: String(a.id),
          doctorName: docInfo?.name || 'Dr. Practitioner',
          specialization: docInfo?.specialization || 'General Physician',
          hospital: hospName || 'All India Institute of Medical Sciences (AIIMS)',
          date: a.appointment_date,
          time: a.appointment_time,
          patientName: userInfo?.full_name || 'Patient',
          approved: a.status === 'scheduled',
        };
      });
    }
  } catch (e) {
    console.warn('Supabase appointments query failed, using localStorage:', e);
  }
  
  isSupabaseOnline = false;
  const local = localStorage.getItem('medhome_appointments');
  if (local) {
    return JSON.parse(local);
  }
  return [];
}

export async function insertAppointment(apt: Omit<DbAppointment, 'id'>, doctorId?: string): Promise<DbAppointment> {
  const newId = `apt-${Math.random().toString(36).substr(2, 9)}`;
  
  let uId = null;
  let dId = Number(doctorId);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) uId = user.id;
  } catch (e) {}

  if (isNaN(dId) && apt.doctorName) {
    try {
      const { data: docData } = await supabase
        .from('doctors')
        .select('id')
        .eq('name', apt.doctorName)
        .limit(1);
      if (docData && docData[0]) {
        dId = docData[0].id;
      }
    } catch (e) {}
  }
  if (isNaN(dId)) {
    dId = 1; // Fallback doctor_id
  }

  const row = {
    user_id: uId,
    doctor_id: dId,
    appointment_date: apt.date,
    appointment_time: apt.time,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([row])
      .select();

    if (error) throw error;
    isSupabaseOnline = true;
    if (data && data[0]) {
      return {
        id: String(data[0].id),
        doctorName: apt.doctorName,
        specialization: apt.specialization,
        hospital: apt.hospital,
        date: data[0].appointment_date,
        time: data[0].appointment_time,
        patientName: apt.patientName,
        approved: data[0].status === 'scheduled'
      };
    }
  } catch (e) {
    console.warn('Supabase appointment insert failed:', e);
  }

  isSupabaseOnline = false;
  const current = await fetchAppointments();
  const created: DbAppointment = { ...apt, id: newId, approved: false };
  const updated = [created, ...current];
  localStorage.setItem('medhome_appointments', JSON.stringify(updated));
  return created;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    const numericId = Number(id);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq(isNaN(numericId) ? 'id' : 'id', id);
    
    if (!error) {
      isSupabaseOnline = true;
      return true;
    }
  } catch (e) {
    console.warn('Supabase cancel appointment failed:', e);
  }

  isSupabaseOnline = false;
  const current = await fetchAppointments();
  const filtered = current.filter(a => String(a.id) !== String(id));
  localStorage.setItem('medhome_appointments', JSON.stringify(filtered));
  return true;
}

export async function updateAppointmentApproval(id: string, approved: boolean): Promise<boolean> {
  try {
    const numericId = Number(id);
    const { error } = await supabase
      .from('appointments')
      .update({ status: approved ? 'scheduled' : 'pending' })
      .eq(isNaN(numericId) ? 'id' : 'id', id);
    if (!error) {
      isSupabaseOnline = true;
      return true;
    }
  } catch (e) {
    console.warn('Supabase update appointment failed:', e);
  }

  isSupabaseOnline = false;
  const current = await fetchAppointments();
  const updated = current.map(a => String(a.id) === String(id) ? { ...a, approved } : a);
  localStorage.setItem('medhome_appointments', JSON.stringify(updated));
  return true;
}

export async function rescheduleAppointment(id: string, date: string, time: string): Promise<boolean> {
  try {
    const numericId = Number(id);
    const { error } = await supabase
      .from('appointments')
      .update({ 
        appointment_date: date, 
        appointment_time: time,
        status: 'pending' // reset to pending on reschedule
      })
      .eq(isNaN(numericId) ? 'id' : 'id', id);
    if (!error) {
      isSupabaseOnline = true;
      return true;
    }
  } catch (e) {
    console.warn('Supabase reschedule appointment failed:', e);
  }
  
  isSupabaseOnline = false;
  const current = await fetchAppointments();
  const updated = current.map(a => String(a.id) === String(id) ? { ...a, date, time, approved: false } : a);
  localStorage.setItem('medhome_appointments', JSON.stringify(updated));
  return true;
}

// ----------------------------------------------------
// AI Symptom Checker Integration
// ----------------------------------------------------
export interface DiagnosisReport {
  id?: string;
  condition: string;
  severity: string;
  specialist: string;
  confidence: number;
  description: string;
  precautions: string[];
  clinicalNote?: string;
  sourcedFrom: string;
  createdAt?: string;
}

export async function diagnoseSymptomsOnline(text: string): Promise<DiagnosisReport | null> {
  const query = text.toLowerCase().trim();
  try {
    // 1. Fetch matching disease-symptom mapping
    const { data: diseaseSymptoms, error: dsErr } = await supabase
      .from('disease_symptoms')
      .select('*');

    if (dsErr) throw dsErr;

    let matchedDisease: string | null = null;
    let highestMatches = 0;

    if (diseaseSymptoms && diseaseSymptoms.length > 0) {
      const diseaseMap: Record<string, string[]> = {};
      diseaseSymptoms.forEach((row: any) => {
        const dName = row.disease;
        const sym = row.symptom;
        if (dName && sym) {
          if (!diseaseMap[dName]) diseaseMap[dName] = [];
          diseaseMap[dName].push(sym.toLowerCase().trim());
        }
      });

      Object.keys(diseaseMap).forEach(dName => {
        let matches = 0;
        diseaseMap[dName].forEach(sym => {
          if (query.includes(sym)) {
            matches++;
          }
        });

        if (matches > highestMatches && matches >= 2) {
          highestMatches = matches;
          matchedDisease = dName;
        }
      });
    }

    if (matchedDisease) {
      // 2. Fetch Description
      const { data: descData } = await supabase
        .from('disease_descriptions')
        .select('*')
        .eq('disease', matchedDisease)
        .limit(1);

      // 3. Fetch Precautions
      const { data: precData } = await supabase
        .from('precautions')
        .select('*')
        .eq('disease', matchedDisease)
        .limit(1);

      // 4. Fetch Severity Weight
      const { data: severityData } = await supabase
        .from('symptom_severity')
        .select('*');

      let severity = 'Moderate';
      let specialist = 'General Physician';
      let maxWeight = 1;

      if (severityData && severityData.length > 0) {
        severityData.forEach((row: any) => {
          const sym = row.symptom?.toLowerCase().trim();
          const w = Number(row.weight) || 1;
          if (sym && query.includes(sym)) {
            if (w > maxWeight) maxWeight = w;
          }
        });
      }

      // Convert weight to clinical labels
      if (maxWeight >= 5) {
        severity = 'Urgent';
        specialist = 'Cardiologist / Pulmonologist / Specialist';
      } else if (maxWeight >= 3) {
        severity = 'Moderate';
        specialist = 'General Physician / Internal Medicine';
      } else {
        severity = 'Low';
        specialist = 'General Physician';
      }

      // Format Precautions from precaution1..4 columns
      const precautionsList: string[] = [];
      if (precData && precData[0]) {
        const p = precData[0];
        if (p.precaution1) precautionsList.push(p.precaution1);
        if (p.precaution2) precautionsList.push(p.precaution2);
        if (p.precaution3) precautionsList.push(p.precaution3);
        if (p.precaution4) precautionsList.push(p.precaution4);
      }
      if (precautionsList.length === 0) {
        precautionsList.push('Consult a medical practitioner.', 'Monitor hydration levels.', 'Rest properly.');
      }

      const descriptionText = descData?.[0]?.description || `Symptoms point to possible case of ${matchedDisease}.`;

      const report: DiagnosisReport = {
        condition: matchedDisease,
        severity,
        specialist,
        confidence: Math.min(80 + highestMatches * 5, 98),
        description: descriptionText,
        precautions: precautionsList,
        clinicalNote: '',
        sourcedFrom: 'Supabase Clinical Knowledgebase'
      };

      await insertAiReport(report, text);
      isSupabaseOnline = true;
      return report;
    }
  } catch (e) {
    console.warn('Supabase clinical query failed, symptom checker fallback:', e);
  }
  isSupabaseOnline = false;
  return null;
}

export async function insertAiReport(report: Omit<DiagnosisReport, 'id'>, symptomsText: string = ''): Promise<DiagnosisReport> {
  const newId = `rep-${Math.random().toString(36).substr(2, 9)}`;
  let uId = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) uId = user.id;
  } catch (e) {}

  const row = {
    user_id: uId,
    severity: report.severity,
    specialist: report.specialist,
    confidence: report.confidence,
    precautions: JSON.stringify(report.precautions),
    symptoms: symptomsText || report.description,
    predicted_disease: report.condition,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('ai_reports')
      .insert([row])
      .select();

    if (!error && data && data[0]) {
      isSupabaseOnline = true;
      return {
        id: String(data[0].id),
        condition: data[0].predicted_disease,
        severity: data[0].severity,
        specialist: data[0].specialist,
        confidence: data[0].confidence,
        description: report.description,
        precautions: JSON.parse(data[0].precautions),
        sourcedFrom: 'Supabase Clinical Knowledgebase',
        createdAt: data[0].created_at
      };
    }
  } catch (e) {
    console.warn('Supabase insert ai_report failed:', e);
  }

  isSupabaseOnline = false;
  const current = await fetchAiReports();
  const created: DiagnosisReport = { ...report, id: newId, createdAt: new Date().toISOString() };
  localStorage.setItem('medhome_ai_reports', JSON.stringify([created, ...current]));
  return created;
}

export async function fetchAiReports(): Promise<DiagnosisReport[]> {
  try {
    const { data, error } = await supabase
      .from('ai_reports')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    if (data) {
      isSupabaseOnline = true;
      
      // Fetch descriptions dynamically
      const { data: descData } = await supabase
        .from('disease_descriptions')
        .select('disease, description');
      
      const descMap = new Map();
      if (descData) {
        descData.forEach(d => descMap.set(d.disease.toLowerCase().trim(), d.description));
      }

      return data.map(r => {
        const conditionName = r.predicted_disease || 'Unknown Disease';
        return {
          id: String(r.id),
          condition: conditionName,
          severity: r.severity || 'Moderate',
          specialist: r.specialist || 'General Physician',
          confidence: Number(r.confidence) || 90,
          description: descMap.get(conditionName.toLowerCase().trim()) || `Symptoms point to possible case of ${conditionName}.`,
          precautions: typeof r.precautions === 'string' ? JSON.parse(r.precautions) : (Array.isArray(r.precautions) ? r.precautions : []),
          sourcedFrom: 'Supabase Clinical Knowledgebase',
          createdAt: r.created_at
        };
      });
    }
  } catch (e) {
    console.warn('Supabase ai_reports query failed, using localStorage:', e);
  }

  isSupabaseOnline = false;
  const local = localStorage.getItem('medhome_ai_reports');
  if (local) {
    return JSON.parse(local);
  }
  return [];
}

// ----------------------------------------------------
// Emergency Contacts Table Integration
// ----------------------------------------------------
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: string;
  state?: string;
}

export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase.from('emergency_contacts').select('*');
    if (user) {
      query = query.eq('user_id', user.id);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    if (data && data.length > 0) {
      isSupabaseOnline = true;
      return data.map(c => ({
        id: String(c.id),
        name: c.contact_name || 'Personal Contact',
        phone: c.phone || '',
        category: 'Personal Contact'
      }));
    }
  } catch (e) {
    console.warn('Supabase emergency_contacts query failed:', e);
  }

  isSupabaseOnline = false;
  return []; // Return empty personal contacts; UI will merge with national ones
}

export async function insertEmergencyContact(contact: { contact_name: string; phone: string }): Promise<EmergencyContact | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const row = {
      user_id: user.id,
      contact_name: contact.contact_name,
      phone: contact.phone
    };

    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([row])
      .select();

    if (error) throw error;
    if (data && data[0]) {
      isSupabaseOnline = true;
      return {
        id: String(data[0].id),
        name: data[0].contact_name,
        phone: data[0].phone,
        category: 'Personal Contact'
      };
    }
  } catch (e) {
    console.warn('Supabase insert emergency contact failed:', e);
  }
  return null;
}

export async function deleteEmergencyContact(id: string): Promise<boolean> {
  try {
    const numericId = Number(id);
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq(isNaN(numericId) ? 'id' : 'id', id);
    
    if (!error) {
      isSupabaseOnline = true;
      return true;
    }
  } catch (e) {
    console.warn('Supabase delete emergency contact failed:', e);
  }
  return false;
}

// ----------------------------------------------------
// AI Symptom Analysis Engine
// ----------------------------------------------------

// Normalize symptom names: "chest pain" <-> "chest_pain"
function normalizeSymptom(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, '_');
}

function humanizeSymptom(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Cache for Supabase data to avoid refetching during same session
let _cachedSymptomsList: string[] | null = null;
let _cachedDiseaseMap: Record<string, string[]> | null = null;
let _cachedSeverityMap: Record<string, number> | null = null;

export async function fetchAllSymptomsList(): Promise<string[]> {
  if (_cachedSymptomsList) return _cachedSymptomsList;
  try {
    const { data, error } = await supabase
      .from('disease_symptoms')
      .select('symptom');
    if (error) throw error;
    if (data) {
      const unique = [...new Set(data.map((r: any) => r.symptom as string))].filter(Boolean).sort();
      _cachedSymptomsList = unique;
      isSupabaseOnline = true;
      return unique;
    }
  } catch (e) {
    console.warn('Failed to fetch symptoms list:', e);
  }
  return [];
}

async function buildDiseaseMap(): Promise<Record<string, string[]>> {
  if (_cachedDiseaseMap) return _cachedDiseaseMap;
  try {
    const { data, error } = await supabase
      .from('disease_symptoms')
      .select('disease, symptom');
    if (error) throw error;
    const map: Record<string, string[]> = {};
    if (data) {
      data.forEach((row: any) => {
        const d = row.disease;
        const s = row.symptom;
        if (d && s) {
          if (!map[d]) map[d] = [];
          map[d].push(normalizeSymptom(s));
        }
      });
    }
    _cachedDiseaseMap = map;
    isSupabaseOnline = true;
    return map;
  } catch (e) {
    console.warn('Failed to build disease map:', e);
  }
  return {};
}

async function buildSeverityMap(): Promise<Record<string, number>> {
  if (_cachedSeverityMap) return _cachedSeverityMap;
  try {
    const { data, error } = await supabase
      .from('symptom_severity')
      .select('symptom, weight');
    if (error) throw error;
    const map: Record<string, number> = {};
    if (data) {
      data.forEach((row: any) => {
        if (row.symptom) {
          map[normalizeSymptom(row.symptom)] = Number(row.weight) || 1;
        }
      });
    }
    _cachedSeverityMap = map;
    isSupabaseOnline = true;
    return map;
  } catch (e) {
    console.warn('Failed to build severity map:', e);
  }
  return {};
}

export interface DiseaseMatch {
  disease: string;
  matchedSymptoms: string[];
  totalDiseaseSymptoms: number;
  matchCount: number;
  confidence: number;
  description: string;
  precautions: string[];
}

export interface SeverityResult {
  totalScore: number;
  maxWeight: number;
  category: 'Low' | 'Moderate' | 'High' | 'Critical';
  perSymptom: { symptom: string; weight: number }[];
}

export interface FullAnalysisResult {
  symptoms: string[];
  primaryDiagnosis: DiseaseMatch;
  alternativeDiagnoses: DiseaseMatch[];
  severity: SeverityResult;
  specialist: string;
  specialistReason: string;
  doctors: DbDoctor[];
  hospitals: DbHospital[];
  reportId?: string;
  timestamp: string;
}

// Specialist mapping rules
const SPECIALIST_RULES: { symptoms: string[]; specialist: string; reason: string }[] = [
  { symptoms: ['chest_pain', 'palpitations', 'fast_heart_rate', 'swollen_blood_vessels'], specialist: 'Cardiologist', reason: 'Cardiac symptoms detected including chest pain and heart-related indicators' },
  { symptoms: ['breathlessness', 'cough', 'blood_in_sputum', 'rusty_sputum', 'phlegm', 'mucoid_sputum', 'congestion'], specialist: 'Pulmonologist', reason: 'Respiratory symptoms detected requiring pulmonary evaluation' },
  { symptoms: ['headache', 'dizziness', 'loss_of_balance', 'altered_sensorium', 'slurred_speech', 'spinning_movements', 'weakness_of_one_body_side', 'unsteadiness', 'lack_of_concentration'], specialist: 'Neurologist', reason: 'Neurological symptoms detected requiring specialized evaluation' },
  { symptoms: ['skin_rash', 'itching', 'nodal_skin_eruptions', 'blackheads', 'pus_filled_pimples', 'skin_peeling', 'silver_like_dusting', 'yellow_crust_ooze', 'scurring', 'dischromic _patches', 'blister', 'red_sore_around_nose'], specialist: 'Dermatologist', reason: 'Dermatological symptoms detected requiring skin specialist evaluation' },
  { symptoms: ['stomach_pain', 'belly_pain', 'abdominal_pain', 'vomiting', 'acidity', 'indigestion', 'passage_of_gases', 'ulcers_on_tongue', 'diarrhoea', 'constipation', 'stomach_bleeding', 'distention_of_abdomen', 'swelling_of_stomach'], specialist: 'Gastroenterologist', reason: 'Gastrointestinal symptoms detected requiring digestive system evaluation' },
  { symptoms: ['blurred_and_distorted_vision', 'redness_of_eyes', 'visual_disturbances', 'watering_from_eyes', 'pain_behind_the_eyes'], specialist: 'Ophthalmologist', reason: 'Ocular symptoms detected requiring eye specialist evaluation' },
  { symptoms: ['joint_pain', 'knee_pain', 'hip_joint_pain', 'neck_pain', 'back_pain', 'swelling_joints', 'movement_stiffness', 'painful_walking', 'muscle_weakness', 'stiff_neck'], specialist: 'Orthopedic', reason: 'Musculoskeletal symptoms detected requiring orthopedic evaluation' },
  { symptoms: ['abnormal_menstruation'], specialist: 'Gynecologist', reason: 'Gynecological symptoms detected requiring specialized care' },
  { symptoms: ['anxiety', 'depression', 'mood_swings', 'irritability', 'restlessness', 'lack_of_concentration'], specialist: 'Psychiatrist', reason: 'Mental health symptoms detected requiring psychiatric evaluation' },
  { symptoms: ['continuous_sneezing', 'throat_irritation', 'sinus_pressure', 'runny_nose', 'patches_in_throat', 'loss_of_smell'], specialist: 'ENT Specialist', reason: 'Ear, nose, and throat symptoms detected requiring ENT evaluation' },
  { symptoms: ['burning_micturition', 'spotting_ urination', 'continuous_feel_of_urine', 'bladder_discomfort', 'foul_smell_of urine', 'dark_urine', 'yellow_urine', 'polyuria'], specialist: 'General Physician', reason: 'Urological symptoms detected — initial assessment by General Physician recommended' },
];

// Disease → specialist overrides for known diseases
const DISEASE_SPECIALIST_MAP: Record<string, string> = {
  'Heart attack': 'Cardiologist',
  'Bronchial Asthma': 'Pulmonologist',
  'Pneumonia': 'Pulmonologist',
  'Tuberculosis': 'Pulmonologist',
  'Migraine': 'Neurologist',
  'Paralysis (brain hemorrhage)': 'Neurologist',
  'Cervical spondylosis': 'Neurologist',
  '(vertigo) Paroymsal  Positional Vertigo': 'Neurologist',
  'Fungal infection': 'Dermatologist',
  'Acne': 'Dermatologist',
  'Psoriasis': 'Dermatologist',
  'Impetigo': 'Dermatologist',
  'GERD': 'Gastroenterologist',
  'Peptic ulcer diseae': 'Gastroenterologist',
  'Gastroenteritis': 'Gastroenterologist',
  'Chronic cholestasis': 'Gastroenterologist',
  'Jaundice': 'Gastroenterologist',
  'hepatitis A': 'Gastroenterologist',
  'Hepatitis B': 'Gastroenterologist',
  'Hepatitis C': 'Gastroenterologist',
  'Hepatitis D': 'Gastroenterologist',
  'Hepatitis E': 'Gastroenterologist',
  'Alcoholic hepatitis': 'Gastroenterologist',
  'Diabetes ': 'General Physician',
  'Hypertension ': 'Cardiologist',
  'Hyperthyroidism': 'General Physician',
  'Hypothyroidism': 'General Physician',
  'Hypoglycemia': 'General Physician',
  'Arthritis': 'Orthopedic',
  'Osteoarthristis': 'Orthopedic',
  'Varicose veins': 'General Physician',
  'Dimorphic hemmorhoids(piles)': 'General Physician',
  'Urinary tract infection': 'General Physician',
  'Dengue': 'General Physician',
  'Malaria': 'General Physician',
  'Typhoid': 'General Physician',
  'Chicken pox': 'General Physician',
  'Common Cold': 'General Physician',
  'AIDS': 'General Physician',
  'Drug Reaction': 'General Physician',
  'Allergy': 'General Physician',
};

export function determineSpecialist(disease: string, userSymptoms: string[]): { specialist: string; reason: string } {
  // 1. Check disease-level override first
  const diseaseOverride = DISEASE_SPECIALIST_MAP[disease];
  if (diseaseOverride) {
    return {
      specialist: diseaseOverride,
      reason: `${disease} is primarily managed by a ${diseaseOverride}`
    };
  }

  // 2. Check symptom pattern rules
  const normalizedSymptoms = userSymptoms.map(normalizeSymptom);
  let bestRule: { specialist: string; reason: string; matchCount: number } | null = null;

  for (const rule of SPECIALIST_RULES) {
    const matchCount = rule.symptoms.filter(s => normalizedSymptoms.includes(s)).length;
    if (matchCount > 0 && (!bestRule || matchCount > bestRule.matchCount)) {
      bestRule = { specialist: rule.specialist, reason: rule.reason, matchCount };
    }
  }

  if (bestRule) {
    return { specialist: bestRule.specialist, reason: bestRule.reason };
  }

  return { specialist: 'General Physician', reason: 'General assessment recommended for these symptoms' };
}

export async function calculateSeverityScore(userSymptoms: string[]): Promise<SeverityResult> {
  const severityMap = await buildSeverityMap();
  const normalizedSymptoms = userSymptoms.map(normalizeSymptom);

  const perSymptom: { symptom: string; weight: number }[] = [];
  let totalScore = 0;
  let maxWeight = 0;

  normalizedSymptoms.forEach(sym => {
    const weight = severityMap[sym] || 0;
    if (weight > 0) {
      perSymptom.push({ symptom: sym, weight });
      totalScore += weight;
      if (weight > maxWeight) maxWeight = weight;
    }
  });

  // Sort by weight descending
  perSymptom.sort((a, b) => b.weight - a.weight);

  let category: 'Low' | 'Moderate' | 'High' | 'Critical';
  if (totalScore >= 29) {
    category = 'Critical';
  } else if (totalScore >= 19) {
    category = 'High';
  } else if (totalScore >= 9) {
    category = 'Moderate';
  } else {
    category = 'Low';
  }

  return { totalScore, maxWeight, category, perSymptom };
}

export async function runSymptomAnalysisEngine(userSymptoms: string[]): Promise<FullAnalysisResult | null> {
  if (!userSymptoms || userSymptoms.length === 0) return null;

  const normalizedSymptoms = userSymptoms.map(normalizeSymptom);

  try {
    // 1. Build disease map from Supabase
    const diseaseMap = await buildDiseaseMap();
    if (Object.keys(diseaseMap).length === 0) return null;

    // 2. Score each disease by symptom match count
    const matches: { disease: string; matched: string[]; total: number }[] = [];

    Object.entries(diseaseMap).forEach(([disease, symptoms]) => {
      const matched = normalizedSymptoms.filter(us => symptoms.includes(us));
      if (matched.length > 0) {
        matches.push({ disease, matched, total: symptoms.length });
      }
    });

    // Sort by match count descending, then by total symptoms ascending (more specific)
    matches.sort((a, b) => {
      if (b.matched.length !== a.matched.length) return b.matched.length - a.matched.length;
      return a.total - b.total;
    });

    if (matches.length === 0) return null;

    // 3. Fetch descriptions and precautions for top matches
    const topDiseases = matches.slice(0, 5).map(m => m.disease);

    const [{ data: descData }, { data: precData }] = await Promise.all([
      supabase.from('disease_descriptions').select('disease, description').in('disease', topDiseases),
      supabase.from('precautions').select('*').in('disease', topDiseases),
    ]);

    const descMap = new Map<string, string>();
    if (descData) descData.forEach((d: any) => descMap.set(d.disease, d.description));

    const precMap = new Map<string, string[]>();
    if (precData) {
      precData.forEach((p: any) => {
        const precs: string[] = [];
        if (p.precaution1) precs.push(p.precaution1);
        if (p.precaution2) precs.push(p.precaution2);
        if (p.precaution3) precs.push(p.precaution3);
        if (p.precaution4) precs.push(p.precaution4);
        precMap.set(p.disease, precs);
      });
    }

    // 4. Build disease match results
    const buildMatch = (m: { disease: string; matched: string[]; total: number }): DiseaseMatch => {
      const confidence = Math.min(Math.round((m.matched.length / normalizedSymptoms.length) * 100), 98);
      return {
        disease: m.disease,
        matchedSymptoms: m.matched,
        totalDiseaseSymptoms: m.total,
        matchCount: m.matched.length,
        confidence,
        description: descMap.get(m.disease) || `Symptoms indicate possible ${m.disease}.`,
        precautions: precMap.get(m.disease) || ['Consult a medical practitioner.', 'Monitor symptoms closely.', 'Stay hydrated.', 'Rest adequately.'],
      };
    };

    const primaryDiagnosis = buildMatch(matches[0]);
    const alternativeDiagnoses = matches.slice(1, 5).map(buildMatch);

    // 5. Calculate severity
    const severity = await calculateSeverityScore(userSymptoms);

    // 6. Determine specialist
    const { specialist, reason: specialistReason } = determineSpecialist(
      primaryDiagnosis.disease,
      userSymptoms
    );

    // 7. Fetch matching doctors
    const doctors = await fetchMatchingDoctorsForSpec(specialist);

    // 8. Fetch recommended hospitals
    const hospitals = await fetchRecommendedHospitals(severity.category === 'Critical' || severity.category === 'High');

    // 9. Save report to ai_reports
    const symptomsText = userSymptoms.join(', ');
    const savedReport = await insertAiReport({
      condition: primaryDiagnosis.disease,
      severity: severity.category,
      specialist,
      confidence: primaryDiagnosis.confidence,
      description: primaryDiagnosis.description,
      precautions: primaryDiagnosis.precautions,
      clinicalNote: '',
      sourcedFrom: 'Supabase AI Symptom Analysis Engine',
    }, symptomsText);

    isSupabaseOnline = true;

    return {
      symptoms: userSymptoms,
      primaryDiagnosis,
      alternativeDiagnoses,
      severity,
      specialist,
      specialistReason,
      doctors,
      hospitals,
      reportId: savedReport.id,
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    console.error('Symptom analysis engine failed:', e);
    return null;
  }
}

async function fetchMatchingDoctorsForSpec(specialist: string): Promise<DbDoctor[]> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('specialization', specialist)
      .order('rating', { ascending: false })
      .limit(5);

    if (error) throw error;
    if (data && data.length > 0) {
      // Fetch hospital names
      const hospitalIds = [...new Set(data.map((d: any) => d.hospital_id))];
      const { data: hospData } = await supabase
        .from('hospitals')
        .select('id, name')
        .in('id', hospitalIds);

      const hospMap = new Map<number, string>();
      if (hospData) hospData.forEach((h: any) => hospMap.set(h.id, h.name));

      return data.map((d: any, index: number) => {
        const spec = d.specialization || 'General Physician';
        let avatarColor = 'from-blue-550 to-indigo-650';
        if (spec.includes('Cardio')) avatarColor = 'from-rose-500 to-red-600';
        else if (spec.includes('Neuro')) avatarColor = 'from-purple-500 to-indigo-700';
        else if (spec.includes('Pediatric') || spec.includes('ENT')) avatarColor = 'from-emerald-400 to-teal-650';
        else if (spec.includes('Dermato')) avatarColor = 'from-fuchsia-400 to-pink-650';
        else if (spec.includes('Gastro')) avatarColor = 'from-amber-500 to-orange-600';
        else if (spec.includes('Ortho')) avatarColor = 'from-cyan-400 to-blue-600';
        else if (spec.includes('Ophth')) avatarColor = 'from-sky-400 to-blue-500';
        else if (spec.includes('Psych')) avatarColor = 'from-violet-400 to-purple-600';
        else if (spec.includes('Gynec')) avatarColor = 'from-pink-400 to-rose-600';
        else if (spec.includes('Pulmo')) avatarColor = 'from-teal-400 to-emerald-600';

        return {
          id: String(d.id),
          name: d.name || `Dr. Specialist #${d.id}`,
          specialization: spec,
          experience: Number(d.experience) || 5,
          rating: Number(d.rating) || 4.5,
          hospital: hospMap.get(d.hospital_id) || 'Medical Center',
          distance: Number((1.2 + (index % 10) * 0.7).toFixed(1)),
          availableToday: d.available_today !== undefined ? d.available_today : true,
          timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
          avatarColor,
          phone: '+91-11-26588500',
          bio: `${d.qualification || 'MBBS'} with ${d.experience || 5} years of specialized experience in ${spec}.`,
          qualification: d.qualification || 'MBBS',
        };
      });
    }
  } catch (e) {
    console.warn('Failed to fetch matching doctors:', e);
  }
  return [];
}

async function fetchRecommendedHospitals(emergencyFirst: boolean): Promise<DbHospital[]> {
  try {
    let query = supabase
      .from('hospitals')
      .select('*')
      .order('rating', { ascending: false })
      .limit(5);

    if (emergencyFirst) {
      query = supabase
        .from('hospitals')
        .select('*')
        .eq('emergency_available', true)
        .order('rating', { ascending: false })
        .limit(5);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((h: any, index: number) => {
        const lat = Number(h.latitude) || 20;
        const lng = Number(h.longitude) || 78;
        let x = ((lng - 68) / (98 - 68)) * 100;
        let y = (1 - (lat - 8) / (38 - 8)) * 100;
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));

        let type = 'Hospital';
        if (h.name?.toLowerCase().includes('clinic')) type = 'Clinic';
        else if (h.name?.toLowerCase().includes('lab')) type = 'Lab';

        return {
          id: String(h.id),
          name: h.name || `Health Facility #${h.id}`,
          type,
          state: h.state || 'Delhi',
          district: h.city || 'New Delhi',
          ownership: index % 3 === 0 ? 'Private' : 'Public',
          licenseNumber: `HFR-IN-${100000 + Number(h.id)}`,
          rating: Number(h.rating) || 4.2,
          isOpen: true,
          emergencyBeds: h.emergency_available ? 25 : 0,
          phone: h.phone || '+91-11-26588500',
          address: h.address || `${h.city}, ${h.state}`,
          facilities: ['24/7 ICU & General Triage', 'Clinical Pathology', 'ABDM Health Locker Sync'],
          x,
          y,
          latitude: lat,
          longitude: lng,
        };
      });
    }
  } catch (e) {
    console.warn('Failed to fetch recommended hospitals:', e);
  }
  return [];
}

// Export the humanize helper for the UI
export { humanizeSymptom, normalizeSymptom };
