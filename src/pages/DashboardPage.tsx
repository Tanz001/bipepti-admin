import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  EyeOff,
  AlertTriangle,
  Plus,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { stats, products, openAddDrawer } = useProducts();
  const { user } = useAuth();

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const overview = [
    {
      label: 'Total products',
      value: stats.total,
      icon: Package,
      tone: 'bg-[#EAF3FD] text-[#1C7FDB]',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: CheckCircle2,
      tone: 'bg-[#12B8A6]/10 text-[#12B8A6]',
    },
    {
      label: 'Draft / hidden',
      value: stats.draft,
      icon: EyeOff,
      tone: 'bg-[#F5A524]/10 text-[#F5A524]',
    },
    {
      label: 'Out of stock',
      value: stats.outOfStock,
      icon: AlertTriangle,
      tone: 'bg-red-50 text-[#E5484D]',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5F7088] mb-1">
            Overview
          </p>
          <h1 className="font-['Sora'] font-bold text-2xl sm:text-3xl text-[#0A2358] tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-[#5F7088] mt-1.5 max-w-lg">
            Manage your catalog and account from one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <NavLink
            to="/admin/settings"
            className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-[#0A2358] bg-white border border-[#E3EAF2] rounded-xl hover:bg-[#F5F8FB] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#5F7088]" />
            Settings
          </NavLink>
          <button
            onClick={openAddDrawer}
            className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {overview.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-[#E3EAF2] p-4 sm:p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#5F7088]">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.tone}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-['JetBrains_Mono'] font-bold text-2xl sm:text-3xl text-[#0A2358] tabular-nums tracking-tight">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E3EAF2] shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3EAF2]">
            <div>
              <h2 className="font-['Sora'] font-semibold text-base text-[#0A2358]">
                Recently updated
              </h2>
              <p className="text-xs text-[#5F7088] mt-0.5">Latest catalog changes</p>
            </div>
            <NavLink
              to="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C7FDB] hover:underline"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {recentProducts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-[#5F7088]">No products yet.</p>
              <button
                onClick={openAddDrawer}
                className="mt-3 text-sm font-semibold text-[#1C7FDB] hover:underline"
              >
                Add your first product
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E3EAF2]">
              {recentProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] overflow-hidden shrink-0 border border-[#E3EAF2]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#5F7088]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A2358] truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#5F7088] truncate font-mono">
                      {product.sku || product.category}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      product.status === 'active'
                        ? 'bg-[#12B8A6]/10 text-[#12B8A6]'
                        : 'bg-slate-100 text-[#5F7088]'
                    }`}
                  >
                    {product.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E3EAF2] shadow-card p-5">
            <h2 className="font-['Sora'] font-semibold text-base text-[#0A2358] mb-1">
              Quick actions
            </h2>
            <p className="text-xs text-[#5F7088] mb-4">Common tasks</p>

            <div className="space-y-2">
              <button
                onClick={openAddDrawer}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[#E3EAF2] hover:border-[#1C7FDB]/40 hover:bg-[#EAF3FD]/50 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-gradient text-white flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2358]">Add product</p>
                  <p className="text-[11px] text-[#5F7088]">Create a new catalog item</p>
                </div>
              </button>

              <NavLink
                to="/admin/products"
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[#E3EAF2] hover:border-[#1C7FDB]/40 hover:bg-[#EAF3FD]/50 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#EAF3FD] text-[#1C7FDB] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2358]">Manage products</p>
                  <p className="text-[11px] text-[#5F7088]">Edit or remove catalog items</p>
                </div>
              </NavLink>

              <NavLink
                to="/admin/settings"
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-[#E3EAF2] hover:border-[#1C7FDB]/40 hover:bg-[#EAF3FD]/50 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] text-[#0A2358] flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2358]">Edit profile</p>
                  <p className="text-[11px] text-[#5F7088]">Update your account details</p>
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
