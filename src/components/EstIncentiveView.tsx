import React from 'react';
import { StoreOverviewData } from '../types/dashboard';
import { formatRupiah } from '../services/googleSheets';
import { Wallet, Award, TrendingUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface EstIncentiveViewProps {
  data: StoreOverviewData;
}

export const EstIncentiveView: React.FC<EstIncentiveViewProps> = ({ data }) => {
  // Store incentive calculation
  const storePoints = data.totalPointsEarned;
  const storeTargetHit = data.totalAchievementPercent >= 100;
  
  // Point tiers in Digiplus:
  // >= 85 pts: Tier 1 (120% incentive pool)
  // >= 70 pts: Tier 2 (100% incentive pool)
  // >= 60 pts: Tier 3 (80% incentive pool) - Currently at 66.5 pts
  // < 60 pts: Tier 4 (50% incentive pool)
  const currentTier = storePoints >= 85 ? 'Tier 1 (Maksimal)' : storePoints >= 70 ? 'Tier 2 (Standar)' : storePoints >= 60 ? 'Tier 3 (Pro-rata 80%)' : 'Tier 4 (Minimal)';
  const poolBase = 45000000; // Rp 45 Juta store incentive pool
  const poolMultiplier = storePoints >= 85 ? 1.2 : storePoints >= 70 ? 1.0 : storePoints >= 60 ? 0.8 : 0.5;
  const estStorePool = Math.round(poolBase * poolMultiplier);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet size={20} className="text-emerald-500" />
            Estimasi Insentif Toko & Karyawan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perhitungan insentif berdasarkan target poin LOB dan performa individu.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
          <Award size={14} />
          <span>Skor Toko: {data.totalPointsEarned}/100 Poin</span>
        </div>
      </div>

      {/* Incentive Store Pool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Estimasi Pool Toko QF10</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatRupiah(estStorePool)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Status: {currentTier}</div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Syarat Kelulusan Insentif</span>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Total Sales Hit 110%</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Poin Toko saat ini: 66,5 / 100 pts</div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Potensi Naik Tier</span>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-2">
            Butuh +3.5 Poin lagi untuk Tier 2
          </div>
          <div className="text-xs text-slate-500 mt-1">Dorong penjualan Aksesoris & VAS</div>
        </div>
      </div>

      {/* Staff Incentive Breakdown Table */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Simulasi Estimasi Pembagian Insentif Staff (Oktober 2026)
        </h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <th className="pb-3 pl-1">Nama Staff</th>
              <th className="pb-3">Posisi</th>
              <th className="pb-3 text-center">Poin Individu</th>
              <th className="pb-3 text-right">Actual Sales</th>
              <th className="pb-3 text-center">Achieve %</th>
              <th className="pb-3 text-right pr-2">Estimasi Insentif (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {data.staffList.map((staff) => {
              // Calculate estimated payout based on sales & points
              const staffShare = (staff.points / 366.5);
              const estPayout = Math.round(estStorePool * staffShare);

              return (
                <tr key={staff.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-1 font-bold text-slate-900 dark:text-white">{staff.name}</td>
                  <td className="py-3 text-slate-500">{staff.role}</td>
                  <td className="py-3 text-center font-bold text-blue-600">{staff.points} pts</td>
                  <td className="py-3 text-right text-slate-800 dark:text-slate-200">{formatRupiah(staff.actualSales)}</td>
                  <td className="py-3 text-center">
                    <span className={`font-bold ${staff.achievementPercent >= 100 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>
                      {staff.achievementPercent}%
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(estPayout)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
