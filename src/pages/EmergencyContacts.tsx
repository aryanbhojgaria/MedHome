import React, { useState, useEffect } from 'react';
import { Phone, Plus, Wifi, WifiOff } from 'lucide-react';
import { fetchEmergencyContacts, checkSupabaseConnection, EmergencyContact } from '../lib/db';

export default function EmergencyContacts() {
  const [bloodState, setBloodState] = useState('All');
  const [bloodGroup, setBloodGroup] = useState('All');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEmergencyContacts();
        setContacts(data);
        const connected = await checkSupabaseConnection();
        setIsLive(connected);
      } catch (err) {
        console.error('Error loading contacts:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Static mock blood bank registry units database
  const bloodInventories = [
    { hospital: 'AIIMS Blood Bank', state: 'Delhi', group: 'O+', units: 28, contact: '+91-11-26588500' },
    { hospital: 'Safdarjung Blood Bank', state: 'Delhi', group: 'A+', units: 14, contact: '+91-11-26730000' },
    { hospital: 'KEM Hospital Blood Bank', state: 'Maharashtra', group: 'O+', units: 45, contact: '+91-22-24107000' },
    { hospital: 'Manipal Hospital Blood Hub', state: 'Karnataka', group: 'B+', units: 22, contact: '+91-80-25024444' },
    { hospital: 'Apollo Chennai Blood Unit', state: 'Tamil Nadu', group: 'AB+', units: 8, contact: '+91-44-28290200' },
    { hospital: 'SSKM Kolkata Blood Bank', state: 'West Bengal', group: 'O-', units: 5, contact: '+91-33-22235000' }
  ];

  const filteredBlood = bloodInventories.filter(item => {
    const matchesState = bloodState === 'All' || item.state === bloodState;
    const matchesGroup = bloodGroup === 'All' || item.group === bloodGroup;
    return matchesState && matchesGroup;
  });

  const handleDial = (number: string) => {
    alert(`Initiating dialer dispatch to ${number}...`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">National Emergency Directories</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Sourced directly from government registries. Dial directly in critical crises.
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border dark:border-slate-800 border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              Loading Backend...
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 dark:border-emerald-500/30">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Supabase Live
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
        <div className="h-[200px] flex items-center justify-center font-bold text-slate-400">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Fetching Helplines Directory...
        </div>
      ) : (
        /* Hotline Grid */
        <div className="grid md:grid-cols-2 gap-6">
          {contacts.map((hotline) => (
            <div key={hotline.id} className="glass-panel p-5 border border-white/5 flex justify-between items-start gap-4">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hotline.category || 'National Roster'}</span>
                <h3 className="text-sm font-extrabold dark:text-white text-slate-800">{hotline.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Emergency hotline for {hotline.name.toLowerCase()} triage support and disaster assistance.
                </p>
              </div>
              
              <button
                onClick={() => handleDial(hotline.phone)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-emergency text-white hover:bg-red-600 active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-brand-emergency/15 flex-shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                Dial {hotline.phone}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Blood Bank Registry */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center gap-2 border-b dark:border-slate-900 border-slate-200 pb-3">
          <Plus className="w-5 h-5 text-brand-emergency" />
          <h3 className="text-sm font-extrabold dark:text-white text-slate-800">State Blood Inventory Database</h3>
        </div>

        {/* Filters */}
        <div className="grid sm:grid-cols-2 gap-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select State</label>
            <select
              value={bloodState}
              onChange={(e) => setBloodState(e.target.value)}
              className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
            >
              <option value="All">All States</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
            >
              <option value="All">All Groups</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
            </select>
          </div>
        </div>

        {/* Listing results */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b dark:border-slate-800 border-slate-100">
                <th className="py-2.5">Blood Bank / Hospital</th>
                <th className="py-2.5">State</th>
                <th className="py-2.5">Group</th>
                <th className="py-2.5">Stock Available</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 divide-slate-50 font-semibold text-slate-700 dark:text-slate-300">
              {filteredBlood.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  <td className="py-3 font-bold dark:text-white">{item.hospital}</td>
                  <td className="py-3">{item.state}</td>
                  <td className="py-3 text-brand-teal font-extrabold">{item.group}</td>
                  <td className="py-3 dark:text-white text-slate-800 font-extrabold">{item.units} Units</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDial(item.contact)}
                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold bg-brand-blue text-white hover:bg-brand-blue-dark active:scale-95 transition-all flex items-center justify-center gap-1 shadow-md shadow-brand-blue/15"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Blood Center
                    </button>
                  </td>
                </tr>
              ))}

              {filteredBlood.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-bold">
                    No active blood bank registry entries matching parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
