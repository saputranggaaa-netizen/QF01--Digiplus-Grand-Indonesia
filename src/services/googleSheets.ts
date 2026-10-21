import { StoreOverviewData, GoogleSheetConfig, SheetTabConfig, LOBMetric, StaffPerformance, DailySalesRecord, StockItem } from '../types/dashboard';
import { INITIAL_DASHBOARD_DATA } from '../data/initialData';
import { parseQF01TransactionCsv } from './qf01Parser';

const STORAGE_KEY_CONFIG = 'digiplus_google_sheet_config';
const STORAGE_KEY_DATA = 'digiplus_store_data';

export const LOCAL_QF01_ASSET_PATH = '/assets/aistudio/QF01_-YOUR_GOALS_50c7a0a7';

export const DEFAULT_TABS: SheetTabConfig[] = [
  {
    id: 'overview',
    name: 'Overview',
    description: 'Target Toko, Pencapaian Kategori LOB (Apple, Android, Aksesoris, VAS) & Poin',
    enabled: true,
    status: 'synced',
    rowCount: 13
  },
  {
    id: 'transactions',
    name: 'Transactions',
    description: 'Ledger Transaksi Penjualan Riil (Invoice, SAP Article, Qty, Amount, Brand Name)',
    enabled: true,
    status: 'synced',
    rowCount: 271
  },
  {
    id: 'staff',
    name: 'Staff_Performance',
    description: 'Daftar Staf Sales, Target Penjualan Individu, Peran & Insentif',
    enabled: true,
    status: 'synced',
    rowCount: 8
  },
  {
    id: 'daily',
    name: 'Daily_Sales',
    description: 'Rincian & Target Penjualan Harian (30 Hari)',
    enabled: true,
    status: 'synced',
    rowCount: 21
  },
  {
    id: 'soh',
    name: 'SOH',
    description: 'Stok Fisik Toko (Stock on Hand), In Transit & Status Reorder',
    enabled: true,
    status: 'synced',
    rowCount: 12
  },
  {
    id: 'focus',
    name: 'Target_Fokus',
    description: 'Program Kampanye Khusus 3PP (Marshall, Anker) & VAS AppleCare+',
    enabled: true,
    status: 'synced',
    rowCount: 4
  }
];

export const DEFAULT_SHEET_CONFIG: GoogleSheetConfig = {
  sheetUrl: LOCAL_QF01_ASSET_PATH,
  sheetId: 'QF01_-YOUR_GOALS',
  sheetName: 'Transactions',
  activeTabId: 'transactions',
  tabs: DEFAULT_TABS,
  isAutoSync: true,
  autoSyncInterval: 30, // Auto-update every 30 seconds
  syncStatus: 'success',
  lastSyncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  lastSyncedTimestamp: Date.now()
};

export function extractSheetId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (trimmed.includes('QF01') || trimmed.startsWith('/') || trimmed.startsWith('assets/')) {
    return 'QF01_-YOUR_GOALS';
  }
  if (/^[a-zA-Z0-9-_]{20,70}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  const matchPub = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (matchPub && matchPub[1]) {
    return matchPub[1];
  }
  return null;
}

export function loadSavedConfig(): GoogleSheetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SHEET_CONFIG,
        ...parsed,
        tabs: parsed.tabs && parsed.tabs.length > 0 ? parsed.tabs : DEFAULT_TABS
      };
    }
  } catch (err) {
    console.error('Error loading sheet config from localStorage', err);
  }
  return DEFAULT_SHEET_CONFIG;
}

export function saveSheetConfig(config: GoogleSheetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving sheet config to localStorage', err);
  }
}

export function loadSavedDashboardData(): StoreOverviewData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading dashboard data from localStorage', err);
  }
  return INITIAL_DASHBOARD_DATA;
}

export function saveDashboardData(data: StoreOverviewData): void {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving dashboard data to localStorage', err);
  }
}

export interface FetchResult {
  data: StoreOverviewData;
  rawTable: {
    headers: string[];
    rows: (string | number)[][];
    totalRows: number;
    sheetName?: string;
  };
  updatedTabs?: SheetTabConfig[];
  tabTables?: Record<string, {
    headers: string[];
    rows: (string | number)[][];
    totalRows: number;
    sheetName: string;
  }>;
}

