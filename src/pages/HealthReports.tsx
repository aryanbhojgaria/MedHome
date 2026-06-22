import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Sliders, AlertTriangle, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { generateLabReports } from '../utils/datasetGenerator';

export default function HealthReports() {
  // Pre-load default lab reports for patient PT-00001
  const baseReports = generateLabReports('PT-00001', 'John Doe');

  // State simulators for interactive metrics adjustments
  const [bloodSugar, setBloodSugar] = useState(110); // Fasting glucose mg/dL
  const [platelets, setPlatelets] = useState(180); // Platelets x1000 cells/mcL

  // Dynamic calculations for Fasting Glucose status
  const glucoseStatus = bloodSugar < 100 
    ? { status: 'Normal' as const, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', msg: 'Your fasting blood glucose is within the healthy reference range (< 100 mg/dL).' } 
    : bloodSugar < 126 
    ? { status: 'Warning' as const, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', msg: 'Indicates Pre-diabetes. Maintain a low glycemic index diet and walk regularly.' }
    : { status: 'Critical' as const, color: 'text-red-500 bg-brand-emergency/15 border-brand-emergency/40 animate-pulse shadow-neon-emergency', msg: '🚨 Hyperglycemia Warning (Diabetes Range). Consult a Physician / Endocrinologist for HbA1c screening.' };

  // Dynamic calculations for Platelets status
  const plateletStatus = platelets >= 150 
    ? { status: 'Normal' as const, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', msg: 'Platelet counts are healthy. Standard clotting parameters active.' } 
    : platelets >= 100 
    ? { status: 'Warning' as const, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', msg: 'Mild Thrombocytopenia. Track symptoms for potential viral triggers.' }
    : { status: 'Critical' as const, color: 'text-red-500 bg-brand-emergency/15 border-brand-emergency/40 animate-pulse shadow-neon-emergency', msg: '🚨 Critical Thrombocytopenia. Severe dengue or bone marrow suppression warning. Restrict activity and seek emergency hospital triage immediately.' };

  const handleDownloadPdf = (reportName: string) => {
    alert(`Downloading official PDF copy of your ${reportName} directly from ABDM Health Locker storage...`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
            <Sparkles className="w-3.5 h-3.5" /> Clinical Test Dashboard
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Diagnostic Lab Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Retrieve certified pathology reports synced directly with the National Health Authority locker.
          </p>
        </div>

        {/* Origin */}
        <div className="px-3 py-1.5 rounded-xl border dark:border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
          NHA LOCKER SECURE ACCESS
        </div>
      </div>

      {/* Interactive Simulator sliders */}
      <div className="glass-panel p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-2 border-b dark:border-slate-900 border-slate-200 pb-3">
          <Sliders className="w-5 h-5 text-brand-blue" />
          <h3 className="text-sm font-extrabold text-white">Interactive Diagnostic Metric Simulator</h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          Drag the sliders below to simulate blood markers and observe how MedHome dynamically triages reference ranges in real time.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Fasting glucose slider */}
          <div className="space-y-4 p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400">Fasting Blood Glucose</span>
              <span className="text-brand-blue">{bloodSugar} mg/dL</span>
            </div>
            
            <input
              type="range"
              min="60"
              max="250"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
            />

            <div className={`p-3 rounded-xl border text-xs font-semibold space-y-1 ${glucoseStatus.color}`}>
              <div className="flex items-center justify-between font-extrabold uppercase">
                <span>Fast Sugar: {glucoseStatus.status}</span>
                {glucoseStatus.status === 'Critical' && <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
              </div>
              <p className="text-[10px] leading-relaxed opacity-90">{glucoseStatus.msg}</p>
            </div>
          </div>

          {/* Platelets slider */}
          <div className="space-y-4 p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400">Platelet Count</span>
              <span className="text-brand-blue">{platelets},000 cells/mcL</span>
            </div>
            
            <input
              type="range"
              min="30"
              max="350"
              value={platelets}
              onChange={(e) => setPlatelets(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
            />

            <div className={`p-3 rounded-xl border text-xs font-semibold space-y-1 ${plateletStatus.color}`}>
              <div className="flex items-center justify-between font-extrabold uppercase">
                <span>Platelets: {plateletStatus.status}</span>
                {plateletStatus.status === 'Critical' && <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
              </div>
              <p className="text-[10px] leading-relaxed opacity-90">{plateletStatus.msg}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pathology reports lists */}
      <div className="space-y-6">
        {baseReports.map((report) => (
          <div key={report.id} className="glass-panel p-6 space-y-4 border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-slate-900 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-blue" />
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white">{report.testName}</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">Date: {report.date}</span>
                <button
                  onClick={() => handleDownloadPdf(report.testName)}
                  className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold bg-brand-blue text-white hover:bg-brand-blue-dark active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-brand-blue/15"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>

            {/* Metrics tables */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b dark:border-slate-800 border-slate-100">
                    <th className="py-2.5">Pathology Parameter</th>
                    <th className="py-2.5">Result</th>
                    <th className="py-2.5">Reference Bounds</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800 divide-slate-50 font-semibold text-slate-700 dark:text-slate-300">
                  {report.metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="py-3 font-bold dark:text-white">{m.name}</td>
                      <td className="py-3 font-mono">{m.value} {m.unit}</td>
                      <td className="py-3 text-slate-500 font-mono">{m.range} {m.unit}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          m.status === 'Critical' 
                            ? 'bg-brand-emergency/10 border border-brand-emergency/30 text-brand-emergency'
                            : m.status === 'Warning'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
