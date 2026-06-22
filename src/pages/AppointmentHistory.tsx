import React, { useState } from 'react';
import { Calendar, Clock, Search, ArrowRight, ShieldCheck, Download, Filter, FileText } from 'lucide-react';
import { generateAppointmentRecords } from '../utils/datasetGenerator';

interface AppointmentHistoryProps {
  appointments: any[]; // active bookings from central state
}

export default function AppointmentHistory({ appointments }: AppointmentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pre-load static historical appointments
  const staticHistory = generateAppointmentRecords('PT-00001', 'John Doe');

  // Merge central active appointments state with static history
  const mergedAppointments = [
    ...appointments.map(a => ({
      ...a,
      status: a.approved ? 'Scheduled' as const : 'Pending' as const
    })),
    ...staticHistory.map(h => ({
      ...h,
      approved: true
    }))
  ];

  // Filter Logic
  const filteredAppointments = mergedAppointments.filter((a) => {
    const matchesSearch = a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Scheduled' && (a.status === 'Scheduled' || a.status === 'Pending')) ||
                          (statusFilter === 'Completed' && a.status === 'Completed') ||
                          (statusFilter === 'Cancelled' && a.status === 'Cancelled');

    return matchesSearch && matchesStatus;
  });

  const handleDownloadSummary = (apt: any) => {
    alert(`Downloading medical receipt & consultation summary for consult with ${apt.doctorName} on ${apt.date}...`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Consultation & Appointment History</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Comprehensive timeline of your medical visits, scheduled sessions, and historical clinical feedback sheets.
        </p>
      </div>

      {/* Control Filters */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor, specialty, hospital..."
            className="custom-input pl-10 text-xs py-2.5 dark:bg-slate-900 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white min-w-[150px]"
          >
            <option value="All">All Consults</option>
            <option value="Scheduled">Scheduled / Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Timeline Roster */}
      <div className="relative border-l-2 dark:border-slate-800 border-slate-200 pl-6 sm:pl-8 space-y-8">
        {filteredAppointments.map((apt, idx) => {
          const isCompleted = apt.status === 'Completed';
          const isPending = apt.status === 'Pending';
          
          return (
            <div key={idx} className="relative group">
              {/* Dot indicator */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center transition-all ${
                isCompleted 
                  ? 'border-brand-teal text-brand-teal' 
                  : isPending
                  ? 'border-amber-500 text-amber-500 animate-pulse'
                  : 'border-brand-blue text-brand-blue'
              }`} />

              <div className="glass-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-white/5 relative overflow-hidden">
                <div className="space-y-1">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                    isCompleted 
                      ? 'bg-brand-teal/10 text-brand-teal' 
                      : isPending
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-brand-blue/10 text-brand-blue'
                  }`}>
                    {apt.status || 'Scheduled'}
                  </span>
                  
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-1.5">{apt.doctorName}</h3>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {apt.specialization} • {apt.hospital}
                  </span>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase pt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-brand-blue" /> {apt.time}</span>
                    <span>• Date: {apt.date}</span>
                    {apt.patientName && <span>• Patient: {apt.patientName}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleDownloadSummary(apt)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:text-slate-350 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Receipt
                  </button>
                  
                  {isCompleted && (
                    <button
                      onClick={() => alert('Opening clinical prescriptions & medical summary form...')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/10 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Rx
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAppointments.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs font-semibold">
            No consultations match your query filters.
          </div>
        )}
      </div>
    </div>
  );
}
