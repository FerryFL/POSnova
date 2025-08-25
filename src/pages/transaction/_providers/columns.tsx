"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Transaksi } from "~/utils/api"
import { DetailTransaksiDialog } from "../_components/DetailTransaksiDialog"
import { Button } from "~/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import dayjs from "dayjs"
import "dayjs/locale/id"

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
        id: "actions",
        cell: ({ row }) => <DetailTransaksiDialog transaksi={row.original} />,
    },
]