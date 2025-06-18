import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import type { NextPageWithLayout } from "../_app"

export const DashboardPage: NextPageWithLayout = () => {
    return (
        <h1 className="text-xl font-bold">Halaman Dashboard</h1>
    )
}

DashboardPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default DashboardPage
