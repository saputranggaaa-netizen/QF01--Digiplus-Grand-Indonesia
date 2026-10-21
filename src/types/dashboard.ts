export interface LOBMetric {
  id: string;
  name: string;
  actual: number;
  target: number;
  achievementPercent: number;
  estAmount: number;
  estPercent: number;
  pointsEarned: number;
  maxPoints: number;
  variance: number;
  isPositive: boolean;
  subCategories?: {
    name: string;
    actual: number;
    target: number;
    quantity: number;
    growthPercent: number;
  }[];
}

export interface StaffPerformance {
  id: string;
  name: string;
  role: string;
  actualSales: number;
  targetSales: number;
  achievementPercent: number;
  transactions: number;
  upt: number; // Units per transaction
  atv: number; // Average transaction value
  status: 'Productive' | 'Need Push';
  points: number;
  avatar?: string;
  appleSales: number;
  androidSales: number;
  accSales: number;
  vasSales: number;
}

export interface DailySalesRecord {
  date: string; // e.g., "2026-10-01"
  dayLabel: string; // e.g., "01/10"
  actual: number;
  target: number;
  transactions: number;
  upt: number;
  atv: number;
  notes?: string;
}

export interface StockItem {
  sku: string;
  name: string;
  category: 'Apple' | 'Android' | 'Accessories' | 'VAS';
  soh: number; // Stock on hand
  intransit: number;
  unitPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Critical' | 'Out of Stock';
}

export interface StoreOverviewData {
  storeCode: string;
  storeName: string;
  period: string; // e.g. "Oktober 2026"
  cutoffDate: string; // e.g. "21/10"
  timeGonePercent: number; // e.g. 67.7
  
  // Total Store
  totalSales: number;
  totalTarget: number;
  totalAchievementPercent: number;
  totalEstAmount: number;
  totalEstPercent: number;
  totalPointsEarned: number;
  totalMaxPoints: number;
  totalVariance: number;

  // LOBs
  lobs: {
    apple: LOBMetric;
    android: LOBMetric;
    accessories: LOBMetric;
    vas: LOBMetric;
  };

  // Team summary
  teamSummary: {
    totalStaff: number;
    productive: number;
    needPush: number;
    totalTransactions: number;
    avgUpt: number;
    avgAtv: number;
  };

  staffList: StaffPerformance[];
  dailySales: DailySalesRecord[];
  stockItems: StockItem[];
}

export interface SheetTabConfig {
  id: string; // 'overview' | 'transactions' | 'staff' | 'daily' | 'soh' | 'focus' | custom
  name: string; // Name of the tab in Google Sheets, e.g. "Overview", "Transactions", "Sheet1"
  gid?: string; // Optional Google Sheet GID, e.g. "0"
  description: string;
  enabled: boolean;
  status: 'synced' | 'pending' | 'error' | 'optional';
  rowCount?: number;
  lastSync?: string;
  errorMessage?: string;
}

export interface GoogleSheetConfig {
  sheetUrl: string;
  sheetId: string;
  sheetName?: string; // Primary/active tab name
  activeTabId?: string; // Currently previewed tab
  tabs: SheetTabConfig[]; // Configured multiple tabs
  apiKey?: string;
  lastSyncedAt?: string;
  lastSyncedTimestamp?: number;
  isAutoSync: boolean;
  autoSyncInterval: number; // in seconds: 0 (off), 15, 30, 60, 300
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  rawTableData?: {
    headers: string[];
    rows: (string | number)[][];
    totalRows: number;
    sheetName?: string;
  };
  tabTables?: Record<string, {
    headers: string[];
    rows: (string | number)[][];
    totalRows: number;
    sheetName: string;
  }>;
}
