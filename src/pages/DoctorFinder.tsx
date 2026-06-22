import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Clock, ChevronRight, X, Sparkles, UserCheck, Wifi, WifiOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchDoctors, checkSupabaseConnection, insertAppointment, DbDoctor } from '../lib/db';

interface DoctorFinderProps {
  lang: string;
  onAddAppointment: (appointment: {
    id: string;
    doctorName: string;
    specialization: string;
    hospital: string;
    date: string;
    time: string;
    patientName: string;
  }) => void;
  selectedSpecialization: string;
  setSelectedSpecialization: (spec: string) => void;
}

export default function DoctorFinder({
  lang,
  onAddAppointment,
  selectedSpecialization,
  setSelectedSpecialization,
}: DoctorFinderProps) {
  const [doctors, setDoctors] = useState<DbDoctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Booking Modal State
  const [bookingDoc, setBookingDoc] = useState<DbDoctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDoctors();
        setDoctors(data);
        const connected = await checkSupabaseConnection();
        setIsLive(connected);
      } catch (err) {
        console.error('Error loading doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter Logic
  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === 'All' || d.specialization === selectedSpecialization;
    const matchesHospital = selectedHospital === 'All' || d.hospital === selectedHospital;
    
    const matchesAvailability = selectedAvailability === 'All' || 
      (selectedAvailability === 'Today' && d.availableToday);

    const matchesExperience = selectedExperience === 'All' ||
      (selectedExperience === '10+' && d.experience >= 10) ||
      (selectedExperience === '15+' && d.experience >= 15);

    const matchesRating = selectedRating === 'All' ||
      (selectedRating === '4.8+' && d.rating >= 4.8) ||
      (selectedRating === '4.9+' && d.rating >= 4.9);

    return matchesSearch && matchesSpecialization && matchesHospital && matchesAvailability && matchesExperience && matchesRating;
  });

  // Sort Logic
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === 'experience') return b.experience - a.experience;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'distance') return a.distance - b.distance;
    return 0;
  });

  const uniqueSpecializations = Array.from(new Set(doctors.map(d => d.specialization)));
  const uniqueHospitals = Array.from(new Set(doctors.map(d => d.hospital)));

  const handleOpenBooking = (doc: DbDoctor) => {
    setBookingDoc(doc);
    setBookingDate(new Date().toISOString().split('T')[0]); // Default to today
    setBookingTime(doc.timeSlots[0] || '10:00 AM');
    setPatientName('John Doe'); // Default mockup name
    setBookingSuccess(false);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoc) return;

    try {
      const newApt = await insertAppointment({
        doctorName: bookingDoc.name,
        specialization: bookingDoc.specialization,
        hospital: bookingDoc.hospital,
        date: bookingDate,
        time: bookingTime,
        patientName,
      }, bookingDoc.id);

      // Trigger callback to parent state
      onAddAppointment(newApt);
      setBookingSuccess(true);
      
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Close modal after success animation
      setTimeout(() => {
        setBookingDoc(null);
        setBookingSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error reserving appointment:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Verified Doctor Recommendation Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Search and schedule certified medical practitioners. Use the filters below to refine by clinic rating, location coordinates, experience, or instant today availability.
          </p>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border dark:border-slate-800 border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              Loading Backend...
            </div>
          ) : isLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:border-emerald-500/30">
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

      {/* Filters & Search Control Bar */}
      <div className="glass-panel p-5 grid sm:grid-cols-2 lg:grid-cols-7 gap-4 text-left">
        {/* Search */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Doctor or Specialty</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Sarah Jenkins or Pulmonologist..."
              className="custom-input pl-10 text-xs py-2.5"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Specialization */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialty</label>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
          >
            <option value="All">All Specialties</option>
            {uniqueSpecializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Hospital */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital</label>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
          >
            <option value="All">All Hospitals</option>
            {uniqueHospitals.map((hosp) => (
              <option key={hosp} value={hosp}>{hosp}</option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Availability</label>
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
          >
            <option value="All">Any Day</option>
            <option value="Today">Available Today</option>
          </select>
        </div>

        {/* Experience / Ratings Combined */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
          >
            <option value="All">Any Rating</option>
            <option value="4.8+">⭐️ 4.8 & Above</option>
            <option value="4.9+">⭐️ 4.9 & Above</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
          >
            <option value="rating">Rating (High to Low)</option>
            <option value="experience">Experience (High to Low)</option>
            <option value="distance">Distance (Low to High)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center font-bold text-slate-400">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-brand-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Fetching Doctor Rosters...
        </div>
      ) : (
        /* Grid of Doctors */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDoctors.map((doc) => (
            <div
              key={doc.id}
              className="glass-panel p-6 flex flex-col justify-between text-left hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden border border-white/5"
            >
              {/* Glow accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4">
                {/* Doctor Header */}
                <div className="flex items-center gap-4">
                  {/* Initials Avatar */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-white text-base bg-gradient-to-br ${doc.avatarColor} shadow-lg shadow-black/25 flex-shrink-0`}>
                    {doc.name.split(' ').map(n => n[0]).filter(c => c !== 'D' && c !== 'r' && c !== '.').join('')}
                  </div>
                  
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-extrabold dark:text-white text-slate-800 truncate">
                        {doc.name}
                      </h3>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                    </div>
                    
                    <span className="block text-xs font-bold text-brand-blue uppercase tracking-wider">
                      {doc.specialization} <span className="text-[10px] text-slate-400 font-semibold lowercase">({doc.qualification})</span>
                    </span>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span>{doc.experience} Years Exp</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {doc.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio & Details */}
                <p className="text-xs dark:text-slate-400 text-slate-500 leading-relaxed font-medium line-clamp-3">
                  {doc.bio}
                </p>

                {/* Hospital & Distance details */}
                <div className="space-y-1.5 py-3 border-t border-b border-dashed dark:border-slate-800 border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <MapPin className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-5.5">
                    <span>Distance: {doc.distance} km</span>
                    {doc.availableToday ? (
                      <span className="text-[10px] font-bold text-brand-teal uppercase bg-brand-teal/10 px-2 py-0.5 rounded-full">Available Today</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-400/10 px-2 py-0.5 rounded-full">Next Available Tomorrow</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <div className="pt-4 flex justify-between items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Consult Fee: ₹800</span>
                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue-dark active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-brand-blue/15 cursor-pointer"
                >
                  Book Appointment
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {sortedDoctors.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-semibold">
              No doctors match the selected search criteria. Try removing some filters.
            </div>
          )}
        </div>
      )}

      {/* Appointment Booking Modal */}
      {bookingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 relative dark:bg-slate-950 bg-white border border-white/10 shadow-2xl animate-fade-in text-left">
            <button 
              onClick={() => setBookingDoc(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 dark:text-slate-400 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-teal/20 border-2 border-brand-teal flex items-center justify-center text-brand-teal animate-bounce">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Appointment Reserved!</h3>
                  <p className="text-xs text-slate-400 mt-1">A confirmation text & verification code has been dispatched.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-5">
                <div className="flex items-center gap-2 text-brand-blue">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">Confirm Booking</h3>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border dark:border-slate-800 border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consulting Practitioner</span>
                  <div className="text-sm font-extrabold dark:text-white text-slate-800">{bookingDoc.name}</div>
                  <div className="text-xs font-bold text-brand-teal uppercase">{bookingDoc.specialization}</div>
                </div>

                {/* Patient Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name..."
                    className="custom-input text-xs py-2.5"
                  />
                </div>

                {/* Date and Time slots picker */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consult Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Time Slot</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="custom-input text-xs py-2.5 dark:bg-slate-900 bg-white"
                    >
                      {bookingDoc.timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center gap-1.5 py-3 text-xs uppercase font-extrabold tracking-wider cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Reserve Appointment Slot
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
