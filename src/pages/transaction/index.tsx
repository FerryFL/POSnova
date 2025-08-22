import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { api } from "~/utils/api"
import type { NextPageWithLayout } from "../_app"
import { DataTable } from "../../components/shared/data-table"
import { columns } from "./columns"

export const TransactionPage: NextPageWithLayout = () => {
    const lihatTransaksi = api.transaksi.lihatTransaksi.useQuery()

    return (
        <div>
            <DataTable columns={columns} data={lihatTransaksi.data ?? []} />
        </div>
    )
}

TransactionPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default TransactionPage