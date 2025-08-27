import { Pencil, Trash } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import type { Kategori } from "~/utils/api"

interface CategoryCardsProps {
    kategori?: Kategori[]
    handleEdit: (data: { id: string, nama: string, status: boolean, UMKMId: string }) => void
    handleDelete: (id: string) => void
}

const CategoryCards = (props: CategoryCardsProps) => {
    const { kategori, handleEdit, handleDelete } = props

    return (
        kategori?.map((item) => {
            return (
                <Card key={item.id} className="">
                    <CardHeader>
                        <Badge variant={item.status ? "success" : "destructive"}>{item.status ? "Aktif" : "Inaktif"}</Badge>
                        <CardTitle className="line-clamp-1 break-words">{item.nama}</CardTitle>

                    </CardHeader>
                    <CardFooter className="gap-2">
                        <Button className="flex-1" variant="secondary" size="icon" onClick={() => handleEdit({ id: item.id, nama: item.nama, status: item.status, UMKMId: item.UMKM?.id ?? "" })}>
                            <Pencil />
                        </Button>
                        <Button className="flex-1" variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash />
                        </Button>
                    </CardFooter>
                </Card>
            )
        })
    )
}

export default CategoryCards