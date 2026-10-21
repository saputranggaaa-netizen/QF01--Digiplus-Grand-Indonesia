import React from 'react';
import { StoreOverviewData } from '../types/dashboard';
import { formatRupiah } from '../services/googleSheets';
import { Target, Zap, Box, Smartphone, CheckCircle, ArrowUpRight } from 'lucide-react';

interface TargetFokusViewProps {
  data: StoreOverviewData;
  activeSubSection?: string;
}

export const TargetFokusView: React.FC<TargetFokusViewProps> = ({ data, activeSubSection }) => {
  const focusCampaigns = [
    {
      id: 'apple-care',
      title: 'Attach Rate AppleCare+ (Target 25%)',
      category: 'VAS Fokus',
      icon: <Zap size={18} className="text-purple-500" />,
      current: '14.2%',
      target: '25.0%',
      gap: '-10.8%',
      status: 'Need Push',
      kicker: 'Tambahan Insentif Rp 50.000 / unit AppleCare+ terjual'
    },
    {
      id: '3pp-audio',
      title: 'Premium Audio 3PP (Marshall & JBL)',
      category: 'Product Fokus 3PP',
      icon: <Box size={18} className="text-amber-500" />,
      current: 'Rp 44.250.000',
      target: 'Rp 95.000.000',
      gap: 'Achieve 46.5%',
      status: 'Need Push',
      kicker: 'Kicker 2x poin reward untuk penjualan Marshall Emberton / Acton'
    },
    {
      id: 'android-s24',
      title: 'Samsung Galaxy S24 Ultra & Fold/Flip 6',
      category: 'Android Fokus',
      icon: <Smartphone size={18} className="text-blue-500" />,
      current: '22 Unit',
      target: '50 Unit',
      gap: 'Minus 28 Unit',
      status: 'Need Push',
      kicker: 'Free Memory Upgrade + Cashback Trade-in s/d Rp 2 Jt'
    },
    {
      id: 'anker-power',
      title: 'Anker Power & GaN Chargers Attach',
      category: 'Product Fokus 3PP',
      icon: <Box size={18} className="text-emerald-500" />,
      current: '64 Unit',
      target: '80 Unit',
      gap: 'Achieve 80.0%',
      status: 'On Track',
      kicker: 'Bundling hemat iPhone 16 dengan Anker 65W GaN'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target size={20} className="text-purple-500" />
          Target Fokus & Program Khusus
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Program akselerasi margin tinggi (3PP, VAS, Android, Apple Attach Rate).
        </p>
      </div>

      {/* Focus Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {focusCampaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/40 flex items-center gap-1.5">
                  {camp.icon}
                  {camp.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    camp.status === 'On Track'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {camp.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                {camp.title}
              </h4>

              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Realisasi Saat Ini:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{camp.current}</div>
                </div>
                <div>
                  <span className="text-slate-400">Target Toko:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{camp.target}</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                Reward / Kicker Staff:
              </span>
              <span className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {camp.kicker}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
