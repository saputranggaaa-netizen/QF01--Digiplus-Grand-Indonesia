import React, { useState } from 'react';
import {
  X,
  Sheet,
  ExternalLink,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Sparkles,
  FileSpreadsheet,
  Clock,
  Layers,
  Upload,
  Database,
  Plus,
  Trash2,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { GoogleSheetConfig, SheetTabConfig, StoreOverviewData } from '../types/dashboard';
import {
  fetchGoogleSheetData,
  saveSheetConfig,
  saveDashboardData,
  generateGoogleSheetTemplateCsv,
  DEFAULT_SHEET_CONFIG,
  DEFAULT_TABS,
  LOCAL_QF01_ASSET_PATH
} from '../services/googleSheets';
import { INITIAL_DASHBOARD_DATA } from '../data/initialData';
import { parseQF01TransactionCsv } from '../services/qf01Parser';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetConfig;
  onConfigChange: (config: GoogleSheetConfig) => void;
  onDataLoaded: (data: StoreOverviewData) => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  onDataLoaded
}) => {
  const [sheetUrlInput, setSheetUrlInput] = useState(config.sheetUrl || '');
  const [tabs, setTabs] = useState<SheetTabConfig[]>(config.tabs && config.tabs.length > 0 ? config.tabs : DEFAULT_TABS);
  const [autoSyncSecs, setAutoSyncSecs] = useState<number>(config.autoSyncInterval);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTabEditor, setShowTabEditor] = useState(true);

  if (!isOpen) return null;

  // Toggle tab enabled
  const handleToggleTab = (id: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  // Change tab sheet name
  const handleTabNameChange = (id: string, newName: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
  };

  // Add custom tab
  const handleAddCustomTab = () => {
    const newId = `custom_${Date.now()}`;
    const newTab: SheetTabConfig = {
      id: newId,
      name: `Sheet${tabs.length + 1}`,
      description: 'Tab Kustom dari Google Spreadsheet',
      enabled: true,
      status: 'pending'
    };
    setTabs((prev) => [...prev, newTab]);
  };

  // Remove tab
  const handleRemoveTab = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSyncAll = async (customUrl?: string) => {
    const targetUrl = customUrl !== undefined ? customUrl : sheetUrlInput;
    if (!targetUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan masukkan link Google Sheet terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await fetchGoogleSheetData(targetUrl, undefined, tabs);
      const updatedTabsList = result.updatedTabs || tabs;

      const updatedConfig: GoogleSheetConfig = {
        ...config,
        sheetUrl: targetUrl,
        tabs: updatedTabsList,
        autoSyncInterval: autoSyncSecs,
        isAutoSync: autoSyncSecs > 0,
        lastSyncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lastSyncedTimestamp: Date.now(),
        syncStatus: 'success',
        errorMessage: undefined,
        rawTableData: result.rawTable,
        tabTables: result.tabTables
      };
      
      saveSheetConfig(updatedConfig);
      saveDashboardData(result.data);
      onConfigChange(updatedConfig);
      onDataLoaded(result.data);

      const syncedCount = updatedTabsList.filter((t) => t.status === 'synced').length;
      setStatusMessage({
        type: 'success',
        text: `Berhasil tersinkronisasi! ${syncedCount} sheet/tab berhasil terhubung untuk toko ${result.data.storeCode} (${result.data.storeName}).`
      });
    } catch (err: any) {
      const updatedConfig: GoogleSheetConfig = {
        ...config,
        sheetUrl: targetUrl,
        tabs,
        autoSyncInterval: autoSyncSecs,
        syncStatus: 'error',
        errorMessage: err.message
      };
      saveSheetConfig(updatedConfig);
      onConfigChange(updatedConfig);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menyinkronkan dengan Google Sheet.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Load QF01 Uploaded Sheet
  const handleLoadQF01 = () => {
    setSheetUrlInput(LOCAL_QF01_ASSET_PATH);
    handleSyncAll(LOCAL_QF01_ASSET_PATH);
  };

  // 1-Click Load QF10 Screenshot Data
  const handleLoadQF10 = () => {
    const updatedCfg: GoogleSheetConfig = {
      ...config,
      sheetUrl: 'SAMPLE_QF10_KOKAS',
      sheetId: 'SAMPLE_QF10_KOKAS',
      sheetName: 'Overview',
      tabs: DEFAULT_TABS,
      syncStatus: 'success'
    };
    saveSheetConfig(updatedCfg);
    saveDashboardData(INITIAL_DASHBOARD_DATA);
    onConfigChange(updatedCfg);
    onDataLoaded(INITIAL_DASHBOARD_DATA);
    setSheetUrlInput('SAMPLE_QF10_KOKAS');
    setStatusMessage({
      type: 'info',
      text: 'Data beralih ke toko QF10 (Digiplus Kota Kasablanka - Sesuai Foto Screenshot).'
    });
  };

  // File upload from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (text.includes('Sales ID') || text.includes('SAP Article') || text.includes('Sales Name')) {
          const { data, rawRows } = parseQF01TransactionCsv(text);
          saveDashboardData(data);
          onDataLoaded(data);
          setStatusMessage({
            type: 'success',
            text: `File ${file.name} berhasil diunggah! Toko: ${data.storeCode} - ${rawRows.length} transaksi riil dihitung.`
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `File ${file.name} dibaca.`
          });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Gagal membaca file.' });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyTemplate = () => {
    const csvContent = generateGoogleSheetTemplateCsv();
    navigator.clipboard.writeText(csvContent);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleDownloadCsv = () => {
    const csvContent = generateGoogleSheetTemplateCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Digiplus_MultiSheet_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Sheet size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Integrasi Banyak Sheet / Multi-Tab
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  {tabs.filter((t) => t.enabled).length} Tab Aktif
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan dan petakan beberapa tab/sheet sekaligus dari satu Google Spreadsheet toko Anda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alert if any */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {/* Quick Preset Selector Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Pilihan Cepat Sumber Spreadsheet:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleLoadQF01}
                className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/70 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Database size={14} className="text-emerald-600" />
                    QF01 - YOUR GOALS
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                    Banyak Tab
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Otomatis hubungkan tab Transaksi, Overview, Staff, Daily Sales & SOH.
                </p>
              </button>

              <button
                type="button"
                onClick={handleLoadQF10}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sheet size={14} className="text-blue-500" />
                    QF10 - Kota Kasablanka
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Sesuai Foto
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Dataset ringkasan Rp 7.54 Miliar sesuai tampilan tangkapan layar.
                </p>
              </button>
            </div>
          </div>

          {/* URL & Main Settings */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Link Google Spreadsheet (Workbook Utama)</span>
                {config.lastSyncedAt && (
                  <span className="text-[11px] font-normal text-slate-400">
                    Terakhir diperbarui: {config.lastSyncedAt}
                  </span>
                )}
              </label>

              <input
                type="text"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-xs"
              />
            </div>

            {/* Auto-Sync Interval Setting */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Pembaruan Otomatis (Auto-Sync Semua Sheet):
                </span>
              </div>
              <select
                value={autoSyncSecs}
                onChange={(e) => setAutoSyncSecs(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={0}>Mati (Hanya refresh manual)</option>
                <option value={15}>Setiap 15 Detik</option>
                <option value={30}>Setiap 30 Detik (Disarankan)</option>
                <option value={60}>Setiap 1 Menit</option>
                <option value={300}>Setiap 5 Menit</option>
              </select>
            </div>
          </div>

          {/* Multi-Tab Connection Manager Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers size={16} className="text-blue-500" />
                  Daftar Tab / Sheet yang Dihubungkan ({tabs.length} Tab)
                </span>
                <p className="text-[11px] text-slate-500">
                  Sesuaikan nama tab di bawah dengan nama sheet asli di Google Spreadsheet Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCustomTab}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <Plus size={13} />
                <span>Tambah Tab Baru</span>
              </button>
            </div>

            {/* List of Configured Tabs */}
            <div className="space-y-2">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    tab.enabled
                      ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                      : 'border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={tab.enabled}
                      onChange={() => handleToggleTab(tab.id)}
                      className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {tab.id.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                            tab.status === 'synced'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : tab.status === 'error'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {tab.status === 'synced' ? 'Tersinkron' : tab.status === 'error' ? 'Gagal' : 'Siap'}
                          {tab.rowCount ? ` (${tab.rowCount} baris)` : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tab.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-7 sm:pl-0">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">Nama Sheet:</span>
                    <input
                      type="text"
                      value={tab.name}
                      onChange={(e) => handleTabNameChange(tab.id, e.target.value)}
                      placeholder="Nama tab di Google Sheet"
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[160px]"
                    />

                    {tab.id.startsWith('custom_') && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTab(tab.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Hapus tab"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleSyncAll()}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Menyinkronkan Semua Tab...' : 'Sinkronkan Semua Sheet / Tab'}</span>
            </button>

            {/* Upload File button */}
            <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer">
              <Upload size={14} />
              <span>Unggah File CSV/Sheet</span>
              <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Template & Quick Setup Section */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet size={16} className="text-emerald-500" />
                Template Format Banyak Sheet (Multi-Sheet)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                >
                  {copiedTemplate ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedTemplate ? 'Tersalin!' : 'Salin Format'}</span>
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors shadow-2xs"
                >
                  <Download size={13} />
                  <span>Unduh .CSV</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Format mencakup contoh kolom transaksi penjualan Apple, Android, Aksesoris, VAS, total pencapaian, dan metrik tim toko Digiplus.
            </p>
          </div>

          {/* Step-by-step Guide */}
          <div className="space-y-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle size={15} className="text-blue-500" />
                Cara Menghubungkan Banyak Tab di Google Sheets:
              </span>
              <span className="text-blue-500 text-[11px]">
                {showInstructions ? 'Sembunyikan' : 'Tampilkan Panduan'}
              </span>
            </button>

            {showInstructions && (
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pl-4 list-decimal leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100/70 dark:border-blue-900/30">
                <li>
                  Buka Google Spreadsheet Anda yang memiliki banyak tab di bagian bawah (misal: <em>Overview</em>, <em>Transactions</em>, <em>Staff</em>).
                </li>
                <li>
                  Klik tombol <strong>Bagikan (Share)</strong> di kanan atas spreadsheet, setel Akses Umum ke <strong>&quot;Siapa saja yang memiliki link&quot;</strong> sebagai <strong>Pelihat (Viewer)</strong>.
                </li>
                <li>
                  Pastikan nama-nama sheet di daftar tab di atas sama persis dengan nama tab di spreadsheet Anda.
                </li>
                <li>
                  Klik <strong>Sinkronkan Semua Sheet / Tab</strong>. Dashboard akan membaca seluruh tab dan menggabungkan datanya secara terpadu!
                </li>
              </ol>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-slate-400">
            Digiplus Multi-Tab Sheet Synchronization • Live Connected
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
