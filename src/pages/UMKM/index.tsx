import { useEffect, useState, useMemo, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { api } from "~/utils/api"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { LoaderCircle, Pencil, Plus, Trash, Search } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { umkmFormSchema, type UmkmFormSchema } from "~/forms/umkm"
import { zodResolver } from "@hookform/resolvers/zod"
import { UMKMForm } from "~/components/shared/umkm/UMKMForm"
import { toast } from "sonner"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

export const UMKMPage: NextPageWithLayout = () => {
    const apiUtils = api.useUtils()
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

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

    const filteredData = useMemo(() => {
        if (!umkmData) return []

        return umkmData.filter((item) =>
            item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.noTelp.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [umkmData, searchTerm])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        const endIndex = startIndex + rowsPerPage
        return filteredData.slice(startIndex, endIndex)
    }, [filteredData, currentPage, rowsPerPage])

    const totalPages = Math.ceil(filteredData.length / rowsPerPage)
    const startRow = (currentPage - 1) * rowsPerPage + 1
    const endRow = Math.min(currentPage * rowsPerPage, filteredData.length)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

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

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    useEffect(() => {
        if (!addOpen) {
            addForm.reset()
        }
    }, [addOpen, addForm])

    return (
        <div className="space-y-4 w-full">
            <h1 className="text-xl font-bold">Manajemen UMKM</h1>

            {/* Dialog Edit UMKM */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="w-[95%] max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Ubah UMKM</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <UMKMForm onSubmit={handleSubmitEdit} />
                    </Form>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full sm:w-auto">Tutup</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            onClick={editForm.handleSubmit(handleSubmitEdit)}
                            className="w-full sm:w-auto"
                        >
                            {ubahUMKMIsPending && <LoaderCircle className="animate-spin mr-2" />}
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
                <AlertDialogContent className="w-[95%] max-w-md mx-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus UMKM</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Apakah yakin anda akan menghapus UMKM ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Tutup</AlertDialogCancel>
                        <Button
                            disabled={hapusUMKMIsPending}
                            variant="destructive"
                            onClick={handleSubmitDelete}
                            className="w-full sm:w-auto"
                        >
                            {hapusUMKMIsPending && <LoaderCircle className="animate-spin mr-2" />}
                            Hapus
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card>
                <CardHeader className="space-y-4">
                    <CardTitle>Data UMKM</CardTitle>

                    <div className="flex flex-col space-y-3 sm:hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show</span>
                                <Select
                                    value={rowsPerPage.toString()}
                                    onValueChange={(value) => {
                                        setRowsPerPage(Number(value))
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-16">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95%] max-w-md mx-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-semibold">Tambah UMKM</DialogTitle>
                                        <DialogDescription></DialogDescription>
                                    </DialogHeader>
                                    <Form {...addForm}>
                                        <UMKMForm onSubmit={handleSubmit} />
                                    </Form>
                                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full sm:w-auto">Tutup</Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            onClick={addForm.handleSubmit(handleSubmit)}
                                            className="w-full sm:w-auto"
                                        >
                                            {tambahUMKMIsPending && <LoaderCircle className="animate-spin mr-2" />}
                                            Simpan
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Cari UMKM..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show</span>
                            <Select
                                value={rowsPerPage.toString()}
                                onValueChange={(value) => {
                                    setRowsPerPage(Number(value))
                                    setCurrentPage(1)
                                }}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-600">Rows</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Cari UMKM..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>

                            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah UMKM
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95%] max-w-md mx-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-semibold">Tambah UMKM</DialogTitle>
                                    </DialogHeader>
                                    <Form {...addForm}>
                                        <UMKMForm onSubmit={handleSubmit} />
                                    </Form>
                                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                                        <DialogClose asChild>
                                            <Button variant="outline" className="w-full sm:w-auto">Tutup</Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            onClick={addForm.handleSubmit(handleSubmit)}
                                            className="w-full sm:w-auto"
                                        >
                                            {tambahUMKMIsPending && <LoaderCircle className="animate-spin mr-2" />}
                                            Simpan
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-xs sm:text-sm">No</TableHead>
                                        <TableHead className="min-w-[120px] text-xs sm:text-sm">Nama UMKM</TableHead>
                                        <TableHead className="min-w-[150px] text-xs sm:text-sm">Alamat</TableHead>
                                        <TableHead className="min-w-[120px] text-xs sm:text-sm">No Telepon</TableHead>
                                        <TableHead className="w-20 sm:w-32 text-xs sm:text-sm">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {umkmIsLoading ? (
                                        Array.from({ length: rowsPerPage }, (_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                                                {searchTerm ? "Tidak ada data yang ditemukan" : "Belum ada data UMKM"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium text-xs sm:text-sm">
                                                    {startRow + index}
                                                </TableCell>
                                                <TableCell className="font-medium text-xs sm:text-sm">
                                                    {item.nama}
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-[150px] sm:max-w-xs truncate text-xs sm:text-sm"
                                                    title={item.alamat}
                                                >
                                                    {item.alamat}
                                                </TableCell>
                                                <TableCell className="text-xs sm:text-sm">{item.noTelp}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleEdit({
                                                                id: item.id,
                                                                nama: item.nama,
                                                                alamat: item.alamat,
                                                                noTelp: item.noTelp
                                                            })}
                                                        >
                                                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {!umkmIsLoading && filteredData.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                            <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                                Menampilkan {startRow} sampai {endRow} dari {filteredData.length} data
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="text-xs sm:text-sm px-2 sm:px-3"
                                >
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                    <span className="sm:hidden">Prev</span>
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) }, (_, i) => {
                                        const maxPages = window.innerWidth < 640 ? 3 : 5;
                                        let pageNum;
                                        if (totalPages <= maxPages) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                                            pageNum = totalPages - maxPages + 1 + i;
                                        } else {
                                            pageNum = currentPage - Math.floor(maxPages / 2) + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                className="w-6 h-6 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="text-xs sm:text-sm px-2 sm:px-3"
                                >
                                    <span className="hidden sm:inline">Selanjutnya</span>
                                    <span className="sm:hidden">Next</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

UMKMPage.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default UMKMPage