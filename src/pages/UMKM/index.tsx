import { useEffect, useState, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { api } from "~/utils/api"
import { Skeleton } from "~/components/ui/skeleton"
import { Button } from "~/components/ui/button"
import { LoaderCircle, Pencil, Plus, Trash, MapPin, Phone, Building } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { umkmFormSchema, type UmkmFormSchema } from "~/forms/umkm"
import { zodResolver } from "@hookform/resolvers/zod"
import { UMKMForm } from "~/components/shared/umkm/UMKMForm"
import { toast } from "sonner"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"

export const UMKMPage: NextPageWithLayout = () => {
    const apiUtils = api.useUtils()
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const addForm = useForm<UmkmFormSchema>({
        resolver: zodResolver(umkmFormSchema),
        defaultValues: {
            nama: "",
            alamat: "",
            noTelp: ""
        }
    })

    const editForm = useForm<UmkmFormSchema>({
        resolver: zodResolver(umkmFormSchema),
    })

    const { data: umkmData, isLoading: umkmIsLoading } = api.umkm.lihatUMKM.useQuery()
    const { mutate: tambahUMKM, isPending: tambahUMKMIsPending } = api.umkm.tambahUMKM.useMutation({
        onSuccess: async () => {
            await apiUtils.umkm.lihatUMKM.invalidate()
            toast.success("Data UMKM Berhasil Ditambahkan!")
            addForm.reset()
            setAddOpen(false)
        }
    })

    const { mutate: ubahUMKM, isPending: ubahUMKMIsPending } = api.umkm.ubahUMKM.useMutation({
        onSuccess: async () => {
            await apiUtils.umkm.lihatUMKM.invalidate()
            toast.success("Data UMKM Berhasil Diubah!")
            editForm.reset()
            setEditOpen(false)
        }
    })

    const { mutate: hapusUMKM, isPending: hapusUMKMIsPending } = api.umkm.hapusUMKM.useMutation({
        onSuccess: async () => {
            await apiUtils.umkm.lihatUMKM.invalidate()
            setIdToDelete(null)
            toast.success("UMKM Berhasil Dihapus!")
        }
    })

    const handleSubmit = (data: UmkmFormSchema) => {
        tambahUMKM({
            nama: data.nama,
            alamat: data.alamat,
            noTelp: data.noTelp
        })
    }

    const handleEdit = (data: { id: string, nama: string, alamat: string, noTelp: string }) => {
        setEditOpen(true)
        setIdToEdit(data.id)
        editForm.reset({
            nama: data.nama,
            alamat: data.alamat,
            noTelp: data.noTelp,
        })
    }

    const handleSubmitEdit = (data: UmkmFormSchema) => {
        if (!idToEdit) return

        ubahUMKM({
            id: idToEdit,
            nama: data.nama,
            alamat: data.alamat,
            noTelp: data.noTelp
        })
    }

    const handleDelete = (id: string) => {
        setIdToDelete(id)
    }

    const handleSubmitDelete = () => {
        if (!idToDelete) return

        hapusUMKM({
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
            <h1 className="text-xl font-bold">Manajemen UMKM</h1>
            
            {/* Dialog Tambah UMKM */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Plus />Tambah UMKM</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Tambah UMKM</DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                        <UMKMForm onSubmit={handleSubmit} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button type="submit" onClick={addForm.handleSubmit(handleSubmit)}>
                            {tambahUMKMIsPending && <LoaderCircle className="animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit UMKM */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Ubah UMKM</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <UMKMForm onSubmit={handleSubmitEdit} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button type="submit" onClick={editForm.handleSubmit(handleSubmitEdit)}>
                            {ubahUMKMIsPending && <LoaderCircle className="animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog Hapus UMKM */}
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
                        <AlertDialogTitle>Hapus UMKM</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Apakah yakin anda akan menghapus UMKM ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tutup</AlertDialogCancel>
                        <Button disabled={hapusUMKMIsPending} variant="destructive" onClick={handleSubmitDelete}>
                            {hapusUMKMIsPending && <LoaderCircle className="animate-spin" />}
                            Hapus
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Grid UMKM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {
                    umkmIsLoading ?
                        Array.from({ length: 12 }, (_, i) => (
                            <Card key={i} className="h-48 flex flex-col gap-2">
                                <div className="p-4 flex flex-col gap-3">
                                    <Skeleton className="w-3/4 h-6" />
                                    <Skeleton className="w-full h-4" />
                                    <Skeleton className="w-2/3 h-4" />
                                    <div className="flex flex-row gap-2 mt-4">
                                        <Skeleton className="w-1/2 h-9" />
                                        <Skeleton className="w-1/2 h-9" />
                                    </div>
                                </div>
                            </Card>
                        ))
                        :
                        umkmData?.map((item) => {
                            return (
                                <Card key={item.id} className="flex flex-col justify-between h-48">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Building className="w-5 h-5" />
                                            {item.nama}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1">
                                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{item.alamat}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <span>{item.noTelp}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="gap-2 pt-3">
                                        <Button 
                                            className="flex-1" 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => handleEdit({ 
                                                id: item.id, 
                                                nama: item.nama, 
                                                alamat: item.alamat, 
                                                noTelp: item.noTelp 
                                            })}
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Edit
                                        </Button>
                                        <Button 
                                            className="flex-1" 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash className="w-4 h-4" />
                                            Hapus
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

UMKMPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default UMKMPage