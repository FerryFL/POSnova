import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { api } from "~/utils/api"
import type { NextPageWithLayout } from "../_app"
import { DataTable } from "../../components/shared/data-table"
import { columns } from "./_providers/columns"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/router"
import { useUserStore } from "~/store/user"

export const TransactionPage: NextPageWithLayout = () => {

    const router = useRouter()
    const { profile } = useUserStore()

    const handleNavigate = () => {
        void router.push("/dashboard-cashier")
    }

    const lihatTransaksi = api.transaksi.lihatTransaksi.useQuery(
        { umkmId: profile?.UMKM?.id ?? "" },
        {
            enabled: !!profile?.UMKM?.id
        }
    )

    return (
        <div className="space-y-4 w-full">
            <h1 className="text-xl font-bold">Manajemen Transaksi</h1>
            <Button variant="outline" onClick={handleNavigate}><Plus />Tambah Transaksi</Button>
            <Card className="p-4">
                <h1>Data Transaksi</h1>
                <DataTable columns={columns} data={lihatTransaksi.data ?? []} />
            </Card>
        </div>
    )
}

TransactionPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default TransactionPage