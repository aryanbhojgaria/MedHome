import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic, MicOff, Search, Sparkles, AlertTriangle, UserCheck, ShieldCheck,
  Wifi, WifiOff, Star, Building2, X, Plus, ChevronDown, CheckCircle,
  FileText, Activity, Stethoscope, Heart, Brain, Eye, Bone,
  Clock, CalendarDays, Award, TrendingUp, Zap, ClipboardList
} from 'lucide-react';
import {
  fetchAllSymptomsList, runSymptomAnalysisEngine, checkSupabaseConnection,
  humanizeSymptom, normalizeSymptom,
  type FullAnalysisResult, type DbDoctor, type DbHospital
} from '../lib/db';

import { motion, AnimatePresence } from 'framer-motion';

interface SymptomCheckerProps {
  setCurrentTab: (tab: string) => void;
  setSelectedSpecialization: (spec: string) => void;
  lang: string;
}

// Preset symptom groups for quick testing
const PRESET_GROUPS = [
  { label: 'Dengue Fever', symptoms: ['high_fever', 'headache', 'muscle_pain', 'joint_pain', 'skin_rash', 'nausea', 'vomiting', 'fatigue'] },
  { label: 'Heart Attack', symptoms: ['chest_pain', 'breathlessness', 'sweating', 'vomiting', 'fatigue'] },
  { label: 'Malaria', symptoms: ['high_fever', 'chills', 'shivering', 'sweating', 'headache', 'nausea', 'vomiting', 'fatigue'] },
  { label: 'Typhoid', symptoms: ['high_fever', 'headache', 'abdominal_pain', 'constipation', 'fatigue', 'diarrhoea'] },
  { label: 'Common Cold', symptoms: ['continuous_sneezing', 'chills', 'fatigue', 'cough', 'high_fever', 'headache', 'runny_nose', 'congestion'] },
  { label: 'Migraine', symptoms: ['headache', 'blurred_and_distorted_vision', 'acidity', 'nausea', 'vomiting', 'depression'] },
  { label: 'Pneumonia', symptoms: ['cough', 'high_fever', 'breathlessness', 'chest_pain', 'fatigue', 'phlegm', 'rusty_sputum', 'chills'] },
  { label: 'Fungal Infection', symptoms: ['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic _patches'] },
];

// Severity color helpers
function getSeverityColor(category: string): string {
  switch (category) {
    case 'Critical': return 'text-red-400';
    case 'High': return 'text-orange-400';
    case 'Moderate': return 'text-amber-400';
    case 'Low': return 'text-emerald-400';
    default: return 'text-slate-400';
  }
}

function getSeverityBg(category: string): string {
  switch (category) {
    case 'Critical': return 'bg-red-500/10 border-red-500/30 text-red-400';
    case 'High': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
    case 'Moderate': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    case 'Low': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
  }
}

function getSeverityBarWidth(category: string): string {
  switch (category) {
    case 'Critical': return 'w-full';
    case 'High': return 'w-[75%]';
    case 'Moderate': return 'w-[50%]';
    case 'Low': return 'w-[25%]';
    default: return 'w-[10%]';
  }
}

function getSeverityBarColor(category: string): string {
  switch (category) {
    case 'Critical': return 'bg-gradient-to-r from-red-600 to-red-400';
    case 'High': return 'bg-gradient-to-r from-orange-600 to-orange-400';
    case 'Moderate': return 'bg-gradient-to-r from-amber-600 to-amber-400';
    case 'Low': return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
    default: return 'bg-slate-600';
  }
}

function getWeightColor(w: number): string {
  if (w >= 6) return 'text-red-400 bg-red-500/10';
  if (w >= 4) return 'text-orange-400 bg-orange-500/10';
  if (w >= 3) return 'text-amber-400 bg-amber-500/10';
  return 'text-emerald-400 bg-emerald-500/10';
}

