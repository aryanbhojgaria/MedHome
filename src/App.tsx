import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import LandingPage from './pages/LandingPage';
import SymptomChecker from './pages/SymptomChecker';
import DoctorFinder from './pages/DoctorFinder';
import HospitalFinder from './pages/HospitalFinder';
import EmergencySOS from './pages/EmergencySOS';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DiseaseHeatMap from './pages/DiseaseHeatMap';
import PatientHistory from './pages/PatientHistory';
import AppointmentHistory from './pages/AppointmentHistory';
import HealthReports from './pages/HealthReports';
import EmergencyContacts from './pages/EmergencyContacts';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import { abdmHfrFacilities } from './data/openDatasets';
import { fetchAppointments, deleteAppointment, updateAppointmentApproval } from './lib/db';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(true);

  // Authentication State
  const [session, setSession] = useState<{ email: string; role: 'Patient' | 'Doctor' | 'Admin' | string; name: string } | null>(null);

  // Centralized Appointments State Sync
  const [appointments, setAppointments] = useState<any[]>([]);
  const [icuBedsCount, setIcuBedsCount] = useState(45); // default AIIMS beds vacancy
  const [verifiedDocs, setVerifiedDocs] = useState<string[]>([
    'doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5'
  ]);

  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  // Load appointments from database on mount or when tab changes
  useEffect(() => {
    async function load() {
      if (session) {
        const data = await fetchAppointments();
        setAppointments(data);
      }
    }
    load();
  }, [currentTab, session]);

  // Handle dark mode class wrapper bindings
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (darkMode) {
      root.classList.add('dark');
      body.classList.remove('light');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }, [darkMode]);

  // Sync beds counter modifications directly to ABDM dataset
  useEffect(() => {
    const aiims = abdmHfrFacilities.find(h => h.id === 'hfr-1');
    if (aiims) {
      aiims.emergencyBeds = icuBedsCount;
    }
  }, [icuBedsCount]);

  // Update dynamic titles for SEO/Auditing fidelity
  useEffect(() => {
    const tabTitles: Record<string, string> = {
      landing: 'Home - AI Healthcare Navigation',
      dashboard: 'User Dashboard & Insights',
      checker: 'AI Symptom Checker & Diagnostics',
      doctors: 'Find Verified Doctors',
      hospitals: 'Emergency Hospital Finder & Routing',
      sos: 'EMERGENCY SOS TRIAGE',
      analytics: 'Healthcare Analytics Warehouse',
      heatmap: 'Disease Incidence Heat Map',
      history: 'EHR Patient Medical Logs',
      appointments: 'Consultations Timeline',
      reports: 'Laboratory Pathology Sheets',
      contacts: 'National Hotlines Directory'
    };
    document.title = `MedHome | ${tabTitles[currentTab] || 'Healthcare Platform'}`;
  }, [currentTab]);

  const handleAddAppointment = (newApt: any) => {
    setAppointments(prev => [newApt, ...prev.filter(a => a.id !== newApt.id)]);
  };

  const handleCancelAppointment = async (id: string) => {
    await deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const handleApproveAppointment = async (id: string) => {
    await updateAppointmentApproval(id, true);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, approved: true } : a));
  };

  const handleLogout = () => {
    setSession(null);
    setCurrentTab('landing');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Background radial overlays */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-teal/5 dark:bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation header */}
        <Navbar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          lang={lang} 
          setLang={setLang} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          session={session}
          onLogout={handleLogout}
        />

        {/* Page Switcher */}
        <main className="flex-1 w-full relative">
          {/* Protected Routes Handler: If not logged in and not landing, show Auth screen */}
          {!session && currentTab !== 'landing' ? (
            <AuthPage onAuthSuccess={(user) => {
              setSession(user);
              setCurrentTab('dashboard');
            }} />
          ) : (
            <>
              {currentTab === 'landing' && (
                <LandingPage setCurrentTab={setCurrentTab} lang={lang} />
              )}

              {currentTab === 'dashboard' && session && (
                <UserDashboard 
                  user={session} 
                  setCurrentTab={setCurrentTab} 
                  setSelectedSpecialization={setSelectedSpecialization}
                />
              )}

              {currentTab === 'checker' && (
                <SymptomChecker 
                  setCurrentTab={setCurrentTab} 
                  setSelectedSpecialization={setSelectedSpecialization} 
                  lang={lang} 
                />
              )}

              {currentTab === 'doctors' && (
                <DoctorFinder 
                  lang={lang} 
                  onAddAppointment={handleAddAppointment} 
                  selectedSpecialization={selectedSpecialization}
                  setSelectedSpecialization={setSelectedSpecialization}
                />
              )}

              {currentTab === 'hospitals' && (
                <HospitalFinder 
                  setCurrentTab={setCurrentTab}
                  setSelectedSpecialization={setSelectedSpecialization}
                />
              )}

              {currentTab === 'sos' && (
                <EmergencySOS />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsDashboard />
              )}

              {currentTab === 'heatmap' && (
                <DiseaseHeatMap />
              )}

              {currentTab === 'history' && (
                <PatientHistory />
              )}

              {currentTab === 'appointments' && (
                <AppointmentHistory appointments={appointments} />
              )}

              {currentTab === 'reports' && (
                <HealthReports />
              )}

              {currentTab === 'contacts' && (
                <EmergencyContacts />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating SOS Emergency Button */}
      {currentTab !== 'sos' && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentTab('sos')}
          className="fixed bottom-6 left-6 z-40 px-5 py-3.5 rounded-full bg-[#E53935] hover:bg-[#B71C1C] text-white shadow-[0_0_24px_rgba(229,57,53,0.5)] border border-[#FF6B6B]/30 flex items-center gap-2 cursor-pointer transition-colors duration-200"
          title="Trigger Emergency SOS Triage"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <ShieldAlert className="w-4 h-4 text-white" />
          <span className="text-xs font-black tracking-widest uppercase font-mono">SOS Emergency</span>
        </motion.button>
      )}

      {/* Floating Chat Assistant */}
      <ChatBot />

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t dark:border-slate-900 border-slate-200 dark:bg-slate-950/40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-gradient font-bold text-sm">MedHome</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => setCurrentTab('landing')} className="hover:text-brand-blue transition-colors">Privacy Policy</button>
            <button onClick={() => setCurrentTab('landing')} className="hover:text-brand-blue transition-colors">Clinical Disclaimer</button>
            <button onClick={() => setCurrentTab('analytics')} className="hover:text-brand-blue transition-colors">Data Sourcing Logs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
