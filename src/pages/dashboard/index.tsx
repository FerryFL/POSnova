import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { SalesChart } from "~/components/SalesChart"
import type { NextPageWithLayout } from "../_app"
import { api } from "~/utils/api"
import { useUserStore } from "~/store/user"
import { useMemo } from "react"
import { Plus, ReceiptText, UserCheck } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useRouter } from "next/router"
import dayjs from "dayjs"

// method buat ngitung persentase
const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
}

export const DashboardPage: NextPageWithLayout = () => {
    const { profile } = useUserStore()
    const router = useRouter()

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

        const now = dayjs()
        const lastMonth = now.subtract(1, "month")

        // filter transaksi bulan ini
        const currentMonthTransactions = lihatTransaksi.data.filter(t => dayjs(t.tanggalTransaksi).isSame(dayjs(), "month"))

        // filter transaksi bulan lalu
        const lastMonthTransactions = lihatTransaksi.data.filter(t => dayjs(t.tanggalTransaksi).isSame(lastMonth, "month"))

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
            .sort((a, b) => dayjs(b.tanggalTransaksi).valueOf() - dayjs(a.tanggalTransaksi).valueOf())
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
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard UMKM</h1>
                    <p className="text-muted-foreground">Selamat datang di POSnova - Sistem Kasir untuk UMKM Indonesia</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4">
                <div className="grow rounded-lg border bg-card p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Total Omzet</h3>
                        <Plus className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">Rp {(dashboardStats.totalOmzet).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardStats.monthlyChange.omzet >= 0 ? '+' : ''}{dashboardStats.monthlyChange.omzet.toFixed(1)}% dari bulan lalu
                        </p>
                    </div>
                </div>

                <div className="grow rounded-lg border bg-card p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Total Transaksi</h3>
                        <ReceiptText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{dashboardStats.totalTransaksi}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardStats.monthlyChange.transaksi >= 0 ? '+' : ''}{dashboardStats.monthlyChange.transaksi.toFixed(1)}% dari bulan lalu
                        </p>
                    </div>
                </div>

                <div className="grow rounded-lg border bg-card p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Rata-rata Transaksi</h3>
                        <UserCheck className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">Rp {(dashboardStats.rataRataTransaksi).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {dashboardStats.monthlyChange.average >= 0 ? '+' : ''}{dashboardStats.monthlyChange.average.toFixed(1)}% dari bulan lalu
                        </p>
                    </div>
                </div>
            </div>

            {/* Sales Chart */}
            <SalesChart transaksiData={lihatTransaksi.data ?? []} />

            {/* Recent Activity Section */}
            <div className="flex flex-wrap gap-4">
                <div className="grow rounded-lg border bg-card p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
                        <p className="text-sm text-muted-foreground">Transaksi terbaru dari sistem kasir Anda</p>
                    </div>
                    <div className="space-y-4">
                        {dashboardStats.recentTransactions.length > 0 ? (
                            dashboardStats.recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-start md:items-center justify-between flex-col md:flex-row ml-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Transaksi #{transaction.id.toUpperCase()}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {transaction.totalProduk} item • {transaction.transaksiItem.map(item => item.produk.nama).join(', ')}
                                        </p>
                                    </div>
                                    <div className="font-medium">Rp {(transaction.totalHarga).toLocaleString()}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Belum ada transaksi</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grow rounded-lg border bg-card p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Aksi Cepat</h3>
                        <p className="text-sm text-muted-foreground">Fitur yang sering digunakan</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => router.push('/transaction')}>Lihat Transaksi</Button>
                        <Button className="bg-background hover:bg-accent text-foreground" onClick={() => router.push('/dashboard-cashier')}>Transaksi Baru</Button>
                        <Button className="bg-background hover:bg-accent text-foreground" onClick={() => router.push('/transaction')}>Laporan Bulanan</Button>
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