/**
 * Fetch and parse data from Google Sheet with multi-tab support
 */
export async function fetchGoogleSheetData(
  sheetIdOrUrl: string,
  sheetName?: string,
  configuredTabs: SheetTabConfig[] = DEFAULT_TABS
): Promise<FetchResult> {
  const trimmed = (sheetIdOrUrl || '').trim();

  // If loading the user uploaded QF01 transaction file
  if (!trimmed || trimmed === LOCAL_QF01_ASSET_PATH || trimmed.includes('QF01') || trimmed.includes('YOUR_GOALS')) {
    try {
      const res = await fetch(LOCAL_QF01_ASSET_PATH);
      if (res.ok) {
        const csvContent = await res.text();
        const { data, rawRows } = parseQF01TransactionCsv(csvContent);
        
        // Prepare multi-tab simulated tables
        const transactionHeaders = ['Date', 'Sales ID', 'Sales Name', 'Invoice', 'SAP Description', 'Qty', 'Amount', 'Product Type', 'Brand Name', 'Category'];
        const transactionRows = rawRows.slice(0, 25).map((r) => [
          r.date,
          r.salesId,
          r.salesName,
          r.invoice,
          r.sapDescription,
          r.qty,
          r.amount,
          r.productType,
          r.brandName,
          r.groupCategory
        ]);

        const overviewTable = {
          headers: ['CATEGORY / METRIC', 'ACTUAL_SALES', 'TARGET_SALES', 'POIN', 'MAX_POIN', 'VARIANCE'],
          rows: [
            ['TOTAL SALES', data.totalSales, data.totalTarget, data.totalPointsEarned, 100, data.totalVariance],
            ['APPLE', data.lobs.apple.actual, data.lobs.apple.target, data.lobs.apple.pointsEarned, 30, data.lobs.apple.variance],
            ['ANDROID', data.lobs.android.actual, data.lobs.android.target, data.lobs.android.pointsEarned, 30, data.lobs.android.variance],
            ['ACCESSORIES', data.lobs.accessories.actual, data.lobs.accessories.target, data.lobs.accessories.pointsEarned, 30, data.lobs.accessories.variance],
            ['VAS', data.lobs.vas.actual, data.lobs.vas.target, data.lobs.vas.pointsEarned, 10, data.lobs.vas.variance]
          ],
          totalRows: 5,
          sheetName: 'Overview'
        };

        const staffTable = {
          headers: ['STAFF ID', 'STAFF NAME', 'ROLE', 'ACTUAL SALES', 'TARGET', 'ACHIEVE %', 'STATUS', 'TRX', 'UPT', 'ATV'],
          rows: data.staffList.map((s) => [s.id, s.name, s.role, s.actualSales, s.targetSales, `${s.achievementPercent}%`, s.status, s.transactions, s.upt, s.atv]),
          totalRows: data.staffList.length,
          sheetName: 'Staff_Performance'
        };

        const dailyTable = {
          headers: ['TANGGAL', 'ACTUAL SALES', 'TARGET', 'TRANSAKSI', 'UPT', 'ATV'],
          rows: data.dailySales.map((d) => [d.dayLabel, d.actual, d.target, d.transactions, d.upt, d.atv]),
          totalRows: data.dailySales.length,
          sheetName: 'Daily_Sales'
        };

        const sohTable = {
          headers: ['SKU', 'NAMA PRODUK', 'KATEGORI', 'SOH (UNIT)', 'IN TRANSIT', 'HARGA SATUAN', 'STATUS'],
          rows: data.stockItems.map((st) => [st.sku, st.name, st.category, st.soh, st.intransit, st.unitPrice, st.status]),
          totalRows: data.stockItems.length,
          sheetName: 'SOH'
        };

        const tabTables: Record<string, any> = {
          transactions: {
            headers: transactionHeaders,
            rows: transactionRows,
            totalRows: rawRows.length,
            sheetName: 'Transactions'
          },
          overview: overviewTable,
          staff: staffTable,
          daily: dailyTable,
          soh: sohTable
        };

        const updatedTabs = configuredTabs.map((t) => ({
          ...t,
          status: 'synced' as const,
          rowCount: tabTables[t.id]?.totalRows || t.rowCount || 0,
          lastSync: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }));

        const primaryTabId = sheetName ? (configuredTabs.find((t) => t.name.toLowerCase() === sheetName.toLowerCase())?.id || 'transactions') : 'transactions';
        const primaryTable = tabTables[primaryTabId] || tabTables.transactions;

        return {
          data,
          rawTable: primaryTable,
          updatedTabs,
          tabTables
        };
      }
    } catch (e) {
      console.warn('Failed loading local QF01 file, fallback to initial data', e);
    }
  }

  // If using sample demo ID (QF10 Kokas)
  if (trimmed.includes('SAMPLE') || trimmed.includes('QF10')) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const currentData = loadSavedDashboardData();
    const rawTable = {
      headers: ['KATEGORI / METRIK', 'ACTUAL_SALES', 'TARGET_SALES', 'POIN_TERCAPAI', 'MAX_POIN', 'VARIANCE', 'STATUS'],
      rows: [
        ['TOTAL SALES', currentData.totalSales, currentData.totalTarget, currentData.totalPointsEarned, currentData.totalMaxPoints, currentData.totalVariance, `${currentData.totalAchievementPercent}%`],
        ['APPLE', currentData.lobs.apple.actual, currentData.lobs.apple.target, currentData.lobs.apple.pointsEarned, currentData.lobs.apple.maxPoints, currentData.lobs.apple.variance, `${currentData.lobs.apple.achievementPercent}%`],
        ['ANDROID', currentData.lobs.android.actual, currentData.lobs.android.target, currentData.lobs.android.pointsEarned, currentData.lobs.android.maxPoints, currentData.lobs.android.variance, `${currentData.lobs.android.achievementPercent}%`],
        ['ACCESSORIES', currentData.lobs.accessories.actual, currentData.lobs.accessories.target, currentData.lobs.accessories.pointsEarned, currentData.lobs.accessories.maxPoints, currentData.lobs.accessories.variance, `${currentData.lobs.accessories.achievementPercent}%`],
        ['VAS', currentData.lobs.vas.actual, currentData.lobs.vas.target, currentData.lobs.vas.pointsEarned, currentData.lobs.vas.maxPoints, currentData.lobs.vas.variance, `${currentData.lobs.vas.achievementPercent}%`],
        ['Store Code', currentData.storeCode, '-', '-', '-', '-', '-'],
        ['Store Name', currentData.storeName, '-', '-', '-', '-', '-'],
        ['Periode', currentData.period, '-', '-', '-', '-', '-']
      ],
      totalRows: 8,
      sheetName: 'Overview'
    };
    return { data: currentData, rawTable, updatedTabs: configuredTabs };
  }

  const sheetId = extractSheetId(trimmed);
  if (!sheetId) {
    throw new Error('ID atau URL Google Sheet tidak valid. Contoh format: https://docs.google.com/spreadsheets/d/1BxiMVs.../edit');
  }

  // Multi-tab fetch loop for real Google Spreadsheets
  const tabTables: Record<string, any> = {};
  let mergedData = { ...INITIAL_DASHBOARD_DATA };
  const updatedTabs: SheetTabConfig[] = [];

  const enabledTabs = configuredTabs.filter((t) => t.enabled);
  const targetTabs = enabledTabs.length > 0 ? enabledTabs : configuredTabs;

  for (const tab of targetTabs) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${
        tab.name ? `&sheet=${encodeURIComponent(tab.name)}` : ''
      }${tab.gid ? `&gid=${tab.gid}` : ''}`;

      const res = await fetch(gvizUrl, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
        if (jsonMatch && jsonMatch[1]) {
          const gvizData = JSON.parse(jsonMatch[1]);
          if (gvizData.table && gvizData.table.rows && gvizData.table.rows.length > 0) {
            const table = gvizData.table;
            const headers = (table.cols || []).map((c: any) => c.label || c.id || '');
            const rows = (table.rows || []).map((r: any) => (r.c || []).map((cell: any) => (cell ? (cell.v !== undefined ? cell.v : cell.f) : '')));

            tabTables[tab.id] = {
              headers,
              rows,
              totalRows: rows.length,
              sheetName: tab.name
            };

            // Process data depending on tab type
            const csvText = gvizTableToCsv(table);
            if (tab.id === 'transactions' || csvText.includes('Sales ID') || csvText.includes('SAP Article')) {
              const { data: parsedData } = parseQF01TransactionCsv(csvText);
              mergedData = { ...mergedData, ...parsedData };
            } else if (tab.id === 'overview' || tab.name.toLowerCase().includes('overview')) {
              const { data: ovData } = parseGVizTableToDashboard(table);
              mergedData = { ...mergedData, lobs: ovData.lobs, totalSales: ovData.totalSales, totalTarget: ovData.totalTarget };
            }

            updatedTabs.push({
              ...tab,
              status: 'synced',
              rowCount: rows.length,
              lastSync: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });
            continue;
          }
        }
      }
    } catch (tabErr: any) {
      console.warn(`Tab ${tab.name} fetch failed:`, tabErr.message);
    }

    updatedTabs.push({
      ...tab,
      status: tab.enabled ? 'error' : 'optional',
      errorMessage: 'Tab tidak ditemukan atau belum dipublikasikan'
    });
  }

  // If no specific multi-tab worked, fallback to primary sheet
  const primaryTable = Object.values(tabTables)[0] || {
    headers: ['Kolom 1', 'Kolom 2', 'Kolom 3'],
    rows: [['Data belum tersinkronisasi']],
    totalRows: 1,
    sheetName: sheetName || 'Sheet1'
  };

  return {
    data: mergedData,
    rawTable: primaryTable,
    updatedTabs,
    tabTables
  };
}

function gvizTableToCsv(table: any): string {
  const headers = (table.cols || []).map((c: any) => c.label || c.id || '');
  const lines: string[] = [headers.join(',')];
  for (const row of table.rows || []) {
    const rowCells = (row.c || []).map((cell: any) => {
      if (!cell) return '';
      const v = cell.v !== undefined ? cell.v : cell.f;
      return String(v).replace(/,/g, '');
    });
    lines.push(rowCells.join(','));
  }
  return lines.join('\n');
}

/**
 * Converts GViz summary table into StoreOverviewData & raw table
 */
function parseGVizTableToDashboard(table: any): FetchResult {
  const base = { ...INITIAL_DASHBOARD_DATA };
  const rawHeaders: string[] = (table.cols || []).map((col: any, idx: number) => {
    return (col.label || col.id || `Kolom ${idx + 1}`).trim();
  });

  const rawRows: (string | number)[][] = [];

  for (const row of table.rows || []) {
    const cells = (row.c || []).map((cell: any) => {
      if (!cell) return '';
      return cell.v !== undefined ? cell.v : (cell.f || '');
    });
    rawRows.push(cells);

    const firstCell = String(cells[0] || '').trim().toLowerCase();

    if (firstCell.includes('store code') || firstCell.includes('kode toko')) {
      base.storeCode = String(cells[1] || base.storeCode);
    } else if (firstCell.includes('store name') || firstCell.includes('nama toko')) {
      base.storeName = String(cells[1] || base.storeName);
    } else if (firstCell.includes('periode') || firstCell.includes('period')) {
      base.period = String(cells[1] || base.period);
    } else if (firstCell.includes('total sales') || firstCell.includes('total penjualan')) {
      const actual = parseNumber(cells[1]);
      const target = parseNumber(cells[2]);
      if (actual > 0) base.totalSales = actual;
      if (target > 0) base.totalTarget = target;
      base.totalAchievementPercent = Math.round((base.totalSales / base.totalTarget) * 100);
      base.totalVariance = base.totalSales - base.totalTarget;
    } else if (firstCell.includes('apple')) {
      updateLobRow(base.lobs.apple, cells);
    } else if (firstCell.includes('android')) {
      updateLobRow(base.lobs.android, cells);
    } else if (firstCell.includes('accessories') || firstCell.includes('aksesoris')) {
      updateLobRow(base.lobs.accessories, cells);
    } else if (firstCell.includes('vas')) {
      updateLobRow(base.lobs.vas, cells);
    }
  }

  recalculateTotals(base);

  const rawTable = {
    headers: rawHeaders.length > 0 ? rawHeaders : ['Kolom A', 'Kolom B', 'Kolom C', 'Kolom D', 'Kolom E'],
    rows: rawRows,
    totalRows: rawRows.length,
    sheetName: 'Overview'
  };

  return { data: base, rawTable };
}

function recalculateTotals(base: StoreOverviewData) {
  const sumActual = base.lobs.apple.actual + base.lobs.android.actual + base.lobs.accessories.actual + base.lobs.vas.actual;
  const sumTarget = base.lobs.apple.target + base.lobs.android.target + base.lobs.accessories.target + base.lobs.vas.target;
  if (sumActual > 0) base.totalSales = sumActual;
  if (sumTarget > 0) base.totalTarget = sumTarget;
  base.totalAchievementPercent = Math.round((base.totalSales / base.totalTarget) * 100);
  base.totalVariance = base.totalSales - base.totalTarget;
  base.totalPointsEarned = +(base.lobs.apple.pointsEarned + base.lobs.android.pointsEarned + base.lobs.accessories.pointsEarned + base.lobs.vas.pointsEarned).toFixed(1);
  base.totalEstAmount = Math.round(base.totalSales / 0.677);
  base.totalEstPercent = Math.round((base.totalEstAmount / base.totalTarget) * 100);
}

function updateLobRow(lob: LOBMetric, cells: any[]) {
  const actual = parseNumber(cells[1]);
  const target = parseNumber(cells[2]);
  const points = parseNumber(cells[3]);

  if (actual > 0) lob.actual = actual;
  if (target > 0) lob.target = target;
  if (points > 0) lob.pointsEarned = points;

  lob.achievementPercent = Math.round((lob.actual / lob.target) * 100);
  lob.variance = lob.actual - lob.target;
  lob.isPositive = lob.variance >= 0;
  lob.estAmount = Math.round(lob.actual / 0.677);
  lob.estPercent = Math.round((lob.estAmount / lob.target) * 100);
}

export function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(/Rp|\s/gi, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function generateGoogleSheetTemplateCsv(): string {
  return [
    '# TEMPLATE GOOGLE SHEET - DIGIPLUS',
    '# Salin isi ini ke Google Spreadsheet Anda atau unduh sebagai CSV',
    'CATEGORY,ACTUAL_SALES,TARGET_SALES,POINTS_EARNED,MAX_POINTS,VARIANCE',
    `APPLE,${INITIAL_DASHBOARD_DATA.lobs.apple.actual},${INITIAL_DASHBOARD_DATA.lobs.apple.target},30,30,${INITIAL_DASHBOARD_DATA.lobs.apple.variance}`,
    `ANDROID,${INITIAL_DASHBOARD_DATA.lobs.android.actual},${INITIAL_DASHBOARD_DATA.lobs.android.target},13.1,30,${INITIAL_DASHBOARD_DATA.lobs.android.variance}`,
    `ACCESSORIES,${INITIAL_DASHBOARD_DATA.lobs.accessories.actual},${INITIAL_DASHBOARD_DATA.lobs.accessories.target},15.6,30,${INITIAL_DASHBOARD_DATA.lobs.accessories.variance}`,
    `VAS,${INITIAL_DASHBOARD_DATA.lobs.vas.actual},${INITIAL_DASHBOARD_DATA.lobs.vas.target},7.8,10,${INITIAL_DASHBOARD_DATA.lobs.vas.variance}`,
    '',
    '# INFORMASI TOKO',
    'METRIC,VALUE',
    'Store Code,QF01',
    'Store Name,Digiplus QF01 - YOUR GOALS',
    'Period,Oktober 2026',
    'Cutoff Date,21/10',
    'Time Gone %,67.7%',
    'Total Staff,8',
    'Productive Staff,6',
    'Need Push Staff,2',
    'Total Transactions,158',
    'Avg UPT,1.52',
    'Avg ATV,17933254'
  ].join('\n');
}

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(abs);
  return `${isNegative ? '-Rp ' : 'Rp '}${formatted}`;
}

export function formatCompactRupiah(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1)} Jt`;
  }
  return formatRupiah(amount);
}
