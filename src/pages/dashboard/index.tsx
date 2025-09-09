import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { SalesChart } from "~/components/SalesChart"
import type { NextPageWithLayout } from "../_app"
import { api } from "~/utils/api"
import { useUserStore } from "~/store/user"
import { useMemo } from "react"

// format Rupiah
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// method buat ngitung persentase
const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
}

export const DashboardPage: NextPageWithLayout = () => {
    const { profile } = useUserStore()

    const lihatTransaksi = api.transaksi.lihatTransaksi.useQuery(
        { umkmId: profile?.UMKM?.id ?? "" },
        {
            enabled: !!profile?.UMKM?.id
        }
    )

    // Hitung statistik dashboard
    const dashboardStats = useMemo(() => {
        if (!lihatTransaksi.data?.length) {
            return {
                totalOmzet: 0,
                totalTransaksi: 0,
                rataRataTransaksi: 0,
                recentTransactions: [],
                monthlyChange: {
                    omzet: 0,
                    transaksi: 0,
                    average: 0
                }
            }
        }

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

        // filter transaksi bulan ini
        const currentMonthTransactions = lihatTransaksi.data.filter(t => {
            const transactionDate = new Date(t.tanggalTransaksi)
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear
        })

        // filter transaksi bulan lalu
        const lastMonthTransactions = lihatTransaksi.data.filter(t => {
            const transactionDate = new Date(t.tanggalTransaksi)
            return transactionDate.getMonth() === lastMonth && 
                   transactionDate.getFullYear() === lastMonthYear
        })

        // data bulan ini (omzet, bnyk transaksi, rata2 transaksi)
        const currentMonthOmzet = currentMonthTransactions.reduce((sum, t) => sum + t.totalHarga, 0)
        const currentMonthCount = currentMonthTransactions.length
        const currentMonthAverage = currentMonthCount > 0 ? currentMonthOmzet / currentMonthCount : 0

        // data bulan lalu (omzet, bnyk transaksi, rata2 transaksi)
        const lastMonthOmzet = lastMonthTransactions.reduce((sum, t) => sum + t.totalHarga, 0)
        const lastMonthCount = lastMonthTransactions.length
        const lastMonthAverage = lastMonthCount > 0 ? lastMonthOmzet / lastMonthCount : 0

        // last 4 transaksi
        const recentTransactions = [...lihatTransaksi.data]
            .sort((a, b) => new Date(b.tanggalTransaksi).getTime() - new Date(a.tanggalTransaksi).getTime())
            .slice(0, 4)

        return {
            totalOmzet: currentMonthOmzet,
            totalTransaksi: currentMonthCount,
            rataRataTransaksi: currentMonthAverage,
            recentTransactions,
            monthlyChange: {
                omzet: calculatePercentageChange(currentMonthOmzet, lastMonthOmzet),
                transaksi: calculatePercentageChange(currentMonthCount, lastMonthCount),
                average: calculatePercentageChange(currentMonthAverage, lastMonthAverage)
            }
        }
    }, [lihatTransaksi.data])

    return (
        <div className="space-y-6 p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard UMKM</h1>
                    <p className="text-muted-foreground">
                        Selamat datang di POSnova - Sistem Kasir untuk UMKM Indonesia
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Omzet</h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20m9-9H3" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold">{formatRupiah(dashboardStats.totalOmzet)}</div>
                    <p className="text-xs text-muted-foreground">
                        {dashboardStats.monthlyChange.omzet >= 0 ? '+' : ''}{dashboardStats.monthlyChange.omzet.toFixed(1)}% dari bulan lalu
                    </p>
                </div>
                
                <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Transaksi</h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold">{dashboardStats.totalTransaksi.toLocaleString('id-ID')}</div>
                    <p className="text-xs text-muted-foreground">
                        {dashboardStats.monthlyChange.transaksi >= 0 ? '+' : ''}{dashboardStats.monthlyChange.transaksi.toFixed(1)}% dari bulan lalu
                    </p>
                </div>
                
                <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Rata-rata Transaksi</h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="m22 2-5 10-5-5-5 10" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold">{formatRupiah(dashboardStats.rataRataTransaksi)}</div>
                    <p className="text-xs text-muted-foreground">
                        {dashboardStats.monthlyChange.average >= 0 ? '+' : ''}{dashboardStats.monthlyChange.average.toFixed(1)}% dari bulan lalu
                    </p>
                </div>
            </div>

            {/* Sales Chart */}
            <SalesChart transaksiData={lihatTransaksi.data ?? []} />

            {/* Recent Activity Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
                            <p className="text-sm text-muted-foreground">
                                Transaksi terbaru dari sistem kasir Anda
                            </p>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="space-y-4">
                                {dashboardStats.recentTransactions.length > 0 ? (
                                    dashboardStats.recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    Transaksi #{transaction.id.toUpperCase()}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.totalProduk} item • {transaction.transaksiItem.map(item => item.produk.nama).join(', ')}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">{formatRupiah(transaction.totalHarga)}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Belum ada transaksi</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-span-3">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold">Aksi Cepat</h3>
                            <p className="text-sm text-muted-foreground">
                                Fitur yang sering digunakan
                            </p>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="space-y-3">
                                <button 
                                    onClick={() => window.location.href = '/transaction'}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full cursor-pointer"
                                >
                                    Lihat Transaksi
                                </button>
                                <button 
                                    onClick={() => window.location.href = '/dashboard-cashier'}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full cursor-pointer"
                                >
                                    Transaksi Baru
                                </button>
                                <button 
                                    onClick={() => window.location.href = '/transaction'}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full cursor-pointer"
                                >
                                    Laporan Bulanan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

DashboardPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default DashboardPage