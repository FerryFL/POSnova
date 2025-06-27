import { useEffect, useState, type ReactElement } from "react";
import type { NextPageWithLayout } from "../_app";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { api } from "~/utils/api";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button";
import { LoaderCircle, Pencil, Plus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VariantForm } from "~/components/shared/variant/VariantForm";
import { toast } from "sonner";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { variantFormSchema, type VariantFormSchema } from "~/forms/variant";
import { Form } from "~/components/ui/form";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";

export const VariantPage: NextPageWithLayout = () => {
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const apiUtils = api.useUtils()

    const addForm = useForm<VariantFormSchema>({
        resolver: zodResolver(variantFormSchema),
    })

    const editForm = useForm<VariantFormSchema>({
        resolver: zodResolver(variantFormSchema)
    })

    const { data: varianData, isLoading: varianIsLoading } = api.varian.lihatVarian.useQuery()

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
        })
    }

    const handleEdit = (varian: { id: string, nama: string }) => {
        setIdToEdit(varian.id)
        setEditOpen(true)
        editForm.reset({
            nama: varian.nama,
        })
    }

    const handleSubmitEdit = (data: VariantFormSchema) => {
        if (!idToEdit) return

        ubahVarian({
            id: idToEdit,
            nama: data.nama,
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
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Plus />Tambah Varian</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle><h1 className="text-lg font-semibold">Tambah Varian</h1></DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                        <VariantForm onSubmit={handleSubmit} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button disabled={tambahVarianIsPending} type="submit" onClick={addForm.handleSubmit(handleSubmit)}>
                            {tambahVarianIsPending && <LoaderCircle className="animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle><h1 className="text-lg font-semibold">Ubah Varian</h1></DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <VariantForm onSubmit={handleSubmitEdit} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button disabled={ubahVarianIsPending} type="submit" onClick={editForm.handleSubmit(handleSubmitEdit)}>
                            {ubahVarianIsPending && <LoaderCircle className="animate-spin" />}
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
                        <AlertDialogTitle>Hapus Varian</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>Apakah yakin anda akan menghapus varian ini?</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tutup</AlertDialogCancel>
                        <Button disabled={hapusVarianIsPending} variant="destructive" onClick={handleSubmitDelete}>
                            {hapusVarianIsPending && <LoaderCircle className="animate-spin" />}
                            Hapus
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

                {
                    varianIsLoading ?
                        Array.from({ length: 20 }, (_, i) => (
                            <Card key={i} className="h-36 p-3 flex flex-col gap-2 justify-center">
                                <Skeleton className="w-full h-6" />
                                <Skeleton className="w-1/2 h-4" />
                                <div className="flex flex-row gap-2">
                                    <Skeleton className="w-1/2 h-9" />
                                    <Skeleton className="w-1/2 h-9" />
                                </div>
                            </Card>
                        ))
                        :
                        varianData?.map((item) => {
                            return (
                                <Card key={item.id} className="">
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1 break-words">{item.nama}</CardTitle>

                                    </CardHeader>
                                    <CardFooter className="gap-2">
                                        <Button className="flex-1" variant="secondary" size="icon" onClick={() => handleEdit({ id: item.id, nama: item.nama })}>
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

VariantPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default VariantPage