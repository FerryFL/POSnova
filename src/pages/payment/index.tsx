import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Button } from "~/components/ui/button"
import { useCartStore } from "~/store/cart"
import { api } from "~/utils/api"
import { toast } from "sonner"
import type { ReactElement } from "react"
import { HandCoins, ShoppingCart } from "lucide-react"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { useUserStore } from "~/store/user"
import calculateTax from "~/utils/tax"

export const PaymentPage: NextPageWithLayout = () => {

    const { items, jumlahProduk, totalProduk, clearCart } = useCartStore()
    const { profile } = useUserStore()
    const tambahTransaksi = api.transaksi.tambahTransaksi.useMutation()

    const pajak = 11
    const { grandTotal, pajakNominal } = calculateTax(totalProduk, pajak)

    const handleBayar = () => {
        tambahTransaksi.mutate(
            {
                items: items.map((item) => ({
                    produkId: item.id,
                    jumlah: item.jumlah,
                    hargaSatuan: item.harga,
                    hargaTotal: item.harga * item.jumlah,
                    varianId: item.varianId,
                    varianNama: item.varianNama,
                })),
                totalProduk: jumlahProduk,
                totalHarga: totalProduk,
                pajakPersen: pajak,
                pajakNominal: pajakNominal,
                grandTotal: grandTotal,
                umkmId: profile?.UMKM?.id ?? "",
                createdBy: `${profile?.name} - ${profile?.email}`
            },
            {
                onSuccess: () => {
                    clearCart();
                    toast.success("Transaksi berhasil!");
                },
            }
        );
    };

    return (
        <div className="space-y-4 max-w-[500px] mx-auto">
            <Card className="p-4 gap-2">
                <div className="flex gap-2">
                    <ShoppingCart />
                    <h1 className="text-xl font-bold">Halaman Pembayaran</h1>
                </div>
                <p className="text-gray-500 text-sm">Konfirmasi pesanan sebelum melanjutkan pembayaran</p>
            </Card>

            <Card className="p-4 gap-4">
                <div className="flex justify-between">
                    <h1 className="text-lg font-semibold">Pesanan Anda</h1>
                    <Badge variant="success">{jumlahProduk} Produk</Badge>
                </div>

                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="rounded-lg bg-secondary px-4 py-3 space-y-1">
                            <div className="flex justify-between">
                                <p className="text-sm">{item.nama}</p>
                                <p className="text-sm">{item.jumlah}x Rp {item.harga.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-sm text-gray-500">{item.varianNama}</p>
                                <p className="text-md font-semibold">Rp {(item.jumlah * item.harga).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-4 gap-4">
                <div className="space-y-4">
                    <h1 className="text-lg font-semibold">Ringkasan Pesanan</h1>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <p className="text-sm ">Total Produk </p>
                            <p className="text-sm ">{jumlahProduk} Produk</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm ">Subtotal </p>
                            <p className="text-sm ">Rp {totalProduk.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm ">Pajak {pajak}% </p>
                            <p className="text-sm ">Rp {pajakNominal.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-base">Total Harga </p>
                        <p className="text-base font-semibold">Rp {grandTotal.toLocaleString()}</p>
                    </div>
                </div>
            </Card>

            <div className="space-y-2">
                <Button disabled={items.length === 0} onClick={handleBayar} className="w-full">
                    <HandCoins />
                    Bayar Sekarang
                </Button>

                <Button variant="destructive" onClick={clearCart} className="w-full">
                    Hapus Keranjang
                </Button>
            </div>
        </div>
    )
}

PaymentPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default PaymentPage