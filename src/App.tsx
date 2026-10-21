import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { DailySalesView } from './components/DailySalesView';
import { StaffPerformanceView } from './components/StaffPerformanceView';
import { EstIncentiveView } from './components/EstIncentiveView';
import { SohView } from './components/SohView';
import { TargetFokusView } from './components/TargetFokusView';
import { AdministrationView } from './components/AdministrationView';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { StoreOverviewData, GoogleSheetConfig } from './types/dashboard';
import {
  loadSavedConfig,
  loadSavedDashboardData,
  fetchGoogleSheetData,
  saveDashboardData,
  saveSheetConfig
} from './services/googleSheets';
import { Sheet, RefreshCw, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<StoreOverviewData>(() => loadSavedDashboardData());
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(() => loadSavedConfig());
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-sync countdown timer in seconds
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState<number>(sheetConfig.autoSyncInterval || 30);
  const isRefreshingRef = useRef(isRefreshing);
  isRefreshingRef.current = isRefreshing;

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial load from Google Sheet / attached spreadsheet file
  useEffect(() => {
    handleRefresh(true);
  }, []);

  // Main refresh handler
  const handleRefresh = async (isAuto = false) => {
    if (isRefreshingRef.current) return;
    setIsRefreshing(true);
    try {
      if (sheetConfig.sheetUrl) {
        const result = await fetchGoogleSheetData(sheetConfig.sheetUrl, sheetConfig.sheetName);
        setData(result.data);
        saveDashboardData(result.data);
        const updatedConfig: GoogleSheetConfig = {
          ...sheetConfig,
          lastSyncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          lastSyncedTimestamp: Date.now(),
          syncStatus: 'success',
          rawTableData: result.rawTable
        };
        setSheetConfig(updatedConfig);
        saveSheetConfig(updatedConfig);
        if (!isAuto) {
          showToast('Data berhasil diperbarui dari Google Sheet!');
        }
      } else {
        await new Promise((r) => setTimeout(r, 500));
        if (!isAuto) {
          showToast('Data dashboard berhasil diperbarui!');
        }
      }
    } catch (err: any) {
      if (!isAuto) {
        showToast(err.message || 'Gagal menyinkronkan data.');
      }
    } finally {
      setIsRefreshing(false);
      setSecondsUntilNextSync(sheetConfig.autoSyncInterval || 30);
    }
  };

  // Auto-refresh interval effect
  useEffect(() => {
    if (!sheetConfig.autoSyncInterval || sheetConfig.autoSyncInterval <= 0) {
      return;
    }

    setSecondsUntilNextSync(sheetConfig.autoSyncInterval);

    const timer = setInterval(() => {
      setSecondsUntilNextSync((prev) => {
        if (prev <= 1) {
          handleRefresh(true);
          return sheetConfig.autoSyncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sheetConfig.autoSyncInterval, sheetConfig.sheetUrl, sheetConfig.sheetName]);

  // Handle changing auto-sync interval
  const handleUpdateAutoSyncInterval = (newSeconds: number) => {
    const updated: GoogleSheetConfig = {
      ...sheetConfig,
      autoSyncInterval: newSeconds,
      isAutoSync: newSeconds > 0
    };
    setSheetConfig(updated);
    saveSheetConfig(updated);
    setSecondsUntilNextSync(newSeconds);
    showToast(newSeconds > 0 ? `Auto-Sync aktif setiap ${newSeconds} detik` : 'Auto-Sync dimatikan');
  };

  // Handle simulation updates
  const handleSimulateDataUpdate = (modifiedData: StoreOverviewData) => {
    setData(modifiedData);
    saveDashboardData(modifiedData);
    const updatedCfg: GoogleSheetConfig = {
      ...sheetConfig,
      lastSyncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      lastSyncedTimestamp: Date.now()
    };
    setSheetConfig(updatedCfg);
    saveSheetConfig(updatedCfg);
    showToast('Data berhasil diperbarui secara langsung!');
  };

  // Nav title mapping for Header Breadcrumb
  const getNavTitle = (id: string): string => {
    switch (id) {
      case 'overview': return 'Overview';
      case 'daily-sales': return 'Daily Sales';
      case 'daily-summary': return 'Daily Summary';
      case 'staff-performance': return 'Staff Performance';
      case 'est-incentive': return 'Est. Incentive';
      case 'soh': return 'SOH (Stock on Hand)';
      case 'stokan': return 'Stokan & Replenishment';
      case 'price-list': return 'Price List';
      case 'lob-target-fokus': return 'LOB Target Fokus';
      case 'product-fokus-3pp': return 'Product Fokus 3PP';
      case 'vas-fokus': return 'VAS Fokus';
      case 'android-fokus': return 'Android Fokus';
      case 'mading': return 'Mading Digital';
      case 'bnpl-trade-in': return 'BNPL & Trade-In';
      case 'checklist-spv': return 'Checklist Store - SPV';
      case 'checklist-staff': return 'Checklist Store - Staff';
      case 'data-upload': return 'Data Upload & Google Sheet';
      default: return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18] text-slate-800 dark:text-slate-100 flex transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(id) => setActiveNav(id)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenGoogleSheetModal={() => setIsSheetModalOpen(true)}
        isSheetConnected={Boolean(sheetConfig.sheetUrl)}
        storeCode={data.storeCode}
        storeName={data.storeName}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <Header
          storeCode={data.storeCode}
          activeNavTitle={getNavTitle(activeNav)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onRefresh={() => handleRefresh(false)}
          isRefreshing={isRefreshing}
          onOpenGoogleSheetModal={() => setIsSheetModalOpen(true)}
          sheetConfig={sheetConfig}
          secondsUntilNextSync={secondsUntilNextSync}
          onUpdateAutoSyncInterval={handleUpdateAutoSyncInterval}
          onLogout={() => {
            if (confirm('Apakah Anda ingin keluar dari sesi dashboard?')) {
              showToast('Sesi ditutup.');
            }
          }}
        />

        {/* Google Sheet Live Status Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <Sheet size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Sumber Data: <strong>Google Sheet ({data.storeCode} - {data.storeName})</strong></span>
            {sheetConfig.lastSyncedAt && (
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                • Diperbarui: {sheetConfig.lastSyncedAt}
              </span>
            )}
            {sheetConfig.autoSyncInterval > 0 && (
              <span className="hidden md:inline font-mono text-[11px] bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                Pembaruan otomatis dalam {secondsUntilNextSync} detik
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRefresh(false)}
              disabled={isRefreshing}
              className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-md hover:bg-emerald-100/50"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Sinkronkan Sekarang</span>
            </button>
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-0.5 font-medium px-2 py-0.5"
            >
              <span>Ubah Sheet</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* View Contents */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeNav === 'overview' && (
            <OverviewView
              data={data}
              onNavigateToStaff={() => setActiveNav('staff-performance')}
              onNavigateToDaily={() => setActiveNav('daily-sales')}
            />
          )}

          {activeNav === 'daily-sales' && (
            <DailySalesView
              records={data.dailySales}
              monthName={data.period}
            />
          )}

          {activeNav === 'daily-summary' && (
            <DailySalesView
              records={data.dailySales}
              monthName={data.period}
            />
          )}

          {activeNav === 'staff-performance' && (
            <StaffPerformanceView
              staffList={data.staffList}
              period={data.period}
            />
          )}

          {activeNav === 'est-incentive' && (
            <EstIncentiveView
              data={data}
            />
          )}

          {(activeNav === 'soh' || activeNav === 'stokan' || activeNav === 'price-list') && (
            <SohView
              items={data.stockItems}
              storeCode={data.storeCode}
            />
          )}

          {(activeNav === 'lob-target-fokus' ||
            activeNav === 'product-fokus-3pp' ||
            activeNav === 'vas-fokus' ||
            activeNav === 'android-fokus') && (
            <TargetFokusView
              data={data}
              activeSubSection={activeNav}
            />
          )}

          {(activeNav === 'mading' ||
            activeNav === 'bnpl-trade-in' ||
            activeNav === 'checklist-spv' ||
            activeNav === 'checklist-staff' ||
            activeNav === 'data-upload') && (
            <AdministrationView
              sectionId={activeNav}
              data={data}
              sheetConfig={sheetConfig}
              onOpenGoogleSheetModal={() => setIsSheetModalOpen(true)}
              onRefresh={() => handleRefresh(false)}
              isRefreshing={isRefreshing}
              onUpdateAutoSyncInterval={handleUpdateAutoSyncInterval}
              onSimulateDataUpdate={handleSimulateDataUpdate}
            />
          )}
        </main>
      </div>

      {/* Google Sheet Sync Modal */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        config={sheetConfig}
        onConfigChange={(newCfg) => setSheetConfig(newCfg)}
        onDataLoaded={(newData) => setData(newData)}
      />
    </div>
  );
}
