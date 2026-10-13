import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon, ArrowLeft, Sparkles } from 'lucide-react';

interface SectionPlaceholderPageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
}

export const SectionPlaceholderPage: React.FC<SectionPlaceholderPageProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge = 'Coming Soon in Q4',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E3EAF2] p-8 sm:p-12 shadow-card text-center max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAF3FD] text-[#1C7FDB] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12B8A6]/10 text-[#12B8A6] text-xs font-semibold mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        {badge}
      </div>

      <h2 className="font-['Sora'] font-bold text-2xl text-[#0A2358]">{title}</h2>
      <p className="text-sm text-[#5F7088] mt-2 max-w-md mx-auto leading-relaxed">
        {subtitle}
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <NavLink
          to="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-gradient rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products Catalog</span>
        </NavLink>
      </div>
    </div>
  );
};
