import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { api } from "~/utils/api"
import type { NextPageWithLayout } from "../_app"

export const TransactionPage: NextPageWithLayout = () => {
    const lihatTransaksi = api.transaksi.lihatTransaksi.useQuery()

    return (
        <div>
            {
                lihatTransaksi.data?.map((item) => (
                    <div key={item.id} className="mb-5">
                        <p>ID: {item.id}</p>
                        <p>Total Produk: {item.totalProduk}</p>
                        <p>Harga Total: {item.totalHarga}</p>

                        <div className="ml-4">
                            {
                                item.transaksiItem.map((detailItem) => (
                                    <div key={item.id}>
                                        <p>{detailItem.jumlah}x {detailItem.produk.nama} | {detailItem.varianNama} = Rp. {detailItem.hargaSatuan}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

TransactionPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default TransactionPage