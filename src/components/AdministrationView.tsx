import React, { useState } from 'react';
import { StoreOverviewData, GoogleSheetConfig } from '../types/dashboard';
import { formatRupiah } from '../services/googleSheets';
import {
  Newspaper,
  CreditCard,
  CheckSquare,
  UploadCloud,
  Sheet,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  FileSpreadsheet,
  Clock,
  Play,
  Table,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface AdministrationViewProps {
  sectionId: string;
  data: StoreOverviewData;
  sheetConfig: GoogleSheetConfig;
  onOpenGoogleSheetModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onUpdateAutoSyncInterval: (secs: number) => void;
  onSimulateDataUpdate: (modifiedData: StoreOverviewData) => void;
  onSelectTabToInspect?: (tabId: string) => void;
}

export const AdministrationView: React.FC<AdministrationViewProps> = ({
  sectionId,
  data,
  sheetConfig,
  onOpenGoogleSheetModal,
  onRefresh,
  isRefreshing,
  onUpdateAutoSyncInterval,
  onSimulateDataUpdate,
  onSelectTabToInspect
}) => {
  // Checklist State
  const [checklistSpv, setChecklistSpv] = useState([
    { id: 1, text: 'Briefing pagi & pembagian target harian staff', done: true },
    { id: 2, text: 'Pengecekan kebersihan display Apple & Android meja depan', done: true },
    { id: 3, text: 'Verifikasi demo device aktif dan login demo mode', done: true },
    { id: 4, text: 'Pengecekan fisik brankas & kas register pembukaan', done: true },
    { id: 5, text: 'Follow-up stock replenishment ke logistik pusat', done: false },
    { id: 6, text: 'Closing kasir & serah terima fisik setoran bank', done: false }
  ]);

  const [checklistStaff, setChecklistStaff] = useState([
    { id: 1, text: 'Grooming & seragam rapi sesuai SOP Digiplus', done: true },
    { id: 2, text: 'Lap bersih display produk, kabel charger, dan aksesoris', done: true },
    { id: 3, text: 'Pastikan label harga (Price Tag) akurat dan rapi', done: true },
    { id: 4, text: 'Cek stok aksesoris hanger (Spigen, Marshall, Anker)', done: true },
    { id: 5, text: 'Tawarkan paket perlindungan VAS AppleCare+ di setiap transaksi', done: true },
    { id: 6, text: 'Input log kartu garansi dan nota elektronik konsumen', done: false }
  ]);

  const toggleSpv = (id: number) => {
    setChecklistSpv((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const toggleStaff = (id: number) => {
    setChecklistStaff((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  // Mading / Announcements
  if (sectionId === 'mading') {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Newspaper size={20} className="text-blue-500" />
            Mading Digital Toko (Papan Informasi & Memo)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengumuman operasional, SOP pelayanan, dan memo promo Digiplus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                Penting • Operasional
              </span>
              <span className="text-xs text-slate-400">20 Okt 2026</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Ketentuan SOP Trade-In iPhone 16 Series
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Seluruh staff wajib melakukan diagnostic test lengkap via aplikasi Trade-In Digiplus sebelum menerbitkan voucher tukar tambah. Pastikan unit bebas iCloud lock dan battery health tercatat.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Promo Bank & Cicilan
              </span>
              <span className="text-xs text-slate-400">18 Okt 2026</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Cashback Bank Mandiri & BCA s/d Rp 1.5 Jt
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cicilan 0% hingga 24 bulan berlaku untuk semua kartu kredit Mandiri & BCA dengan minimal pembelanjaan Rp 15.000.000. Kuota promo 15 transaksi per hari di QF10.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // BNPL & Trade-In
  if (sectionId === 'bnpl-trade-in') {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard size={20} className="text-indigo-500" />
            Monitoring Transaksi BNPL & Trade-In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Realisasi cicilan tanpa kartu (Kredivo, Indodana, PayLater) & tukar tambah device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Total Volume BNPL</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Rp 1.140.500.000</div>
            <div className="text-xs text-emerald-600 mt-1">78 Transaksi Disetujui</div>
          </div>
          <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Unit Trade-In Masuk</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">34 Unit</div>
            <div className="text-xs text-blue-600 mt-1">Valuasi Rp 280.400.000</div>
          </div>
          <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Approval Rate BNPL</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">89.5%</div>
            <div className="text-xs text-slate-400 mt-1">Rata-rata approval 5 menit</div>
          </div>
        </div>
      </div>
    );
  }

  // Checklists (SPV / Staff)
  if (sectionId === 'checklist-spv' || sectionId === 'checklist-staff') {
    const isSpv = sectionId === 'checklist-spv';
    const list = isSpv ? checklistSpv : checklistStaff;
    const toggleFunc = isSpv ? toggleSpv : toggleStaff;

    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare size={20} className="text-amber-500" />
            Checklist Kesiapan Toko - {isSpv ? 'Supervisor (SPV)' : 'Staff Sales'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Standard operating procedure checklist harian untuk menjaga kualitas layanan toko.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs max-w-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">Item Pemeriksaan</span>
            <span className="text-xs text-emerald-600 font-bold">
              {list.filter((x) => x.done).length} / {list.length} Selesai
            </span>
          </div>

          <div className="space-y-3">
            {list.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleFunc(item.id)}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <div
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    item.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {item.done && <Check size={14} />}
                </div>
                <span className={`text-xs font-medium ${item.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quick Simulation handler to demonstrate live updates
  const handleSimulateSalesBoost = () => {
    const updated = JSON.parse(JSON.stringify(data)) as StoreOverviewData;
    // Add Rp 50.000.000 to Apple and Rp 15.000.000 to Accessories
    updated.lobs.apple.actual += 50000000;
    updated.lobs.accessories.actual += 15000000;
    updated.totalSales += 65000000;
    updated.totalAchievementPercent = Math.round((updated.totalSales / updated.totalTarget) * 100);
    updated.totalVariance = updated.totalSales - updated.totalTarget;
    updated.teamSummary.totalTransactions += 3;
    onSimulateDataUpdate(updated);
  };

  // Data Upload & Google Sheet Hub
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UploadCloud size={20} className="text-blue-500" />
          Pusat Integrasi & Sinkronisasi Google Sheets
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kelola sumber data Google Spreadsheet, atur interval pembaruan otomatis (Auto-Sync), dan tinjau data tabel mentah.
        </p>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Sheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  Google Spreadsheet Terhubung
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Ready
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                {sheetConfig.sheetUrl || 'Belum ada sheet terhubung'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                <span>Tab: <strong>{sheetConfig.sheetName || 'Overview'}</strong></span>
                <span>•</span>
                <span>Terakhir sinkron: <strong>{sheetConfig.lastSyncedAt || 'Belum pernah'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 cursor-pointer transition-colors shadow-xs disabled:opacity-60"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
              <span>{isRefreshing ? 'Menyinkronkan...' : 'Perbarui Sekarang'}</span>
            </button>

            <button
              onClick={onOpenGoogleSheetModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Pengaturan Sheet
            </button>
          </div>
        </div>

        {/* Auto-Sync Configuration Controls */}
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-emerald-500" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Interval Pembaruan Otomatis (Auto-Sync Interval)
              </div>
              <div className="text-[11px] text-slate-500">
                Dashboard akan otomatis menarik perubahan dari Google Sheets di latar belakang.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0, 15, 30, 60].map((secs) => (
              <button
                key={secs}
                onClick={() => onUpdateAutoSyncInterval(secs)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  sheetConfig.autoSyncInterval === secs
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {secs === 0 ? 'Mati' : `${secs} Detik`}
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Action (To prove real-time updates) */}
        <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Play size={14} className="text-blue-600" />
              Simulasi Pembaruan Data Secara Langsung
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Uji coba responsivitas dashboard dengan menambahkan simulasi transaksi baru (+Rp 65jt Apple & Aksesoris).
            </div>
          </div>
          <button
            onClick={handleSimulateSalesBoost}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs shrink-0"
          >
            + Tambah Transaksi Demo
          </button>
        </div>

        {/* Multi-Tab Connection Overview Card */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={16} className="text-blue-500" />
              Tab / Sheet yang Terhubung ({sheetConfig.tabs?.filter((t) => t.enabled).length || 5} Tab Aktif)
            </h3>
            <button
              onClick={onOpenGoogleSheetModal}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Atur Nama & Pemetaan Tab</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {(sheetConfig.tabs || []).map((tab) => (
              <div
                key={tab.id}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                  tab.enabled && tab.status === 'synced'
                    ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">
                    {tab.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                    {tab.id.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {tab.rowCount ? `${tab.rowCount} baris` : 'Aktif'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Raw Table Inspector from Connected Google Sheets */}
        <div className="space-y-3 pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Table size={16} className="text-emerald-500" />
                Inspektor Data Multi-Sheet
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih tab di bawah untuk melihat isi baris dan kolom yang disinkronkan dari Google Spreadsheet.
              </p>
            </div>

            {/* Tab Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {(sheetConfig.tabs || []).map((tab) => {
                const isActive = (sheetConfig.activeTabId || 'transactions') === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelectTabToInspect?.(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {sheetConfig.rawTableData && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    {sheetConfig.rawTableData.headers.map((hdr, i) => (
                      <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                        {hdr}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {sheetConfig.rawTableData.rows.slice(0, 15).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                          {typeof cell === 'number' && cell > 100000 ? formatRupiah(cell) : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
