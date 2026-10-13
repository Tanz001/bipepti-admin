import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { BiopeptiLogo } from '../components/common/BiopeptiLogo';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@biopepti.com');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/products';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F8FB]">
      {/* Left Column: Login Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto lg:mx-0 w-full">
        <div>
          <BiopeptiLogo size="lg" />
        </div>

        <div className="py-8 sm:py-12 max-w-sm w-full mx-auto lg:mx-0">
          <div className="mb-8">
            <h1 className="font-['Sora'] font-bold text-2xl sm:text-3xl text-[#0A2358] tracking-tight">
              Catalog Admin Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#5F7088] mt-1.5 leading-relaxed">
              Enter your credentials to access store catalog management and B2B pricing controls.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5F7088] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@biopepti.com"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none text-[#0A2358] transition-all shadow-xs"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0A2358]">Password</label>
                <span className="text-[11px] text-[#1C7FDB] hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5F7088] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none text-[#0A2358] transition-all shadow-xs"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#EAF3FD] rounded-xl border border-[#1C7FDB]/20 text-xs text-[#0A2358] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#1C7FDB] shrink-0 mt-0.5" />
              <span>
                Demo Sandbox: Any email & password is accepted to sign in as store administrator.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 font-semibold text-sm text-white bg-brand-gradient hover:opacity-95 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="pt-4 text-xs text-[#5F7088] border-t border-[#E3EAF2]">
          BIOPEPTI Chemical & Peptide Catalog Management System · v2.4
        </div>
      </div>

      {/* Right Column: Split Screen Brand Gradient + Molecule Art */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#071A42] via-[#0A2358] to-[#12B8A6] p-12 text-white flex-col justify-between overflow-hidden">
        {/* Molecule Background Pattern SVG */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
            <g stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4">
              <polygon points="100,100 200,50 300,100 300,200 200,250 100,200" />
              <polygon points="300,100 400,50 500,100 500,200 400,250 300,200" />
              <polygon points="500,100 600,50 700,100 700,200 600,250 500,200" />
              <polygon points="200,250 300,200 400,250 400,350 300,400 200,350" />
              <polygon points="400,250 500,200 600,250 600,350 500,400 400,350" />
              <circle cx="200" cy="50" r="8" fill="#12B8A6" />
              <circle cx="400" cy="50" r="8" fill="#1C7FDB" />
              <circle cx="600" cy="50" r="8" fill="#12B8A6" />
              <circle cx="300" cy="400" r="8" fill="#1C7FDB" />
              <circle cx="500" cy="400" r="8" fill="#12B8A6" />
            </g>
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-mono tracking-widest text-[#12B8A6] uppercase font-bold">
            B2B Peptide Supplier
          </span>
          <span className="text-xs text-white/60 font-mono">ISO 9001 · HPLC Tested</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <h2 className="font-['Sora'] font-bold text-3xl xl:text-4xl leading-tight">
            Precision Research Peptide Management Platform
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Manage formulations, analytical purity specifications, wholesale tier pricing, and instant COA document generation with enterprise-grade catalog precision.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#12B8A6]" />
              <span>Real-time Stock Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#12B8A6]" />
              <span>Multi-tier Volume Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#12B8A6]" />
              <span>HPLC / MS Documentation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#12B8A6]" />
              <span>Fast CSV Import / Export</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/60">
          <span>Trusted by Research Laboratories Worldwide</span>
          <ShieldCheck className="w-4 h-4 text-[#12B8A6]" />
        </div>
      </div>
    </div>
  );
};
