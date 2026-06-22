import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import { 
  MapPin, Navigation, Phone, ShieldCheck, Search, Wifi, WifiOff, 
  AlertTriangle, Crosshair, Star, ChevronLeft, ChevronRight, Compass 
} from 'lucide-react';
import { fetchHospitals, checkSupabaseConnection, DbHospital } from '../lib/db';

interface HospitalFinderProps {
  setCurrentTab?: (tab: string) => void;
  setSelectedSpecialization?: (spec: string) => void;
}

// Haversine distance calculator in km
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function HospitalFinder({ setCurrentTab, setSelectedSpecialization }: HospitalFinderProps) {
  const [facilities, setFacilities] = useState<DbHospital[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<DbHospital | null>(null);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  
  // Geolocation & Distances
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;
  
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchHospitals();
        setFacilities(data);
        if (data.length > 0) {
          setSelectedFacility(data[0]);
        }
        const connected = await checkSupabaseConnection();
        setIsLive(connected);
      } catch (err) {
        console.error('Error loading hospitals:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Geolocation trigger
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    
    setGeoLoading(true);
    setGeoError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation permission rejected or failed:', err);
        setGeoError('Could not retrieve location. Please check browser permissions.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Compute facility distances and search combinations
  const facilitiesWithDistances = React.useMemo(() => {
    return facilities.map(f => {
      if (userLocation && f.latitude && f.longitude) {
        const dist = calculateHaversineDistance(
          userLocation[0],
          userLocation[1],
          f.latitude,
          f.longitude
        );
        return { ...f, distance: dist };
      }
      return f;
    });
  }, [facilities, userLocation]);

  // Dynamic States for filters
  const uniqueStates = React.useMemo(() => {
    return Array.from(new Set(facilities.map(f => f.state))).filter(Boolean).sort();
  }, [facilities]);

  // Filter Logic
  const filteredFacilities = React.useMemo(() => {
    let result = facilitiesWithDistances.filter((f) => {
      const matchesName = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = f.district.toLowerCase().includes(citySearch.toLowerCase()) || 
                          f.address.toLowerCase().includes(citySearch.toLowerCase());
      const matchesType = filterType === 'All' || f.type === filterType;
      const matchesState = filterState === 'All' || f.state === filterState;
      const matchesEmergency = !showEmergencyOnly || f.emergencyBeds > 0;

      return matchesName && matchesCity && matchesType && matchesState && matchesEmergency;
    });

    // If user location is active, sort search results by nearest first
    if (userLocation) {
      result = [...result].sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }
    return result;
  }, [facilitiesWithDistances, searchTerm, citySearch, filterType, filterState, showEmergencyOnly, userLocation]);

  // Nearest 5 Hospitals (For highlight panel, regardless of search queries, but filtered by emergency check if toggled)
  const nearestHospitals = React.useMemo(() => {
    if (!userLocation) return [];
    
    return facilitiesWithDistances
      .filter(f => {
        const matchesEmergency = !showEmergencyOnly || f.emergencyBeds > 0;
        return f.latitude && f.longitude && matchesEmergency;
      })
      .sort((a, b) => (a.distance || 9999) - (b.distance || 9999))
      .slice(0, 5);
  }, [facilitiesWithDistances, userLocation, showEmergencyOnly]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, citySearch, filterType, filterState, showEmergencyOnly]);

  // Paginated Facilities for left list
  const paginatedFacilities = React.useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredFacilities.slice(start, start + cardsPerPage);
  }, [filteredFacilities, currentPage]);

  const totalPages = Math.ceil(filteredFacilities.length / cardsPerPage) || 1;

  const handleDirections = (f: DbHospital) => {
    setSelectedFacility(f);
  };

  const handleCall = (f: DbHospital) => {
    alert(`Dialing verified ABDM helpline for ${f.name} at ${f.phone || '+91-11-26588500'}...`);
  };

  const handleBookRedirect = () => {
    if (setCurrentTab && setSelectedSpecialization) {
      setSelectedSpecialization('All');
      setCurrentTab('doctors');
    } else {
      alert('Routing to doctors booking directory...');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight dark:text-white text-slate-800">
            Interactive Health Facility Finder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Search 5,000+ public and private medical facilities, clinical pathology labs, and pharmacies mapped to Ayushman Bharat (ABDM) coordinates.
          </p>
        </div>

        {/* Live status badge */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:border-emerald-500/30">
              <Wifi className="w-3 w-3 text-emerald-400 animate-pulse" /> Supabase Live
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <WifiOff className="w-3 w-3 text-amber-400" /> Sandbox Mode
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Split Screen */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch min-h-[600px] h-[calc(100vh-160px)]">
        
        {/* LEFT PANEL - Filters & Listings */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-y-auto space-y-5 pr-2 custom-scrollbar">
          
          <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-brand-blue/20">
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Compass className="w-4.5 h-4.5 text-brand-blue" />
                Find Facilities Near Me
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">
                Uses GPS geolocation coordinates to calculate distances to the closest 5 ICU units.
              </p>
            </div>
            
            <button
              onClick={handleLocateUser}
              disabled={geoLoading}
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              <Crosshair className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
              {geoLoading ? 'Locating...' : 'Locate Position'}
            </button>
          </div>

          {geoError && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-brand-emergency/15 text-[11px] text-red-400 font-bold flex gap-2 items-center">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{geoError}</span>
            </div>
          )}

          {/* Search Inputs & Filters Panel */}
          <div className="glass-panel p-5 space-y-4 text-left">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Search Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block font-mono">Hospital Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g. Hospital #1 or Clinic..."
                    className="custom-input pl-8.5 text-xs py-2"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Search City */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block font-mono">City / Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="e.g. Anantpur or Delhi..."
                    className="custom-input pl-8.5 text-xs py-2"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* State Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block font-mono">Select State</label>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="custom-input text-xs py-2 dark:bg-slate-900 bg-white"
                >
                  <option value="All">All States</option>
                  {uniqueStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block font-mono">Facility Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="custom-input text-xs py-2 dark:bg-slate-900 bg-white"
                >
                  <option value="All">All Facility Types</option>
                  <option value="Hospital">Hospitals</option>
                  <option value="Clinic">Outpatient Clinics</option>
                  <option value="Lab">Diagnostic Labs</option>
                  <option value="Pharmacy">Verified Pharmacies</option>
                </select>
              </div>
            </div>

            {/* Emergency Checkbox Toggle */}
            <div className="flex items-center gap-2 pt-2 border-t dark:border-slate-900 border-slate-100">
              <input
                type="checkbox"
                id="emergToggle"
                checked={showEmergencyOnly}
                onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-blue border-slate-700 bg-slate-900 focus:ring-brand-blue cursor-pointer"
              />
              <label htmlFor="emergToggle" className="text-xs font-extrabold uppercase text-slate-300 flex items-center gap-1 cursor-pointer">
                <AlertTriangle className="w-3.5 h-3.5 text-brand-emergency" />
                Show Only Emergency ICU Facilities
              </label>
            </div>
          </div>

          {/* NEAREST HOSPITALS HIGHLIGHT PANEL (If Geolocation active) */}
          {userLocation && nearestHospitals.length > 0 && (
            <div className="glass-panel p-5 space-y-3.5 border-brand-teal/20 text-left bg-gradient-to-br dark:from-teal-950/15 dark:to-transparent">
              <h3 className="text-xs font-extrabold text-brand-teal uppercase tracking-widest flex items-center gap-1.5 border-b dark:border-slate-900 border-slate-100 pb-2">
                <Compass className="w-4.5 h-4.5 animate-spin-slow" />
                Nearest Hospitals (Locational Proximity)
              </h3>
              
              <div className="space-y-2">
                {nearestHospitals.map((hosp, idx) => {
                  const isSelected = selectedFacility?.id === hosp.id;
                  return (
                    <div 
                      key={hosp.id}
                      onClick={() => setSelectedFacility(hosp)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center text-xs ${
                        isSelected 
                          ? 'border-brand-teal dark:bg-brand-teal/10 bg-brand-teal/5' 
                          : 'dark:border-slate-800 dark:bg-slate-900/40 bg-slate-50 dark:hover:bg-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-left space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4.5 h-4.5 rounded bg-brand-teal/20 text-brand-teal font-extrabold text-[10px] flex items-center justify-center">#{idx+1}</span>
                          <h4 className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">{hosp.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-6">{hosp.address.split(',')[0]} • {hosp.district}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="block text-brand-teal font-extrabold font-mono">{hosp.distance} km</span>
                        <span className="text-[8px] text-amber-500 font-extrabold flex items-center gap-0.5 justify-end">★ {hosp.rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HOSPITAL CARDS LIST */}
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono text-left">
                Facilities List ({filteredFacilities.length} Matches)
              </span>

              {loading ? (
                // Skeletons
                [1, 2, 3].map(idx => (
                  <div key={idx} className="glass-panel p-4 h-24 animate-pulse bg-slate-800/10 border-white/5" />
                ))
              ) : paginatedFacilities.length > 0 ? (
                paginatedFacilities.map((f) => {
                  const isSelected = selectedFacility?.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFacility(f)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                        isSelected 
                          ? 'border-brand-blue dark:bg-brand-blue/10 bg-brand-blue/5 shadow-md shadow-brand-blue/10' 
                          : 'dark:border-slate-800 border-slate-200 dark:hover:bg-slate-900/60 hover:bg-slate-50 bg-slate-50'
                      }`}
                    >
                      {/* Left color bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                        f.emergencyBeds > 0 ? 'bg-brand-emergency' : 'bg-brand-blue'
                      }`} />

                      <div className="flex justify-between items-start gap-4 pl-1">
                        <div className="space-y-1 flex-1">
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight group-hover:text-brand-blue transition-colors">{f.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{f.address}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase pt-1">
                            <span className="flex items-center gap-0.5 text-amber-500">★ {f.rating}</span>
                            <span>•</span>
                            <span className="text-slate-400">{f.district}, {f.state}</span>
                            {f.distance !== undefined && (
                              <>
                                <span>•</span>
                                <span className="text-brand-teal font-mono">{f.distance} km away</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between items-end h-full">
                          <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            f.type === 'Hospital' ? 'bg-blue-500/10 text-blue-400' :
                            f.type === 'Clinic' ? 'bg-emerald-500/10 text-emerald-500' :
                            f.type === 'Lab' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {f.type}
                          </span>
                          
                          {f.emergencyBeds > 0 ? (
                            <span className="text-[9px] text-red-500 dark:text-red-400 font-extrabold uppercase tracking-wide bg-brand-emergency/10 border border-brand-emergency/20 px-1.5 py-0.5 rounded-full mt-4 flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-emergency animate-pulse"></span>
                              ICU Vacant: {f.emergencyBeds}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide bg-slate-900 border dark:border-slate-800 px-1.5 py-0.5 rounded mt-4">
                              General Care
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty State
                <div className="py-16 text-center text-slate-400 font-semibold border border-dashed dark:border-slate-800 rounded-2xl p-6">
                  <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-bounce" />
                  No hospitals match the selected filter conditions.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-5 border-t dark:border-slate-900 border-slate-100">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3.5 py-1.5 rounded-xl border dark:border-slate-800 dark:hover:bg-slate-900 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:text-slate-300 disabled:opacity-50 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3.5 py-1.5 rounded-xl border dark:border-slate-800 dark:hover:bg-slate-900 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:text-slate-300 disabled:opacity-50 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PANEL - Leaflet OpenStreetMap */}
        <div className="lg:col-span-7 h-full flex flex-col relative z-0">
          <InteractiveMap 
            facilities={filteredFacilities}
            selectedFacility={selectedFacility}
            onSelectFacility={(f) => setSelectedFacility(f)}
            userLocation={userLocation}
            onBookClick={handleBookRedirect}
          />
        </div>

      </div>

    </div>
  );
}
