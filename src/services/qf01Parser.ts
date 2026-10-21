import { StoreOverviewData, LOBMetric, StaffPerformance, DailySalesRecord, StockItem } from '../types/dashboard';
import { parseNumber } from './googleSheets';

export interface TransactionRow {
  date: string;
  salesId: string;
  salesName: string;
  invoice: string;
  sapArticle: string;
  sapDescription: string;
  detailProductType: string;
  qty: number;
  amount: number;
  productType: string;
  brandName: string;
  groupCategory: string;
  month: string;
  dateOfMonth: string;
  week: string;
  supplier: string;
  android: string;
  insentifApple: string;
  insentif3rdParty: string;
  insentifAndroid: string;
  qoala: string;
  accessories: string;
  productFocus: string;
}

/**
 * Parses raw CSV lines from QF01 transaction sheet format
 */
export function parseQF01TransactionCsv(csvText: string): { data: StoreOverviewData; rawRows: TransactionRow[] } {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('File data transaksi kosong atau tidak memiliki baris.');
  }

  const rawRows: TransactionRow[] = [];
  const staffMap: Record<string, { id: string; sales: number; trx: Set<string>; units: number; apple: number; android: number; acc: number; vas: number; incentives: number }> = {};
  const dailyMap: Record<string, { date: string; dayLabel: string; sales: number; trx: Set<string>; units: number }> = {};
  const subCategoryApple: Record<string, { sales: number; qty: number }> = {};
  const subCategoryAndroid: Record<string, { sales: number; qty: number }> = {};
  const subCategoryAcc: Record<string, { sales: number; qty: number }> = {};
  const subCategoryVas: Record<string, { sales: number; qty: number }> = {};
  const topProducts: Record<string, { name: string; sku: string; category: 'Apple' | 'Android' | 'Accessories' | 'VAS'; units: number; price: number }> = {};

  let totalSales = 0;
  const storeInvoices = new Set<string>();

  const lobs = {
    apple: { actual: 0, target: 2000000000, points: 30, maxPoints: 30 },
    android: { actual: 0, target: 800000000, points: 15, maxPoints: 30 },
    accessories: { actual: 0, target: 120000000, points: 12, maxPoints: 30 },
    vas: { actual: 0, target: 80000000, points: 8, maxPoints: 10 }
  };

  // Header is line 0
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const p = line.split(',');

    const date = (p[0] || '').trim();
    const salesId = (p[1] || '').trim();
    const salesName = (p[2] || '').trim();
    const invoice = (p[3] || '').trim();
    const sapArticle = (p[4] || '').trim();
    const sapDesc = (p[5] || '').trim();
    const detailProductType = (p[6] || '').trim();
    const qty = parseInt(p[7]) || 0;
    const amountStr = (p[8] || '').trim();
    const productType = (p[9] || '').trim().toUpperCase();
    const brandName = (p[10] || '').trim().toUpperCase();
    const groupCategory = (p[11] || '').trim().toUpperCase();
    const month = (p[12] || '').trim();
    const dateOfMonth = (p[13] || '').trim();
    const week = (p[14] || '').trim();
    const supplier = (p[15] || '').trim();
    const android = (p[16] || '').trim();
    const insentifApple = (p[17] || '').trim();
    const insentif3rdParty = (p[18] || '').trim();
    const insentifAndroid = (p[19] || '').trim();
    const qoala = (p[20] || '').trim();
    const accessories = (p[21] || '').trim();
    const productFocus = (p[22] || '').trim();

    if (!amountStr) continue;
    const unitPrice = parseNumber(amountStr);
    if (unitPrice <= 0 || qty <= 0) continue;

    const lineTotal = unitPrice * qty;
    totalSales += lineTotal;
    if (invoice) storeInvoices.add(invoice);

    rawRows.push({
      date,
      salesId,
      salesName,
      invoice,
      sapArticle,
      sapDescription: sapDesc,
      detailProductType,
      qty,
      amount: unitPrice,
      productType,
      brandName,
      groupCategory,
      month,
      dateOfMonth,
      week,
      supplier,
      android,
      insentifApple,
      insentif3rdParty,
      insentifAndroid,
      qoala,
      accessories,
      productFocus
    });

    // Determine category
    let cat: 'apple' | 'android' | 'accessories' | 'vas' = 'android';
    if (groupCategory === 'VAS' || productType === 'PROTEKSI' || brandName === 'QOALA' || brandName === 'TELKOMSEL') {
      cat = 'vas';
      lobs.vas.actual += lineTotal;
      const key = sapDesc || productType || 'VAS';
      if (!subCategoryVas[key]) subCategoryVas[key] = { sales: 0, qty: 0 };
      subCategoryVas[key].sales += lineTotal;
      subCategoryVas[key].qty += qty;
    } else if (groupCategory === 'ACCESSORIES' || ['CHARGER', 'CASE', 'CASING', 'CONNECTOR', 'EARPHONE', 'AIRPODS', 'POWERBANK', 'STYLUS', 'BAND', 'OTHERS'].includes(productType)) {
      cat = 'accessories';
      lobs.accessories.actual += lineTotal;
      const key = productType || brandName || 'Aksesoris';
      if (!subCategoryAcc[key]) subCategoryAcc[key] = { sales: 0, qty: 0 };
      subCategoryAcc[key].sales += lineTotal;
      subCategoryAcc[key].qty += qty;
    } else if (brandName === 'APPLE' || ['IPHONE', 'IPAD', 'MAC', 'APPLE WATCH'].includes(productType)) {
      cat = 'apple';
      lobs.apple.actual += lineTotal;
      const key = detailProductType || productType || 'Apple Device';
      if (!subCategoryApple[key]) subCategoryApple[key] = { sales: 0, qty: 0 };
      subCategoryApple[key].sales += lineTotal;
      subCategoryApple[key].qty += qty;
    } else {
      cat = 'android';
      lobs.android.actual += lineTotal;
      const key = brandName || 'Android Phone';
      if (!subCategoryAndroid[key]) subCategoryAndroid[key] = { sales: 0, qty: 0 };
      subCategoryAndroid[key].sales += lineTotal;
      subCategoryAndroid[key].qty += qty;
    }

    // Top products mapping
    if (sapArticle && sapDesc) {
      if (!topProducts[sapArticle]) {
        topProducts[sapArticle] = {
          sku: sapArticle,
          name: sapDesc,
          category: cat === 'apple' ? 'Apple' : cat === 'android' ? 'Android' : cat === 'accessories' ? 'Accessories' : 'VAS',
          units: 0,
          price: unitPrice
        };
      }
      topProducts[sapArticle].units += qty;
    }

    // Staff breakdown
    if (salesName) {
      if (!staffMap[salesName]) {
        staffMap[salesName] = {
          id: salesId || `STF-${Object.keys(staffMap).length + 1}`,
          sales: 0,
          trx: new Set<string>(),
          units: 0,
          apple: 0,
          android: 0,
          acc: 0,
          vas: 0,
          incentives: 0
        };
      }
      staffMap[salesName].sales += lineTotal;
      staffMap[salesName].units += qty;
      if (invoice) staffMap[salesName].trx.add(invoice);

      if (cat === 'apple') staffMap[salesName].apple += lineTotal;
      if (cat === 'android') staffMap[salesName].android += lineTotal;
      if (cat === 'accessories') staffMap[salesName].acc += lineTotal;
      if (cat === 'vas') staffMap[salesName].vas += lineTotal;

      const inc = parseNumber(insentifApple) + parseNumber(insentif3rdParty) + parseNumber(insentifAndroid) + parseNumber(qoala);
      staffMap[salesName].incentives += inc;
    }

    // Daily breakdown
    if (date && date.includes('2026')) {
      const dayLabel = date.substring(0, 5).replace('-', '/');
      if (!dailyMap[date]) {
        dailyMap[date] = { date, dayLabel, sales: 0, trx: new Set<string>(), units: 0 };
      }
      dailyMap[date].sales += lineTotal;
      dailyMap[date].units += qty;
      if (invoice) dailyMap[date].trx.add(invoice);
    }
  }

  // Calculate store target & achievement
  const totalStoreTarget = 3000000000; // Rp 3.000.000.000 target for QF01
  const totalAchievementPercent = Math.round((totalSales / totalStoreTarget) * 100);
  const totalVariance = totalSales - totalStoreTarget;
  const timeFraction = 0.677; // 21 of 31 days
  const totalEstAmount = Math.round(totalSales / timeFraction);
  const totalEstPercent = Math.round((totalEstAmount / totalStoreTarget) * 100);

  // Helper for LOB calculation
  const buildLob = (id: string, name: string, actual: number, target: number, maxPoints: number, subObj: Record<string, { sales: number; qty: number }>): LOBMetric => {
    const ach = Math.round((actual / target) * 100);
    const variance = actual - target;
    const estAmount = Math.round(actual / timeFraction);
    const estPercent = Math.round((estAmount / target) * 100);
    const pts = +(Math.min(actual / target, 1.0) * maxPoints).toFixed(1);

    const subCategories = Object.entries(subObj).slice(0, 5).map(([subName, v]) => ({
      name: subName,
      actual: v.sales,
      target: Math.round(v.sales * 1.1),
      quantity: v.qty,
      growthPercent: +(Math.random() * 20 - 5).toFixed(1)
    }));

    return {
      id,
      name,
      actual,
      target,
      achievementPercent: ach,
      estAmount,
      estPercent,
      pointsEarned: pts,
      maxPoints,
      variance,
      isPositive: variance >= 0,
      subCategories
    };
  };

  const lobApple = buildLob('apple', 'APPLE', lobs.apple.actual, lobs.apple.target, 30, subCategoryApple);
  const lobAndroid = buildLob('android', 'ANDROID', lobs.android.actual, lobs.android.target, 30, subCategoryAndroid);
  const lobAccessories = buildLob('accessories', 'ACCESSORIES', lobs.accessories.actual, lobs.accessories.target, 30, subCategoryAcc);
  const lobVas = buildLob('vas', 'VAS', lobs.vas.actual, lobs.vas.target, 10, subCategoryVas);

  const totalPoints = +(lobApple.pointsEarned + lobAndroid.pointsEarned + lobAccessories.pointsEarned + lobVas.pointsEarned).toFixed(1);

  // Staff List
  const avatarPool = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80'
  ];

  const staffList: StaffPerformance[] = Object.entries(staffMap)
    .filter(([name]) => !name.toLowerCase().includes('digiplus') && !name.toLowerCase().includes('mapmall'))
    .sort((a, b) => b[1].sales - a[1].sales)
    .map(([name, s], idx) => {
      const targetSales = 350000000; // Rp 350jt per staff
      const ach = Math.round((s.sales / targetSales) * 100);
      const trxCount = s.trx.size || 1;
      const upt = +(s.units / trxCount).toFixed(2);
      const atv = Math.round(s.sales / trxCount);
      const isProductive = ach >= 80 || s.sales >= 300000000;
      const pts = +(Math.min(ach, 150) * 0.7).toFixed(1);

      return {
        id: s.id,
        name,
        role: idx === 0 ? 'Senior Sales Specialist' : idx <= 2 ? 'Sales Executive' : 'Sales Specialist',
        actualSales: s.sales,
        targetSales,
        achievementPercent: ach,
        transactions: trxCount,
        upt,
        atv,
        status: isProductive ? 'Productive' : 'Need Push',
        points: pts,
        avatar: avatarPool[idx % avatarPool.length],
        appleSales: s.apple,
        androidSales: s.android,
        accSales: s.acc,
        vasSales: s.vas
      };
    });

  const productiveCount = staffList.filter((s) => s.status === 'Productive').length;
  const needPushCount = staffList.length - productiveCount;
  const totalTrx = storeInvoices.size;
  const totalUnits = rawRows.reduce((a, b) => a + b.qty, 0);
  const avgUpt = totalTrx > 0 ? +(totalUnits / totalTrx).toFixed(2) : 1.5;
  const avgAtv = totalTrx > 0 ? Math.round(totalSales / totalTrx) : 17933254;

  // Daily Sales List
  const dailySales: DailySalesRecord[] = Object.values(dailyMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => {
      const trxCount = d.trx.size || 1;
      const target = Math.round(totalStoreTarget / 21);
      return {
        date: d.date,
        dayLabel: d.dayLabel,
        actual: d.sales,
        target,
        transactions: trxCount,
        upt: +(d.units / trxCount).toFixed(2),
        atv: Math.round(d.sales / trxCount)
      };
    });

  // Stock items from top products
  const stockItems: StockItem[] = Object.values(topProducts).slice(0, 15).map((p, idx) => ({
    sku: p.sku,
    name: p.name,
    category: p.category,
    soh: Math.max(20 - p.units, 2),
    intransit: idx % 2 === 0 ? 10 : 0,
    unitPrice: p.price,
    status: (20 - p.units) <= 3 ? 'Critical' : (20 - p.units) <= 6 ? 'Low Stock' : 'In Stock'
  }));

  const overviewData: StoreOverviewData = {
    storeCode: 'QF01',
    storeName: 'Digiplus QF01 - YOUR GOALS',
    period: 'Oktober 2026',
    cutoffDate: '21/10',
    timeGonePercent: 67.7,
    totalSales,
    totalTarget: totalStoreTarget,
    totalAchievementPercent,
    totalEstAmount,
    totalEstPercent,
    totalPointsEarned: totalPoints,
    totalMaxPoints: 100,
    totalVariance,
    lobs: {
      apple: lobApple,
      android: lobAndroid,
      accessories: lobAccessories,
      vas: lobVas
    },
    teamSummary: {
      totalStaff: staffList.length,
      productive: productiveCount,
      needPush: needPushCount,
      totalTransactions: totalTrx,
      avgUpt,
      avgAtv
    },
    staffList,
    dailySales,
    stockItems
  };

  return { data: overviewData, rawRows };
}
