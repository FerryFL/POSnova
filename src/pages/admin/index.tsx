import type { ReactElement } from "react"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Button } from "~/components/ui/button"
import { api } from "~/utils/api"

const AdminPage = () => {
    const { data, refetch } = api.rekomendasi.checkHealth.useQuery(undefined, { enabled: false })

    const handleClickHealth = () => {
        void refetch()
        console.log(data)
        alert(data?.status)
    }

    return (
        <Button onClick={handleClickHealth}> Check Health</Button>
    )
}

AdminPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default AdminPage