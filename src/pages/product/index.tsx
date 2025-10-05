import { useState, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { api } from "~/utils/api"
import { useForm } from "react-hook-form"
import { productFormSchema, type ProductFormSchema } from "~/lib/schemas/product"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import DialogAddProduct from "../../components/features/product/DialogAddProduct"
import DialogEditProduct from "../../components/features/product/DialogEditProduct"
import DialogDeleteProduct from "../../components/features/product/DialogDeleteProduct"
import ProductSkeleton from "../../components/features/product/ProductSkeleton"
import ProductCards from "../../components/features/product/ProductCards"
import { useUserStore } from "~/store/user"

interface ImageState {
    current: string | null
    original: string | null
    toDelete: string[]
}

export const ProductPage: NextPageWithLayout = () => {
    const apiUtils = api.useUtils()
    const { profile } = useUserStore()
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
            nama: "",
            harga: 0,
            stok: 0,
            categoryId: "",
            UMKMId: "",
            status: true,
            varianIds: []
        }
    })

    const editForm = useForm<ProductFormSchema>({
        resolver: zodResolver(productFormSchema),
    })

    const { data: produkData, isLoading: produkIsLoading } = api.produk.lihatProduk.useQuery(
        { umkmId: profile?.UMKM?.id ?? "" },
        {
            enabled: !!profile?.UMKM?.id
        }
    )
    const { mutate: tambahProduk, isPending: tambahProdukIsPending } = api.produk.tambahProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            toast.success("Produk Berhasil Ditambahkan!")
            resetImageState()
            addForm.reset()
            setAddOpen(false)
        },
        onError: async (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: ubahProduk, isPending: ubahProdukIsPending } = api.produk.ubahProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            toast.success("Produk Berhasil Diubah!")
            resetImageState()
            editForm.reset()
            setEditOpen(false)
        },
        onError: async (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: hapusProduk, isPending: hapusProdukIsPending } = api.produk.hapusProduk.useMutation({
        onSuccess: async () => {
            await apiUtils.produk.lihatProduk.invalidate()
            setIdToDelete(null)
            toast.success("Produk Berhasil Dihapus!")
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
            UMKMId: data.UMKMId,
            varianIds: data.varianIds,
            gambar: imageState.current
        })
    }

    const handleEdit = (data: { id: string, nama: string, harga: number, stok: number, status: boolean, categoryId: string, UMKMId: string, varianIds: string[], gambar: string }) => {
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
            UMKMId: data.UMKMId,
            varianIds: data.varianIds
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
            UMKMId: data.UMKMId,
            varianIds: data.varianIds,
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
            <DialogAddProduct
                open={addOpen}
                onOpenChange={handleAddDialogClose}
                addForm={addForm}
                handleImageChange={handleImageChange}
                handleSubmit={handleSubmit}
                imageUrl={imageState.current}
                tambahProdukIsPending={tambahProdukIsPending}
            />

            <DialogEditProduct
                open={editOpen}
                onOpenChange={handleEditDialogClose}
                editForm={editForm}
                handleImageChange={handleImageChange}
                handleSubmitEdit={handleSubmitEdit}
                imageUrl={imageState.current}
                ubahProdukIsPending={ubahProdukIsPending}
            />

            <DialogDeleteProduct
                idToDelete={idToDelete}
                setIdToDelete={setIdToDelete}
                hapusProdukIsPending={hapusProdukIsPending}
                handleSubmitDelete={handleSubmitDelete}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {
                    produkIsLoading ?
                        <ProductSkeleton /> :
                        <ProductCards
                            produk={produkData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                }
            </div>
        </div>
    )
}

ProductPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default ProductPage