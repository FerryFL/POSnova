import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { variantFormSchema, type VariantFormSchema } from "~/lib/schemas/variant";
import DialogAddVarian from "../../components/features/variant/DialogAddVarian";
import DialogEditVarian from "../../components/features/variant/DialogEditVarian";
import DialogDeleteVarian from "../../components/features/variant/DialogDeleteVarian";
import VarianSkeleton from "../../components/features/variant/VarianSkeleton";
import VarianCard from "../../components/features/variant/VarianCard";
import { useUserStore } from "~/store/user";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

export const VariantPage: NextPageWithLayout = () => {
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")

    const apiUtils = api.useUtils()
    const { profile } = useUserStore()

    const addForm = useForm<VariantFormSchema>({
        resolver: zodResolver(variantFormSchema),
        defaultValues: {
            nama: "",
            status: true,
            UMKMId: "",
        }
    })

    const editForm = useForm<VariantFormSchema>({
        resolver: zodResolver(variantFormSchema),
    })

    const { data: varianData, isLoading: varianIsLoading } = api.varian.lihatVarian.useQuery(
        { umkmId: profile?.UMKM?.id ?? "" },
        {
            enabled: !!profile?.UMKM?.id
        }
    )

    const filteredData = useMemo(() => {
        if (!varianData) return []

        return varianData.filter((item) =>
            item.nama.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [varianData, searchTerm])

    const { mutate: tambahVarian, isPending: tambahVarianIsPending } = api.varian.tambahVarian.useMutation({
        onSuccess: async () => {
            await apiUtils.varian.lihatVarian.invalidate()
            toast.success("Varian Berhasil Ditambahkan!")
            addForm.reset()
            setAddOpen(false)
        },
        onError: async (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: ubahVarian, isPending: ubahVarianIsPending } = api.varian.ubahVarian.useMutation({
        onSuccess: async () => {
            await apiUtils.varian.lihatVarian.invalidate()
            toast.success("Varian Berhasil Diubah!")
            addForm.reset()
            setEditOpen(false)
        },
        onError: async (error) => {
            toast.error(error.message)
        }
    })

    const { mutate: hapusVarian, isPending: hapusVarianIsPending } = api.varian.hapusVarian.useMutation({
        onSuccess: async () => {
            await apiUtils.varian.lihatVarian.invalidate()
            toast.success("Varian Berhasil Dihapus!")
            addForm.reset()
            setIdToDelete(null)
        }
    })

    const handleSubmit = (data: VariantFormSchema) => {
        tambahVarian({
            nama: data.nama,
            status: data.status,
            UMKMId: data.UMKMId
        })
    }

    const handleEdit = (varian: { id: string, nama: string, status: boolean, UMKMId: string }) => {
        setIdToEdit(varian.id)
        setEditOpen(true)
        editForm.reset({
            nama: varian.nama,
            status: varian.status,
            UMKMId: varian.UMKMId
        })
    }

    const handleSubmitEdit = (data: VariantFormSchema) => {
        if (!idToEdit) return

        ubahVarian({
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

        hapusVarian({
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
            <h1 className="text-xl font-bold">Manajemen Varian</h1>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Cari Varian..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                <DialogAddVarian
                    open={addOpen}
                    onOpenChange={setAddOpen}
                    addForm={addForm}
                    handleSubmit={handleSubmit}
                    tambahVarianIsPending={tambahVarianIsPending} 
                />
            </div>

            <DialogEditVarian
                open={editOpen}
                onOpenChange={setEditOpen}
                editForm={editForm}
                handleSubmitEdit={handleSubmitEdit}
                ubahVarianIsPending={ubahVarianIsPending}
            />

            <DialogDeleteVarian
                idToDelete={idToDelete}
                setIdToDelete={setIdToDelete}
                hapusVarianIsPending={hapusVarianIsPending}
                handleSubmitDelete={handleSubmitDelete}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {
                    varianIsLoading ?
                        <VarianSkeleton /> :
                        <VarianCard
                            varian={filteredData}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete} />
                }
            </div>
        </div>
    )
}

VariantPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default VariantPage