function getSpecialistIcon(specialist: string) {
  if (specialist.includes('Cardio')) return <Heart className="w-5 h-5" />;
  if (specialist.includes('Neuro') || specialist.includes('Psych')) return <Brain className="w-5 h-5" />;
  if (specialist.includes('Ophth')) return <Eye className="w-5 h-5" />;
  if (specialist.includes('Ortho')) return <Bone className="w-5 h-5" />;
  if (specialist.includes('Pulmo')) return <Activity className="w-5 h-5" />;
  return <Stethoscope className="w-5 h-5" />;
}

// Loading step messages
const ANALYSIS_STEPS = [
  'Querying disease_symptoms database...',
  'Matching symptom patterns across 41 diseases...',
  'Computing severity weights from symptom_severity...',
  'Ranking disease matches by confidence...',
  'Fetching disease descriptions & precautions...',
  'Determining specialist recommendation...',
  'Querying recommended doctors...',
  'Querying recommended hospitals...',
  'Saving report to ai_reports...',
  'Generating AI diagnostic report...',
];

const VOICE_SYMPTOM_MAP: Record<string, string[]> = {
  // English mappings
  'fever': ['high_fever', 'mild_fever'],
  'temperature': ['high_fever'],
  'cough': ['cough'],
  'headache': ['headache'],
  'head pain': ['headache'],
  'joint': ['joint_pain'],
  'muscle': ['muscle_pain'],
  'chest': ['chest_pain'],
  'breath': ['breathlessness'],
  'sweating': ['sweating'],
  'sweat': ['sweating'],
  'vomit': ['vomiting'],
  'rash': ['skin_rash'],
  'itching': ['itching'],
  'stomach': ['abdominal_pain'],
  'abdominal': ['abdominal_pain'],
  'chills': ['chills'],
  'shivering': ['shivering'],
  'fatigue': ['fatigue'],
  'tired': ['fatigue'],
  'constipation': ['constipation'],
  'diarrhea': ['diarrhoea'],
  'diarrhoea': ['diarrhoea'],
  'sneezing': ['continuous_sneezing'],
  'runny nose': ['runny_nose'],
  'congestion': ['congestion'],
  
  // Hindi (Transliterated and Devanagari) mappings
  'bukhar': ['high_fever'],
  'बुखार': ['high_fever'],
  'khansi': ['cough'],
  'खांसी': ['cough'],
  'sardard': ['headache'],
  'sir dard': ['headache'],
  'सिर दर्द': ['headache'],
  'sir me dard': ['headache'],
  'jodo': ['joint_pain'],
  'जोड़': ['joint_pain'],
  'pait dard': ['abdominal_pain'],
  'pet dard': ['abdominal_pain'],
  'पेट दर्द': ['abdominal_pain'],
  'ulti': ['vomiting'],
  'उल्टी': ['vomiting'],
  'khujli': ['itching'],
  'खुजली': ['itching'],
  'saans': ['breathlessness'],
  'सांस': ['breathlessness'],
  'chhati': ['chest_pain'],
  'सीना': ['chest_pain'],
  'paseena': ['sweating'],
  'पसीना': ['sweating'],
  'kamzori': ['fatigue'],
  'कमजोरी': ['fatigue'],
  'thakan': ['fatigue'],
  'थकान': ['fatigue'],
  'kabz': ['constipation'],
  'कब्ज': ['constipation'],
  'dast': ['diarrhoea'],
  'दस्त': ['diarrhoea'],
  'chheenk': ['continuous_sneezing'],
  'छींक': ['continuous_sneezing']
};

const detectSymptomsFromText = (text: string, allSymptomsList: string[]): string[] => {
  const detected: string[] = [];
  const normalizedText = text.toLowerCase();
  
  // 1. Direct matched phrases
  allSymptomsList.forEach(s => {
    const humanized = s.replace(/_/g, ' ').toLowerCase();
    if (normalizedText.includes(humanized) || normalizedText.includes(s.toLowerCase())) {
      detected.push(s);
    }
  });

  // 2. Dictionary keyword/synonyms
  Object.entries(VOICE_SYMPTOM_MAP).forEach(([keyword, mappedKeys]) => {
    if (normalizedText.includes(keyword.toLowerCase())) {
      mappedKeys.forEach(k => {
        if (allSymptomsList.includes(k) && !detected.includes(k)) {
          detected.push(k);
        }
      });
    }
  });

  return detected;
};

