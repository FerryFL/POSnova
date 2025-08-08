import type { ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Button } from "~/components/ui/button"

export const PaymentPage: NextPageWithLayout = () => {
    return (
        <div>
            <h1 className="text-xl font-bold">Halaman Pembayaran</h1>
            <Button>Bayar</Button>
        </div>
    )
}

PaymentPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default PaymentPage