import { useEffect, useState, useMemo, type ReactElement } from "react"
import type { NextPageWithLayout } from "../_app"
import { PublicLayout } from "~/components/layouts/PublicLayout"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { api } from "~/utils/api"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { LoaderCircle, Pencil, Plus, Trash, Search, ArrowUpDown } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { umkmFormSchema, type UmkmFormSchema } from "~/forms/umkm"
import { zodResolver } from "@hookform/resolvers/zod"
import { UMKMForm } from "~/components/shared/umkm/UMKMForm"
import { toast } from "sonner"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table"

// Tipe data UMKM
export type UMKM = {
  id: string
  nama: string
  alamat: string
  noTelp: string
}

export const UMKMPage: NextPageWithLayout = () => {
    const apiUtils = api.useUtils()
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [idToEdit, setIdToEdit] = useState<string | null>(null)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)
    
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

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

    const columns: ColumnDef<UMKM>[] = [
        {
            accessorKey: "nama",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3 text-xs sm:text-sm"
                    >
                        Nama UMKM
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-medium text-xs sm:text-sm">{row.getValue("nama")}</div>
            ),
        },
        {
            accessorKey: "alamat",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3 text-xs sm:text-sm"
                    >
                        Alamat
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div 
                    className="max-w-[150px] sm:max-w-xs truncate text-xs sm:text-sm" 
                    title={row.getValue("alamat")}
                >
                    {row.getValue("alamat")}
                </div>
            ),
        },
        {
            accessorKey: "noTelp",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 lg:px-3 text-xs sm:text-sm"
                    >
                        No Telepon
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="text-xs sm:text-sm">{row.getValue("noTelp")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => <div className="text-xs sm:text-sm">Aksi</div>,
            cell: ({ row }) => {
                const umkm = row.original

                return (
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit({
                                id: umkm.id,
                                nama: umkm.nama,
                                alamat: umkm.alamat,
                                noTelp: umkm.noTelp
                            })}
                        >
                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(umkm.id)}
                        >
                            <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    // Setup TanStack Table
    const table = useReactTable({
        data: umkmData ?? [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="space-y-4 w-full px-2 sm:px-4">
            <h1 className="text-xl font-bold">Manajemen UMKM</h1>

            {/* Dialog Edit UMKM */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="w-[95%] max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Ubah UMKM</DialogTitle>
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

            {/* Alert Dialog Delete */}
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
                                    value={table.getState().pagination.pageSize.toString()}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value))
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
                                value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
                                onChange={(e) => table.getColumn("nama")?.setFilterValue(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show</span>
                            <Select
                                value={table.getState().pagination.pageSize.toString()}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
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
                                    value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
                                    onChange={(e) => table.getColumn("nama")?.setFilterValue(e.target.value)}
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
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            <TableHead className="w-12 text-xs sm:text-sm">No</TableHead>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id} className="min-w-[120px] text-xs sm:text-sm">
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                    </TableHead>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {umkmIsLoading ? (
                                        Array.from({ length: table.getState().pagination.pageSize }, (_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                                </TableCell>
                                                {columns.map((_, colIndex) => (
                                                    <TableCell key={colIndex}>
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row, index) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                <TableCell className="font-medium text-xs sm:text-sm">
                                                    {(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + index + 1}
                                                </TableCell>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                                                {(table.getColumn("nama")?.getFilterValue() as string) ? "Tidak ada data yang ditemukan" : "Belum ada data UMKM"}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {!umkmIsLoading && table.getFilteredRowModel().rows.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                            <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                                Menampilkan {table.getRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} data
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="text-xs sm:text-sm px-2 sm:px-3"
                                >
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                    <span className="sm:hidden">Prev</span>
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </span>
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
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