export default function SymptomChecker({
  setCurrentTab,
  setSelectedSpecialization,
  lang,
}: SymptomCheckerProps) {
  // Symptoms state
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [freeText, setFreeText] = useState('');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<FullAnalysisResult | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Precaution checklist state
  const [checkedPrecautions, setCheckedPrecautions] = useState<Record<number, boolean>>({});

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'hi-IN'>('en-US');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const transcriptRef = useRef('');
  const shouldAnalyzeRef = useRef(true);

  // Status
  const [isLive, setIsLive] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load symptoms list and check connection
  useEffect(() => {
    async function init() {
      const connected = await checkSupabaseConnection();
      setIsLive(connected);
      const symptoms = await fetchAllSymptomsList();
      setAllSymptoms(symptoms);
    }
    init();

    // Check for prefilled symptoms from landing page
    const prefilled = localStorage.getItem('medhome_landing_symptom');
    if (prefilled) {
      setFreeText(prefilled);
      localStorage.removeItem('medhome_landing_symptom');
    }
  }, []);

  // Process voice inputs, map symptoms, and execute analyzer automatically
  const processVoiceInputAndAnalyze = async (transcriptText: string) => {
    const detected = detectSymptomsFromText(transcriptText, allSymptoms);
    const updatedSymptoms = [...new Set([...selectedSymptoms, ...detected])];
    setSelectedSymptoms(updatedSymptoms);
    setFreeText(transcriptText);

    if (updatedSymptoms.length > 0) {
      await runAnalysisWithSymptoms(updatedSymptoms);
    } else {
      alert(lang === 'hi' 
        ? "आवाज से कोई लक्षण नहीं पहचाना जा सका। कृपया टाइप करें या मैन्युअल रूप से चुनें।" 
        : "No symptoms could be detected from your speech. Please select them manually or try again.");
    }
  };

  const runAnalysisWithSymptoms = async (symptomsList: string[]) => {
    setIsAnalyzing(true);
    setResult(null);
    setCheckedPrecautions({});
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 400);

    try {
      const analysisResult = await runSymptomAnalysisEngine(symptomsList);
      clearInterval(stepInterval);
      setAnalysisStep(ANALYSIS_STEPS.length - 1);

      if (analysisResult) {
        setResult(analysisResult);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 4000);
      }
    } catch (e) {
      console.error('Analysis failed:', e);
      clearInterval(stepInterval);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upgraded Web Speech API listening coordinator
  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. Please type your symptoms.');
      return;
    }

    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = voiceLang;

    rec.onstart = () => {
      setIsRecording(true);
      setVoiceTranscript('');
      transcriptRef.current = '';
      shouldAnalyzeRef.current = true;
    };

    rec.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setVoiceTranscript(currentTranscript);
      transcriptRef.current = currentTranscript;
    };

    rec.onerror = (e: any) => {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
      if (shouldAnalyzeRef.current) {
        const finalVal = transcriptRef.current;
        if (finalVal.trim()) {
          setIsVoiceModalOpen(false);
          processVoiceInputAndAnalyze(finalVal);
        }
      }
    };

    setRecognition(rec);
    rec.start();
  };

  useEffect(() => {
    if (isVoiceModalOpen) {
      startVoiceListening();
    }
    return () => {
      if (recognition) {
        try { recognition.stop(); } catch(e) {}
      }
    };
  }, [voiceLang, isVoiceModalOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filtered symptoms for autocomplete
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return allSymptoms.filter(s => !selectedSymptoms.includes(s)).slice(0, 20);
    const q = normalizeSymptom(searchQuery);
    return allSymptoms
      .filter(s => !selectedSymptoms.includes(s) && s.includes(q))
      .slice(0, 15);
  }, [searchQuery, allSymptoms, selectedSymptoms]);

  const addSymptom = (sym: string) => {
    if (!selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(prev => [...prev, sym]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeSymptom = (sym: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== sym));
  };

  const toggleRecording = () => {
    setIsVoiceModalOpen(true);
  };

  const loadPreset = (symptoms: string[]) => {
    setSelectedSymptoms(symptoms);
    setFreeText('');
    setResult(null);
    setCheckedPrecautions({});
  };

  // Parse free text into symptoms
  const parseFreeTextSymptoms = (): string[] => {
    if (!freeText.trim()) return [];
    const words = freeText.toLowerCase().split(/[,;.\n]+/).map(w => w.trim()).filter(Boolean);
    const matched: string[] = [];
    words.forEach(phrase => {
      const normalized = normalizeSymptom(phrase);
      // Exact match
      if (allSymptoms.includes(normalized) && !matched.includes(normalized)) {
        matched.push(normalized);
        return;
      }
      // Partial match
      const partial = allSymptoms.find(s => s.includes(normalized) || normalized.includes(s));
      if (partial && !matched.includes(partial)) {
        matched.push(partial);
      }
    });
    return matched;
  };

  const handleAnalyze = async () => {
    // Combine selected symptoms + parsed free text
    const freeTextSymptoms = parseFreeTextSymptoms();
    const allSelected = [...new Set([...selectedSymptoms, ...freeTextSymptoms])];

    if (allSelected.length === 0) return;

    setSelectedSymptoms(allSelected);
    await runAnalysisWithSymptoms(allSelected);
  };

  const totalSymptomCount = selectedSymptoms.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-fade-in">

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl shadow-2xl animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold text-emerald-300">Report saved to ai_reports</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> AI Symptom Analysis Engine
          </div>
          {isLive ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wifi className="w-3 h-3 animate-pulse" /> Supabase Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          AI Symptom Checker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          Select symptoms from the verified database of 131 clinical indicators, or describe them in free text.
          The engine matches against 41 diseases with severity scoring and specialist recommendation.
        </p>
      </div>

      {/* ── SYMPTOM INPUT PANEL ── */}
      <div className="glass-panel p-6 md:p-8 space-y-6">

        {/* Search with autocomplete */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search & Select Symptoms
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Type to search... e.g. chest pain, headache, fever"
              className="custom-input pl-10 text-sm py-3"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown */}
            {showDropdown && filteredSymptoms.length > 0 && (
              <div className="absolute z-50 w-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950/95 bg-white backdrop-blur-xl shadow-2xl">
                {filteredSymptoms.map(sym => (
                  <button
                    key={sym}
                    onClick={() => addSymptom(sym)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium dark:text-slate-300 text-slate-600 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors flex items-center justify-between group"
                  >
                    <span>{humanizeSymptom(sym)}</span>
                    <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-blue" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected symptom chips */}
        {selectedSymptoms.length > 0 && (
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5" /> Selected Symptoms ({selectedSymptoms.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map(sym => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20 group transition-all hover:bg-brand-blue/20"
                >
                  {humanizeSymptom(sym)}
                  <button onClick={() => removeSymptom(sym)} className="hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => { setSelectedSymptoms([]); setResult(null); }}
                className="text-[10px] font-bold uppercase text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Free text area */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Additional Symptoms (Free Text)
          </label>
          <div className="relative">
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Describe additional symptoms separated by commas... e.g. high fever, chest pain, nausea"
              className="w-full h-24 px-4 py-3 pb-11 rounded-2xl outline-none transition-all duration-200 border resize-none text-sm dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 border-slate-200 bg-white"
            />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="p-2 rounded-xl border dark:border-slate-800 dark:bg-slate-900/80 border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-[#E53935]" />
                Voice Triage
              </button>
              <span className="text-[10px] text-slate-400 font-mono">{freeText.length} chars</span>
            </div>
          </div>
        </div>

        {/* Quick Preset Groups */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Quick Load Test Cases
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_GROUPS.map(preset => (
              <button
                key={preset.label}
                onClick={() => loadPreset(preset.symptoms)}
                className="text-[11px] px-3 py-1.5 rounded-lg border dark:border-slate-800 dark:bg-slate-900/30 border-slate-200 hover:border-brand-blue hover:text-brand-blue transition-all text-slate-500 dark:text-slate-400 font-semibold active:scale-95"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-end pt-3 border-t dark:border-slate-900 border-slate-100">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (selectedSymptoms.length === 0 && !freeText.trim())}
            className="btn-primary flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="w-4.5 h-4.5" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── LOADING ANIMATION ── */}
      {isAnalyzing && (
        <div className="glass-panel p-6 md:p-8 space-y-5 border-brand-blue/30 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-blue animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold dark:text-white text-slate-800">AI Analysis Engine Processing</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Step {analysisStep + 1} of {ANALYSIS_STEPS.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-teal transition-all duration-500 ease-out"
              style={{ width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step messages */}
          <div className="space-y-1.5">
            {ANALYSIS_STEPS.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                idx < analysisStep ? 'text-emerald-400' : idx === analysisStep ? 'text-brand-blue' : 'text-slate-600'
              }`}>
                {idx < analysisStep ? (
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                ) : idx === analysisStep ? (
                  <svg className="animate-spin w-3.5 h-3.5 flex-shrink-0 text-brand-blue" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border dark:border-slate-800 border-slate-300 flex-shrink-0" />
                )}
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI DIAGNOSTIC REPORT ── */}
      {result && !isAnalyzing && (
        <div className="space-y-6 animate-fade-in">

          {/* Report Header */}
          <div className={`glass-panel p-6 md:p-8 border relative overflow-hidden ${
            result.severity.category === 'Critical'
              ? 'border-red-500/30 bg-gradient-to-br dark:from-red-950/15 dark:to-transparent'
              : result.severity.category === 'High'
              ? 'border-orange-500/30 bg-gradient-to-br dark:from-orange-950/10 dark:to-transparent'
              : 'border-brand-blue/20 bg-gradient-to-br dark:from-blue-950/10 dark:to-transparent'
          }`}>
            {/* Glow accent */}
            <div className={`absolute top-0 left-0 w-full h-[2px] ${
              result.severity.category === 'Critical' ? 'bg-gradient-to-r from-red-500 via-red-400 to-transparent'
              : result.severity.category === 'High' ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-transparent'
              : 'bg-gradient-to-r from-brand-blue via-brand-teal to-transparent'
            }`} />

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Report metadata */}
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase bg-brand-blue/10 text-brand-blue border border-brand-blue/20 tracking-widest">
                    <FileText className="w-3 h-3" /> AI Diagnostic Report
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {result.reportId || 'RPT-' + Date.now().toString(36).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Primary Diagnosis */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Primary Diagnosis</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-slate-800">
                    {result.primaryDiagnosis.disease}
                  </h2>
                </div>

                {/* Severity Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 border ${getSeverityBg(result.severity.category)} ${
                    result.severity.category === 'Critical' ? 'animate-pulse' : ''
                  }`}>
                    {(result.severity.category === 'Critical' || result.severity.category === 'High') && <AlertTriangle className="w-3.5 h-3.5" />}
                    {result.severity.category} Severity
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Score: <span className={`font-mono ${getSeverityColor(result.severity.category)}`}>{result.severity.totalScore}</span> pts
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Matched: <span className="font-mono text-brand-blue">{result.primaryDiagnosis.matchCount}/{totalSymptomCount}</span> symptoms
                  </span>
                </div>
              </div>

              {/* Right: Confidence Ring */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                      className="text-slate-800/30" />
                    <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8"
                      strokeDasharray={`${result.primaryDiagnosis.confidence * 3.27} ${327 - result.primaryDiagnosis.confidence * 3.27}`}
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${
                        result.primaryDiagnosis.confidence >= 80 ? 'text-brand-blue' :
                        result.primaryDiagnosis.confidence >= 60 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                      stroke="currentColor"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold dark:text-white text-slate-800 font-mono">{result.primaryDiagnosis.confidence}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Confidence</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Low Confidence</span>
                <span>High Confidence</span>
              </div>
              <div className="h-2.5 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-teal transition-all duration-1000 ease-out"
                  style={{ width: `${result.primaryDiagnosis.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── SUBMITTED SYMPTOMS ── */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4" /> Symptoms Submitted ({result.symptoms.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.symptoms.map(sym => {
                const isMatched = result.primaryDiagnosis.matchedSymptoms.includes(normalizeSymptom(sym));
                const sevEntry = result.severity.perSymptom.find(ps => ps.symptom === normalizeSymptom(sym));
                return (
                  <span
                    key={sym}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      isMatched
                        ? 'bg-brand-blue/15 text-brand-blue border-brand-blue/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}
                  >
                    {isMatched && <CheckCircle className="w-3 h-3" />}
                    {humanizeSymptom(sym)}
                    {sevEntry && (
                      <span className={`ml-1 text-[9px] font-mono px-1.5 py-0.5 rounded ${getWeightColor(sevEntry.weight)}`}>
                        w{sevEntry.weight}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* ── SEVERITY ANALYSIS ── */}
          <div className="glass-panel p-6 space-y-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Severity Analysis
            </h3>

            {/* Main severity bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Safe</span>
                <span>Moderate</span>
                <span>High Risk</span>
                <span>Critical</span>
              </div>
              <div className="h-4 w-full rounded-full dark:bg-slate-900 bg-slate-200 overflow-hidden relative border dark:border-slate-800">
                <div className={`h-full rounded-full transition-all duration-700 ease-out ${getSeverityBarColor(result.severity.category)} ${getSeverityBarWidth(result.severity.category)}`} />
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-extrabold uppercase ${getSeverityColor(result.severity.category)}`}>
                  {result.severity.category} ({result.severity.totalScore} pts)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Max single weight: {result.severity.maxWeight}/7</span>
              </div>
            </div>

            {/* Per-symptom severity breakdown */}
            {result.severity.perSymptom.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Per-Symptom Weight Breakdown</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.severity.perSymptom.map(({ symptom, weight }) => (
                    <div key={symptom} className="flex items-center justify-between p-2.5 rounded-xl dark:bg-slate-900/50 bg-slate-50 border dark:border-slate-800 border-slate-200">
                      <span className="text-xs font-semibold dark:text-slate-300 text-slate-600 truncate flex-1">{humanizeSymptom(symptom)}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 h-1.5 rounded-full dark:bg-slate-800 bg-slate-200 overflow-hidden">
                          <div className={`h-full rounded-full ${
                            weight >= 6 ? 'bg-red-500' : weight >= 4 ? 'bg-orange-500' : weight >= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} style={{ width: `${(weight / 7) * 100}%` }} />
                        </div>
                        <span className={`text-xs font-extrabold font-mono w-6 text-right ${
                          weight >= 6 ? 'text-red-400' : weight >= 4 ? 'text-orange-400' : weight >= 3 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── DISEASE DESCRIPTION & PRECAUTIONS ── */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Disease Description */}
            <div className="glass-panel p-6 space-y-4 flex flex-col">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Disease Information
              </h3>
              <div className="space-y-3 flex-1">
                <h4 className="text-lg font-extrabold dark:text-white text-slate-800">{result.primaryDiagnosis.disease}</h4>
                <p className="text-sm dark:text-slate-400 text-slate-500 leading-relaxed font-medium">
                  {result.primaryDiagnosis.description}
                </p>
              </div>
              <div className="pt-3 border-t dark:border-slate-900 border-slate-100 text-[10px] text-slate-500 font-mono uppercase">
                Source: disease_descriptions table
              </div>
            </div>

            {/* Precautions Checklist */}
            <div className="glass-panel p-6 space-y-4 flex flex-col">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Precautions & Guidelines
              </h3>
              <div className="space-y-3 flex-1">
                {result.primaryDiagnosis.precautions.map((precaution, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      checkedPrecautions[idx]
                        ? 'dark:bg-emerald-950/20 bg-emerald-50 border-emerald-500/30'
                        : 'dark:bg-slate-900/40 bg-slate-50 dark:border-slate-800 border-slate-200 hover:border-brand-blue/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedPrecautions[idx]}
                      onChange={(e) => setCheckedPrecautions(prev => ({ ...prev, [idx]: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded text-brand-blue border-slate-700 bg-slate-900 focus:ring-brand-blue cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-sm font-medium leading-relaxed ${
                      checkedPrecautions[idx] ? 'text-emerald-400 line-through opacity-70' : 'dark:text-slate-300 text-slate-600'
                    }`}>
                      {precaution}
                    </span>
                  </label>
                ))}
              </div>
              <div className="pt-3 border-t dark:border-slate-900 border-slate-100 text-[10px] text-slate-500 font-mono uppercase">
                Source: precautions table
              </div>
            </div>
          </div>

          {/* ── SPECIALIST RECOMMENDATION ── */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Recommended Specialist
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/15 flex items-center justify-center text-brand-blue flex-shrink-0">
                {getSpecialistIcon(result.specialist)}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold dark:text-white text-slate-800">{result.specialist}</h4>
                <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">{result.specialistReason}</p>
              </div>
              <button
                onClick={() => { setSelectedSpecialization(result.specialist); setCurrentTab('doctors'); }}
                className="ml-auto px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95 flex-shrink-0"
              >
                Find {result.specialist}s
              </button>
            </div>
          </div>

          {/* ── RECOMMENDED DOCTORS ── */}
          {result.doctors.length > 0 && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" /> Recommended Doctors ({result.doctors.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.doctors.slice(0, 5).map(doc => (
                  <div key={doc.id} className="p-4 rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/30 bg-white space-y-3 transition-all hover:border-brand-blue/30 group">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${doc.avatarColor} flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0`}>
                        {doc.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold dark:text-white text-slate-800 truncate group-hover:text-brand-blue transition-colors">{doc.name}</h4>
                        <p className="text-[10px] font-bold text-brand-blue uppercase">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                        <Award className="w-3 h-3" /> {doc.qualification}
                      </div>
                      <div className="flex items-center justify-between text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {doc.experience} yrs exp</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-extrabold"><Star className="w-3 h-3 fill-amber-500" /> {doc.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                        <Building2 className="w-3 h-3" /> <span className="truncate">{doc.hospital}</span>
                      </div>
                      {doc.availableToday && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available Today
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-slate-800 border-slate-100">
                      <button
                        onClick={() => { setSelectedSpecialization(doc.specialization); setCurrentTab('doctors'); }}
                        className="py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white text-[10px] font-extrabold uppercase transition-colors text-center"
                      >
                        Book
                      </button>
                      <button
                        onClick={() => { setSelectedSpecialization(doc.specialization); setCurrentTab('doctors'); }}
                        className="py-2 rounded-lg dark:bg-slate-800 dark:hover:bg-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 text-slate-600 text-[10px] font-extrabold uppercase transition-colors text-center"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RECOMMENDED HOSPITALS ── */}
          {result.hospitals.length > 0 && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Recommended Hospitals ({result.hospitals.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.hospitals.slice(0, 5).map(hosp => (
                  <div key={hosp.id} className="p-4 rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/30 bg-white space-y-2.5 transition-all hover:border-brand-teal/30">
                    <h4 className="text-sm font-extrabold dark:text-white text-slate-800 leading-tight">{hosp.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{hosp.address}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase flex-wrap">
                      <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3 fill-amber-500" /> {hosp.rating}</span>
                      <span>{hosp.district}, {hosp.state}</span>
                    </div>
                    <div>
                      {hosp.emergencyBeds > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Emergency Available
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold uppercase text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full">
                          General Care
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALTERNATIVE DIAGNOSES ── */}
          {result.alternativeDiagnoses.length > 0 && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Alternative Diagnoses ({result.alternativeDiagnoses.length})
              </h3>
              <div className="space-y-3">
                {result.alternativeDiagnoses.map((alt, idx) => (
                  <div key={alt.disease} className="p-4 rounded-xl dark:bg-slate-900/40 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-extrabold text-slate-400">
                          #{idx + 2}
                        </span>
                        <h4 className="text-sm font-extrabold dark:text-slate-200 text-slate-700">{alt.disease}</h4>
                      </div>
                      <span className="text-xs font-extrabold font-mono text-slate-400">{alt.confidence}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full dark:bg-slate-800 bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-700"
                        style={{ width: `${alt.confidence}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                      <span>Matched: <span className="font-bold text-slate-300">{alt.matchCount}</span> symptoms</span>
                      <span>•</span>
                      <span className="truncate flex-1">{alt.description.slice(0, 100)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REPORT FOOTER ── */}
          <div className="glass-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
              Source: Supabase AI Symptom Analysis Engine
            </div>
            <div className="flex items-center gap-2">
              {result.reportId && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved as {result.reportId}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Voice Modal Overlay */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 relative bg-white dark:bg-slate-950 border border-white/10 shadow-2xl animate-fade-in text-center space-y-6">
            {/* Close Button */}
            <button
              onClick={() => {
                shouldAnalyzeRef.current = false;
                if (recognition) {
                  try { recognition.stop(); } catch(e) {}
                }
                setIsVoiceModalOpen(false);
              }}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setVoiceLang('en-US')}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  voiceLang === 'en-US'
                    ? 'bg-[#E53935] text-white border-[#E53935] shadow-lg shadow-[#E53935]/25'
                    : 'dark:border-white/10 dark:bg-white/5 border-black/5 bg-black/5 dark:text-slate-400 text-slate-500 hover:bg-black/10'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setVoiceLang('hi-IN')}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  voiceLang === 'hi-IN'
                    ? 'bg-[#E53935] text-white border-[#E53935] shadow-lg shadow-[#E53935]/25'
                    : 'dark:border-white/10 dark:bg-white/5 border-black/5 bg-black/5 dark:text-slate-400 text-slate-500 hover:bg-black/10'
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#E53935]/12 text-[#E53935] flex items-center justify-center mx-auto animate-pulse">
                <Mic className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight dark:text-white text-slate-900">
                {isRecording ? (voiceLang === 'hi-IN' ? 'सुन रहे हैं...' : 'Listening...') : (voiceLang === 'hi-IN' ? 'बोलना समाप्त करें' : 'Speech Stopped')}
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500 max-w-xs mx-auto">
                {voiceLang === 'hi-IN' 
                  ? 'कृपया अपने लक्षण बताएं (जैसे: मुझे कल रात से तेज बुखार और सिर दर्द है)।' 
                  : 'Describe your symptoms in natural language (e.g. "I have a sharp stomach ache and vomiting").'}
              </p>
            </div>

            {/* Pulsing Audio Waveform */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1.5 h-16 my-8">
                {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                  <motion.div
                    key={bar}
                    className="w-1.5 rounded-full bg-[#E53935]"
                    animate={{
                      height: [15, bar % 2 === 0 ? 55 : 35, 15],
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: bar * 0.08,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Transcript Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border dark:border-white/5 border-black/5 max-h-28 overflow-y-auto text-left">
              <span className="text-[9px] font-bold dark:text-[#555] text-slate-400 uppercase tracking-widest font-mono block mb-1">Live Transcript</span>
              <p className="text-xs font-semibold dark:text-slate-200 text-slate-800 italic">
                {voiceTranscript || (voiceLang === 'hi-IN' ? 'बोलना शुरू करें...' : 'Speak now...')}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  shouldAnalyzeRef.current = false;
                  if (recognition) {
                    try { recognition.stop(); } catch(e) {}
                  }
                  setIsVoiceModalOpen(false);
                }}
                type="button"
                className="flex-1 py-3 rounded-xl border dark:border-white/10 dark:bg-white/5 border-black/10 bg-black/5 text-xs font-bold uppercase tracking-wider dark:text-slate-300 text-slate-600 hover:bg-black/10 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  shouldAnalyzeRef.current = true;
                  if (recognition) {
                    try { recognition.stop(); } catch(e) {}
                  }
                }}
                type="button"
                className="flex-1 py-3 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all"
              >
                Done & Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
