import React from 'react';
import { X, TrendingUp, TrendingDown, Target, ShoppingBag, Award, Sparkles } from 'lucide-react';
import { LOBMetric } from '../types/dashboard';
import { formatRupiah } from '../services/googleSheets';

interface LOBDetailModalProps {
  lob: LOBMetric | null;
  onClose: () => void;
  period: string;
}

export const LOBDetailModal: React.FC<LOBDetailModalProps> = ({ lob, onClose, period }) => {
  if (!lob) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/40">
                Rincian Kategori
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{period}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {lob.name} Performance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Actual Sales</span>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                {formatRupiah(lob.actual)}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Target</span>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                {formatRupiah(lob.target)}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Achieve</span>
              <p className={`text-sm sm:text-base font-bold mt-1 flex items-center gap-1 ${
                lob.achievementPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {lob.achievementPercent >= 100 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {lob.achievementPercent}%
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Point Reward</span>
              <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <Award size={16} />
                {lob.pointsEarned}/{lob.maxPoints} pts
              </p>
            </div>
          </div>

          {/* Sub-categories Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ShoppingBag size={16} className="text-blue-500" />
              Kontribusi Sub-Produk & Model
            </h4>

            {lob.subCategories && lob.subCategories.length > 0 ? (
              <div className="space-y-3">
                {lob.subCategories.map((sub, idx) => {
                  const percent = Math.round((sub.actual / sub.target) * 100);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-slate-900 dark:text-white">{sub.name}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(sub.actual)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>Target: {formatRupiah(sub.target)} • Terjual: {sub.quantity} unit</span>
                        <span className={percent >= 100 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                          {percent}% ({sub.growthPercent > 0 ? `+${sub.growthPercent}%` : `${sub.growthPercent}%`})
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent >= 100
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-rose-500 to-amber-500'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Rincian sub-kategori dapat dikonfigurasi melalui Google Sheet.</p>
            )}
          </div>

          {/* Variance & Run-rate note */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles size={14} />
              Analisis Estimasi Akhir Bulan (Run-rate)
            </div>
            <p>
              Dengan sisa waktu bulan berjalan, proyeksi akhir bulan untuk {lob.name} diproyeksikan mencapai{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{formatRupiah(lob.estAmount)}</strong> ({lob.estPercent}% dari target bulanan).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
