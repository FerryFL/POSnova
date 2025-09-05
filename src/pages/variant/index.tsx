import { useEffect, useState, type ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { variantFormSchema, type VariantFormSchema } from "~/forms/variant";
import DialogAddVarian from "./_components/DialogAddVarian";
import DialogEditVarian from "./_components/DialogEditVarian";
import DialogDeleteVarian from "./_components/DialogDeleteVarian";
import VarianSkeleton from "./_components/VarianSkeleton";
import VarianCard from "./_components/VarianCard";
import { useUserStore } from "~/store/user";

export const VariantPage: NextPageWithLayout = () => {
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

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
        { umkmId: profile?.umkm.id ?? "" },
        {
            enabled: !!profile?.umkm.id
        }
    )

    const { mutate: tambahVarian, isPending: tambahVarianIsPending } = api.varian.tambahVarian.useMutation({
        onSuccess: async () => {
            await apiUtils.varian.lihatVarian.invalidate()
            toast.success("Data Berhasil Ditambahkan!")
            addForm.reset()
            setAddOpen(false)
        }
    })

    const { mutate: ubahVarian, isPending: ubahVarianIsPending } = api.varian.ubahVarian.useMutation({
        onSuccess: async () => {
            await apiUtils.varian.lihatVarian.invalidate()
            toast.success("Data Berhasil Diubah!")
            addForm.reset()
            setEditOpen(false)
        }
    })

    const { mutate: hapusVarian, isPending: hapusVarianIsPending } = api.varian.hapusVarian.useMutation({
        onSuccess: async () => {
            await apiUtils.varian.lihatVarian.invalidate()
            toast.success("Data Berhasil Dihapus!")
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

            <DialogAddVarian
                open={addOpen}
                onOpenChange={setAddOpen}
                addForm={addForm}
                handleSubmit={handleSubmit}
                tambahVarianIsPending={tambahVarianIsPending} />

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
                            varian={varianData}
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