import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchAiReports, 
  fetchAppointments, 
  fetchEmergencyContacts, 
  insertEmergencyContact,
  deleteEmergencyContact,
  updateAppointmentApproval,
  deleteAppointment,
  rescheduleAppointment,
  fetchDoctors,
  fetchHospitals,
  checkSupabaseConnection,
  type DiagnosisReport,
  type DbAppointment,
  type EmergencyContact,
  type DbDoctor,
  type DbHospital
} from '../lib/db';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Heart, 
  ShieldAlert, 
  Users, 
  Wifi, 
  WifiOff, 
  Clock, 
  ArrowRight,
  ChevronRight,
  Bookmark,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Edit,
  Award,
  Building,
  UserCheck,
  Search,
  X,
  Sparkles,
  TrendingUp,
  Star,
  Stethoscope,
  MapPin,
  HeartOff
} from 'lucide-react';

interface UserDashboardProps {
  user: { email: string; role: string; name: string };
  setCurrentTab: (tab: string) => void;
  setSelectedSpecialization: (spec: string) => void;
}

export default function UserDashboard({ user, setCurrentTab, setSelectedSpecialization }: UserDashboardProps) {
  // Shared States
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [appointments, setAppointments] = useState<DbAppointment[]>([]);
  const [personalContacts, setPersonalContacts] = useState<EmergencyContact[]>([]);
  const [doctors, setDoctors] = useState<DbDoctor[]>([]);
  const [hospitals, setHospitals] = useState<DbHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Saved Doctors & Hospitals State
  const [savedDoctorIds, setSavedDoctorIds] = useState<string[]>([]);
  const [savedHospitalIds, setSavedHospitalIds] = useState<string[]>([]);

  // AI insights drawer state
  const [selectedReport, setSelectedReport] = useState<DiagnosisReport | null>(null);
  const [checkedPrecautions, setCheckedPrecautions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedReport) {
      setCheckedPrecautions({});
    }
  }, [selectedReport]);

  // Patient Mode Form State
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Rescheduling Modal State
  const [rescheduleApt, setRescheduleApt] = useState<DbAppointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Admin Verification Checklist State
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, boolean>>({
    '1': true, '2': true, '3': true
  });

  async function loadDashboardData() {
    try {
      const [rData, aData, cData, dData, hData] = await Promise.all([
        fetchAiReports(),
        fetchAppointments(),
        fetchEmergencyContacts(),
        fetchDoctors(),
        fetchHospitals()
      ]);
      setReports(rData);
      setAppointments(aData);
      setPersonalContacts(cData);
      setDoctors(dData);
      setHospitals(hData);

      const connected = await checkSupabaseConnection();
      setIsLive(connected);

      // Load Saved / Bookmarked IDs from localStorage with defaults if empty
      const localSavedDocs = localStorage.getItem('medhome_saved_doctor_ids');
      if (localSavedDocs) {
        setSavedDoctorIds(JSON.parse(localSavedDocs));
      } else {
        // Pre-populate with first two doctors
        const defaultDocIds = dData.slice(0, 2).map(d => d.id);
        setSavedDoctorIds(defaultDocIds);
        localStorage.setItem('medhome_saved_doctor_ids', JSON.stringify(defaultDocIds));
      }

      const localSavedHosps = localStorage.getItem('medhome_saved_hospital_ids');
      if (localSavedHosps) {
        setSavedHospitalIds(JSON.parse(localSavedHosps));
      } else {
        // Pre-populate with first two hospitals
        const defaultHospIds = hData.slice(0, 2).map(h => h.id);
        setSavedHospitalIds(defaultHospIds);
        localStorage.setItem('medhome_saved_hospital_ids', JSON.stringify(defaultHospIds));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Sync Saved Doctors / Hospitals to localStorage when changed
  const saveDoctorsToLocal = (ids: string[]) => {
    setSavedDoctorIds(ids);
    localStorage.setItem('medhome_saved_doctor_ids', JSON.stringify(ids));
  };

  const saveHospitalsToLocal = (ids: string[]) => {
    setSavedHospitalIds(ids);
    localStorage.setItem('medhome_saved_hospital_ids', JSON.stringify(ids));
  };

  const handleRemoveSavedDoctor = (id: string) => {
    const updated = savedDoctorIds.filter(docId => docId !== id);
    saveDoctorsToLocal(updated);
  };

  const handleRemoveSavedHospital = (id: string) => {
    const updated = savedHospitalIds.filter(hospId => hospId !== id);
    saveHospitalsToLocal(updated);
  };

  // Compute Patient Stats & Chart Data
  const statsAndCharts = useMemo(() => {
    // 1. Disease Distribution from reports
    const diseaseCounts: Record<string, number> = {};
    // Fallback/Default values if no reports exist yet to make chart stunning
    const defaultDiseases = {
      'Dengue Fever': 4,
      'Typhoid': 2,
      'Malaria': 3,
      'Migraine': 1,
      'Common Cold': 5
    };

    reports.forEach(r => {
      const condition = r.condition || 'Unknown Condition';
      diseaseCounts[condition] = (diseaseCounts[condition] || 0) + 1;
    });

    const activeDiseases = Object.keys(diseaseCounts).length > 0 ? diseaseCounts : defaultDiseases;
    const diseaseChartData = Object.entries(activeDiseases).map(([name, count]) => ({ name, count }));

    // 2. Symptom Frequency from reports or presets
    const symptomCounts: Record<string, number> = {};
    const defaultSymptoms = {
      'high_fever': 8,
      'headache': 6,
      'joint_pain': 5,
      'nausea': 4,
      'fatigue': 7,
      'cough': 3
    };

    reports.forEach(r => {
      // Precautions field was repurposed as symptoms in reports in checker auto-save
      if (r.precautions && r.precautions.length > 0) {
        r.precautions.forEach(s => {
          const clean = s.toLowerCase().trim().replace(/_/g, ' ');
          symptomCounts[clean] = (symptomCounts[clean] || 0) + 1;
        });
      }
    });

    const activeSymptoms = Object.keys(symptomCounts).length > 0 ? symptomCounts : defaultSymptoms;
    const symptomChartData = Object.entries(activeSymptoms)
      .map(([name, count]) => ({
        name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Appointment Activity: mock monthly counts for interactive timeline
    const appointmentActivity = [
      { month: 'Jan', count: 2 },
      { month: 'Feb', count: 4 },
      { month: 'Mar', count: 3 },
      { month: 'Apr', count: appointments.length || 5 },
      { month: 'May', count: (appointments.length + 2) || 7 },
      { month: 'Jun', count: (appointments.length + 3) || 8 }
    ];

    // Top primary symptom
    const topSymptom = symptomChartData[0]?.name || 'High Fever';

    return {
      diseaseChartData,
      symptomChartData,
      appointmentActivity,
      topSymptom
    };
  }, [reports, appointments]);

  // Filter appointments for Doctor Role
  const doctorAppointments = useMemo(() => {
    if (user.role !== 'Doctor') return [];
    const docPrefix = user.name.toLowerCase().replace('dr.', '').trim();
    return appointments.filter(a => a.doctorName.toLowerCase().includes(docPrefix));
  }, [appointments, user.name]);

  // Doctor metrics
  const doctorStats = useMemo(() => {
    const pending = doctorAppointments.filter(a => !a.approved).length;
    const approved = doctorAppointments.filter(a => a.approved).length;
    return {
      total: doctorAppointments.length,
      pending,
      approved
    };
  }, [doctorAppointments]);

  // General Dashboard Counts
  const dashboardStats = useMemo(() => {
    return {
      totalHospitals: hospitals.length,
      totalDoctors: doctors.length,
      totalReports: reports.length,
      totalAppointments: appointments.length,
      totalEmergencyContacts: personalContacts.length + 5 // Personal + 5 National Hotline fallbacks
    };
  }, [doctors, hospitals, reports, appointments, personalContacts]);

  // Saved components data extraction
  const savedDoctorsList = useMemo(() => {
    return doctors.filter(d => savedDoctorIds.includes(d.id));
  }, [doctors, savedDoctorIds]);

  const savedHospitalsList = useMemo(() => {
    return hospitals.filter(h => savedHospitalIds.includes(h.id));
  }, [hospitals, savedHospitalIds]);

  // Personal Contact Handlers
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const added = await insertEmergencyContact({
      contact_name: contactName,
      phone: contactPhone
    });

    if (added) {
      setPersonalContacts(prev => [...prev, added]);
    } else {
      // Offline fallback
      setPersonalContacts(prev => [...prev, {
        id: 'mock-' + Math.random().toString(36).substr(2, 9),
        name: contactName,
        phone: contactPhone,
        category: 'Personal Contact'
      }]);
    }
    setContactName('');
    setContactPhone('');
    setShowAddContact(false);
  };

  const handleDeleteContact = async (id: string) => {
    const success = await deleteEmergencyContact(id);
    if (success || id.startsWith('mock-')) {
      setPersonalContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  // Appointment Actions
  const handleApprove = async (id: string) => {
    const success = await updateAppointmentApproval(id, true);
    if (success) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, approved: true } : a));
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this consultation slot?')) {
      const success = await deleteAppointment(id);
      if (success) {
        setAppointments(prev => prev.filter(a => a.id !== id));
      }
    }
  };

  const handleOpenReschedule = (apt: DbAppointment) => {
    setRescheduleApt(apt);
    setNewDate(apt.date);
    setNewTime(apt.time);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt) return;

    const success = await rescheduleAppointment(rescheduleApt.id, newDate, newTime);
    if (success) {
      setAppointments(prev => prev.map(a => 
        a.id === rescheduleApt.id ? { ...a, date: newDate, time: newTime, approved: false } : a
      ));
      setRescheduleApt(null);
    }
  };

  // Admin beds vacancy updates
  const handleUpdateHospitalBeds = (hospId: string, increment: boolean) => {
    setHospitals(prev => prev.map(h => {
      if (h.id === hospId) {
        const currentBeds = h.emergencyBeds || 0;
        const newBeds = increment ? currentBeds + 1 : Math.max(0, currentBeds - 1);
        return { ...h, emergencyBeds: newBeds };
      }
      return h;
    }));
  };

  const toggleDocVerification = (docId: string) => {
    setVerifiedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-800">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Account Role: <span className="text-brand-blue font-bold uppercase tracking-wider">{user.role}</span> • Accessing live clinical registries, analytics modules, and rosters.
          </p>
        </div>

        {/* Live status banner */}
        <div className="flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border dark:border-slate-800 border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              Loading Backend...
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Supabase Connected
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:border-amber-500/30">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              Local Sandbox Mode
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center font-bold text-slate-400">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Compiling Workspace Environment...
        </div>
      ) : (
        <>
          {/* ========================================== */}
          {/* 1. PATIENT DASHBOARD SCREEN (PREMIUM DESIGN)*/}
          {/* ========================================== */}
          {user.role === 'Patient' && (
            <div className="space-y-8">
              {/* Stats Cards Row */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
              >
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="glass-panel p-5 flex items-center justify-between border-white/5"
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospitals</span>
                    <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">{dashboardStats.totalHospitals}</h3>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">ABDM HFR Registry</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                </motion.div>

                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="glass-panel p-5 flex items-center justify-between border-white/5"
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctors</span>
                    <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">{dashboardStats.totalDoctors}</h3>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">Verified Active</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </motion.div>

                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="glass-panel p-5 flex items-center justify-between border-white/5"
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Reports</span>
                    <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">{dashboardStats.totalReports}</h3>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">Diagnoses Run</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-450 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                </motion.div>

                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="glass-panel p-5 flex items-center justify-between border-white/5"
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointments</span>
                    <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">{dashboardStats.totalAppointments}</h3>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">Active Bookings</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-450 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                </motion.div>

                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="glass-panel p-5 flex items-center justify-between border-white/5"
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Helplines</span>
                    <h3 className="text-2xl font-extrabold dark:text-white text-slate-900">{dashboardStats.totalEmergencyContacts}</h3>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">Emergency Contacts</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-emergency/15 text-brand-emergency flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Disease Distribution Chart */}
                <div className="glass-panel p-6 space-y-4 border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Disease Distribution</span>
                    <Sparkles className="w-4 h-4 text-brand-red-light" />
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {statsAndCharts.diseaseChartData.slice(0, 4).map((item, idx) => {
                      const maxVal = Math.max(...statsAndCharts.diseaseChartData.map(d => d.count), 1);
                      const percent = (item.count / maxVal) * 100;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="dark:text-slate-300 text-slate-600 truncate max-w-[190px]">{item.name}</span>
                            <span className="text-[#E53935] font-bold">{item.count} Cases</span>
                          </div>
                          <div className="h-2 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                              className="h-full bg-gradient-to-r from-[#E53935] to-[#FF6B6B] rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Frequent Symptoms Chart */}
                <div className="glass-panel p-6 space-y-4 border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Frequent Symptoms</span>
                    <Activity className="w-4 h-4 text-[#FF6B6B] animate-pulse" />
                  </div>
                  
                  <div className="h-36 flex items-end justify-between gap-3 pt-4">
                    {statsAndCharts.symptomChartData.map((item, i) => {
                      const maxVal = Math.max(...statsAndCharts.symptomChartData.map(s => s.count), 1);
                      const height = (item.count / maxVal) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[10px] font-extrabold text-white">{item.count}</span>
                          <div className="w-full bg-[#FF6B6B]/10 rounded-t-lg relative group overflow-hidden h-full flex flex-col justify-end">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 1, ease: 'easeOut', delay: i * 0.05 }}
                              className="w-full bg-gradient-to-t from-[#B71C1C] via-[#E53935] to-[#FF6B6B] hover:opacity-90 transition-opacity origin-bottom rounded-t-lg"
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-tight block max-w-[50px] truncate leading-tight">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Appointment Activity Timeline */}
                <div className="glass-panel p-6 space-y-4 border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Appointment Activity</span>
                    <TrendingUp className="w-4 h-4 text-[#FF6B6B]" />
                  </div>

                  <div className="h-36 flex items-end justify-between gap-3 pt-4 relative">
                    {/* SVG Line representation overlay */}
                    <div className="absolute inset-0 pt-8 pb-6 px-4 pointer-events-none">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E53935" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#E53935" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path 
                          d="M 5,90 L 20,60 L 40,75 L 60,35 L 80,20 L 95,15 L 95,95 L 5,95 Z" 
                          fill="url(#lineGrad)" 
                          stroke="none" 
                        />
                        {/* Line */}
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                          d="M 5,90 L 20,60 L 40,75 L 60,35 L 80,20 L 95,15" 
                          fill="none" 
                          stroke="#E53935" 
                          strokeWidth="2.5"
                          strokeLinecap="round" 
                        />
                        {/* Coordinate points */}
                        <g>
                          <circle cx="5" cy="90" r="3.5" fill="#FF6B6B" stroke="#0A0A0A" strokeWidth="1" className="animate-pulse" />
                          <circle cx="20" cy="60" r="3.5" fill="#FF6B6B" stroke="#0A0A0A" strokeWidth="1" className="animate-pulse" />
                          <circle cx="40" cy="75" r="3.5" fill="#FF6B6B" stroke="#0A0A0A" strokeWidth="1" className="animate-pulse" />
                          <circle cx="60" cy="35" r="3.5" fill="#FF6B6B" stroke="#0A0A0A" strokeWidth="1" className="animate-pulse" />
                          <circle cx="80" cy="20" r="3.5" fill="#FF6B6B" stroke="#0A0A0A" strokeWidth="1" className="animate-pulse" />
                          <circle cx="95" cy="15" r="3.5" fill="#FF6B6B" stroke="#0A0A0A" strokeWidth="1" className="animate-pulse" />
                        </g>
                      </svg>
                    </div>

                    {statsAndCharts.appointmentActivity.map((act, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end z-10">
                        <span className="text-[9px] font-mono font-extrabold text-[#FF6B6B] bg-[#E53935]/12 px-1 py-0.5 rounded">{act.count}</span>
                        <div className="h-16" />
                        <span className="text-[9px] font-bold text-slate-450 uppercase">{act.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Splits: Appointments & Reports */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Upcoming Appointments */}
                  <div className="glass-panel p-6 space-y-4">
                    <div className="flex justify-between items-center border-b dark:border-slate-900 border-slate-200 pb-3">
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Clock className="w-4.5 h-4.5 text-brand-blue" />
                        Upcoming Appointments
                      </h3>
                      <button 
                        onClick={() => setCurrentTab('doctors')}
                        className="text-[10px] font-bold text-brand-blue hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        Book Consultation <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {appointments.length > 0 ? (
                        appointments.slice(0, 3).map((apt) => (
                          <div key={apt.id} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-brand-blue/35 transition-all">
                            <div className="space-y-0.5 text-left">
                              <h4 className="text-sm font-extrabold dark:text-white text-slate-800">{apt.doctorName}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{apt.specialization} • {apt.hospital}</p>
                              <div className="flex gap-4 text-[10px] font-mono text-slate-400 font-bold uppercase pt-1">
                                <span>Date: {apt.date}</span>
                                <span>Time: {apt.time}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                apt.approved ? 'bg-brand-teal/10 text-brand-teal' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                              }`}>
                                {apt.approved ? 'Scheduled' : 'Pending Approval'}
                              </span>
                              <button 
                                onClick={() => handleOpenReschedule(apt)}
                                className="p-1.5 rounded dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-200 hover:text-brand-blue cursor-pointer"
                                title="Reschedule"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleCancel(apt.id)}
                                className="p-1.5 rounded dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-200 hover:text-red-500 cursor-pointer"
                                title="Cancel Appointment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                          No upcoming appointments scheduled.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent AI Reports */}
                  <div className="glass-panel p-6 space-y-4">
                    <div className="flex justify-between items-center border-b dark:border-slate-900 border-slate-200 pb-3">
                      <h3 className="text-sm font-extrabold dark:text-white text-slate-800 flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-brand-teal" />
                        Recent AI Diagnostic Reports
                      </h3>
                      <button 
                        onClick={() => setCurrentTab('checker')}
                        className="text-[10px] font-bold text-brand-teal dark:hover:text-white hover:text-brand-teal/80 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        Analyze Symptoms <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {reports.length > 0 ? (
                        reports.slice(0, 3).map((rep) => (
                          <div 
                            key={rep.id} 
                            onClick={() => setSelectedReport(rep)}
                            className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-brand-teal/50 hover:scale-[1.01] hover:shadow-lg transition-all duration-200 cursor-pointer"
                          >
                            <div className="space-y-0.5 text-left">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Report ID: {rep.id}</span>
                              <h4 className="text-sm font-extrabold dark:text-white text-slate-800 mt-0.5">{rep.condition}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[320px]">{rep.description}</p>
                              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider pt-1">
                                <span className="text-brand-teal">Confidence: {rep.confidence}%</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Created: {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'Today'}</span>
                              </div>
                            </div>
                            <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              rep.severity === 'Critical' || rep.severity === 'Urgent'
                                ? 'bg-brand-emergency text-white animate-pulse'
                                : (rep.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-brand-blue/10 text-brand-blue')
                            }`}>
                              {rep.severity}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                          No AI diagnostic sheets found. Run the Symptom Checker to generate your first sheet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Emergency contacts card */}
                  <div className="glass-panel p-5 space-y-4 border-brand-emergency/20 border">
                    <div className="flex justify-between items-center border-b dark:border-slate-900 border-slate-200 pb-2.5">
                      <h3 className="text-xs font-extrabold dark:text-white text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4.5 h-4.5 text-brand-emergency" />
                        Emergency Helplines
                      </h3>
                      <button 
                        onClick={() => setShowAddContact(!showAddContact)}
                        className="text-[9px] font-bold text-brand-blue dark:hover:text-white hover:text-brand-blue/80 uppercase flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Personal
                      </button>
                    </div>

                    {showAddContact && (
                      <form onSubmit={handleAddContact} className="p-3 rounded-lg border dark:border-slate-800 bg-slate-900/60 space-y-2.5">
                        <input
                          type="text"
                          required
                          placeholder="Contact Name..."
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="custom-input text-[11px] py-1.5"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone number..."
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="custom-input text-[11px] py-1.5"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button 
                            type="button" 
                            onClick={() => setShowAddContact(false)}
                            className="px-2.5 py-1 text-[9px] uppercase font-bold text-slate-400 border dark:border-slate-800 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-2.5 py-1 text-[9px] uppercase font-bold text-white bg-brand-blue rounded cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {/* Personal Contacts */}
                      {personalContacts.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-2 rounded-lg border dark:border-slate-800 dark:bg-slate-900/40 bg-slate-50 text-xs">
                          <div className="text-left">
                            <h4 className="font-extrabold text-white">{c.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{c.phone}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteContact(c.id)}
                            className="p-1 rounded hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* National Hotline Fallbacks */}
                      <div className="flex justify-between items-center p-2 rounded-lg border border-red-500/10 dark:bg-red-950/5 bg-red-50/50 text-xs">
                        <div className="text-left">
                          <h4 className="font-extrabold dark:text-red-300 text-red-650">National Disaster Response</h4>
                          <p className="text-[10px] text-slate-450">1078 (ICU/ER Dispatch)</p>
                        </div>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-550/10 text-red-400">Hotline</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg border border-brand-blue/10 dark:bg-blue-950/5 bg-blue-50/50 text-xs">
                        <div className="text-left">
                          <h4 className="font-extrabold dark:text-blue-300 text-blue-650">Aids/Trauma Helpline</h4>
                          <p className="text-[10px] text-slate-450">1097 (24/7 Clinical Desk)</p>
                        </div>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-blue/10 text-brand-blue">Hotline</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Doctors & Saved Hospitals Sections */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Saved Doctors List */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="flex justify-between items-center border-b dark:border-slate-900 border-slate-200 pb-3">
                    <h3 className="text-sm font-extrabold dark:text-white text-slate-800 flex items-center gap-2">
                      <Stethoscope className="w-4.5 h-4.5 text-brand-teal" />
                      Saved Medical Practitioners ({savedDoctorsList.length})
                    </h3>
                    <button 
                      onClick={() => setCurrentTab('doctors')}
                      className="text-[10px] font-bold text-brand-blue dark:hover:text-white hover:text-brand-blue/85 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      Find Doctors <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {savedDoctorsList.length > 0 ? (
                      savedDoctorsList.map((doc) => (
                        <div key={doc.id} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-slate-50 flex flex-col justify-between relative hover:border-brand-teal/30 transition-all">
                          <button
                            onClick={() => handleRemoveSavedDoctor(doc.id)}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer"
                            title="Remove Saved Doctor"
                          >
                            <HeartOff className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="text-left space-y-1">
                            <h4 className="text-xs font-extrabold dark:text-white text-slate-800 pr-5">{doc.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{doc.specialization}</p>
                            <p className="text-[10px] text-slate-500">{doc.hospital}</p>
                            
                            <div className="flex items-center gap-3 pt-1 text-[10px]">
                              <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" /> {doc.rating}
                              </div>
                              <span className="text-slate-400 dark:text-slate-600">•</span>
                              <span className="text-slate-500 dark:text-slate-400 font-semibold">{doc.experience} Years Exp</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t dark:border-slate-900 border-slate-200 mt-3 flex justify-between items-center">
                            <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                              {doc.availableToday ? 'Available Today' : 'Slot Available'}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedSpecialization(doc.specialization);
                                setCurrentTab('doctors');
                              }}
                              className="text-[10px] font-extrabold uppercase tracking-wider text-brand-blue dark:hover:text-white hover:text-brand-blue-dark transition-colors"
                            >
                              Book Slot
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-slate-500 text-xs font-semibold">
                        No saved doctors. Select the heart icon on any doctor listing in Doctor Finder to save them here.
                      </div>
                    )}
                  </div>
                </div>

                {/* Saved Hospitals List */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="flex justify-between items-center border-b dark:border-slate-900 border-slate-200 pb-3">
                    <h3 className="text-sm font-extrabold dark:text-white text-slate-800 flex items-center gap-2">
                      <Building className="w-4.5 h-4.5 text-brand-blue" />
                      Saved Health Facilities ({savedHospitalsList.length})
                    </h3>
                    <button 
                      onClick={() => setCurrentTab('hospitals')}
                      className="text-[10px] font-bold text-brand-blue dark:hover:text-white hover:text-brand-blue/85 uppercase flex items-center gap-1 cursor-pointer"
                    >
                      Hospital Finder <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {savedHospitalsList.length > 0 ? (
                      savedHospitalsList.map((hosp) => (
                        <div key={hosp.id} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-slate-50 flex flex-col justify-between relative hover:border-brand-blue/30 transition-all">
                          <button
                            onClick={() => handleRemoveSavedHospital(hosp.id)}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer"
                            title="Remove Saved Hospital"
                          >
                            <HeartOff className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="text-left space-y-1">
                            <h4 className="text-xs font-extrabold dark:text-white text-slate-800 pr-5">{hosp.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{hosp.type}</p>
                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {hosp.district}, {hosp.state}
                            </p>
                            
                            <div className="flex items-center gap-3 pt-1 text-[10px]">
                              <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" /> {hosp.rating}
                              </div>
                              <span className="text-slate-400 dark:text-slate-650">•</span>
                              <span className="text-brand-teal font-extrabold">{hosp.emergencyBeds} beds vacant</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t dark:border-slate-900 border-slate-200 mt-3 flex justify-between items-center">
                            <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
                              ABDM Facility
                            </span>
                            <button
                              onClick={() => {
                                setCurrentTab('hospitals');
                              }}
                              className="text-[10px] font-extrabold uppercase tracking-wider text-brand-blue dark:hover:text-white hover:text-brand-blue-dark transition-colors"
                            >
                              View on Map
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-slate-500 text-xs font-semibold">
                        No saved hospitals. Select the heart icon on any hospital page to save them here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 2. DOCTOR DASHBOARD SCREEN                  */}
          {/* ========================================== */}
          {user.role === 'Doctor' && (
            <div className="space-y-8">
              {/* Doctor Stats Grid */}
              <div className="grid grid-cols-3 gap-6">
                <div className="glass-panel p-5 flex items-center justify-between border-white/5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Consults Assigned</span>
                    <h3 className="text-2xl font-extrabold text-white">{doctorStats.total}</h3>
                    <span className="block text-[9px] text-slate-455 font-medium">All Consults List</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 flex items-center justify-between border-white/5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled (Approved)</span>
                    <h3 className="text-2xl font-extrabold text-brand-teal">{doctorStats.approved}</h3>
                    <span className="block text-[9px] text-brand-teal font-medium">Verified Active Slots</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 flex items-center justify-between border-white/5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</span>
                    <h3 className="text-2xl font-extrabold text-amber-500">{doctorStats.pending}</h3>
                    <span className="block text-[9px] text-amber-550 font-medium">Requests Pending Review</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-550 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Roster Panel */}
              <div className="glass-panel p-6 space-y-4 text-left">
                <h3 className="text-base font-extrabold dark:text-white text-slate-800 border-b dark:border-slate-900 border-slate-200 pb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-blue" />
                  Clinical Consultation Roster
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-400 uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-4 text-left font-mono">Patient Name</th>
                        <th className="py-3 px-4 text-left font-mono">Date</th>
                        <th className="py-3 px-4 text-left font-mono">Time Slot</th>
                        <th className="py-3 px-4 text-center font-mono">Status</th>
                        <th className="py-3 px-4 text-right font-mono">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorAppointments.length > 0 ? (
                        doctorAppointments.map((apt) => (
                          <tr key={apt.id} className="border-b dark:border-slate-900/60 border-slate-200 hover:bg-slate-900/20">
                            <td className="py-4 px-4 font-extrabold dark:text-white text-slate-900">{apt.patientName}</td>
                            <td className="py-4 px-4 font-mono">{apt.date}</td>
                            <td className="py-4 px-4 font-mono">{apt.time}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                                apt.approved ? 'bg-brand-teal/15 text-brand-teal' : 'bg-amber-500/15 text-amber-500 animate-pulse'
                              }`}>
                                {apt.approved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex gap-2 justify-end">
                                {!apt.approved && (
                                  <button 
                                    onClick={() => handleApprove(apt.id)}
                                    className="p-1.5 rounded dark:bg-emerald-950/40 bg-emerald-55 text-emerald-500 dark:border-emerald-900/40 border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" /> Approve
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleOpenReschedule(apt)}
                                  className="p-1.5 rounded dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-200 hover:text-brand-blue cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold text-slate-350"
                                >
                                  <Edit className="w-3.5 h-3.5" /> Reschedule
                                </button>
                                <button 
                                  onClick={() => handleCancel(apt.id)}
                                  className="p-1.5 rounded dark:bg-red-950/30 bg-red-55 border dark:border-red-900/40 border-red-200 text-brand-emergency hover:bg-brand-emergency hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-500 font-semibold italic">No patient consultations assigned to your profile yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 3. ADMIN DASHBOARD SCREEN                  */}
          {/* ========================================== */}
          {user.role === 'Admin' && (
            <div className="space-y-8">
              {/* Admin Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-5 flex items-center justify-between border-white/5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patients Registered</span>
                    <h3 className="text-2xl font-extrabold text-white">242</h3>
                    <span className="block text-[9px] text-slate-455 font-medium">Platform Users Count</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 flex items-center justify-between border-white/5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Doctors</span>
                    <h3 className="text-2xl font-extrabold text-brand-teal">{dashboardStats.totalDoctors}</h3>
                    <span className="block text-[9px] text-brand-teal font-medium">Active Practitioners</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                <div className="glass-panel p-5 flex items-center justify-between border-white/5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospital Units</span>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{dashboardStats.totalHospitals}</h3>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">ABDM HFR Registered</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 flex items-center justify-between border-white/5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointments Managed</span>
                    <h3 className="text-2xl font-extrabold text-amber-500">{dashboardStats.totalAppointments}</h3>
                    <span className="block text-[9px] text-amber-600 dark:text-amber-400 font-medium">Total Consultations</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Admin Main Splits */}
              <div className="grid lg:grid-cols-2 gap-8 text-left">
                
                {/* Hospital Vacancy Controller */}
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 border-b dark:border-slate-900 border-slate-200 pb-3">
                    <Building className="w-4.5 h-4.5 text-brand-teal" />
                    ABDM Emergency ICU Beds Vacancy Controller
                  </h3>
                  
                  <div className="space-y-3">
                    {hospitals.slice(0, 5).map(hosp => (
                      <div key={hosp.id} className="p-3 rounded-xl border dark:border-slate-800 dark:bg-slate-900/60 bg-slate-50 flex items-center justify-between gap-4">
                        <div className="text-left">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{hosp.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{hosp.address.split(',')[0]} • {hosp.state}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-extrabold text-brand-teal font-mono">
                            {hosp.emergencyBeds} Beds Vacant
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdateHospitalBeds(hosp.id, false)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleUpdateHospitalBeds(hosp.id, true)}
                              className="px-2 py-1 rounded bg-brand-teal text-white font-bold text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor Verification Auditing */}
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 border-b dark:border-slate-900 border-slate-200 pb-3">
                    <Award className="w-4.5 h-4.5 text-brand-blue" />
                    Medical Credentials Auditing Registry
                  </h3>

                  <div className="space-y-3">
                    {doctors.slice(0, 5).map(doc => {
                      const isVerified = verifiedDocs[doc.id] !== false;
                      return (
                        <div key={doc.id} className="p-3 rounded-xl border dark:border-slate-800 dark:bg-slate-900/60 bg-slate-50 flex items-center justify-between gap-4">
                          <div className="text-left">
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{doc.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{doc.specialization} • ({doc.qualification})</p>
                          </div>

                          <button
                            onClick={() => toggleDocVerification(doc.id)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                              isVerified 
                                ? 'bg-brand-teal/15 text-brand-teal border border-brand-teal/30' 
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            }`}
                          >
                            {isVerified ? '✓ Verified' : 'Audit Pending'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      )}

      {/* Rescheduling Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 relative bg-white dark:bg-slate-950 border border-white/10 shadow-2xl animate-fade-in text-left">
            <button 
              onClick={() => setRescheduleApt(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleConfirmReschedule} className="space-y-5">
              <div className="flex items-center gap-2 text-brand-blue">
                <Edit className="w-5 h-5 animate-pulse" />
                <h3 className="text-lg font-extrabold tracking-tight text-white">Reschedule Consultation</h3>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200 text-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Practitioner Details</span>
                <div className="text-sm font-extrabold text-white mt-0.5">{rescheduleApt.doctorName}</div>
                <div className="text-xs text-slate-400 font-semibold">{rescheduleApt.specialization} • {rescheduleApt.hospital}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Time</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-1.5 py-3 text-xs uppercase font-extrabold tracking-wider cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Reschedule Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Insights Drawer */}
      <AnimatePresence>
        {selectedReport && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            {/* Drawer body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-md dark:bg-[#111] bg-white border-l border-slate-200 dark:border-white/10 z-55 shadow-2xl flex flex-col text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-teal" />
                    AI Diagnostic Insights
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">REPORT ID: {selectedReport.id}</span>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Condition Name & Severity */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Predicted Condition</span>
                      <h4 className="text-xl font-black dark:text-white text-slate-800 mt-1">{selectedReport.condition}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedReport.severity === 'Critical' || selectedReport.severity === 'Urgent'
                        ? 'bg-brand-emergency text-white animate-pulse'
                        : selectedReport.severity === 'High'
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : 'bg-brand-blue/10 text-brand-blue'
                    }`}>
                      {selectedReport.severity}
                    </span>
                  </div>

                  {/* Confidence Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Diagnosis Confidence</span>
                      <span className="text-brand-teal">{selectedReport.confidence}%</span>
                    </div>
                    {/* Sleek progress bar */}
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedReport.confidence}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-brand-teal to-[#26A69A] rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Clinical Description</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Precautions checklist */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Recovery Action Plan</h5>
                    <span className="text-[10px] font-bold text-brand-teal">
                      {Object.values(checkedPrecautions).filter(Boolean).length} of{' '}
                      {selectedReport.precautions?.length || 4} Completed
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      animate={{
                        width: `${
                          ((Object.values(checkedPrecautions).filter(Boolean).length) /
                            (selectedReport.precautions?.length || 4)) *
                          100
                        }%`,
                      }}
                      className="h-full bg-brand-teal rounded-full"
                    />
                  </div>

                  <div className="space-y-2.5">
                    {(selectedReport.precautions?.length ? selectedReport.precautions : [
                      'Rest and monitor body temperature',
                      'Keep hydrated with electrolytes',
                      'Avoid self-medicating without clinical consult',
                      'Track key vital signs hourly'
                    ]).map((precaution, idx) => {
                      const isChecked = !!checkedPrecautions[precaution];
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setCheckedPrecautions((prev) => ({
                              ...prev,
                              [precaution]: !prev[precaution],
                            }))
                          }
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                            isChecked
                              ? 'bg-brand-teal/5 border-brand-teal/30 text-slate-800 dark:text-white'
                              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-brand-teal border-brand-teal text-white'
                                : 'border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            {isChecked && (
                              <svg
                                className="w-2.5 h-2.5 stroke-2 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-xs font-semibold select-none leading-tight">
                            {precaution}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sourcing details */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/55 dark:bg-white/2 text-[10px] text-slate-500 dark:text-slate-400 font-bold space-y-1">
                  <div>DATABASE ORIGIN: {selectedReport.sourcedFrom || 'Supabase Clinical Desk'}</div>
                  <div>TIMESTAMP: {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'Just Now'}</div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 space-y-3">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center mb-1">
                  <span>Recommended Specialist:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedReport.specialist || 'General Physician'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedSpecialization(selectedReport.specialist || 'All');
                    setCurrentTab('doctors');
                    setSelectedReport(null);
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-1.5 py-3 text-xs uppercase font-extrabold tracking-wider cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Book Consult with {selectedReport.specialist || 'Physician'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
