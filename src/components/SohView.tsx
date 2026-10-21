import React, { useState } from 'react';
import { StockItem } from '../types/dashboard';
import { formatRupiah } from '../services/googleSheets';
import { Package, Search, Filter, AlertTriangle, CheckCircle, ArrowDownUp } from 'lucide-react';

interface SohViewProps {
  items: StockItem[];
  storeCode: string;
}

export const SohView: React.FC<SohViewProps> = ({ items, storeCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalSohUnits = items.reduce((acc, it) => (it.category !== 'VAS' ? acc + it.soh : acc), 0);
  const totalSohValuation = items.reduce((acc, it) => (it.category !== 'VAS' ? acc + (it.soh * it.unitPrice) : acc), 0);
  const lowStockCount = items.filter((it) => it.status === 'Low Stock' || it.status === 'Critical').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package size={20} className="text-amber-500" />
            Stock On Hand (SOH) & Inventory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring ketersediaan unit stok fisik di store {storeCode}.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          {lowStockCount} SKU Butuh Replenish Segera
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Unit SOH (Fisik)</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {totalSohUnits} Unit
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Device & Aksesoris</div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Valuasi Stok Toko</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatRupiah(totalSohValuation)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Berdasarkan Harga Ritel</div>
        </div>

        <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Status Replenishment</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            Aman (Normal)
          </div>
          <div className="text-xs text-slate-400 mt-0.5">PO Dalam Perjalanan: 40 Unit</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0c1427] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari SKU atau nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          {['All', 'Apple', 'Android', 'Accessories', 'VAS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SOH Table */}
      <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <th className="pb-3 pl-1">SKU & Produk</th>
              <th className="pb-3">Kategori</th>
              <th className="pb-3 text-right">Harga Satuan</th>
              <th className="pb-3 text-center">SOH Toko</th>
              <th className="pb-3 text-center">In Transit</th>
              <th className="pb-3 text-center pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {filteredItems.map((item) => (
              <tr key={item.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pl-1">
                  <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</div>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400 font-semibold">
                  {item.category}
                </td>
                <td className="py-3 text-right text-slate-800 dark:text-slate-200">
                  {formatRupiah(item.unitPrice)}
                </td>
                <td className="py-3 text-center font-bold text-slate-900 dark:text-white">
                  {item.category === 'VAS' ? 'Digital' : `${item.soh} pcs`}
                </td>
                <td className="py-3 text-center text-slate-500">
                  {item.intransit > 0 ? `+${item.intransit} pcs` : '-'}
                </td>
                <td className="py-3 text-center pr-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'In Stock'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
