import { useState, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card"
import { api } from "~/utils/api"
import { Skeleton } from "~/components/ui/skeleton"
import { Button } from "~/components/ui/button"
import { LoaderCircle, Pencil, Plus, Tags, Trash } from "lucide-react"
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

interface ImageState {
    current: string | null
    original: string | null
    toDelete: string[]
}

export const ProductPage: NextPageWithLayout = () => {
    const apiUtils = api.useUtils()
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)

    const [imageState, setImageState] = useState<ImageState>({
        current: null,
        original: null,
        toDelete: []
    })

    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const addForm = useForm<ProductFormSchema>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            status: true
        }
    })

    const editForm = useForm<ProductFormSchema>({
        resolver: zodResolver(productFormSchema),
    })

    const { data: produkData, isLoading: produkIsLoading } = api.produk.lihatProduk.useQuery({})
    const { mutate: tambahProduk, isPending: tambahProdukIsPending } = api.produk.tambahProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            toast.success("Data Produk Berhasil Ditambahkan!")
            resetImageState()
            addForm.reset()
            setAddOpen(false)
        }
    })

    const { mutate: ubahProduk, isPending: ubahProdukIsPending } = api.produk.ubahProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            toast.success("Data Produk Berhasil Diubah!")
            resetImageState()
            editForm.reset()
            setEditOpen(false)
        }
    })

    const { mutate: hapusProduk, isPending: hapusProdukIsPending } = api.produk.hapusProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            setIdToDelete(null)
            toast.success("Produk Produk Berhasil Dihapus!")
        }
    })

    const { mutateAsync: hapusGambarProdukMultiple } = api.produk.hapusGambarProdukMultiple.useMutation()

    // const { mutateAsync: hapusGambarProduk } = api.produk.hapusGambarProduk.useMutation()

    const cleanupImages = async (imagesToDelete: string[]) => {
        if (imagesToDelete.length > 0) {
            try {
                await hapusGambarProdukMultiple({ gambar: imagesToDelete })
            } catch (error) {
                console.error("Gagal menghapus gambar multiple", error)
            }
        }
    }

    const resetImageState = () => {
        setImageState({
            current: null,
            original: null,
            toDelete: []
        })
    }

    const handleImageChange = (newImage: string) => {
        setImageState(prev => ({
            ...prev,
            current: newImage,
            toDelete: prev.current ? [...prev.toDelete, prev.current] : prev.toDelete
        }))
    }

    const handleSubmit = async (data: ProductFormSchema) => {
        if (!imageState.current) {
            toast.error("Masukan Gambar Produk!")
            return
        }

        await cleanupImages(imageState.toDelete)

        tambahProduk({
            nama: data.nama,
            harga: data.harga,
            stok: data.stok,
            status: data.status,
            categoryId: data.categoryId,
            varianId: data.varianId,
            gambar: imageState.current
        })
    }

    const handleEdit = (data: { id: string, nama: string, harga: number, stok: number, status: boolean, categoryId: string, varianId: string, gambar: string }) => {
        setEditOpen(true)
        setIdToEdit(data.id)

        setImageState({
            current: data.gambar,
            original: data.gambar,
            toDelete: []
        })

        editForm.reset({
            nama: data.nama,
            harga: data.harga,
            stok: data.stok,
            status: data.status,
            categoryId: data.categoryId,
            varianId: data.varianId
        })
    }

    const handleSubmitEdit = async (data: ProductFormSchema) => {
        if (!idToEdit) return

        if (!imageState.current) {
            toast.error("Masukan Gambar Produk!")
            return
        }

        await cleanupImages(imageState.toDelete)

        ubahProduk({
            id: idToEdit,
            nama: data.nama,
            harga: data.harga,
            stok: data.stok,
            status: data.status,
            categoryId: data.categoryId,
            varianId: data.varianId,
            gambar: imageState.current
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

    const handleAddDialogClose = async (open: boolean) => {
        if (!open) {
            const allImagesToDelete = imageState.current ? [...imageState.toDelete, imageState.current] : imageState.toDelete
            await cleanupImages(allImagesToDelete)
            resetImageState()
            addForm.reset()
        }
        setAddOpen(open)
    }

    const handleEditDialogClose = async (open: boolean) => {
        if (!open) {
            const imagesToDelete = [...imageState.toDelete]

            if (imageState.current && imageState.current !== imageState.original) {
                imagesToDelete.push(imageState.current)
            }

            const filteredImagesToDelete = imagesToDelete.filter(img => img !== imageState.original)
            await cleanupImages(filteredImagesToDelete)
            resetImageState()
            editForm.reset()
        }
        setEditOpen(open)
    }

    return (
        <div className="space-y-4 w-full">
            <h1 className="text-xl font-bold">Manajemen Produk</h1>
            <Dialog open={addOpen} onOpenChange={handleAddDialogClose}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Plus />Tambah Produk</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Tambah Produk</DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                        <ProductForm onSubmit={handleSubmit} onChangeImage={handleImageChange} imageUrl={imageState.current} />
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

            <Dialog open={editOpen} onOpenChange={handleEditDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Ubah Produk</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <ProductForm onSubmit={handleSubmitEdit} onChangeImage={handleImageChange} imageUrl={imageState.current} />
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
                                        <h1 className="text-lg font-medium w-full ">
                                            <span className="line-clamp-1 break-words">{item.nama}</span>
                                            <span className="text-sm flex gap-1 items-center text-muted-foreground line-clamp-1 break-words">
                                                <Tags className="size-4 shrink-0" />
                                                {item.kategori.nama}
                                            </span>
                                        </h1>
                                        <p className="text-sm ">Jumlah Stok: {item.stok}</p>
                                        <p className="text-lg font-bold text-green-700">Rp. {item.harga}</p>
                                    </CardContent>
                                    <CardFooter className="gap-2">
                                        <Button className="flex-1" variant="secondary" size="icon" onClick={() => handleEdit({ id: item.id, nama: item.nama, harga: item.harga, stok: item.stok, status: item.status, categoryId: item.kategori.id, varianId: item.varian.id, gambar: item.gambar })}>
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