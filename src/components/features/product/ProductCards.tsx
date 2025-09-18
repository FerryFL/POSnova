import { Pencil, Tags, Trash } from "lucide-react"
import Image from "next/image"
import NotFound from "~/components/shared/NotFound"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card"
import type { Produk } from "~/utils/api"

interface ProductCardsProps {
    produk?: Produk[]
    handleEdit: (data: { id: string, nama: string, harga: number, stok: number, status: boolean, categoryId: string, UMKMId: string, varianIds: string[], gambar: string }) => void
    handleDelete: (id: string) => void
}

const ProductCards = (props: ProductCardsProps) => {
    const { produk, handleEdit, handleDelete } = props

    return (
        produk && produk.length > 0 ? produk.map((item) => {
            return (
                <Card key={item.id} className="pt-0 gap-2 justify-between">
                    <CardHeader className="p-0">
                        <div className="relative h-40 w-full overflow-hidden">
                            {item.gambar ? (
                                <Image src={item.gambar} alt={item.nama} fill unoptimized className="rounded-t-lg object-cover" />
                            ) : (
                                <div className="bg-muted flex h-full w-full items-center justify-center">
                                    No image
                                </div>
                            )}
                        </div>

                    </CardHeader>
                    <CardContent className="flex flex-col gap-2.5 h-full">

                        <div className="flex justify-between">
                            <Badge variant={item.status ? "success" : "destructive"}>{item.status ? "Aktif" : "Inaktif"}</Badge>
                            <p className="text-sm text-destructive">{item.stok} Tersisa</p>
                        </div>
                        <div className="text-lg font-medium w-full ">
                            <span className="line-clamp-1 break-words font-bold">{item.nama}</span>
                            <span className="text-sm flex gap-1 items-center text-muted-foreground line-clamp-1 break-words">
                                <Tags className="size-4 shrink-0" />
                                {item.kategori.nama}
                            </span>
                            <p className="text-lg font-bold text-green-700">Rp {item.harga.toLocaleString()}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap grow h-fit">
                            {
                                item.ProdukVarian.map((varian) =>
                                    <Badge key={varian.varian.id} variant="outline" className="h-6 font-semibold max-w-full">
                                        <span className="line-clamp-1 break-words">{varian.varian.nama}</span>
                                    </Badge>
                                )
                            }
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button className="flex-1" variant="secondary" size="icon" onClick={() => handleEdit(
                            {
                                id: item.id,
                                nama: item.nama,
                                harga: item.harga,
                                stok: item.stok,
                                status: item.status,
                                categoryId: item.kategori.id,
                                UMKMId: item.UMKM?.id ?? "",
                                varianIds: item.ProdukVarian.map((pv) => pv.varian.id),
                                gambar: item.gambar
                            }
                        )}>
                            <Pencil />
                        </Button>
                        <Button className="flex-1" variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash />
                        </Button>
                    </CardFooter>
                </Card>
            )
        }) : (
            <NotFound>Produk</NotFound>
        )
    )
}

export default ProductCards