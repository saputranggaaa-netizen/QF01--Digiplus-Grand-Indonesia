import React from 'react';
import { DailySalesRecord } from '../types/dashboard';
import { formatRupiah } from '../services/googleSheets';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Percent } from 'lucide-react';

interface DailySalesViewProps {
  records: DailySalesRecord[];
  monthName: string;
}

export const DailySalesView: React.FC<DailySalesViewProps> = ({ records, monthName }) => {
  const totalActual = records.reduce((acc, r) => acc + r.actual, 0);
  const totalTarget = records.reduce((acc, r) => acc + r.target, 0);
  const totalTrx = records.reduce((acc, r) => acc + r.transactions, 0);
  const avgUpt = +(records.reduce((acc, r) => acc + r.upt, 0) / records.length).toFixed(2);
  const maxSale = Math.max(...records.map((r) => r.actual));

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Daily Sales Monitoring
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Penjualan harian toko Digiplus (QF10) periode {monthName}.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          Total Terdata: {records.length} Hari (Data s/d 21/10)
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Sales MTD</span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatRupiah(totalActual)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Target: {formatRupiah(totalTarget)}</div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Rata-rata / Hari</span>
          <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatRupiah(Math.round(totalActual / records.length))}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">21 Hari Berjalan</div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Transaksi</span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            {totalTrx}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">~21 trx / hari</div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Rata-rata UPT</span>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-1">
            {avgUpt}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target UPT: 1.40</div>
        </div>
      </div>

      {/* Visual Bar Chart of Daily Actual vs Target */}
      <div className="bg-white dark:bg-[#0c1427] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Grafik Penjualan Harian vs Target
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span>
              Actual Sales
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-0.5 bg-amber-500 inline-block"></span>
              Target
            </span>
          </div>
        </div>

        {/* Responsive CSS Bar Chart */}
        <div className="h-64 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
          {records.map((r, i) => {
            const heightPercent = Math.round((r.actual / maxSale) * 100);
            const isWeekend = i === 2 || i === 3 || i === 9 || i === 10 || i === 16 || i === 17;
            const isHit = r.actual >= r.target;

            return (
              <div key={r.date} className="flex-1 min-w-[28px] flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip on hover */}
                <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-lg pointer-events-none">
                  <span className="font-bold">{r.dayLabel}: {formatRupiah(r.actual)}</span>
                  <span className="text-slate-400">Target: {formatRupiah(r.target)}</span>
                </div>

                {/* The Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isHit
                      ? 'bg-blue-600 group-hover:bg-blue-500'
                      : 'bg-slate-400 group-hover:bg-slate-500 dark:bg-slate-600'
                  }`}
                  style={{ height: `${Math.max(heightPercent, 8)}%` }}
                />

                {/* Day label */}
                <span className={`text-[10px] mt-2 block font-medium ${isWeekend ? 'text-blue-500 font-bold' : 'text-slate-400'}`}>
                  {r.dayLabel.split('/')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Tabel Rincian Harian
        </h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <th className="pb-3 pl-1">Tanggal</th>
              <th className="pb-3 text-right">Actual Sales</th>
              <th className="pb-3 text-right">Target</th>
              <th className="pb-3 text-center">Achieve %</th>
              <th className="pb-3 text-center">Trx</th>
              <th className="pb-3 text-center">UPT</th>
              <th className="pb-3 text-right pr-2">ATV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {records.map((r) => {
              const ach = Math.round((r.actual / r.target) * 100);
              return (
                <tr key={r.date} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pl-1 font-bold text-slate-900 dark:text-white">{r.dayLabel}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                    {formatRupiah(r.actual)}
                  </td>
                  <td className="py-2.5 text-right text-slate-500">{formatRupiah(r.target)}</td>
                  <td className="py-2.5 text-center">
                    <span className={`font-bold ${ach >= 100 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {ach}%
                    </span>
                  </td>
                  <td className="py-2.5 text-center text-slate-700 dark:text-slate-300">{r.transactions}</td>
                  <td className="py-2.5 text-center text-slate-700 dark:text-slate-300">{r.upt}</td>
                  <td className="py-2.5 text-right pr-2 text-slate-700 dark:text-slate-300">
                    {formatRupiah(r.atv)}
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
