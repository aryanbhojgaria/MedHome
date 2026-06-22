import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, Activity, Calendar, FileText,
  Phone, BarChart2, LogOut, LayoutDashboard, ChevronDown,
  Stethoscope, Building2, HeartPulse, Globe, MapPin
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: string;
  setLang: (lang: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  session: { email: string; role: string; name: string } | null;
  onLogout: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  session,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => setMoreDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const primaryNav = session ? [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'checker', label: 'AI Checker', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'doctors', label: 'Doctors', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'hospitals', label: 'Hospitals', icon: <Building2 className="w-4 h-4" /> },
  ] : [];

  const moreNav = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'heatmap', label: 'Disease Map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'history', label: 'EHR Logs', icon: <Activity className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reports', label: 'Lab Sheets', icon: <FileText className="w-4 h-4" /> },
    { id: 'contacts', label: 'Helplines', icon: <Phone className="w-4 h-4" /> },
  ];

  const isMoreActive = moreNav.some(n => n.id === currentTab);

  const handleNav = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'dark:bg-[#0A0A0A]/90 bg-white/90 backdrop-blur-xl border-b dark:border-white/5 border-black/5 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <button
              onClick={() => handleNav(session ? 'dashboard' : 'landing')}
              className="flex items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E53935] to-[#FF6B6B] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_16px_rgba(229,57,53,0.4)] transition-shadow duration-200">
                <HeartPulse className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold tracking-tight dark:text-white text-gray-900">
                Med<span className="text-gradient">Home</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {primaryNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`nav-item flex items-center gap-1.5 ${currentTab === item.id ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              {/* More dropdown */}
              {session && (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className={`nav-item flex items-center gap-1 ${isMoreActive ? 'active' : ''}`}
                  >
                    More <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {moreDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl z-50 dark:bg-[#141414] bg-white border dark:border-white/8 border-black/8 py-1"
                      >
                        {moreNav.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleNav(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left
                              ${currentTab === item.id
                                ? 'dark:text-[#FF6B6B] text-[#E53935] dark:bg-[#E53935]/10 bg-[#E53935]/05'
                                : 'dark:text-[#888] text-[#555] dark:hover:text-white hover:text-black dark:hover:bg-white/4 hover:bg-black/4'
                              }`}
                          >
                            <span className={currentTab === item.id ? 'text-[#E53935]' : 'opacity-60'}>{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {!session && (
                <button
                  onClick={() => handleNav('landing')}
                  className={`nav-item ${currentTab === 'landing' ? 'active' : ''}`}
                >
                  Home
                </button>
              )}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Dark/Light toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors dark:text-[#888] dark:hover:text-white dark:hover:bg-white/5 text-[#555] hover:text-black hover:bg-black/5"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>

              {/* Lang toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors dark:text-[#888] dark:hover:text-white dark:hover:bg-white/5 text-[#555] hover:text-black hover:bg-black/5"
                title="Toggle language"
              >
                <Globe className="w-4 h-4" />
              </motion.button>

              {session ? (
                <div className="flex items-center gap-2">
                  {/* User badge */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-white/5 bg-black/5 border dark:border-white/8 border-black/8">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E53935] to-[#FF6B6B] flex items-center justify-center text-[9px] font-bold text-white">
                      {session.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold dark:text-[#CCC] text-[#444] max-w-[100px] truncate">{session.name}</span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors dark:text-[#888] dark:hover:text-red-400 dark:hover:bg-red-500/10 text-[#555] hover:text-red-600 hover:bg-red-500/8"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleNav('checker')}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Get Started
                </motion.button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center dark:text-[#888] dark:hover:text-white dark:hover:bg-white/5 text-[#555] hover:text-black hover:bg-black/5"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 dark:bg-[#0A0A0A]/95 bg-white/95 backdrop-blur-xl border-b dark:border-white/5 border-black/5 py-4 px-4 md:hidden"
          >
            <div className="max-w-7xl mx-auto space-y-1">
              {[...(session ? primaryNav : [{ id: 'landing', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> }]), ...moreNav].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors
                    ${currentTab === item.id
                      ? 'dark:bg-[#E53935]/12 dark:text-[#FF6B6B] bg-[#E53935]/8 text-[#E53935]'
                      : 'dark:text-[#888] dark:hover:text-white dark:hover:bg-white/4 text-[#555] hover:text-black hover:bg-black/4'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              {session && (
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left dark:text-red-400 dark:hover:bg-red-500/10 text-red-600 hover:bg-red-500/8 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar spacer */}
      <div className="h-16" />
    </>
  );
}
