import React from 'react';
import { Package, CheckCircle2, EyeOff, Layers } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';

export const StatsRow: React.FC = () => {
  const { stats } = useProducts();

  const cards = [
    {
      label: 'Total Products',
      value: stats.total,
      subtext: 'Catalog SKUs',
      icon: Package,
      iconColor: 'text-[#1C7FDB]',
      iconBg: 'bg-[#EAF3FD]',
      sparkline: 'M0,18 Q15,10 30,14 T60,6 T90,12 T120,4',
      strokeColor: '#1C7FDB',
    },
    {
      label: 'Active for Sale',
      value: stats.active,
      subtext: `${Math.round((stats.active / (stats.total || 1)) * 100)}% of catalog`,
      icon: CheckCircle2,
      iconColor: 'text-[#12B8A6]',
      iconBg: 'bg-[#12B8A6]/10',
      sparkline: 'M0,20 Q20,16 40,8 T80,10 T120,2',
      strokeColor: '#12B8A6',
    },
    {
      label: 'Draft / Hidden',
      value: stats.draft,
      subtext: 'Unpublished or restock',
      icon: EyeOff,
      iconColor: 'text-[#F5A524]',
      iconBg: 'bg-[#F5A524]/10',
      sparkline: 'M0,8 Q30,12 60,18 T90,14 T120,16',
      strokeColor: '#F5A524',
    },
    {
      label: 'Product Categories',
      value: stats.categoriesCount,
      subtext: 'Research segments',
      icon: Layers,
      iconColor: 'text-[#0A2358]',
      iconBg: 'bg-slate-100',
      sparkline: 'M0,14 Q25,6 50,12 T90,8 T120,6',
      strokeColor: '#0A2358',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#E3EAF2] p-4 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-[#5F7088] truncate">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.iconBg} ${card.iconColor} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 mt-1">
              <div>
                <p className="font-['JetBrains_Mono'] font-bold text-2xl text-[#0A2358] tracking-tight tabular-nums">
                  {card.value}
                </p>
                <p className="text-[11px] text-[#5F7088] mt-0.5 font-medium">{card.subtext}</p>
              </div>

              {/* Sparkline */}
              <div className="w-16 h-7 shrink-0 hidden sm:block opacity-75">
                <svg viewBox="0 0 120 24" className="w-full h-full overflow-visible">
                  <path
                    d={card.sparkline}
                    fill="none"
                    stroke={card.strokeColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
