import { useEffect, useState, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { api } from "~/utils/api"
import { categoryFormSchema, type CategoryFormSchema } from "~/lib/schemas/category"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import DialogAddCategory from "../../components/features/category/DialogAddCategory"
import DialogEditCategory from "../../components/features/category/DialogEditCategory"
import DialogDeleteCategory from "../../components/features/category/DialogDeleteCategory"
import CategorySkeleton from "../../components/features/category/CategorySkeleton"
import CategoryCards from "../../components/features/category/CategoryCards"
import { useUserStore } from "~/store/user"

export const CategoryPage: NextPageWithLayout = () => {
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const apiUtils = api.useUtils()

    const { profile } = useUserStore()

    const addForm = useForm<CategoryFormSchema>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            nama: "",
            UMKMId: "",
            status: true
        }
    })

    const editForm = useForm<CategoryFormSchema>({
        resolver: zodResolver(categoryFormSchema)
    })


    const { data: kategoriData, isLoading: kategoriIsLoading } = api.kategori.lihatKategori.useQuery(
        { umkmId: profile?.UMKM?.id ?? '' },
        {
            enabled: !!profile?.UMKM?.id
        }
    )

    const { mutate: tambahKategori, isPending: tambahKategoriIsPending } = api.kategori.tambahKategori.useMutation({
        onSuccess: async () => {
            await apiUtils.kategori.lihatKategori.invalidate()
            toast.success("Kategori Berhasil Ditambahkan!")
            addForm.reset()
            setAddOpen(false)
        }
    })

    const { mutate: ubahKategori, isPending: ubahKategoriIsPending } = api.kategori.ubahKategori.useMutation({
        onSuccess: async () => {
            await apiUtils.kategori.lihatKategori.invalidate()
            toast.success("Kategori Berhasil Diubah!")
            editForm.reset()
            setEditOpen(false)
        }
    })

    const { mutate: hapusKategori, isPending: hapusKategoriIsPending } = api.kategori.hapusKategori.useMutation({
        onSuccess: async () => {
            await apiUtils.kategori.lihatKategori.invalidate()
            toast.success("Kategori Berhasil Dihapus!")
            setIdToDelete(null)
        }
    })

    const handleSubmit = (data: CategoryFormSchema) => {
        tambahKategori({
            nama: data.nama,
            status: data.status,
            UMKMId: data.UMKMId
        })
    }

    // const handleClick = () => {
    //     toast.success("Berhasil!")
    // }

    const handleEdit = (category: { id: string, nama: string, status: boolean, UMKMId: string }) => {
        setIdToEdit(category.id)
        setEditOpen(true)
        editForm.reset({
            nama: category.nama,
            status: category.status,
            UMKMId: category.UMKMId
        })
    }

    const handleSubmitEdit = (data: CategoryFormSchema) => {
        if (!idToEdit) return

        ubahKategori({
            id: idToEdit,
            nama: data.nama,
            status: data.status,
            UMKMId: data.UMKMId
        })
    }

    const handleDelete = (id: string) => {
        setIdToDelete(id)
    }

    const handleSubmitDelete = () => {
        if (!idToDelete) return

        hapusKategori({
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
            <h1 className="text-xl font-bold">Manajemen Kategori</h1>

            <DialogAddCategory
                open={addOpen}
                onOpenChange={setAddOpen}
                addForm={addForm}
                handleSubmit={handleSubmit}
                tambahKategoriIsPending={tambahKategoriIsPending}
            />

            <DialogEditCategory
                open={editOpen}
                onOpenChange={setEditOpen}
                editForm={editForm}
                handleSubmitEdit={handleSubmitEdit}
                ubahKategoriIsPending={ubahKategoriIsPending}
            />

            <DialogDeleteCategory
                idToDelete={idToDelete}
                setIdToDelete={setIdToDelete}
                hapusKategoriIsPending={hapusKategoriIsPending}
                handleSubmitDelete={handleSubmitDelete}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {
                    kategoriIsLoading ?
                        <CategorySkeleton /> :
                        <CategoryCards
                            kategori={kategoriData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                }
            </div>
        </div >
    )
}

CategoryPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default CategoryPage