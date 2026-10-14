import React, { useEffect, useState } from 'react';
import { Check, Loader2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
  }, [user]);

  const initials = (name.trim() || 'AD')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isDirty =
    name.trim() !== user.name ||
    email.trim() !== user.email ||
    role.trim() !== user.role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showError('Name and email are required.');
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || 'Store Admin',
      });
      setSaved(true);
      showSuccess('Profile updated');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      showError('Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setSaved(false);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5F7088] mb-1">
          Account
        </p>
        <h1 className="font-['Sora'] font-bold text-2xl sm:text-3xl text-[#0A2358] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#5F7088] mt-1.5">
          Edit your admin profile details.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E3EAF2] shadow-card overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-[#E3EAF2] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {initials}
          </div>
          <div>
            <h2 className="font-['Sora'] font-semibold text-base text-[#0A2358] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1C7FDB]" />
              Profile
            </h2>
            <p className="text-xs text-[#5F7088] mt-0.5">
              Visible across the admin panel
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="profile-name" className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl focus:bg-white focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none text-[#0A2358] transition-all"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="profile-email" className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@biopepti.com"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl focus:bg-white focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none text-[#0A2358] transition-all"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="profile-role" className="block text-xs font-semibold text-[#0A2358] mb-1.5">
                Role
              </label>
              <input
                id="profile-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Store Admin"
                className="w-full h-11 px-3.5 text-sm bg-[#F5F8FB] border border-[#E3EAF2] rounded-xl focus:bg-white focus:border-[#1C7FDB] focus:ring-2 focus:ring-[#1C7FDB]/20 outline-none text-[#0A2358] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E3EAF2]">
            <p className="text-[11px] text-[#5F7088]">
              Changes are saved locally on this device.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty || saving}
                className="h-10 px-4 text-sm font-medium text-[#5F7088] hover:text-[#0A2358] hover:bg-[#F1F5F9] rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
