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
  Database
} from 'lucide-react';
import { GoogleSheetConfig, StoreOverviewData } from '../types/dashboard';
import {
  fetchGoogleSheetData,
  saveSheetConfig,
  saveDashboardData,
  generateGoogleSheetTemplateCsv,
  DEFAULT_SHEET_CONFIG,
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
  const [sheetNameInput, setSheetNameInput] = useState(config.sheetName || 'Overview');
  const [autoSyncSecs, setAutoSyncSecs] = useState<number>(config.autoSyncInterval);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleSync = async (customUrl?: string) => {
    const targetUrl = customUrl !== undefined ? customUrl : sheetUrlInput;
    if (!targetUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan masukkan link Google Sheet terlebih dahulu.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await fetchGoogleSheetData(targetUrl, sheetNameInput);
      const updatedConfig: GoogleSheetConfig = {
        ...config,
        sheetUrl: targetUrl,
        sheetName: sheetNameInput,
        autoSyncInterval: autoSyncSecs,
        isAutoSync: autoSyncSecs > 0,
        lastSyncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lastSyncedTimestamp: Date.now(),
        syncStatus: 'success',
        errorMessage: undefined,
        rawTableData: result.rawTable
      };
      
      saveSheetConfig(updatedConfig);
      saveDashboardData(result.data);
      onConfigChange(updatedConfig);
      onDataLoaded(result.data);

      setStatusMessage({
        type: 'success',
        text: `Berhasil tersinkronisasi! Data toko ${result.data.storeCode} (${result.data.storeName}) berhasil dimuat dengan ${result.rawTable.totalRows} baris transaksi.`
      });
    } catch (err: any) {
      const updatedConfig: GoogleSheetConfig = {
        ...config,
        sheetUrl: targetUrl,
        sheetName: sheetNameInput,
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
    setSheetNameInput('Transactions');
    handleSync(LOCAL_QF01_ASSET_PATH);
  };

  // 1-Click Load QF10 Screenshot Data
  const handleLoadQF10 = () => {
    saveSheetConfig({
      ...config,
      sheetUrl: 'SAMPLE_QF10_KOKAS',
      sheetId: 'SAMPLE_QF10_KOKAS',
      sheetName: 'Overview',
      syncStatus: 'success'
    });
    saveDashboardData(INITIAL_DASHBOARD_DATA);
    onConfigChange({
      ...config,
      sheetUrl: 'SAMPLE_QF10_KOKAS',
      sheetId: 'SAMPLE_QF10_KOKAS',
      sheetName: 'Overview',
      syncStatus: 'success'
    });
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
            text: `File ${file.name} berhasil diunggah! Toko: ${data.storeCode} - ${rawRows.length} transaksi dihitung.`
          });
        } else {
          setStatusMessage({
            type: 'info',
            text: `File ${file.name} dibaca, memproses format umum.`
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
    link.setAttribute('download', 'Digiplus_Sales_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
                Sumber Data Google Sheet
                <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  {autoSyncSecs > 0 ? `Auto-Sync ${autoSyncSecs}s` : 'Manual Sync'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan Google Spreadsheet toko Anda atau gunakan data transaksi riil.
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
              Pilihan Cepat Sumber Data (Preset):
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
                    File Terunggah
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Data 158 transaksi riil lengkap (Apple, Android, Aksesoris, VAS, Staf).
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
                  Dataset Rp 7.54 Miliar sesuai tampilan tangkapan layar.
                </p>
              </button>
            </div>
          </div>

          {/* URL & Tab Input Form */}
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Atau Tempel Link / ID Google Spreadsheet Anda</span>
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mendukung link Google Sheets publik atau ID Spreadsheet.
              </p>
            </div>

            {/* Row of Tab Name and Auto-Sync Interval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-500" />
                  Nama Tab / Sheet:
                </label>
                <input
                  type="text"
                  value={sheetNameInput}
                  onChange={(e) => setSheetNameInput(e.target.value)}
                  placeholder="Transactions atau Overview"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" />
                  Otomatis Perbarui (Auto-Sync):
                </label>
                <select
                  value={autoSyncSecs}
                  onChange={(e) => setAutoSyncSecs(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>Mati (Hanya tombol refresh manual)</option>
                  <option value={15}>Setiap 15 Detik</option>
                  <option value={30}>Setiap 30 Detik (Disarankan)</option>
                  <option value={60}>Setiap 1 Menit</option>
                  <option value={300}>Setiap 5 Menit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSync()}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
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
                Template Format Kolom Google Sheet
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
              Format mencakup kolom transaksi penjualan untuk Apple, Android, Aksesoris, VAS, total pencapaian, dan metrik tim toko Digiplus.
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
                Langkah Cepat Membagikan Google Sheet:
              </span>
              <span className="text-blue-500 text-[11px]">
                {showInstructions ? 'Sembunyikan' : 'Tampilkan Panduan'}
              </span>
            </button>

            {showInstructions && (
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pl-4 list-decimal leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100/70 dark:border-blue-900/30">
                <li>
                  Buka Google Spreadsheet Anda di browser.
                </li>
                <li>
                  Klik tombol hijau <strong>Bagikan (Share)</strong> di kanan atas spreadsheet.
                </li>
                <li>
                  Di bagian <em>Akses Umum (General access)</em>, ganti dari &quot;Dibatasi (Restricted)&quot; menjadi{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">&quot;Siapa saja yang memiliki link&quot; (Anyone with the link)</strong> dengan peran <strong>Pelihat (Viewer)</strong>.
                </li>
                <li>
                  Klik <strong>Salin Link (Copy Link)</strong>, tempelkan di kotak input di atas, lalu klik tombol <strong>Sinkronkan Sekarang</strong>.
                </li>
              </ol>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-slate-400">
            Digiplus Store Intelligence • Real-time Sheet Sync
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
