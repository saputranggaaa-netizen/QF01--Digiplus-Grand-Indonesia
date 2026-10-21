import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Wallet,
  Package,
  Layers,
  Tag,
  Target,
  Box,
  Zap,
  Smartphone,
  Newspaper,
  CreditCard,
  CheckSquare,
  UploadCloud,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sheet
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onSelectNav: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenGoogleSheetModal: () => void;
  isSheetConnected?: boolean;
  storeCode?: string;
  storeName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  onOpenGoogleSheetModal,
  isSheetConnected,
  storeCode = 'QF01',
  storeName = 'Digiplus QF01'
}) => {
  const [openSections, setOpenSections] = useState({
    dashboard: true,
    targetFokus: true,
    administrasi: true
  });

  const toggleSection = (section: 'dashboard' | 'targetFokus' | 'administrasi') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#0d1527] text-slate-300 z-30 flex flex-col border-r border-slate-800/80 transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-18 px-4 flex items-center justify-between border-b border-slate-800/60 bg-[#0a1120]">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Blue Store Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/30 shrink-0 text-sm tracking-wide">
            {storeCode}
          </div>
          
          {!collapsed && (
            <div className="truncate">
              <div className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
                <span>{storeName.length > 15 ? `${storeName.substring(0, 15)}...` : storeName}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Sales Dashboard</div>
              {/* 3 Color Dots (Red, Yellow, Cyan) matching screenshot */}
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
          title={collapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-700">
        {/* Section 1: DASHBOARD */}
        <div>
          <button
            onClick={() => toggleSection('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wider hover:text-white uppercase ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard size={14} className="text-blue-400" />
              {!collapsed && <span>Dashboard</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  openSections.dashboard ? 'rotate-0' : '-rotate-90'
                }`}
              />
            )}
          </button>

          {(!collapsed ? openSections.dashboard : true) && (
            <div className="mt-1 space-y-0.5">
              <NavItem
                id="overview"
                label="Overview"
                icon={<LayoutDashboard size={16} />}
                active={activeNav === 'overview'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="daily-sales"
                label="Daily Sales"
                icon={<Calendar size={16} />}
                active={activeNav === 'daily-sales'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="daily-summary"
                label="Daily Summary"
                icon={<FileText size={16} />}
                active={activeNav === 'daily-summary'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="staff-performance"
                label="Staff Performance"
                icon={<Users size={16} />}
                active={activeNav === 'staff-performance'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="est-incentive"
                label="Est. Incentive"
                icon={<Wallet size={16} />}
                active={activeNav === 'est-incentive'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="soh"
                label="SOH"
                icon={<Package size={16} />}
                active={activeNav === 'soh'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="stokan"
                label="Stokan"
                icon={<Layers size={16} />}
                active={activeNav === 'stokan'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="price-list"
                label="Price List"
                icon={<Tag size={16} />}
                active={activeNav === 'price-list'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
            </div>
          )}
        </div>

        {/* Section 2: TARGET FOKUS */}
        <div>
          <button
            onClick={() => toggleSection('targetFokus')}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wider hover:text-white uppercase ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <Target size={14} className="text-purple-400" />
              {!collapsed && <span>Target Fokus</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  openSections.targetFokus ? 'rotate-0' : '-rotate-90'
                }`}
              />
            )}
          </button>

          {(!collapsed ? openSections.targetFokus : true) && (
            <div className="mt-1 space-y-0.5">
              <NavItem
                id="lob-target-fokus"
                label="LOB Target Fokus"
                icon={<Target size={16} />}
                active={activeNav === 'lob-target-fokus'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="product-fokus-3pp"
                label="Product Fokus 3PP"
                icon={<Box size={16} />}
                active={activeNav === 'product-fokus-3pp'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="vas-fokus"
                label="VAS Fokus"
                icon={<Zap size={16} />}
                active={activeNav === 'vas-fokus'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="android-fokus"
                label="Android Fokus"
                icon={<Smartphone size={16} />}
                active={activeNav === 'android-fokus'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
            </div>
          )}
        </div>

        {/* Section 3: ADMINISTRASI */}
        <div>
          <button
            onClick={() => toggleSection('administrasi')}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wider hover:text-white uppercase ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckSquare size={14} className="text-amber-400" />
              {!collapsed && <span>Administrasi</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  openSections.administrasi ? 'rotate-0' : '-rotate-90'
                }`}
              />
            )}
          </button>

          {(!collapsed ? openSections.administrasi : true) && (
            <div className="mt-1 space-y-0.5">
              <NavItem
                id="mading"
                label="Mading"
                icon={<Newspaper size={16} />}
                active={activeNav === 'mading'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="bnpl-trade-in"
                label="BNPL & Trade-In"
                icon={<CreditCard size={16} />}
                active={activeNav === 'bnpl-trade-in'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="checklist-spv"
                label="Checklist Store - SPV"
                icon={<CheckSquare size={16} />}
                active={activeNav === 'checklist-spv'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="checklist-staff"
                label="Checklist Store - Staff"
                icon={<CheckSquare size={16} />}
                active={activeNav === 'checklist-staff'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
              <NavItem
                id="data-upload"
                label="Data Upload"
                icon={<UploadCloud size={16} />}
                active={activeNav === 'data-upload'}
                collapsed={collapsed}
                onClick={onSelectNav}
              />
            </div>
          )}
        </div>
      </div>

      {/* Google Sheet Sync Quick Action in Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0a1120]">
        <button
          onClick={onOpenGoogleSheetModal}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
            isSheetConnected
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50'
              : 'bg-blue-900/30 text-blue-300 border border-blue-800/50 hover:bg-blue-900/50'
          } ${collapsed ? 'justify-center px-0' : ''}`}
          title="Sinkronisasi Google Sheet"
        >
          <Sheet size={16} className={isSheetConnected ? 'text-emerald-400' : 'text-blue-400'} />
          {!collapsed && (
            <div className="text-left truncate">
              <div className="font-semibold truncate">Google Sheet</div>
              <div className="text-[10px] opacity-80 truncate">
                {isSheetConnected ? 'Terhubung (Tersinkron)' : 'Atur Koneksi'}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

interface NavItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  onClick: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({
  id,
  label,
  icon,
  active,
  collapsed,
  onClick
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all relative ${
        active
          ? 'bg-blue-600/15 text-blue-400 font-semibold shadow-sm'
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      {/* Active Left indicator bar */}
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full" />
      )}
      <div className={`shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`}>
        {icon}
      </div>
      {!collapsed && <span className="truncate text-[13px]">{label}</span>}
    </button>
  );
};
