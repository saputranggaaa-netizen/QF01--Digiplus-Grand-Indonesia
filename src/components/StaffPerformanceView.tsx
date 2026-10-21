import React, { useState } from 'react';
import { StaffPerformance } from '../types/dashboard';
import { formatRupiah } from '../services/googleSheets';
import { Users, Award, TrendingUp, TrendingDown, Target, ShoppingBag, ShieldCheck } from 'lucide-react';

interface StaffPerformanceViewProps {
  staffList: StaffPerformance[];
  period: string;
}

export const StaffPerformanceView: React.FC<StaffPerformanceViewProps> = ({ staffList, period }) => {
  const [filter, setFilter] = useState<'All' | 'Productive' | 'Need Push'>('All');

  const filteredStaff = staffList.filter((s) => {
    if (filter === 'All') return true;
    return s.status === filter;
  });

  const totalSales = staffList.reduce((acc, s) => acc + s.actualSales, 0);
  const productiveCount = staffList.filter((s) => s.status === 'Productive').length;
  const needPushCount = staffList.filter((s) => s.status === 'Need Push').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            Staff Performance Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring performa individual sales specialist toko QF10 ({period}).
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'All'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({staffList.length})
          </button>
          <button
            onClick={() => setFilter('Productive')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'Productive'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Productive ({productiveCount})
          </button>
          <button
            onClick={() => setFilter('Need Push')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'Need Push'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Need Push ({needPushCount})
          </button>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff, idx) => {
          return (
            <div
              key={staff.id}
              className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 relative overflow-hidden"
            >
              {/* Top Accent for Productive */}
              {staff.status === 'Productive' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              )}

              <div>
                {/* Staff Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-2xs"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {staff.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{staff.role}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      staff.status === 'Productive'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>

                {/* Sales Figure */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Total Penjualan:</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {formatRupiah(staff.actualSales)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>Target: {formatRupiah(staff.targetSales)}</span>
                    <span className={`font-bold ${staff.achievementPercent >= 100 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>
                      {staff.achievementPercent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        staff.achievementPercent >= 100
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(staff.achievementPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown (UPT, ATV, Trx) */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">UPT</span>
                    <span className="font-bold text-slate-900 dark:text-white">{staff.upt}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">ATV</span>
                    <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate block">
                      {formatRupiah(staff.atv)}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Trx</span>
                    <span className="font-bold text-slate-900 dark:text-white">{staff.transactions}</span>
                  </div>
                </div>

                {/* LOB Category Sales breakdown mini pills */}
                <div className="mt-3 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Apple:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(staff.appleSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Android:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(staff.androidSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Aksesoris:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(staff.accSales)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>VAS / Warranty:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(staff.vasSales)}</span>
                  </div>
                </div>
              </div>

              {/* Reward points footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Award size={14} className="text-amber-500" />
                  Poin Reward
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {staff.points} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
