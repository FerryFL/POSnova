import { useEffect, useState, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { api } from "~/utils/api"
import { LoaderCircle, Pencil, Plus, Trash } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { CategoryForm } from "~/components/shared/category/CategoryForm"
import { categoryFormSchema, type CategoryFormSchema } from "~/forms/category"
import { toast } from "sonner"
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "~/components/ui/form"
import { Skeleton } from "~/components/ui/skeleton"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Badge } from "~/components/ui/badge"

export const CategoryPage: NextPageWithLayout = () => {
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const apiUtils = api.useUtils()

    const addForm = useForm<CategoryFormSchema>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            status: true
        }
    })

    const editForm = useForm<CategoryFormSchema>({
        resolver: zodResolver(categoryFormSchema)
    })


    const { data: kategoriData, isLoading: kategoriIsLoading } = api.kategori.lihatKategori.useQuery()

    const { mutate: tambahKategori, isPending: tambahKategoriIsPending } = api.kategori.tambahKategori.useMutation({
        onSuccess: async () => {
            await apiUtils.kategori.lihatKategori.invalidate()
            toast.success("Data Berhasil Ditambahkan!")
            addForm.reset()
            setAddOpen(false)
        }
    })

    const { mutate: ubahKategori, isPending: ubahKategoriIsPending } = api.kategori.ubahKategori.useMutation({
        onSuccess: async () => {
            await apiUtils.kategori.lihatKategori.invalidate()
            toast.success("Data Berhasil Diubah!")
            editForm.reset()
            setEditOpen(false)
        }
    })

    const { mutate: hapusKategori, isPending: hapusKategoriIsPending } = api.kategori.hapusKategori.useMutation({
        onSuccess: async () => {
            await apiUtils.kategori.lihatKategori.invalidate()
            toast.success("Data Berhasil Dihapus!")
            setIdToDelete(null)
        }
    })

    const handleSubmit = (data: CategoryFormSchema) => {
        tambahKategori({
            nama: data.nama,
            status: data.status
        })
        console.log(data)
    }

    // const handleClick = () => {
    //     toast.success("Berhasil!")
    // }

    const handleEdit = (category: { id: string, nama: string, status: boolean }) => {
        setIdToEdit(category.id)
        setEditOpen(true)
        editForm.reset({
            nama: category.nama,
            status: category.status
        })
    }

    const handleSubmitEdit = (data: CategoryFormSchema) => {
        if (!idToEdit) return

        ubahKategori({
            id: idToEdit,
            nama: data.nama,
            status: data.status
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

            {/* <Button onClick={handleClick}>Click ME</Button> */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Plus />Tambah Kategori</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle><h1 className="text-lg font-semibold">Tambah Kategori</h1></DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                        <CategoryForm onSubmit={handleSubmit} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button disabled={tambahKategoriIsPending} type="submit" onClick={addForm.handleSubmit(handleSubmit)}>
                            {tambahKategoriIsPending && <LoaderCircle className="animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle><h1 className="text-lg font-semibold">Ubah Kategori</h1></DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <CategoryForm onSubmit={handleSubmitEdit} />
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button disabled={ubahKategoriIsPending} type="submit" onClick={editForm.handleSubmit(handleSubmitEdit)}>
                            {ubahKategoriIsPending && <LoaderCircle className="animate-spin" />}
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
                        <AlertDialogTitle>Hapus Category</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>Apakah yakin anda akan menghapus kategori ini?</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tutup</AlertDialogCancel>
                        <Button disabled={hapusKategoriIsPending} variant="destructive" onClick={handleSubmitDelete}>
                            {hapusKategoriIsPending && <LoaderCircle className="animate-spin" />}
                            Hapus
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

                {
                    kategoriIsLoading ?
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
                        kategoriData?.map((item) => {
                            return (
                                <Card key={item.id} className="">
                                    <CardHeader>
                                        <Badge variant={item.status ? "success" : "destructive"}>{item.status ? "Aktif" : "Inaktif"}</Badge>
                                        <CardTitle className="line-clamp-1 break-words">{item.nama}</CardTitle>

                                    </CardHeader>
                                    <CardFooter className="gap-2">
                                        <Button className="flex-1" variant="secondary" size="icon" onClick={() => handleEdit({ id: item.id, nama: item.nama, status: item.status })}>
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
        </div >
    )
}

CategoryPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default CategoryPage