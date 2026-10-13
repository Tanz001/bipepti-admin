import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';
import { BiopeptiLogo } from '../common/BiopeptiLogo';
import { SIDEBAR_NAV_ITEMS } from '../../config/navigation';
import { useProducts } from '../../context/ProductsContext';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenStorePreview?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenStorePreview,
}) => {
  const { products } = useProducts();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E3EAF2] select-none">
      {/* Top Header / Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#E3EAF2] shrink-0">
        <NavLink
          to="/admin/products"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#1C7FDB] rounded-lg p-1"
        >
          <BiopeptiLogo collapsed={isCollapsed} size={isCollapsed ? 'sm' : 'md'} />
        </NavLink>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 text-[#5F7088] hover:text-[#0A2358] hover:bg-[#F1F5F9] rounded-md transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-[#5F7088] hover:text-[#0A2358] hover:bg-[#F1F5F9] rounded-md"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2">
          {!isCollapsed && (
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#5F7088]">
              Catalog & Management
            </span>
          )}
        </div>

        {SIDEBAR_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const countBadge = item.badgeType === 'count' ? products.length : item.badge;

          return (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => `
                relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-[#EAF3FD] text-[#0A2358] font-semibold'
                    : 'text-[#071A42] hover:bg-[#F1F5F9] hover:text-[#0A2358]'
                }
                ${isCollapsed ? 'justify-center px-2' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Left 3px brand gradient bar for active item */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-brand-gradient" />
                  )}

                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-[#1C7FDB]' : 'text-[#5F7088] group-hover:text-[#0A2358]'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="flex-1 truncate text-left">{item.label}</span>
                  )}

                  {/* Badge */}
                  {!isCollapsed && countBadge !== undefined && (
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-[#1C7FDB]/15 text-[#1C7FDB]'
                          : 'bg-slate-100 text-[#5F7088]'
                      }`}
                    >
                      {countBadge}
                    </span>
                  )}

                  {/* Floating tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0A2358] text-white text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label} {countBadge ? `(${countBadge})` : ''}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Quick info banner when expanded */}
        {!isCollapsed && (
          <div className="pt-6 px-1">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#12B8A6]/10 via-[#1C7FDB]/5 to-transparent border border-[#12B8A6]/20">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#12B8A6]" />
                <span className="text-xs font-semibold text-[#0A2358]">B2B Direct Supply</span>
              </div>
              <p className="text-[11px] text-[#5F7088] leading-relaxed">
                HPLC/MS verified batches. Fast wholesale tier checkout enabled.
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* Admin Profile Footer */}
      <div className="p-3 border-t border-[#E3EAF2] shrink-0 relative" ref={profileMenuRef}>
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-[#F1F5F9] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1C7FDB] ${
            profileMenuOpen ? 'bg-[#F1F5F9]' : ''
          } ${isCollapsed ? 'justify-center p-1.5' : ''}`}
          aria-expanded={profileMenuOpen}
          aria-label="User account menu"
        >
          {/* Avatar initials with brand gradient */}
          <div className="w-9 h-9 rounded-full bg-brand-gradient text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {user.initials}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0A2358] truncate leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-[#5F7088] truncate leading-tight font-mono">
                {user.email}
              </p>
            </div>
          )}

          {!isCollapsed && (
            <ChevronUp
              className={`w-4 h-4 text-[#5F7088] transition-transform duration-200 ${
                profileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>

        {/* Profile Popover Menu */}
        {profileMenuOpen && (
          <div
            className={`absolute bottom-full mb-2 bg-white rounded-xl border border-[#E3EAF2] shadow-popover py-1.5 z-50 ${
              isCollapsed ? 'left-4 w-52' : 'left-3 right-3'
            }`}
          >
            <div className="px-3 py-2 border-b border-[#E3EAF2] mb-1">
              <p className="text-xs font-bold text-[#0A2358]">{user.name}</p>
              <p className="text-[11px] text-[#5F7088] font-mono">{user.email}</p>
            </div>

            <button
              onClick={() => {
                setProfileMenuOpen(false);
                if (onOpenStorePreview) {
                  onOpenStorePreview();
                } else {
                  navigate('/website-preview');
                }
              }}
              className="w-full px-3 py-2 text-xs font-medium text-[#0A2358] hover:bg-[#EAF3FD] flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#1C7FDB]" />
              View public website
            </button>

            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-xs font-medium text-[#E5484D] hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-[#E3EAF2]/60 mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block h-screen fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCollapsed ? 'w-[76px]' : 'w-[264px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0A2358]/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
