import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { BiopeptiLogo } from '../components/common/BiopeptiLogo';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@biopepti.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin/dashboard';

  if (authReady && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Check your credentials and that the API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5F8FB]">
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-lg w-full mx-auto lg:mx-0">
        <BiopeptiLogo size="lg" />

        <div className="py-10 sm:py-14 w-full">
          <div className="mb-8">
            <h1 className="font-['Sora'] font-bold text-2xl sm:text-[1.75rem] text-[#0A2358] tracking-tight">
              Sign in
            </h1>
            <p className="text-sm text-[#5F7088] mt-2 leading-relaxed">
              Access your Biopepti catalog admin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5F7088] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@biopepti.com"
                  autoComplete="email"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none text-[#0A2358] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#0A2358] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5F7088] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-[#E3EAF2] rounded-xl focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none text-[#0A2358] transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-[#E5484D] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-1 font-semibold text-sm text-white bg-brand-gradient hover:opacity-95 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span>{loading ? 'Signing in…' : 'Sign in'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-xs text-[#5F7088]">Biopepti Admin</p>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#071A42] via-[#0A2358] to-[#0E4A6E] p-12 text-white flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #12B8A6 0%, transparent 40%), radial-gradient(circle at 80% 70%, #1C7FDB 0%, transparent 45%)',
          }}
        />

        <div className="relative z-10 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#12B8A6]" />
          <span className="text-xs font-medium tracking-wide text-white/70">
            Secure admin access
          </span>
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <p className="font-['Sora'] font-bold text-3xl xl:text-4xl leading-tight tracking-tight">
            Catalog control, simplified.
          </p>
          <p className="text-sm text-white/70 mt-4 leading-relaxed max-w-sm">
            Manage products, keep inventory current, and update your profile — all in one place.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          Dashboard · Products · Settings
        </div>
      </div>
    </div>
  );
};
