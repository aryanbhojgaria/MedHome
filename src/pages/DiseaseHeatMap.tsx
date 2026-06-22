import React, { useState, useMemo } from 'react';
import { generatePatientDataset } from '../utils/datasetGenerator';
import { uiTranslations } from '../data/mockData';
import { Map, AlertTriangle, ShieldCheck, Activity, Sliders, Info } from 'lucide-react';

export default function DiseaseHeatMap() {
  const allPatients = useMemo(() => generatePatientDataset(10000), []);

  const [selectedDisease, setSelectedDisease] = useState('All');
  const [selectedState, setSelectedState] = useState<string | null>('Maharashtra');

  // List of active Indian states in our dataset
  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal'];

  // Geographic coordinates for our stylized India SVG Map
  // Mapped to relative positions on a 100x100 grid for high rendering speed and clarity
  const stateCoordinates: Record<string, { x: number; y: number; path: string; labelX: number; labelY: number }> = {
    'Delhi': { 
      x: 35, 
      y: 35, 
      path: 'M 35 30 L 40 30 L 40 35 L 35 35 Z', 
      labelX: 30, 
      labelY: 28 
    },
    'Maharashtra': { 
      x: 30, 
      y: 58, 
      path: 'M 20 52 L 35 50 L 42 58 L 38 68 L 22 66 Z', 
      labelX: 23, 
      labelY: 58 
    },
    'Karnataka': { 
      x: 32, 
      y: 78, 
      path: 'M 28 68 L 36 68 L 38 78 L 30 88 L 26 80 Z', 
      labelX: 25, 
      labelY: 76 
    },
    'Tamil Nadu': { 
      x: 42, 
      y: 86, 
      path: 'M 34 84 L 44 82 L 42 96 L 36 94 Z', 
      labelX: 43, 
      labelY: 88 
    },
    'West Bengal': { 
      x: 68, 
      y: 50, 
      path: 'M 64 45 L 72 45 L 70 56 L 66 58 Z', 
      labelX: 74, 
      labelY: 52 
    }
  };

  // Calculate dynamic stats for each state under selected disease
  const heatStats = useMemo(() => {
    const stats: Record<string, { total: number; diseaseCount: number; topDisease: string; density: 'Low' | 'Moderate' | 'High' }> = {};

    states.forEach(stateName => {
      const statePatients = allPatients.filter(p => p.state === stateName);
      const diseasePatients = selectedDisease === 'All' 
        ? statePatients 
        : statePatients.filter(p => p.diagnosis === selectedDisease);

      // Top diagnosis in state
      const diseaseCounts: Record<string, number> = {};
      statePatients.forEach(p => {
        diseaseCounts[p.diagnosis] = (diseaseCounts[p.diagnosis] || 0) + 1;
      });

      const topDisease = Object.entries(diseaseCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      const diseaseCount = diseasePatients.length;
      
      // Determine density indicator based on case volume
      const density = diseaseCount < 400 ? 'Low' : diseaseCount < 1000 ? 'Moderate' : 'High';

      stats[stateName] = {
        total: statePatients.length,
        diseaseCount,
        topDisease,
        density
      };
    });

    return stats;
  }, [allPatients, selectedDisease]);

  const uniqueDiagnoses = [
    'Dengue Hemorrhagic Fever', 'Malaria (Plasmodium)', 'Enteric Fever (Typhoid)', 'Pulmonary Tuberculosis',
    'COVID-19 / SARI', 'Acute Cholera / Gastroenteritis'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Disease Incidence Heat Map</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl">
          Visualizes epidemiological hotspots across India. Select specific disease filters to dynamically shade state densities based on case loads in the patient registry database.
        </p>
      </div>

      {/* Map Control Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-brand-blue" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Epidemic Overlay</span>
        </div>

        <select
          value={selectedDisease}
          onChange={(e) => setSelectedDisease(e.target.value)}
          className="custom-input text-xs py-2 dark:bg-slate-900 bg-white max-w-[280px]"
        >
          <option value="All">All Incidences (Combined)</option>
          {uniqueDiagnoses.map((diag) => (
            <option key={diag} value={diag}>{diag}</option>
          ))}
        </select>
      </div>

      {/* Split layout: SVG India Map & State Details */}
      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Left Side: India SVG Map (3 columns) */}
        <div className="lg:col-span-3 glass-panel p-6 flex flex-col justify-between items-stretch border-white/5 bg-slate-900/10 min-h-[420px] relative">
          
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Density Grid</span>
          
          {/* SVG Map Container */}
          <div className="flex-1 flex items-center justify-center py-4 relative">
            <svg className="w-full max-w-[340px] h-[340px]" viewBox="0 0 100 100">
              {/* India Outline Boundary Placeholder (dashed background) */}
              <path 
                d="M 30 10 L 45 5 C 60 10, 75 15, 80 25 C 85 35, 75 55, 65 65 C 55 75, 45 85, 40 98 L 35 98 C 25 80, 15 70, 10 50 C 5 30, 20 20, 30 10 Z" 
                fill="none" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="1.5" 
                strokeDasharray="2,2" 
              />

              {/* Render each state polygon */}
              {Object.entries(stateCoordinates).map(([stateName, coord]) => {
                const isSelected = selectedState === stateName;
                const info = heatStats[stateName];
                
                // Color mapping: Light red, amber, green based on case load
                let fillColor = 'rgba(148, 163, 184, 0.2)'; // default
                let strokeColor = 'rgba(255,255,255,0.1)';
                
                if (info) {
                  if (info.diseaseCount > 0) {
                    if (info.diseaseCount < 300) {
                      fillColor = 'rgba(16, 185, 129, 0.15)'; // Low density - Emerald
                      strokeColor = 'rgba(16, 185, 129, 0.5)';
                    } else if (info.diseaseCount < 500) {
                      fillColor = 'rgba(245, 158, 11, 0.25)'; // Moderate density - Amber
                      strokeColor = 'rgba(245, 158, 11, 0.6)';
                    } else {
                      fillColor = 'rgba(239, 68, 68, 0.35)'; // High density - Red
                      strokeColor = 'rgba(239, 68, 68, 0.7)';
                    }
                  }
                }

                if (isSelected) {
                  strokeColor = '#00F2FE'; // Cyan neon border for active state selection
                }

                return (
                  <g key={stateName} className="cursor-pointer" onClick={() => setSelectedState(stateName)}>
                    <path
                      d={coord.path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 1.5 : 0.75}
                      className="transition-all duration-300 hover:fill-opacity-80"
                    />
                    
                    {/* Text state tags overlay */}
                    <text
                      x={coord.labelX}
                      y={coord.labelY}
                      fill={isSelected ? '#00F2FE' : '#E2E8F0'}
                      fontSize="3.2"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none tracking-tight transition-colors"
                    >
                      {stateName} ({info?.diseaseCount || 0})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Density scale legends */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase border-t dark:border-slate-800 border-slate-200 pt-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 block" /> Safe / Low</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/60 block" /> Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/70 block" /> High / Epidemic</span>
          </div>
        </div>

        {/* Right Side: Detailed State Card (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedState && heatStats[selectedState] ? (
            <div className="glass-panel p-6 text-left border border-white/5 space-y-5 relative overflow-hidden h-full flex flex-col justify-between">
              {/* Dynamic side glowing bar */}
              <div className={`absolute top-0 left-0 bottom-0 w-[3.5px] ${
                heatStats[selectedState].density === 'High' ? 'bg-brand-emergency' :
                heatStats[selectedState].density === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Geographic Aggregations</span>
                  <h3 className="text-xl font-extrabold dark:text-white text-slate-800 mt-0.5">{selectedState} State</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400">
                      Sample: {heatStats[selectedState].total.toLocaleString()} Patients
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      heatStats[selectedState].density === 'High' ? 'bg-brand-emergency/15 text-brand-emergency animate-pulse' :
                      heatStats[selectedState].density === 'Moderate' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {heatStats[selectedState].density} Density
                    </span>
                  </div>
                </div>

                {/* Case load details */}
                <div className="p-4 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold pb-2 border-b dark:border-slate-800 border-slate-200">
                    <span className="text-slate-450">Incidences of selected overlay</span>
                    <span className="font-extrabold dark:text-white text-slate-800">{heatStats[selectedState].diseaseCount} cases</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-semibold pt-1">
                    <span className="text-slate-400">Top diagnostic trigger in state</span>
                    <span className="font-extrabold text-brand-teal truncate max-w-[150px]" title={heatStats[selectedState].topDisease}>
                      {heatStats[selectedState].topDisease}
                    </span>
                  </div>
                </div>

                {/* General Advice */}
                <div className="p-3.5 rounded-xl border border-dashed dark:border-slate-800 border-slate-200 text-xs font-medium text-slate-400 flex gap-2 items-start">
                  <Info className="w-4.5 h-4.5 text-brand-blue flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Local medical facilities in {selectedState} are advised to check stockpiles for therapeutics matching {heatStats[selectedState].topDisease}.
                  </p>
                </div>
              </div>

              {/* Data sourcing disclaimer */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold border-t dark:border-slate-900 border-slate-200 pt-3 flex items-center gap-1.5 justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" /> Public Registry data mappings
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 text-center text-slate-500 dark:text-slate-400 font-semibold">
              Select a state on the map to audit regional density diagnostics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
