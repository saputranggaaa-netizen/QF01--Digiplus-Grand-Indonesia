import React from 'react';
import { RefreshCw, LogOut, Moon, Sun, Sheet, CheckCircle2, AlertCircle, Clock, Radio } from 'lucide-react';
import { GoogleSheetConfig } from '../types/dashboard';

interface HeaderProps {
  storeCode: string;
  activeNavTitle: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenGoogleSheetModal: () => void;
  sheetConfig: GoogleSheetConfig;
  secondsUntilNextSync?: number;
  onUpdateAutoSyncInterval: (seconds: number) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeCode,
  activeNavTitle,
  isDarkMode,
  onToggleDarkMode,
  onRefresh,
  isRefreshing,
  onOpenGoogleSheetModal,
  sheetConfig,
  secondsUntilNextSync,
  onUpdateAutoSyncInterval,
  onLogout
}) => {
  return (
    <header className="h-16 bg-white dark:bg-[#0c1427] border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Breadcrumbs & Store tag */}
      <div className="flex items-center gap-3">
        {/* Triple colored icon matching screenshot */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block"></span>
          <span className="w-1.5 h-3 rounded-full bg-blue-500 inline-block"></span>
          <span className="w-1.5 h-3.5 rounded-full bg-rose-500 inline-block"></span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <span className="text-slate-700 dark:text-slate-200 font-semibold">{storeCode}</span>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-white font-medium truncate max-w-[130px] sm:max-w-none">
            {activeNavTitle}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Auto-Sync Selector & Timer */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
          <Clock size={13} className={sheetConfig.autoSyncInterval > 0 ? 'text-emerald-500 animate-pulse' : 'text-slate-400'} />
          <span className="text-[11px] font-medium">Auto-Sync:</span>
          <select
            value={sheetConfig.autoSyncInterval}
            onChange={(e) => onUpdateAutoSyncInterval(Number(e.target.value))}
            className="bg-transparent font-semibold text-slate-900 dark:text-white outline-none cursor-pointer text-xs"
          >
            <option value={0} className="dark:bg-slate-800">Mati</option>
            <option value={15} className="dark:bg-slate-800">15 Detik</option>
            <option value={30} className="dark:bg-slate-800">30 Detik</option>
            <option value={60} className="dark:bg-slate-800">1 Menit</option>
            <option value={300} className="dark:bg-slate-800">5 Menit</option>
          </select>

          {sheetConfig.autoSyncInterval > 0 && secondsUntilNextSync !== undefined && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
              {secondsUntilNextSync}s
            </span>
          )}
        </div>

        {/* Google Sheet Sync Indicator */}
        <button
          onClick={onOpenGoogleSheetModal}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs"
          title={`Google Sheet: ${sheetConfig.sheetUrl || 'Belum diatur'}`}
        >
          <Sheet size={14} className="text-emerald-500" />
          <span className="hidden sm:inline font-medium">Google Sheet</span>
          {sheetConfig.syncStatus === 'syncing' ? (
            <RefreshCw size={12} className="animate-spin text-blue-500" />
          ) : sheetConfig.syncStatus === 'error' ? (
            <AlertCircle size={12} className="text-rose-500" />
          ) : (
            <CheckCircle2 size={12} className="text-emerald-500" />
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer shadow-xs"
          title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Perbarui button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          title={sheetConfig.lastSyncedAt ? `Terakhir diperbarui: ${sheetConfig.lastSyncedAt}` : 'Perbarui data sekarang'}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500 dark:text-slate-400'} />
          <span className="hidden xs:inline">Perbarui</span>
        </button>

        {/* Keluar button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors cursor-pointer shadow-xs"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
