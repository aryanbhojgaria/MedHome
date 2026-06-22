import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Mail, Lock, User, Sparkles, AlertCircle, Eye, EyeOff, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { checkSupabaseConnection } from '../lib/db';

interface AuthPageProps {
  onAuthSuccess: (user: { email: string; role: 'Patient' | 'Doctor' | 'Admin'; name: string }) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'Patient' | 'Doctor' | 'Admin'>('Patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isLive = await checkSupabaseConnection();

    if (!isLive) {
      setTimeout(() => {
        setLoading(false);
        if (isLogin) {
          const simulatedName = fullName || email.split('@')[0].replace('.', ' ');
          const formattedName = simulatedName.charAt(0).toUpperCase() + simulatedName.slice(1);
          onAuthSuccess({ email, role, name: formattedName || 'User Account' });
        } else {
          setSuccess(true);
          setTimeout(() => { setIsLogin(true); setSuccess(false); }, 1500);
        }
      }, 900);
      return;
    }

    try {
      if (isLogin) {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) throw authErr;
        if (data?.user) {
          let userRole = role;
          const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
          if (profile?.role) userRole = profile.role as 'Patient' | 'Doctor' | 'Admin';
          onAuthSuccess({
            email: data.user.email || email,
            role: userRole,
            name: profile?.name || data.user.user_metadata?.fullName || 'User Account',
          });
        }
      } else {
        const { data, error: authErr } = await supabase.auth.signUp({
          email, password,
          options: { data: { fullName, role } }
        });
        if (authErr) throw authErr;
        if (data?.user) {
          await supabase.from('users').insert([{ id: data.user.id, name: fullName, email, role, created_at: new Date().toISOString() }]);
          setSuccess(true);
          setTimeout(() => { setIsLogin(true); setSuccess(false); }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const roles: ('Patient' | 'Doctor' | 'Admin')[] = ['Patient', 'Doctor', 'Admin'];

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] dark:bg-[#E53935]/5 bg-[#E53935]/3 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(229,57,53,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(229,57,53,0.6) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="dark:bg-[#141414] bg-white rounded-3xl border dark:border-white/7 border-black/7 shadow-2xl overflow-hidden">
          {/* Top gradient accent */}
          <div className="h-1 bg-gradient-to-r from-[#E53935] to-[#FF6B6B]" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#FF6B6B] mb-4 shadow-lg shadow-[#E53935]/30">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold dark:text-white text-[#111] mb-1">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-sm dark:text-slate-400 text-slate-500">
                {isLogin ? 'Sign in to your MedHome account' : 'Join thousands of healthcare users'}
              </p>
            </div>

            {/* Role tabs */}
            <div className="flex gap-1 p-1 dark:bg-[#1A1A1A] bg-[#F5F5F7] rounded-xl mb-6">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    role === r
                      ? 'bg-gradient-to-r from-[#E53935] to-[#FF6B6B] text-white shadow-md'
                      : 'dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-[#111]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Success / Error alerts */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 p-3 mb-5 rounded-xl border border-green-500/20 bg-green-500/8 text-green-400 text-xs font-semibold"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Registration successful! Redirecting to login…
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 p-3 mb-5 rounded-xl border border-[#E53935]/20 bg-[#E53935]/8 text-[#FF6B6B] text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-[11px] font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <input
                      type="text" required value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Priya Sharma"
                      className="custom-input pl-10 text-sm"
                    />
                    <User className="w-4 h-4 dark:text-slate-500 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="custom-input pl-10 text-sm"
                  />
                  <Mail className="w-4 h-4 dark:text-slate-500 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="custom-input pl-10 pr-11 text-sm"
                  />
                  <Lock className="w-4 h-4 dark:text-slate-500 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 dark:text-slate-500 dark:hover:text-white text-slate-400 hover:text-[#111] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="btn-primary w-full py-3 rounded-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isLogin ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo bypass */}
            <div className="mt-5 pt-5 border-t dark:border-white/6 border-black/6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onAuthSuccess({ email: `${role.toLowerCase()}@demo.medhome.com`, role, name: `Demo ${role}` })}
                className="w-full py-2.5 rounded-xl border border-dashed dark:border-[#E53935]/25 dark:bg-[#E53935]/5 dark:text-[#FF6B6B] border-[#E53935]/20 bg-[#E53935]/4 text-[#C62828] text-xs font-semibold flex items-center justify-center gap-2 hover:dark:border-[#E53935]/40 hover:dark:bg-[#E53935]/8 hover:border-[#E53935]/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Quick Demo — Bypass Login ({role})
              </motion.button>
            </div>

            {/* Toggle */}
            <div className="text-center mt-4">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-xs dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-[#111] transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="text-[#E53935] font-semibold">{isLogin ? 'Sign up' : 'Sign in'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
