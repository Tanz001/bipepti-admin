import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F8FB] flex items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl border border-[#E3EAF2] p-10 max-w-md w-full shadow-card">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-[#E5484D] flex items-center justify-center mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="font-mono text-3xl font-bold text-[#0A2358]">404</span>
        <h2 className="font-['Sora'] font-bold text-xl text-[#0A2358] mt-2">
          Page Not Found
        </h2>
        <p className="text-xs text-[#5F7088] mt-2 leading-relaxed">
          The requested dashboard section or peptide resource does not exist in this database.
        </p>

        <div className="mt-6">
          <NavLink
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-gradient rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Products</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
