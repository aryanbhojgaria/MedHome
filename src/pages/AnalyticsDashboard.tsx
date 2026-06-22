import React, { useState, useMemo } from 'react';
import { generatePatientDataset, PatientRecord } from '../utils/datasetGenerator';
import { Users, CreditCard, Activity, Calendar, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function AnalyticsDashboard() {
  // Generate the full 10,000 records database at runtime
  const allPatients = useMemo(() => generatePatientDataset(10000), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterDiagnosis, setFilterDiagnosis] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  // Calculate stats dynamically from 10k patient database
  const stats = useMemo(() => {
    let totalBill = 0;
    let admittedCount = 0;
    let totalStayDays = 0;
    let stayCount = 0;

    allPatients.forEach(p => {
      totalBill += p.billAmount;
      if (p.status === 'Admitted') {
        admittedCount++;
      } else if (p.dischargeDate && p.admissionDate) {
        const ad = new Date(p.admissionDate);
        const dc = new Date(p.dischargeDate);
        const diffTime = Math.abs(dc.getTime() - ad.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalStayDays += diffDays;
        stayCount++;
      }
    });

    return {
      total: allPatients.length,
      admitted: admittedCount,
      avgBill: Math.floor(totalBill / allPatients.length),
      avgStay: stayCount > 0 ? (totalStayDays / stayCount).toFixed(1) : '0'
    };
  }, [allPatients]);

  // Aggregate data for Charts
  const chartData = useMemo(() => {
    // 1. Age cohorts
    const ageCohorts = { pediatric: 0, adult: 0, middleAge: 0, senior: 0 };
    // 2. Gender distribution
    const genders = { Male: 0, Female: 0, Other: 0 };
    // 3. Diseases counts
    const diseases: Record<string, number> = {};

    allPatients.forEach(p => {
      // Age
      if (p.age < 18) ageCohorts.pediatric++;
      else if (p.age < 40) ageCohorts.adult++;
      else if (p.age < 60) ageCohorts.middleAge++;
      else ageCohorts.senior++;

      // Gender
      if (p.gender === 'Male') genders.Male++;
      else if (p.gender === 'Female') genders.Female++;
      else genders.Other++;

      // Diseases
      diseases[p.diagnosis] = (diseases[p.diagnosis] || 0) + 1;
    });

    // Top 5 diseases sorted
    const topDiseases = Object.entries(diseases)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      ageCohorts,
      genders,
      topDiseases
    };
  }, [allPatients]);

  // Unique list values for select filters
  const uniqueStates = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
  const uniqueDiagnoses = [
    'Dengue Hemorrhagic Fever', 'Malaria (Plasmodium)', 'Enteric Fever (Typhoid)', 'Pulmonary Tuberculosis',
    'COVID-19 / SARI', 'Acute Cholera / Gastroenteritis', 'Essential Hypertension', 'Type 2 Diabetes Mellitus',
    'Acute Bronchial Asthma', 'Coronary Artery Disease'
  ];

  // Filtering matching patients
  const filteredPatients = useMemo(() => {
    return allPatients.filter(p => {
      const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = filterState === 'All' || p.state === filterState;
      const matchesDiagnosis = filterDiagnosis === 'All' || p.diagnosis === filterDiagnosis;
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;

      return matchesSearch && matchesState && matchesDiagnosis && matchesStatus;
    });
  }, [allPatients, searchTerm, filterState, filterDiagnosis, filterStatus]);

  // Paginated patients
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;

  // Sync current page bounds
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" /> Real-time Warehouse Registry
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Healthcare Analytics Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Sourced dynamically from a 10,000 synthetic patient database modeled after public Indian clinical demographic profiles.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl border dark:border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
          ORIGIN: SYNTHETIC DATA WAREHOUSE
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 flex items-center justify-between border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</span>
            <h3 className="text-2xl font-extrabold text-white">{stats.total.toLocaleString()}</h3>
            <span className="block text-[9px] text-slate-400 font-medium">Aggregate Log Size</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currently Admitted</span>
            <h3 className="text-2xl font-extrabold text-brand-teal">{stats.admitted.toLocaleString()}</h3>
            <span className="block text-[9px] text-brand-teal font-medium">Occupancy Active</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Billing Amount</span>
            <h3 className="text-2xl font-extrabold text-white">₹{stats.avgBill.toLocaleString()}</h3>
            <span className="block text-[9px] text-slate-400 font-medium">Per Patient Intake</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center justify-between border-white/5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Length of Stay</span>
            <h3 className="text-2xl font-extrabold text-white">{stats.avgStay} Days</h3>
            <span className="block text-[9px] text-slate-400 font-medium">Discharged Cohorts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SVG Charts section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart A: Top Diseases Incidence Bar Graph */}
        <div className="glass-panel p-6 space-y-4 border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Top 5 Diagnostic Incidences</span>
          
          <div className="space-y-4 pt-2">
            {chartData.topDiseases.map((item, idx) => {
              const maxVal = chartData.topDiseases[0].count;
              const percent = (item.count / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="dark:text-slate-300 text-slate-600 truncate max-w-[190px]">{item.name}</span>
                    <span className="text-brand-blue font-bold">{item.count} Cases</span>
                  </div>
                  <div className="h-2 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-blue to-brand-teal rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart B: Age Distribution Column Chart */}
        <div className="glass-panel p-6 space-y-4 border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Demographics Age Cohorts</span>
          
          <div className="h-44 flex items-end justify-between gap-4 pt-6">
            {[
              { label: 'Pediatric (<18)', val: chartData.ageCohorts.pediatric },
              { label: 'Adult (18-39)', val: chartData.ageCohorts.adult },
              { label: 'Middle (40-59)', val: chartData.ageCohorts.middleAge },
              { label: 'Senior (60+)', val: chartData.ageCohorts.senior },
            ].map((cohort, i) => {
              const maxVal = Math.max(
                chartData.ageCohorts.pediatric,
                chartData.ageCohorts.adult,
                chartData.ageCohorts.middleAge,
                chartData.ageCohorts.senior
              );
              const height = (cohort.val / maxVal) * 110;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-extrabold text-white">{cohort.val.toLocaleString()}</span>
                  <div className="w-full bg-brand-blue/20 rounded-t-lg relative group overflow-hidden" style={{ height: `${height}px` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-blue to-brand-teal" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-tight block max-w-[65px] leading-tight h-6">
                    {cohort.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart C: Gender Distribution Donut Chart */}
        <div className="glass-panel p-6 space-y-4 border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gender Patient Ratio</span>
          
          <div className="flex items-center justify-between gap-6 pt-4">
            {/* SVG Ring Donut */}
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="transparent" />
                
                {/* Male Segment */}
                <circle cx="56" cy="56" r="46" stroke="#0066FF" strokeWidth="8" fill="transparent"
                  strokeDasharray={289}
                  strokeDashoffset={289 * (1 - chartData.genders.Male / stats.total)}
                />
                
                {/* Female Segment Overlay */}
                <circle cx="56" cy="56" r="46" stroke="#00F2FE" strokeWidth="8" fill="transparent"
                  strokeDasharray={289}
                  strokeDashoffset={289 * (1 - (chartData.genders.Male + chartData.genders.Female) / stats.total)}
                  className="transform origin-center rotate-90"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ratios</span>
                <span className="text-xs font-extrabold text-white mt-0.5">10k Rows</span>
              </div>
            </div>

            {/* Labels legends */}
            <div className="flex-1 space-y-2 text-xs font-semibold text-slate-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-blue block" />
                  <span>Male</span>
                </div>
                <span className="text-white">{((chartData.genders.Male / stats.total) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-teal block" />
                  <span>Female</span>
                </div>
                <span className="text-white">{((chartData.genders.Female / stats.total) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 block" />
                  <span>Other</span>
                </div>
                <span className="text-white">{((chartData.genders.Other / stats.total) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Patient Grid / Pagination Table */}
      <div className="glass-panel p-6 space-y-4">
        {/* Table Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b dark:border-slate-900 border-slate-200 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Patient Database Query</span>
            <span className="text-[10px] font-semibold bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 rounded-md uppercase block">Matches: {filteredPatients.length.toLocaleString()} Patients</span>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search patient, ID, disease..."
                className="custom-input pl-9 text-xs py-2 dark:bg-slate-900 bg-white min-w-[200px]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* State Filter */}
            <select
              value={filterState}
              onChange={(e) => {
                setFilterState(e.target.value);
                setCurrentPage(1);
              }}
              className="custom-input text-xs py-2 dark:bg-slate-900 bg-white max-w-[130px]"
            >
              <option value="All">All States</option>
              {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Diagnosis Filter */}
            <select
              value={filterDiagnosis}
              onChange={(e) => {
                setFilterDiagnosis(e.target.value);
                setCurrentPage(1);
              }}
              className="custom-input text-xs py-2 dark:bg-slate-900 bg-white max-w-[160px]"
            >
              <option value="All">All Diagnoses</option>
              {uniqueDiagnoses.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="custom-input text-xs py-2 dark:bg-slate-900 bg-white max-w-[110px]"
            >
              <option value="All">All Status</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b dark:border-slate-900 border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4 text-right">Bill Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-900 divide-slate-100">
              {paginatedPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">{p.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{p.name}</td>
                  <td className="py-3.5 px-4">{p.age} Y / {p.gender}</td>
                  <td className="py-3.5 px-4">{p.state}</td>
                  <td className="py-3.5 px-4 truncate max-w-[180px]" title={p.diagnosis}>{p.diagnosis}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'Admitted' ? 'bg-brand-teal/15 text-brand-teal' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{p.admissionDate}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-white">₹{p.billAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t dark:border-slate-900 border-slate-200 text-xs text-slate-500 font-bold uppercase">
          <span>Page {currentPage} of {totalPages} ({filteredPatients.length.toLocaleString()} total rows)</span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800 border-slate-200 bg-white text-slate-400 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800 border-slate-200 bg-white text-slate-400 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
