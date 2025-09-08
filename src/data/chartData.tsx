// UMKM Sales data for dashboard (30 days)
// Data penjualan harian untuk UMKM Indonesia
export const salesData = [
  { date: "2024-06-01", totalTransactions: 48, totalRevenue: 2850000 },
  { date: "2024-06-02", totalTransactions: 65, totalRevenue: 3920000 },
  { date: "2024-06-03", totalTransactions: 52, totalRevenue: 3180000 },
  { date: "2024-06-04", totalTransactions: 78, totalRevenue: 4650000 },
  { date: "2024-06-05", totalTransactions: 41, totalRevenue: 2480000 },
  { date: "2024-06-06", totalTransactions: 69, totalRevenue: 4120000 },
  { date: "2024-06-07", totalTransactions: 73, totalRevenue: 4380000 },
  { date: "2024-06-08", totalTransactions: 58, totalRevenue: 3470000 },
  { date: "2024-06-09", totalTransactions: 85, totalRevenue: 5100000 },
  { date: "2024-06-10", totalTransactions: 44, totalRevenue: 2640000 },
  { date: "2024-06-11", totalTransactions: 37, totalRevenue: 2220000 },
  { date: "2024-06-12", totalTransactions: 92, totalRevenue: 5520000 },
  { date: "2024-06-13", totalTransactions: 46, totalRevenue: 2760000 },
  { date: "2024-06-14", totalTransactions: 71, totalRevenue: 4260000 },
  { date: "2024-06-15", totalTransactions: 63, totalRevenue: 3780000 },
  { date: "2024-06-16", totalTransactions: 67, totalRevenue: 4020000 },
  { date: "2024-06-17", totalTransactions: 89, totalRevenue: 5340000 },
  { date: "2024-06-18", totalTransactions: 49, totalRevenue: 2940000 },
  { date: "2024-06-19", totalTransactions: 72, totalRevenue: 4320000 },
  { date: "2024-06-20", totalTransactions: 81, totalRevenue: 4860000 },
  { date: "2024-06-21", totalTransactions: 55, totalRevenue: 3300000 },
  { date: "2024-06-22", totalTransactions: 68, totalRevenue: 4080000 },
  { date: "2024-06-23", totalTransactions: 94, totalRevenue: 5640000 },
  { date: "2024-06-24", totalTransactions: 51, totalRevenue: 3060000 },
  { date: "2024-06-25", totalTransactions: 56, totalRevenue: 3360000 },
  { date: "2024-06-26", totalTransactions: 76, totalRevenue: 4560000 },
  { date: "2024-06-27", totalTransactions: 83, totalRevenue: 4980000 },
  { date: "2024-06-28", totalTransactions: 59, totalRevenue: 3540000 },
  { date: "2024-06-29", totalTransactions: 47, totalRevenue: 2820000 },
  { date: "2024-06-30", totalTransactions: 88, totalRevenue: 5280000 },
]

export type SalesDataItem = {
  date: string
  totalTransactions: number
  totalRevenue: number
}

// Helper function to format Indonesian Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}