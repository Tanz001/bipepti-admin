import React from 'react';

interface BiopeptiLogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BiopeptiLogo: React.FC<BiopeptiLogoProps> = ({
  collapsed = false,
  className = '',
  size = 'md',
}) => {
  const markSize = size === 'sm' ? 28 : size === 'lg' ? 42 : 36;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Molecule Mark: Interconnected peptide rings with teal-to-blue gradient */}
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="BIOPEPTI Molecule Logo"
      >
        <defs>
          <linearGradient id="biopepti-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#12B8A6" />
            <stop offset="100%" stopColor="#1C7FDB" />
          </linearGradient>
          <linearGradient id="biopepti-ring" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#12B8A6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1C7FDB" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Bond connector lines */}
        <line x1="16" y1="24" x2="26" y2="16" stroke="url(#biopepti-grad)" strokeWidth="2.75" strokeLinecap="round" />
        <line x1="26" y1="16" x2="36" y2="24" stroke="url(#biopepti-grad)" strokeWidth="2.75" strokeLinecap="round" />
        <line x1="26" y1="16" x2="26" y2="34" stroke="url(#biopepti-grad)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="24" x2="26" y2="34" stroke="url(#biopepti-grad)" strokeWidth="2.75" strokeLinecap="round" />
        <line x1="26" y1="34" x2="36" y2="24" stroke="url(#biopepti-grad)" strokeWidth="2.75" strokeLinecap="round" />

        {/* Extended peptide bond nodes */}
        <line x1="36" y1="24" x2="43" y2="30" stroke="url(#biopepti-grad)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="16" y1="24" x2="9" y2="30" stroke="url(#biopepti-grad)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="26" y1="16" x2="26" y2="8" stroke="url(#biopepti-grad)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Center aromatic resonance ring */}
        <circle cx="26" cy="24" r="5" stroke="url(#biopepti-ring)" strokeWidth="2" strokeDasharray="3 2" />

        {/* Main hexagonal vertices / atomic nodes */}
        <circle cx="26" cy="16" r="3.75" fill="url(#biopepti-grad)" />
        <circle cx="36" cy="24" r="3.75" fill="url(#biopepti-grad)" />
        <circle cx="26" cy="34" r="3.75" fill="url(#biopepti-grad)" />
        <circle cx="16" cy="24" r="3.75" fill="url(#biopepti-grad)" />

        {/* Outer terminal nodes */}
        <circle cx="26" cy="8" r="2.2" fill="#12B8A6" />
        <circle cx="43" cy="30" r="2.2" fill="#1C7FDB" />
        <circle cx="9" cy="30" r="2.2" fill="#12B8A6" />
      </svg>

      {/* Wordmark: Bold navy Biopepti */}
      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className="font-['Sora'] font-bold text-xl tracking-tight text-[#0A2358]"
              style={{ letterSpacing: '-0.03em' }}
            >
              Biopepti
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#12B8A6] bg-[#12B8A6]/10 px-1.5 py-0.5 rounded-sm">
              Admin
            </span>
          </div>
          <span className="text-[11px] font-medium tracking-tight text-[#5F7088] -mt-0.5">
            Catalog Manager
          </span>
        </div>
      )}
    </div>
  );
};
