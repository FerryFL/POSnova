import { useEffect, useState, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card"
import { api } from "~/utils/api"
import { Skeleton } from "~/components/ui/skeleton"
import { Button } from "~/components/ui/button"
import { LoaderCircle, Pencil, Plus, Trash } from "lucide-react"
import Image from "next/image"
import { Badge } from "~/components/ui/badge"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { productFormSchema, type ProductFormSchema } from "~/forms/product"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProductForm } from "~/components/shared/product/ProductForm"
import { toast } from "sonner"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"


export const ProductPage: NextPageWithLayout = () => {
    const apiUtils = api.useUtils()
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [imgUrl, setImgUrl] = useState<string | null>(null)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const addForm = useForm<ProductFormSchema>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            status: false
        }
    })

    const editForm = useForm<ProductFormSchema>({
        resolver: zodResolver(productFormSchema),
    })

    const { data: produkData, isLoading: produkIsLoading } = api.produk.lihatProduk.useQuery({})
    const { mutate: tambahProduk, isPending: tambahProdukIsPending } = api.produk.tambahProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            toast.success("Data Berhasil Ditambahkan!")
            addForm.reset()
            setAddOpen(false)
            setImgUrl(null)
        }
    })

    const { mutate: ubahProduk, isPending: ubahProdukIsPending } = api.produk.ubahProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            toast.success("Data Berhasil Diubah!")
            editForm.reset()
            setEditOpen(false)
            setImgUrl(null)
        }
    })

    const { mutate: hapusProduk, isPending: hapusProdukIsPending } = api.produk.hapusProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            setIdToDelete(null)
            toast.success("Produk Berhasil Dihapus!")
        }
    })

    const handleSubmit = (data: ProductFormSchema) => {
        if (!imgUrl) {
            toast.error("Masukan Gambar Produk!")
            return
        }

        tambahProduk({
            nama: data.nama,
            harga: data.harga,
            stok: data.stok,
            status: data.status,
            categoryId: data.categoryId,
            gambar: imgUrl
        })
    }

    const handleEdit = (data: { id: string, nama: string, harga: number, stok: number, status: boolean, categoryId: string, gambar: string }) => {
        setEditOpen(true)
        setIdToEdit(data.id)
        setImgUrl(data.gambar)
        editForm.reset({
            nama: data.nama,
            harga: data.harga,
            stok: data.stok,
            status: data.status,
            categoryId: data.categoryId,
        })
    }

    const handleSubmitEdit = (data: ProductFormSchema) => {
        if (!idToEdit) return

        if (!imgUrl) {
            toast.error("Masukan Gambar Produk!")
            return
        }

        ubahProduk({
            id: idToEdit,
            nama: data.nama,
            harga: data.harga,
            stok: data.stok,
            status: data.status,
            categoryId: data.categoryId,
            gambar: imgUrl
        })
    }

    const handleDelete = (id: string) => {
        setIdToDelete(id)
    }

    const handleSubmitDelete = () => {
        if (!idToDelete) return

        hapusProduk({
            id: idToDelete
        })
    }

    useEffect(() => {
        if (!addOpen) {
            addForm.reset()
        }
    }, [addOpen, addForm])

    return (
        <div className="space-y-4 w-full">
            <h1 className="text-xl font-bold">Manajemen Produk</h1>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Plus />Tambah Produk</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Tambah Produk</DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                        <ProductForm onSubmit={handleSubmit} onChangeImage={(url) => { setImgUrl(url) }} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button type="submit" onClick={addForm.handleSubmit(handleSubmit)}>
                            {tambahProdukIsPending && <LoaderCircle className="animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Ubah Produk</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <ProductForm onSubmit={handleSubmitEdit} onChangeImage={(url) => { setImgUrl(url) }} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button type="submit" onClick={editForm.handleSubmit(handleSubmitEdit)}>
                            {ubahProdukIsPending && <LoaderCircle className="animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={!!idToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setIdToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>Apakah yakin anda akan menghapus produk ini? </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tutup</AlertDialogCancel>
                        <Button disabled={hapusProdukIsPending} variant="destructive" onClick={handleSubmitDelete}>
                            {hapusProdukIsPending && <LoaderCircle className="animate-spin" />}
                            Hapus
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {
                    produkIsLoading ?
                        Array.from({ length: 20 }, (_, i) => (
                            <Card key={i} className="h-72 flex flex-col gap-2 pt-0">
                                <Skeleton className="w-full h-40" />
                                <div className="p-3 flex flex-col gap-2">
                                    <Skeleton className="w-3/4 h-5" />
                                    <Skeleton className="w-1/2 h-5" />
                                    <div className="flex flex-row gap-2">
                                        <Skeleton className="w-1/2 h-9" />
                                        <Skeleton className="w-1/2 h-9" />
                                    </div>
                                </div>
                            </Card>
                        ))
                        :
                        produkData?.map((item) => {
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
                                    <CardContent className="space-y-1">
                                        <Badge variant={item.status ? "success" : "destructive"}>{item.status ? "Aktif" : "Inaktif"}</Badge>
                                        <h1 className="text-lg font-medium">{item.nama}<span className="text-sm text-muted-foreground"> | {item.kategori.nama}</span></h1>
                                        <p className="text-sm ">Jumlah Stok: {item.stok}</p>
                                        <p className="text-lg font-bold text-green-700">Rp. {item.harga}</p>
                                    </CardContent>
                                    <CardFooter className="gap-2">
                                        <Button className="flex-1" variant="secondary" size="icon" onClick={() => handleEdit({ id: item.id, nama: item.nama, harga: item.harga, stok: item.stok, status: item.status, categoryId: item.kategori.id, gambar: item.gambar })}>
                                            <Pencil />
                                        </Button>
                                        <Button className="flex-1" variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                                            <Trash />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })
                }
            </div>
        </div>
    )
}

ProductPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default ProductPage