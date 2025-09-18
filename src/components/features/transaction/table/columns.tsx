"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Transaksi } from "~/utils/api"
import { DetailTransaksiDialog } from "../DetailTransaksiDialog"
import { Button } from "~/components/ui/button"
import { ArrowUpDown, FileText } from "lucide-react"
import dayjs from "dayjs"
import "dayjs/locale/id"
import { BlobProvider } from "@react-pdf/renderer"
import PDFDocument from "~/components/features/transaction/PDFDocument"

export const columns: ColumnDef<Transaksi>[] = [
    {
        accessorKey: "no",
        header: () => <div className="text-center">No</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>
    },
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "tanggalTransaksi",
        header: "Tanggal Transaksi",
        cell: ({ row }) => {
            const value = row.getValue<string>("tanggalTransaksi")
            return dayjs(value).locale("id").format("D MMMM YYYY")
        }
    },
    {
        accessorKey: "totalProduk",
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting()}>
                        Total Produk
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => <div className="text-center">{row.original.totalProduk}</div>
    },
    {
        accessorKey: "totalHarga",
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting()}>
                        Total Harga
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const harga = row.getValue<number>("totalHarga")
            return <div className="text-center">{`Rp ${harga.toLocaleString()}`}</div>
        },
    },
    {
        accessorKey: "pajakPersen",
        header: "Pajak",
        cell: ({ row }) => {
            const pajak = row.getValue<number>("pajakPersen")
            return <div className="text-center">{`${pajak ?? 0}%`}</div>
        },
    },
    {
        accessorKey: "grandTotal",
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button variant="ghost" onClick={() => column.toggleSorting()}>
                        Grand Total
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const harga = row.getValue<number>("totalHarga")
            const grandTotal = row.getValue<number | undefined>("grandTotal")
            return <div className="text-center">{`Rp ${(grandTotal ?? harga).toLocaleString()}`}</div>
        },
    },
    {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => {
            const value = row.getValue<string>("createdBy")
            return <div>{value ?? "-"}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <DetailTransaksiDialog transaksi={row.original} />,
    },
    {
        id: "actions2",
        cell: ({ row }) => (
            <BlobProvider document={<PDFDocument transaksi={row.original} />}>
                {({ url }) =>
                    url ? (
                        <a href={url} download={`Invoice Transaksi.pdf`} target="_blank">
                            <Button variant="outline"><FileText className="size-4" /></Button>
                        </a>
                    ) : null
                }
            </BlobProvider>
        ),
    },
]