import { StoreOverviewData } from '../types/dashboard';

export const INITIAL_DASHBOARD_DATA: StoreOverviewData = {
  storeCode: 'QF10',
  storeName: 'Digiplus Kota Kasablanka',
  period: 'Oktober 2026',
  cutoffDate: '21/10',
  timeGonePercent: 67.7,

  // Total Sales from Screenshot
  totalSales: 7543088015,
  totalTarget: 6876812958,
  totalAchievementPercent: 110,
  totalEstAmount: 11135034689,
  totalEstPercent: 162,
  totalPointsEarned: 66.5,
  totalMaxPoints: 100,
  totalVariance: 666275057,

  lobs: {
    apple: {
      id: 'apple',
      name: 'APPLE',
      actual: 6650295035,
      target: 4707668457,
      achievementPercent: 141,
      estAmount: 9817102195,
      estPercent: 209,
      pointsEarned: 30,
      maxPoints: 30,
      variance: 1942626578,
      isPositive: true,
      subCategories: [
        { name: 'iPhone 16 Pro / Pro Max', actual: 3840120000, target: 2600000000, quantity: 168, growthPercent: 47.7 },
        { name: 'iPhone 16 / 16 Plus', actual: 1450200000, target: 1100000000, quantity: 89, growthPercent: 31.8 },
        { name: 'iPad & iPad Air / Pro', actual: 680450000, target: 550000000, quantity: 44, growthPercent: 23.7 },
        { name: 'MacBook Air & Pro', actual: 420500035, target: 300000000, quantity: 18, growthPercent: 40.2 },
        { name: 'Apple Watch & AirPods', actual: 259025000, target: 157668457, quantity: 72, growthPercent: 64.3 }
      ]
    },
    android: {
      id: 'android',
      name: 'ANDROID',
      actual: 633979010,
      target: 1501496255,
      achievementPercent: 42,
      estAmount: 935873777,
      estPercent: 62,
      pointsEarned: 13.1,
      maxPoints: 30,
      variance: -867517245,
      isPositive: false,
      subCategories: [
        { name: 'Samsung Flagship (S24 / Fold / Flip)', actual: 312000000, target: 750000000, quantity: 22, growthPercent: -58.4 },
        { name: 'Samsung Mid-Range (A Series)', actual: 184500000, target: 420000000, quantity: 45, growthPercent: -56.1 },
        { name: 'Xiaomi & Redmi', actual: 82479010, target: 200000000, quantity: 28, growthPercent: -58.8 },
        { name: 'Vivo & Oppo', actual: 55000000, target: 131496255, quantity: 19, growthPercent: -58.2 }
      ]
    },
    accessories: {
      id: 'accessories',
      name: 'ACCESSORIES',
      actual: 181653970,
      target: 360549883,
      achievementPercent: 50,
      estAmount: 268155860,
      estPercent: 74,
      pointsEarned: 15.6,
      maxPoints: 30,
      variance: -178895913,
      isPositive: false,
      subCategories: [
        { name: 'Apple Genuine Accessories', actual: 82400000, target: 150000000, quantity: 134, growthPercent: -45.1 },
        { name: '3PP Premium Audio (Marshall, JBL)', actual: 44250000, target: 95000000, quantity: 26, growthPercent: -53.4 },
        { name: 'Cases & Screen Protectors', actual: 36500000, target: 70000000, quantity: 112, growthPercent: -47.9 },
        { name: 'Power & Cables (Anker, Momax)', actual: 18503970, target: 45549883, quantity: 64, growthPercent: -59.4 }
      ]
    },
    vas: {
      id: 'vas',
      name: 'VAS',
      actual: 77160000,
      target: 307098363,
      achievementPercent: 25,
      estAmount: 113902857,
      estPercent: 37,
      pointsEarned: 7.8,
      maxPoints: 10,
      variance: -229938363,
      isPositive: false,
      subCategories: [
        { name: 'AppleCare+ Protection Plan', actual: 42800000, target: 160000000, quantity: 24, growthPercent: -73.3 },
        { name: 'TecProtec / DigiCare Device Insurance', actual: 24100000, target: 97000000, quantity: 38, growthPercent: -75.2 },
        { name: 'Extended Warranty & Setup Service', actual: 10260000, target: 50098363, quantity: 19, growthPercent: -79.5 }
      ]
    }
  },

  // Team summary from Screenshot
  teamSummary: {
    totalStaff: 6,
    productive: 1,
    needPush: 5,
    totalTransactions: 449,
    avgUpt: 1.5,
    avgAtv: 16799751
  },

  staffList: [
    {
      id: 'STF-01',
      name: 'Angga Saputra',
      role: 'Senior Sales Specialist',
      actualSales: 2450300000,
      targetSales: 1600000000,
      achievementPercent: 153.1,
      transactions: 124,
      upt: 1.82,
      atv: 19760483,
      status: 'Productive',
      points: 92.5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      appleSales: 2150000000,
      androidSales: 180300000,
      accSales: 82000000,
      vasSales: 38000000
    },
    {
      id: 'STF-02',
      name: 'Rian Pratama',
      role: 'Sales Executive',
      actualSales: 1380500000,
      targetSales: 1500000000,
      achievementPercent: 92.0,
      transactions: 86,
      upt: 1.48,
      atv: 16052325,
      status: 'Need Push',
      points: 68.0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      appleSales: 1220000000,
      androidSales: 110500000,
      accSales: 36000000,
      vasSales: 14000000
    },
    {
      id: 'STF-03',
      name: 'Siti Nurhaliza',
      role: 'Sales Specialist Apple',
      actualSales: 1290100000,
      targetSales: 1450000000,
      achievementPercent: 88.9,
      transactions: 79,
      upt: 1.42,
      atv: 16330379,
      status: 'Need Push',
      points: 64.5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      appleSales: 1180000000,
      androidSales: 65100000,
      accSales: 31000000,
      vasSales: 14000000
    },
    {
      id: 'STF-04',
      name: 'Dwi Cahyo',
      role: 'Sales Consultant',
      actualSales: 960250000,
      targetSales: 1350000000,
      achievementPercent: 71.1,
      transactions: 62,
      upt: 1.38,
      atv: 15487903,
      status: 'Need Push',
      points: 52.0,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      appleSales: 840000000,
      androidSales: 85250000,
      accSales: 24000000,
      vasSales: 11000000
    },
    {
      id: 'STF-05',
      name: 'Kevin Sanjaya',
      role: 'Junior Sales Associate',
      actualSales: 812400000,
      targetSales: 1250000000,
      achievementPercent: 65.0,
      transactions: 54,
      upt: 1.35,
      atv: 15044444,
      status: 'Need Push',
      points: 48.0,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
      appleSales: 710000000,
      androidSales: 76400000,
      accSales: 18000000,
      vasSales: 8000000
    },
    {
      id: 'STF-06',
      name: 'Bella Putri',
      role: 'Sales Associate',
      actualSales: 649538015,
      targetSales: 1200000000,
      achievementPercent: 54.1,
      transactions: 44,
      upt: 1.32,
      atv: 14762227,
      status: 'Need Push',
      points: 41.5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      appleSales: 550295035,
      androidSales: 66429010,
      accSales: 14653970,
      vasSales: 5160000
    }
  ],

  // 21 Days of October 2026
  dailySales: [
    { date: '2026-10-01', dayLabel: '01/10', actual: 345000000, target: 320000000, transactions: 21, upt: 1.5, atv: 16428571 },
    { date: '2026-10-02', dayLabel: '02/10', actual: 390200000, target: 320000000, transactions: 23, upt: 1.6, atv: 16965217 },
    { date: '2026-10-03', dayLabel: '03/10', actual: 480100000, target: 380000000, transactions: 28, upt: 1.7, atv: 17146428 },
    { date: '2026-10-04', dayLabel: '04/10', actual: 512400000, target: 380000000, transactions: 30, upt: 1.6, atv: 17080000 },
    { date: '2026-10-05', dayLabel: '05/10', actual: 290150000, target: 310000000, transactions: 18, upt: 1.4, atv: 16119444 },
    { date: '2026-10-06', dayLabel: '06/10', actual: 310400000, target: 310000000, transactions: 19, upt: 1.4, atv: 16336842 },
    { date: '2026-10-07', dayLabel: '07/10', actual: 335000000, target: 310000000, transactions: 20, upt: 1.5, atv: 16750000 },
    { date: '2026-10-08', dayLabel: '08/10', actual: 360800000, target: 320000000, transactions: 22, upt: 1.5, atv: 16400000 },
    { date: '2026-10-09', dayLabel: '09/10', actual: 410200000, target: 340000000, transactions: 25, upt: 1.6, atv: 16408000 },
    { date: '2026-10-10', dayLabel: '10/10', actual: 590000000, target: 420000000, transactions: 35, upt: 1.8, atv: 16857142 },
    { date: '2026-10-11', dayLabel: '11/10', actual: 565000000, target: 420000000, transactions: 33, upt: 1.7, atv: 17121212 },
    { date: '2026-10-12', dayLabel: '12/10', actual: 275000000, target: 310000000, transactions: 17, upt: 1.3, atv: 16176470 },
    { date: '2026-10-13', dayLabel: '13/10', actual: 295000000, target: 310000000, transactions: 18, upt: 1.4, atv: 16388888 },
    { date: '2026-10-14', dayLabel: '14/10', actual: 320000000, target: 310000000, transactions: 19, upt: 1.5, atv: 16842105 },
    { date: '2026-10-15', dayLabel: '15/10', actual: 340150000, target: 320000000, transactions: 20, upt: 1.5, atv: 17007500 },
    { date: '2026-10-16', dayLabel: '16/10', actual: 388000000, target: 340000000, transactions: 23, upt: 1.6, atv: 16869565 },
    { date: '2026-10-17', dayLabel: '17/10', actual: 540300000, target: 430000000, transactions: 31, upt: 1.7, atv: 17429032 },
    { date: '2026-10-18', dayLabel: '18/10', actual: 520200000, target: 430000000, transactions: 30, upt: 1.7, atv: 17340000 },
    { date: '2026-10-19', dayLabel: '19/10', actual: 260100000, target: 310000000, transactions: 16, upt: 1.3, atv: 16256250 },
    { date: '2026-10-20', dayLabel: '20/10', actual: 280200000, target: 310000000, transactions: 17, upt: 1.4, atv: 16482352 },
    { date: '2026-10-21', dayLabel: '21/10', actual: 340488015, target: 336812958, transactions: 20, upt: 1.5, atv: 17024400 }
  ],

  stockItems: [
    { sku: 'APP-IP16P-256-NAT', name: 'iPhone 16 Pro 256GB Natural Titanium', category: 'Apple', soh: 14, intransit: 10, unitPrice: 20999000, status: 'In Stock' },
    { sku: 'APP-IP16PM-256-DES', name: 'iPhone 16 Pro Max 256GB Desert Titanium', category: 'Apple', soh: 6, intransit: 15, unitPrice: 24999000, status: 'Low Stock' },
    { sku: 'APP-IP16-128-BLU', name: 'iPhone 16 128GB Ultramarine', category: 'Apple', soh: 18, intransit: 5, unitPrice: 16499000, status: 'In Stock' },
    { sku: 'APP-MBA-M3-256', name: 'MacBook Air 13" M3 8C/8C 256GB Starlight', category: 'Apple', soh: 4, intransit: 2, unitPrice: 18999000, status: 'In Stock' },
    { sku: 'SAM-S24U-512-GRY', name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray', category: 'Android', soh: 3, intransit: 4, unitPrice: 23999000, status: 'Low Stock' },
    { sku: 'SAM-ZF6-256-SLV', name: 'Samsung Galaxy Z Fold 6 256GB Silver Shadow', category: 'Android', soh: 2, intransit: 2, unitPrice: 26499000, status: 'Critical' },
    { sku: 'XIA-14T-256-BLK', name: 'Xiaomi 14T 12/256GB Titan Black', category: 'Android', soh: 9, intransit: 6, unitPrice: 6499000, status: 'In Stock' },
    { sku: 'ACC-AP-PRO2-USB', name: 'AirPods Pro (2nd gen) with MagSafe Case USB-C', category: 'Accessories', soh: 12, intransit: 8, unitPrice: 3899000, status: 'In Stock' },
    { sku: 'ACC-MARSH-E3-BLK', name: 'Marshall Emberton III Bluetooth Speaker Black', category: 'Accessories', soh: 5, intransit: 3, unitPrice: 3199000, status: 'In Stock' },
    { sku: 'ACC-ANK-65W-GAN', name: 'Anker Nano II 65W GaN Charger 3-Port', category: 'Accessories', soh: 24, intransit: 10, unitPrice: 699000, status: 'In Stock' },
    { sku: 'VAS-AC-IP16P-2Y', name: 'AppleCare+ for iPhone 16 Pro (2 Years)', category: 'VAS', soh: 999, intransit: 0, unitPrice: 3299000, status: 'In Stock' },
    { sku: 'VAS-TP-DAM-1Y', name: 'TecProtec Accidental & Liquid Damage 1 Year', category: 'VAS', soh: 999, intransit: 0, unitPrice: 1299000, status: 'In Stock' }
  ]
};
