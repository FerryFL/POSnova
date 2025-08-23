import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Button } from "~/components/ui/button"
import { useCartStore } from "~/store/cart"
import { api } from "~/utils/api"
import { toast } from "sonner"
import type { ReactElement } from "react"

export const PaymentPage: NextPageWithLayout = () => {

    const { items, jumlahProduk, totalProduk, clearCart } = useCartStore()
    const tambahTransaksi = api.transaksi.tambahTransaksi.useMutation()

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
        <div>
            <h1 className="text-xl font-bold">Halaman Pembayaran</h1>
            <ul className="mb-4">
                {items.map((item) => (
                    <li key={`${item.id}-${item.varianId ?? "no-varian"}`}>
                        {item.nama} | {item.varianNama}— {item.jumlah} x {item.harga}
                    </li>
                ))}
            </ul>

            <p>Total Produk: {jumlahProduk}</p>
            <p>Total Harga: Rp {totalProduk}</p>
            <Button disabled={items.length === 0} onClick={handleBayar}>Bayar</Button>
        </div>
    )
}

PaymentPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default PaymentPage