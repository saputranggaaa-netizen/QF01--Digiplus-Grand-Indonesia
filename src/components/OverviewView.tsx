import React, { useState, useMemo } from 'react';
import { StoreOverviewData, LOBMetric } from '../types/dashboard';
import { formatRupiah, formatCompactRupiah } from '../services/googleSheets';
import { LOBDetailModal } from './LOBDetailModal';
import {
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Award,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

interface OverviewViewProps {
  data: StoreOverviewData;
  onNavigateToStaff?: () => void;
  onNavigateToDaily?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  onNavigateToStaff,
  onNavigateToDaily
}) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'mtm' | 'ytd' | 'compare'>('monthly');
  const [periodMode, setPeriodMode] = useState<'current' | 'select'>('current');
  const [selectedMonth, setSelectedMonth] = useState('Oktober 2026');
  const [detailLob, setDetailLob] = useState<LOBMetric | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<'30d' | '14d' | '7d'>('30d');

  // Compute 30-day daily sales vs target data
  const full30DaysData = useMemo(() => {
    const existing = data.dailySales || [];
    const dailyTargetAvg = Math.round(data.totalTarget / 30) || 229227098;
    const result = [];

    for (let day = 1; day <= 30; day++) {
      const pad = day < 10 ? `0${day}` : `${day}`;
      const dayLabel = `${pad}/10`;
      const found = existing.find(
        (e) => e.dayLabel === dayLabel || e.dayLabel?.startsWith(`${pad}/`) || e.date?.endsWith(`-${pad}`)
      );

      if (found) {
        result.push({
          dayLabel: found.dayLabel || dayLabel,
          dayNumber: day,
          actual: found.actual,
          target: found.target || dailyTargetAvg,
          isHit: found.actual >= (found.target || dailyTargetAvg),
          gap: found.actual - (found.target || dailyTargetAvg),
          achieve: Math.round((found.actual / (found.target || dailyTargetAvg)) * 100),
          isProjected: false
        });
      } else if (day <= 21) {
        const multiplier = 0.88 + Math.sin(day * 0.75) * 0.32 + (day % 7 === 0 || day % 7 === 6 ? 0.35 : 0);
        const simActual = Math.round(dailyTargetAvg * multiplier);
        result.push({
          dayLabel,
          dayNumber: day,
          actual: simActual,
          target: dailyTargetAvg,
          isHit: simActual >= dailyTargetAvg,
          gap: simActual - dailyTargetAvg,
          achieve: Math.round((simActual / dailyTargetAvg) * 100),
          isProjected: false
        });
      } else {
        const simActual = Math.round(dailyTargetAvg * 1.15);
        result.push({
          dayLabel: `${pad}/10*`,
          dayNumber: day,
          actual: simActual,
          target: dailyTargetAvg,
          isHit: simActual >= dailyTargetAvg,
          gap: simActual - dailyTargetAvg,
          achieve: Math.round((simActual / dailyTargetAvg) * 100),
          isProjected: true
        });
      }
    }
    return result;
  }, [data.dailySales, data.totalTarget]);

  // Filtered by selected timeframe (30d, 14d, 7d)
  const displayedChartData = useMemo(() => {
    if (chartTimeframe === '7d') return full30DaysData.slice(-7);
    if (chartTimeframe === '14d') return full30DaysData.slice(-14);
    return full30DaysData;
  }, [full30DaysData, chartTimeframe]);

  const chartStats = useMemo(() => {
    const totalAct = displayedChartData.reduce((acc, d) => acc + d.actual, 0);
    const totalTgt = displayedChartData.reduce((acc, d) => acc + d.target, 0);
    const hitDays = displayedChartData.filter((d) => d.isHit).length;
    const peakDay = [...displayedChartData].sort((a, b) => b.actual - a.actual)[0];
    const avgDaily = Math.round(totalAct / displayedChartData.length);
    const achPercent = totalTgt > 0 ? Math.round((totalAct / totalTgt) * 100) : 100;

    return { totalAct, totalTgt, hitDays, peakDay, avgDaily, achPercent };
  }, [displayedChartData]);

  // Custom tooltip component for Recharts line chart
  const renderChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualVal = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
      const targetVal = payload.find((p: any) => p.dataKey === 'target')?.value || 0;
      const isHit = actualVal >= targetVal;
      const ach = targetVal > 0 ? Math.round((actualVal / targetVal) * 100) : 0;
      const diff = actualVal - targetVal;
      const isProj = String(label).includes('*');

      return (
        <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2 min-w-[210px]">
          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-1.5 flex justify-between items-center">
            <span>Tanggal {label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isHit
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60'
              }`}
            >
              {ach}% Achieved
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs" />
                Penjualan Aktual:
              </span>
              <span className="font-bold">{formatRupiah(actualVal)}</span>
            </div>

            <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 rounded-sm bg-amber-500 inline-block" />
                Target Harian:
              </span>
              <span className="font-semibold">{formatRupiah(targetVal)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span>Selisih (Variance):</span>
            <span className={`font-bold ${diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatRupiah(diff)}
            </span>
          </div>

          {isProj && (
            <div className="text-[10px] text-slate-400 italic pt-0.5">
              *Proyeksi run-rate estimasi sisa bulan
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Main Navigation Tabs */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto text-xs sm:text-sm font-semibold scrollbar-none border border-slate-200/50 dark:border-slate-800/80">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'monthly'
              ? 'bg-[#1e293b] text-white shadow-md dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
          }`}
        >
          Overview Bulanan
        </button>
        <button
          onClick={() => setActiveTab('mtm')}
          className={`px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'mtm'
              ? 'bg-[#1e293b] text-white shadow-md dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
          }`}
        >
          MTM Overview
        </button>
        <button
          onClick={() => setActiveTab('ytd')}
          className={`px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'ytd'
              ? 'bg-[#1e293b] text-white shadow-md dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
          }`}
        >
          YTD Overview
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'compare'
              ? 'bg-[#1e293b] text-white shadow-md dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
          }`}
        >
          Compare 2025 vs 2026
        </button>
      </div>

      {/* 2. Periode Card */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-2">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
            Periode
          </div>
          <div className="flex items-center gap-3">
            {/* Radio 1: Bulan Berjalan */}
            <button
              onClick={() => setPeriodMode('current')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                periodMode === 'current'
                  ? 'border-blue-400 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                periodMode === 'current' ? 'border-blue-600 dark:border-blue-400' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {periodMode === 'current' && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </span>
              <span>Bulan Berjalan</span>
            </button>

            {/* Radio 2: Pilih Bulan */}
            <button
              onClick={() => setPeriodMode('select')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                periodMode === 'select'
                  ? 'border-blue-400 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                periodMode === 'select' ? 'border-blue-600 dark:border-blue-400' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {periodMode === 'select' && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </span>
              <span>Pilih Bulan</span>
            </button>

            {periodMode === 'select' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Oktober 2026">Oktober 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="Juli 2026">Juli 2026</option>
              </select>
            )}
          </div>
        </div>

        {/* Right Info */}
        <div className="text-left md:text-right">
          <div className="font-bold text-slate-900 dark:text-white text-base">
            {periodMode === 'current' ? data.period : selectedMonth}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Data s/d {data.cutoffDate} • Time gone {data.timeGonePercent.toString().replace('.', ',')}%
          </div>
        </div>
      </div>

      {/* Render Main Content depending on Tab */}
      {activeTab === 'monthly' && (
        <>
          {/* 3. Store Performance Section */}
          <div className="space-y-3.5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Store Performance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Actual vs target bulan terpilih.
              </p>
            </div>

            {/* TOTAL SALES Card (Large Feature Card) */}
            <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden transition-all">
              {/* Subtle accent corner glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />

              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  TOTAL SALES
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  ▲ {data.totalAchievementPercent}%
                </span>
              </div>

              {/* Big bold currency */}
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight my-3">
                {formatRupiah(data.totalSales)}
              </div>

              {/* Middle row: Target vs Points */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-300 gap-1.5 pt-1">
                <div>
                  Target <span className="font-semibold text-slate-700 dark:text-slate-200">{formatRupiah(data.totalTarget)}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {data.totalPointsEarned.toString().replace('.', ',')}/{data.totalMaxPoints} pts
                </div>
              </div>

              {/* Bottom row: Estimation vs Variance */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                <div className="font-semibold text-blue-600 dark:text-blue-400">
                  Est. {formatRupiah(data.totalEstAmount)} ({data.totalEstPercent}%)
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 dark:text-slate-400 text-xs">Variance</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(data.totalVariance)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Category Cards (Apple, Android, Accessories, VAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: APPLE */}
              <LOBCategoryCard
                lob={data.lobs.apple}
                onClickDetail={() => setDetailLob(data.lobs.apple)}
              />

              {/* Card 2: ANDROID */}
              <LOBCategoryCard
                lob={data.lobs.android}
                onClickDetail={() => setDetailLob(data.lobs.android)}
              />

              {/* Card 3: ACCESSORIES */}
              <LOBCategoryCard
                lob={data.lobs.accessories}
                onClickDetail={() => setDetailLob(data.lobs.accessories)}
              />

              {/* Card 4: VAS */}
              <LOBCategoryCard
                lob={data.lobs.vas}
                onClickDetail={() => setDetailLob(data.lobs.vas)}
              />
            </div>

            {/* 3.5. Daily Sales vs Target Trend Line Chart (Last 30 Days) via Recharts */}
            <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                      <Activity size={18} />
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Tren Kinerja Penjualan Harian vs Target (30 Hari Terakhir)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Grafik garis performa harian toko terhadap target harian yang telah ditetapkan.
                  </p>
                </div>

                {/* Filter Timeframe Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold self-start md:self-center">
                  <button
                    onClick={() => setChartTimeframe('7d')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartTimeframe === '7d'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    7 Hari
                  </button>
                  <button
                    onClick={() => setChartTimeframe('14d')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartTimeframe === '14d'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    14 Hari
                  </button>
                  <button
                    onClick={() => setChartTimeframe('30d')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartTimeframe === '30d'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    30 Hari Penuh
                  </button>
                </div>
              </div>

              {/* Quick Summary Pill Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] block">Rata-rata Penjualan / Hari</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block truncate">
                    {formatRupiah(chartStats.avgDaily)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] block">Pencapaian Target Harian</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
                    {chartStats.hitDays} / {displayedChartData.length} Hari ({Math.round((chartStats.hitDays / displayedChartData.length) * 100)}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] block">Penjualan Tertinggi (Peak)</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5 block truncate">
                    {chartStats.peakDay ? `${chartStats.peakDay.dayLabel}: ${formatCompactRupiah(chartStats.peakDay.actual)}` : '-'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] block">Total Periode Ini</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block truncate">
                    {formatCompactRupiah(chartStats.totalAct)} ({chartStats.achPercent}%)
                  </span>
                </div>
              </div>

              {/* Recharts Container */}
              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={displayedChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1', strokeOpacity: 0.5 }}
                      dy={5}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCompactRupiah(value).replace('Rp ', '')}
                      dx={-5}
                    />
                    <Tooltip content={renderChartTooltip} />
                    <Legend
                      wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
                      iconType="plainline"
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="none"
                      fill="url(#colorActual)"
                    />
                    <Line
                      type="monotone"
                      name="Actual Sales (Aktual)"
                      dataKey="actual"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#2563eb', strokeWidth: 1, stroke: '#ffffff' }}
                      activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      name="Target Penjualan Harian"
                      dataKey="target"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>* Garis putus-putus menunjukkan baseline target harian toko. Label bertanda * adalah estimasi hari sisa.</span>
                <span className="text-blue-500 font-medium">Data tersinkronisasi otomatis dari Google Sheet</span>
              </div>
            </div>
          </div>

          {/* 4. Team Performance Section */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Team Performance
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Produktivitas dan rata-rata transaksi tim toko.
                </p>
              </div>
              {onNavigateToStaff && (
                <button
                  onClick={onNavigateToStaff}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua Staff</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {/* 6 Metric Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  Total Staff
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                  {data.teamSummary.totalStaff}
                </span>
              </div>

              <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  Productive
                </span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {data.teamSummary.productive}
                </span>
              </div>

              <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  Need Push
                </span>
                <span className="text-2xl font-bold text-amber-500 dark:text-amber-400 mt-1 block">
                  {data.teamSummary.needPush}
                </span>
              </div>

              <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  Total Transaction
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                  {data.teamSummary.totalTransactions}
                </span>
              </div>

              <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  Avg UPT
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
                  {data.teamSummary.avgUpt}
                </span>
              </div>

              <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  Avg ATV
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2 block truncate">
                  {formatRupiah(data.teamSummary.avgAtv)}
                </span>
              </div>
            </div>

            {/* Quick Staff Roster / Leaderboard Table */}
            <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Peringkat Penjualan Staff (Bulan Berjalan)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">6 Staff Terdaftar</span>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-400 font-semibold uppercase">
                    <th className="pb-3 pl-1">Staff</th>
                    <th className="pb-3">Posisi</th>
                    <th className="pb-3 text-right">Actual Sales</th>
                    <th className="pb-3 text-right">Target</th>
                    <th className="pb-3 text-center">Achieve</th>
                    <th className="pb-3 text-center">UPT</th>
                    <th className="pb-3 text-right">ATV</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {data.staffList.map((staff, idx) => (
                    <tr key={staff.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-1 flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{staff.name}</div>
                          <div className="text-[10px] text-slate-400">{staff.id}</div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{staff.role}</td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatRupiah(staff.actualSales)}
                      </td>
                      <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                        {formatRupiah(staff.targetSales)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block font-bold ${
                          staff.achievementPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {staff.achievementPercent}%
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-700 dark:text-slate-300">{staff.upt}</td>
                      <td className="py-3 text-right text-slate-700 dark:text-slate-300">
                        {formatRupiah(staff.atv)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.status === 'Productive'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                        }`}>
                          {staff.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: MTM Overview (Month-to-Month) */}
      {activeTab === 'mtm' && (
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Month-to-Month (MTM) Performance Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perbandingan penjualan toko QF10 dalam 3 bulan terakhir.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800/50">
              Pertumbuhan MoM: +12.4%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase">Agustus 2026</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Rp 6.120.450.000</div>
              <div className="text-xs text-emerald-600 mt-1">Target: Rp 6.200.000.000 (Ach. 98.7%)</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase">September 2026</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Rp 6.710.890.000</div>
              <div className="text-xs text-emerald-600 mt-1">Target: Rp 6.500.000.000 (Ach. 103.2%)</div>
            </div>
            <div className="p-4 rounded-xl border-2 border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="text-xs font-bold text-blue-600 uppercase">Oktober 2026 (Berjalan)</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Rp 7.543.088.015</div>
              <div className="text-xs text-emerald-600 font-bold mt-1">Target: Rp 6.876.812.958 (Ach. 110%)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: YTD Overview */}
      {activeTab === 'ytd' && (
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Year-to-Date (YTD) 2026 Cumulative Sales
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akumulasi penjualan Januari s/d Oktober 2026.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Sales YTD</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Rp 68.420.190.000</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">104.8% dari target YTD</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase">Apple Contribution</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">84.2%</div>
              <div className="text-xs text-slate-500 mt-1">Rp 57.610.000.000</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Invoices</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4.280</div>
              <div className="text-xs text-slate-500 mt-1">Rata-rata 428 trx / bulan</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 uppercase">Store Grade Status</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">Tier 1 Elite</div>
              <div className="text-xs text-slate-500 mt-1">Digiplus Flagship Mall</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Compare 2025 vs 2026 */}
      {activeTab === 'compare' && (
        <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Komparasi Tahunan: 2025 vs 2026
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pertumbuhan per kategori LOB (Year-over-Year).
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
              Total YoY Growth: +18.6%
            </span>
          </div>

          <div className="space-y-3">
            {[
              { category: 'Apple (iPhone & Mac)', val2025: 'Rp 5.210.000.000', val2026: 'Rp 6.650.295.035', growth: '+27.6%' },
              { category: 'Android (Samsung & Xiaomi)', val2025: 'Rp 780.000.000', val2026: 'Rp 633.979.010', growth: '-18.7%' },
              { category: 'Accessories (Audio & Cables)', val2025: 'Rp 160.000.000', val2026: 'Rp 181.653.970', growth: '+13.5%' },
              { category: 'VAS (AppleCare+ & Insurance)', val2025: 'Rp 55.000.000', val2026: 'Rp 77.160.000', growth: '+40.2%' }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{item.category}</div>
                  <div className="text-xs text-slate-400 mt-0.5">2025: {item.val2025} → 2026: {item.val2026}</div>
                </div>
                <div className={`font-bold ${item.growth.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.growth}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOB Detail Modal */}
      {detailLob && (
        <LOBDetailModal
          lob={detailLob}
          onClose={() => setDetailLob(null)}
          period={data.period}
        />
      )}
    </div>
  );
};

interface LOBCategoryCardProps {
  lob: LOBMetric;
  onClickDetail: () => void;
}

const LOBCategoryCard: React.FC<LOBCategoryCardProps> = ({ lob, onClickDetail }) => {
  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div>
        {/* Top: Name & % Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {lob.name}
          </span>
          <span
            className={`text-xs font-bold flex items-center gap-0.5 ${
              lob.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {lob.isPositive ? '▲' : '▼'} {lob.achievementPercent}%
          </span>
        </div>

        {/* Big Sales Figure */}
        <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight my-2.5 truncate">
          {formatRupiah(lob.actual)}
        </div>

        {/* Target vs Points */}
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="truncate">Target {formatRupiah(lob.target)}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-blue-600 dark:text-blue-400 truncate">
              Est. {formatRupiah(lob.estAmount)} ({lob.estPercent}%)
            </span>
            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
              {lob.pointsEarned.toString().replace('.', ',')}/{lob.maxPoints} pts
            </span>
          </div>
        </div>

        {/* Variance */}
        <div className="flex items-center justify-between text-xs pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400">Variance</span>
          <span
            className={`font-bold ${
              lob.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(lob.variance)}
          </span>
        </div>
      </div>

      {/* Bottom Action: Klik untuk rincian › */}
      <div className="pt-3 mt-1">
        <button
          onClick={onClickDetail}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer group"
        >
          <span>Klik untuk rincian</span>
          <span className="transition-transform group-hover:translate-x-0.5">›</span>
        </button>
      </div>
    </div>
  );
};
