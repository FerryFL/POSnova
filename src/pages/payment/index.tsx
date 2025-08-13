import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Button } from "~/components/ui/button"
import { useCartStore } from "~/store/cart"

export const PaymentPage: NextPageWithLayout = () => {

    const { items, jumlahProduk, totalProduk } = useCartStore()

    return (
        <div>
            <h1 className="text-xl font-bold">Halaman Pembayaran</h1>
            <ul className="mb-4">
                {items.map((item, index) => (
                    <li key={index}>
                        {item.nama} | {item.varianNama}— {item.jumlah} x {item.harga}
                    </li>
                ))}
            </ul>

            <p>Total Produk: {jumlahProduk}</p>
            <p>Total Harga: Rp {totalProduk}</p>
            <Button>Bayar</Button>
        </div>
    )
}

PaymentPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default PaymentPage