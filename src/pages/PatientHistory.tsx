import React, { useState, useMemo } from 'react';
import { generatePatientDataset, generateAppointmentRecords, PatientRecord } from '../utils/datasetGenerator';
import { User, Activity, FileText, Calendar, Search, MapPin, Pill, ArrowLeftRight, Heart, Info, ClipboardList } from 'lucide-react';

export default function PatientHistory() {
  // Pre-load patient list to resolve search IDs
  const allPatients = useMemo(() => generatePatientDataset(100), []); // First 100 as indexed lookups

  const [searchId, setSearchId] = useState('PT-00001');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Find current patient
  const patient = useMemo(() => {
    const p = allPatients.find(item => item.id.toUpperCase() === searchId.toUpperCase().trim());
    if (!p) {
      // Fallback generator if they type higher IDs
      const matches = generatePatientDataset(10000);
      const customP = matches.find(item => item.id.toUpperCase() === searchId.toUpperCase().trim());
      if (customP) {
        setErrorMessage('');
        return customP;
      }
      setErrorMessage('Patient ID not found in database. Try PT-00001 to PT-00100.');
      return allPatients[0];
    }
    setErrorMessage('');
    return p;
  }, [searchId, allPatients]);

  // Generate historical consultations for patient
  const history = useMemo(() => {
    return generateAppointmentRecords(patient.id, patient.name);
  }, [patient]);

  // Derived mock prescriptions based on diagnosis
  const prescriptions = useMemo(() => {
    const diag = patient.diagnosis;
    if (diag.includes('Dengue')) {
      return [
        { name: 'Paracetamol 650mg', dose: '1-0-1 (After meals)', duration: '5 Days', note: 'Avoid NSAIDs like Aspirin' },
        { name: 'ORS Fluids Sachet', dose: 'As needed (continuous)', duration: '5 Days', note: 'Ensure high fluid intake' }
      ];
    }
    if (diag.includes('Malaria')) {
      return [
        { name: 'Artesunate 200mg', dose: '1-0-0', duration: '3 Days', note: 'Take after heavy meals' },
        { name: 'Paracetamol 650mg', dose: '1-1-1', duration: '5 Days', note: 'For fever control' }
      ];
    }
    if (diag.includes('Tuberculosis')) {
      return [
        { name: 'Rifampicin 150mg', dose: '1-0-0 (Empty stomach)', duration: '6 Months', note: 'DOTS National Scheme' },
        { name: 'Isoniazid 300mg', dose: '1-0-0', duration: '6 Months', note: 'Strict daily adherence' }
      ];
    }
    if (diag.includes('Typhoid')) {
      return [
        { name: 'Ciprofloxacin 500mg', dose: '1-0-1', duration: '14 Days', note: 'Do not skip dosage' },
        { name: 'Pantoprazole 40mg', dose: '1-0-0 (Before meals)', duration: '7 Days', note: 'Acid control support' }
      ];
    }
    // Default general prescription
    return [
      { name: 'Metformin 500mg', dose: '0-0-1 (With dinner)', duration: 'Ongoing', note: 'Monitor blood sugar' },
      { name: 'Amlodipine 5mg', dose: '1-0-0 (Morning)', duration: 'Ongoing', note: 'Monitor blood pressure' }
    ];
  }, [patient]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Patient EHR Medical History</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Electronic Health Record (EHR) lookup panel. Audit patient historical charts, intake registries, and prescription checklists.
          </p>
        </div>

        {/* Sourced badge */}
        <div className="px-3 py-1.5 rounded-xl border dark:border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
          FHIR EHR INTEGRATION
        </div>
      </div>

      {/* Patient Search controls */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Query Patient ID</label>
          <div className="relative">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. PT-00001, PT-00045..."
              className="custom-input pl-10 text-xs py-2.5 dark:bg-slate-900 bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div className="text-right sm:self-end text-xs font-semibold text-slate-500 py-2">
          {errorMessage ? (
            <span className="text-red-500 font-bold">{errorMessage}</span>
          ) : (
            <span>Showing record details for patient <span className="text-brand-blue font-extrabold">{patient.name}</span></span>
          )}
        </div>
      </div>

      {/* Main EHR Details Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: Demographics Profile (1 column) */}
        <div className="glass-panel p-6 border-white/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/15 text-brand-blue flex items-center justify-center font-extrabold text-base flex-shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-extrabold text-white">{patient.name}</h3>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {patient.id}</span>
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-3.5 text-xs font-semibold text-slate-350">
              <div className="flex justify-between items-center py-1.5 border-b dark:border-slate-800/60 border-slate-100">
                <span className="text-slate-400">Age / Gender</span>
                <span className="text-white">{patient.age} Years / {patient.gender}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b dark:border-slate-800/60 border-slate-100">
                <span className="text-slate-400">Blood Group</span>
                <span className="text-brand-teal font-bold">{patient.bloodGroup}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b dark:border-slate-800/60 border-slate-100">
                <span className="text-slate-400">State / Region</span>
                <span className="text-white">{patient.state}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b dark:border-slate-800/60 border-slate-100">
                <span className="text-slate-400">Active Intake Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  patient.status === 'Admitted' ? 'bg-brand-teal/15 text-brand-teal' : 'bg-slate-800 text-slate-400'
                }`}>
                  {patient.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b dark:border-slate-800/60 border-slate-100">
                <span className="text-slate-400">Date of Admission</span>
                <span className="text-white">{patient.admissionDate}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b dark:border-slate-800/60 border-slate-100">
                <span className="text-slate-400">Accumulated Bill</span>
                <span className="text-white">₹{patient.billAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-dashed dark:border-slate-800 border-slate-200 text-[10px] font-semibold text-slate-500 text-center leading-relaxed">
            Record synchronization complete. Registry ID matched with ABDM Health Locker parameters.
          </div>
        </div>

        {/* Right Side: Timeline & Prescription tabs (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Prescriptions */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-1.5 text-brand-blue border-b dark:border-slate-900 border-slate-100 pb-3">
              <Pill className="w-5 h-5 text-brand-blue" />
              <h3 className="text-sm font-extrabold text-white">Active Clinical Prescriptions</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {prescriptions.map((pr, idx) => (
                <div key={idx} className="p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-brand-teal uppercase">Medicine Roster</span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{pr.name}</h4>
                  </div>
                  <div className="text-xs text-slate-650 dark:text-slate-400 font-semibold space-y-1">
                    <div>Dosage: <span className="text-slate-800 dark:text-white">{pr.dose}</span></div>
                    <div>Duration: <span className="text-slate-800 dark:text-white">{pr.duration}</span></div>
                    <div className="text-[10px] text-red-500 italic mt-1 font-bold">{pr.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical History timeline */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-1.5 text-brand-blue border-b dark:border-slate-900 border-slate-100 pb-3">
              <ClipboardList className="w-5 h-5 text-brand-blue" />
              <h3 className="text-sm font-extrabold text-white">Admissions & Diagnostic Logs</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/40 bg-white flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Intake Diagnosis</span>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{patient.diagnosis}</h4>
                  <span className="block text-[10px] text-slate-400">Admitted on: {patient.admissionDate}</span>
                </div>
                <span className="px-2.5 py-1.5 rounded-lg bg-brand-blue/15 text-brand-blue text-[10px] font-bold uppercase">Current Case</span>
              </div>

              {history.map((h, idx) => (
                <div key={idx} className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/10 bg-white flex justify-between items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Historical Consult</span>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{h.specialization} Assessment</h4>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Doctor: {h.doctorName} • {h.hospital}</span>
                  </div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">{h.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
