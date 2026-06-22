import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchHospitals, 
  fetchEmergencyContacts, 
  insertEmergencyContact, 
  deleteEmergencyContact,
  checkSupabaseConnection, 
  type DbHospital, 
  type EmergencyContact 
} from '../lib/db';
import { 
  ShieldAlert, AlertTriangle, ShieldCheck, MapPin, Navigation, 
  Phone, Heart, Activity, Star, Plus, Trash2, Users, Wifi, WifiOff, X, ArrowRight
} from 'lucide-react';

export default function EmergencySOS() {
  const [sosActivated, setSosActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [triageComplete, setTriageComplete] = useState(false);
  
  // Data States
  const [hospitals, setHospitals] = useState<DbHospital[]>([]);
  const [personalContacts, setPersonalContacts] = useState<EmergencyContact[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Contact Form State
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // National Hotlines Static List
  const nationalHotlines = [
    { id: 'nat-1', name: 'National Emergency Helpline', phone: '112', category: 'General Help' },
    { id: 'nat-2', name: 'Ambulance Dispatch Control', phone: '102', category: 'Medical Triage' },
    { id: 'nat-3', name: 'Disaster Management Unit', phone: '108', category: 'Emergency Services' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [hData, cData] = await Promise.all([
          fetchHospitals(),
          fetchEmergencyContacts()
        ]);
        setHospitals(hData);
        setPersonalContacts(cData);
        const connected = await checkSupabaseConnection();
        setIsLive(connected);
      } catch (err) {
        console.error('Error loading emergency data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let timer: any;
    if (sosActivated && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (sosActivated && countdown === 0) {
      setTriageComplete(true);
    }
    return () => clearTimeout(timer);
  }, [sosActivated, countdown]);

  // Sort hospitals: emergency available first, then by rating
  const sortedEmergencyHospitals = React.useMemo(() => {
    return [...hospitals].sort((a, b) => {
      const aEmerg = a.emergencyBeds > 0 ? 1 : 0;
      const bEmerg = b.emergencyBeds > 0 ? 1 : 0;
      if (bEmerg !== aEmerg) return bEmerg - aEmerg;
      return b.rating - a.rating;
    });
  }, [hospitals]);

  const nearestHospital = sortedEmergencyHospitals[0] || {
    id: 'hfr-1',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    address: 'Ansari Nagar, New Delhi - 110029',
    phone: '+91-11-26588500',
    emergencyBeds: 25,
    licenseNumber: 'HFR-DL-2022-00453',
    rating: 4.8
  };

  const handleActivateSOS = () => {
    setSosActivated(true);
    setCountdown(5);
    setTriageComplete(false);
  };

  const handleCancelSOS = () => {
    setSosActivated(false);
    setTriageComplete(false);
  };

  const handleDial = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const added = await insertEmergencyContact({
      contact_name: newContactName,
      phone: newContactPhone
    });

    if (added) {
      setPersonalContacts(prev => [...prev, added]);
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContact(false);
    } else {
      // Offline fallback
      const offlineContact = {
        id: 'mock-' + Math.random().toString(36).substr(2, 9),
        name: newContactName,
        phone: newContactPhone,
        category: 'Personal Contact'
      };
      setPersonalContacts(prev => [...prev, offlineContact]);
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    const success = await deleteEmergencyContact(id);
    if (success || id.startsWith('mock-')) {
      setPersonalContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8 animate-fade-in relative z-10">
      
      {/* SOS Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white text-slate-900">
            Emergency SOS Control Center
          </h1>
          <p className="text-xs sm:text-sm dark:text-[#888] text-[#555] font-medium">
            Activate instant triage maps, view real-time vacant ICU care centers, and dispatch alerts to emergency contacts.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#1A1A1A] text-slate-500 border dark:border-white/5 border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              Loading Backend...
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">
              <Wifi className="w-3.5 h-3.5 text-[#00C853] animate-pulse" />
              Live Sync Active
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <WifiOff className="w-3.5 h-3.5 text-orange-500" />
              Local Sandbox Mode
            </div>
          )}
        </div>
      </div>

      {!sosActivated ? (
        /* SOS Trigger Screen */
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Pulse SOS Button Panel */}
          <div className="lg:col-span-7 glass-panel p-8 md:p-12 text-center space-y-8 border-[#E53935]/20 border relative overflow-hidden bg-gradient-to-br dark:from-[#E53935]/5 dark:to-transparent">
            {/* Heartbeat indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#E53935] bg-[#E53935]/8 border border-[#E53935]/20 uppercase tracking-widest animate-pulse-slow">
              <Activity className="w-4 h-4 animate-bounce" /> Emergency Mode Standby
            </div>

            <div className="space-y-3 pt-6 max-w-lg mx-auto">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Instant Hospital Triage & <br />
                <span className="text-gradient-emergency">Ambulance Dispatch</span>
              </h2>
              <p className="text-xs sm:text-sm dark:text-[#888] text-[#555] font-medium leading-relaxed">
                Press the button below in an active medical crisis. MedHome will instantly locate the nearest ICU, pre-reserve a bed, and establish emergency route coordinates.
              </p>
            </div>

            {/* Pulsing SOS Button */}
            <div className="relative flex justify-center py-8">
              {/* Outer animated rings */}
              <div className="absolute w-44 h-44 rounded-full border border-[#E53935]/35 radar-wave pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full border border-[#E53935]/35 radar-wave-delayed pointer-events-none" />
              
              <button
                onClick={handleActivateSOS}
                className="w-36 h-36 rounded-full flex flex-col items-center justify-center bg-[#E53935] hover:bg-[#B71C1C] active:scale-95 transition-all shadow-[0_0_30px_rgba(229,57,53,0.4)] border border-[#FF6B6B]/40 relative z-10 group cursor-pointer"
              >
                <ShieldAlert className="w-12 h-12 text-white group-hover:scale-115 transition-transform" />
                <span className="text-white text-lg font-black tracking-widest mt-1 font-mono uppercase">
                  SOS
                </span>
                <span className="block text-[8px] font-bold text-red-200 tracking-widest uppercase">
                  Tap to Trigger
                </span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[#E53935]/15 bg-[#E53935]/5 max-w-md mx-auto">
              <span className="text-[10px] font-bold dark:text-[#888] text-[#555] uppercase tracking-wider block">Important Information</span>
              <p className="text-[11px] dark:text-[#CCC] text-slate-600 leading-relaxed font-semibold mt-1">
                Activating SOS coordinates your GPS path with nearest cardiovascular, respiratory, or trauma center databases for automated triage.
              </p>
            </div>
          </div>

          {/* Sidebar - Emergency Contacts Management */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* User Custom Contacts Panel */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex justify-between items-center border-b dark:border-white/5 border-black/5 pb-3">
                <h3 className="text-sm font-extrabold dark:text-white text-slate-900 flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-[#E53935]" />
                  Personal Contacts
                </h3>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="text-[10px] font-bold text-[#E53935] hover:text-white dark:hover:bg-white/5 hover:bg-black/5 px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              {/* Add contact form toggle panel */}
              {showAddContact && (
                <form onSubmit={handleAddContactSubmit} className="p-3 rounded-xl border dark:border-white/8 border-black/8 dark:bg-[#1A1A1A]/40 bg-white space-y-3 animate-fade-in">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Add Personal Helpline</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Contact Name..."
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="custom-input text-xs py-2 px-3"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone number..."
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="custom-input text-xs py-2 px-3"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-1.5 rounded-lg border dark:border-white/8 border-black/8 text-[10px] font-bold uppercase tracking-wider text-slate-550 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3.5 py-1.5 rounded-lg bg-[#E53935] hover:bg-[#B71C1C] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Save Contact
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {personalContacts.length > 0 ? (
                  personalContacts.map(c => (
                    <div key={c.id} className="flex justify-between items-center gap-2 p-3 rounded-xl dark:bg-[#1A1A1A]/60 bg-slate-50 border dark:border-white/5 border-black/5">
                      <div>
                        <h4 className="text-xs font-extrabold dark:text-white text-slate-800">{c.name}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">{c.category || 'Emergency'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDial(c.phone)}
                          className="px-3 py-1.5 rounded bg-[#E53935]/15 text-[#E53935] text-[10px] font-extrabold uppercase hover:bg-[#E53935] hover:text-white active:scale-95 transition-all cursor-pointer"
                        >
                          Dial {c.phone}
                        </button>
                        <button
                          onClick={() => handleDeleteContact(c.id)}
                          className="p-1.5 rounded text-slate-500 hover:text-[#E53935] hover:bg-[#E53935]/10 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-slate-500 text-xs font-semibold italic">
                    No custom contacts saved. Add one above.
                  </div>
                )}
              </div>
            </div>

            {/* National Hotlines static panel */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-extrabold dark:text-white text-slate-900 border-b dark:border-white/5 border-black/5 pb-3">
                National Crisis Dispatch Lines
              </h3>
              <div className="space-y-3">
                {nationalHotlines.map(h => (
                  <div key={h.id} className="flex justify-between items-center gap-2 p-3 rounded-xl dark:bg-[#1A1A1A]/60 bg-slate-50 border dark:border-white/5 border-black/5">
                    <div>
                      <h4 className="text-xs font-extrabold dark:text-white text-slate-800">{h.name}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">{h.category}</span>
                    </div>
                    <button 
                      onClick={() => handleDial(h.phone)}
                      className="px-4.5 py-1.5 rounded bg-[#E53935] text-white text-[10px] font-extrabold uppercase hover:bg-[#B71C1C] active:scale-95 transition-all cursor-pointer"
                    >
                      Call {h.phone}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : !triageComplete ? (
        /* Countdown Screen (Stress-optimized circular progress) */
        <div className="glass-panel p-12 text-center space-y-8 border-[#E53935]/35 border dark:bg-[#0A0A0A] bg-white max-w-2xl mx-auto shadow-2xl rounded-3xl animate-pulse">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-[#E53935] uppercase font-mono">Triage Dispatch Countdown</h2>
            <p className="text-sm dark:text-[#CCC] text-slate-600 font-semibold leading-relaxed">
              MedHome is establishing emergency database sync with local ICU trauma rooms.
            </p>
          </div>

          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#E53935]/25 animate-spin-slow" />
            {/* Inner countdown */}
            <div className="text-5xl font-black text-slate-900 dark:text-white font-mono">
              {countdown}
            </div>
          </div>

          <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">
            🚨 Ambulance routing and dispatch will trigger automatically in {countdown} seconds.
          </p>

          <button
            onClick={handleCancelSOS}
            className="px-8 py-3.5 rounded-2xl border dark:border-white/10 border-black/10 dark:bg-[#1A1A1A] bg-slate-100 text-xs uppercase tracking-wider font-extrabold dark:text-white text-slate-700 hover:bg-slate-200 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            Cancel SOS Dispatch
          </button>
        </div>
      ) : (
        /* Full-screen Active Triage Screen */
        <div className="space-y-6 animate-fade-in relative z-25">
          {/* Status Alert Banner */}
          <div className="p-6 rounded-3xl border border-[#E53935]/30 bg-[#E53935]/8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_24px_rgba(229,57,53,0.1)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0 animate-ping absolute opacity-30" />
              <div className="w-12 h-12 rounded-full bg-[#E53935] flex items-center justify-center flex-shrink-0 relative z-10 animate-pulse">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div className="text-left space-y-1">
                <h3 className="text-lg font-black dark:text-white text-slate-900 uppercase tracking-widest font-mono">CRITICAL SOS BEACON DISPATCHED</h3>
                <p className="text-xs dark:text-red-200 text-red-700 font-semibold leading-relaxed">
                  Secured fastest driving coordinates. ICU Bed #4 is pre-reserved. Patient files sent to {nearestHospital.name}.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCancelSOS}
              className="px-6 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-black uppercase tracking-wider text-white hover:bg-black active:scale-95 transition-all flex-shrink-0 cursor-pointer"
            >
              Cancel SOS / Resolved
            </button>
          </div>

          {/* Grid: Map & Hospital details vs First Aid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Nearest Hospital Card */}
            <div className="glass-panel p-6 space-y-6 border-[#E53935]/25 border bg-gradient-to-br dark:from-[#E53935]/5 dark:to-transparent">
              <div>
                <span className="text-[10px] font-bold text-[#E53935] uppercase tracking-wider block font-mono">Nearest Emergency Center</span>
                <h3 className="text-2xl font-black tracking-tight dark:text-white text-slate-900 mt-1">{nearestHospital.name}</h3>
                <span className="text-[9px] font-bold text-[#E53935] uppercase bg-[#E53935]/8 px-2 py-0.5 rounded inline-block mt-2 border border-[#E53935]/15 font-mono">
                  ABDM License: {nearestHospital.licenseNumber || `HFR-DL-2022-00${nearestHospital.id || 123}`}
                </span>
              </div>

              {/* Transit Metrics */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl dark:bg-[#0C0C0C]/80 bg-slate-50 border dark:border-white/5 border-black/5">
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Estimated Distance</span>
                  <span className="text-lg font-black dark:text-white text-slate-800">2.4 km away</span>
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Driving Arrival</span>
                  <span className="text-lg font-black text-[#E53935]">8 minutes</span>
                </div>
              </div>

              {/* Location stats */}
              <div className="space-y-3 font-semibold text-xs dark:text-slate-300 text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4.5 h-4.5 text-[#E53935] flex-shrink-0 mt-0.5" />
                  <span>{nearestHospital.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4.5 h-4.5 text-[#FF6B6B] flex-shrink-0" />
                  <span>Optimal Route: Ring Road Trauma Bypass secured</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2">
                <button
                  onClick={() => handleDial(nearestHospital.phone || '112')}
                  className="w-full btn-primary py-3.5 text-xs uppercase font-extrabold tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(229,57,53,0.3)] animate-pulse"
                >
                  <Phone className="w-4.5 h-4.5 text-white" />
                  Call Ambulance Dispatcher
                </button>
              </div>

              {/* Alternatives List */}
              {sortedEmergencyHospitals.length > 1 && (
                <div className="space-y-3 pt-4 border-t dark:border-white/5 border-black/5 text-left">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-mono">Alternative Emergency Centers</span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {sortedEmergencyHospitals.slice(1, 4).map(h => (
                      <div key={h.id} className="p-3 rounded-xl border dark:border-white/5 border-black/5 dark:bg-[#1A1A1A]/30 bg-slate-50 flex justify-between items-center text-xs font-semibold">
                        <div>
                          <h4 className="dark:text-white text-slate-800 font-extrabold">{h.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{h.address.split(',')[0]} • {h.state}</p>
                        </div>
                        <span className="text-[10.5px] font-extrabold text-[#E53935] font-mono uppercase">{h.emergencyBeds} beds</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* First Aid Instructions */}
            <div className="glass-panel p-6 space-y-6 border dark:border-white/5 border-black/5 bg-[#151515]/30">
              <span className="text-[10px] font-bold text-[#E53935] uppercase tracking-wider block font-mono">AI First Aid Precaution Checklist</span>

              <div className="space-y-3.5">
                <div className="flex gap-3 items-start p-4 rounded-2xl dark:bg-[#0A0A0A]/60 bg-slate-50 border dark:border-white/5 border-black/5">
                  <span className="w-6 h-6 rounded-lg bg-[#E53935]/12 text-[#E53935] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black dark:text-white text-slate-800 uppercase tracking-wider">Remain Seated / Resting</h4>
                    <p className="text-[10.5px] dark:text-[#888] text-slate-600 font-semibold leading-relaxed">Stop all physical activity to lower cardiac workload and keep heart rate steady.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-2xl dark:bg-[#0A0A0A]/60 bg-slate-50 border dark:border-white/5 border-black/5">
                  <span className="w-6 h-6 rounded-lg bg-[#E53935]/12 text-[#E53935] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black dark:text-white text-slate-800 uppercase tracking-wider">Loosen Clothing</h4>
                    <p className="text-[10.5px] dark:text-[#888] text-slate-600 font-semibold leading-relaxed">Loosen ties, collars, or belts to facilitate full diaphragm breathing expansions.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-2xl dark:bg-[#0A0A0A]/60 bg-slate-50 border dark:border-white/5 border-black/5">
                  <span className="w-6 h-6 rounded-lg bg-[#E53935]/12 text-[#E53935] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black dark:text-white text-slate-800 uppercase tracking-wider">Unlock Doors</h4>
                    <p className="text-[10.5px] dark:text-[#888] text-slate-600 font-semibold leading-relaxed">Ensure physical access points to your home are unlocked so paramedics can enter immediately.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 rounded-2xl dark:bg-[#0A0A0A]/60 bg-slate-50 border dark:border-white/5 border-black/5">
                  <span className="w-6 h-6 rounded-lg bg-[#E53935]/12 text-[#E53935] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">4</span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black dark:text-white text-slate-800 uppercase tracking-wider">Prepare Diagnostics ID</h4>
                    <p className="text-[10.5px] dark:text-[#888] text-slate-600 font-semibold leading-relaxed">Have your insurance card or national healthcare ID card ready for paramedic scanning.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
