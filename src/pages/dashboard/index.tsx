import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { SalesChart } from "~/components/SalesChart"
import type { NextPageWithLayout } from "../_app"

export const DashboardPage: NextPageWithLayout = () => {
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
                    <div className="text-2xl font-bold">Rp 87.450.000</div>
                    <p className="text-xs text-muted-foreground">
                        +15.2% dari bulan lalu
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
                    <div className="text-2xl font-bold">1,847</div>
                    <p className="text-xs text-muted-foreground">
                        +12.3% dari bulan lalu
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
                    <div className="text-2xl font-bold">Rp 47.350</div>
                    <p className="text-xs text-muted-foreground">
                        +2.8% dari bulan lalu
                    </p>
                </div>
            </div>

            {/* Sales Chart */}
            <SalesChart />

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
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Transaksi #TR001234
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            3 item • Nasi Gudeg + Es Teh
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">Rp 45.000</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Transaksi #TR001235
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            1 item • Kopi Tubruk
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">Rp 12.000</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Transaksi #TR001236
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            5 item • Paket Nasi + Lauk
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">Rp 85.000</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Transaksi #TR001237
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            2 item • Gado-gado + Jus Jeruk
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">Rp 32.000</div>
                                </div>
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
                            <div className="space-y-2">
                                <button 
                                    onClick={() => window.location.href = '/dashboard-cashier'}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                                >
                                    Transaksi Baru
                                </button>
                                <button 
                                    onClick={() => window.location.href = '/product'}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                                >
                                    Tambah Produk
                                </button>
                                <button 
                                    onClick={() => window.location.href = '/category'}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                                >
                                    Tambah Kategori
                                </button>
                                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                                    Laporan Harian
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