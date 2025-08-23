"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Transaksi } from "~/utils/api"
import { DetailTransaksiDialog } from "../_components/DetailTransaksiDialog"

export const columns: ColumnDef<Transaksi>[] = [
    {
        accessorKey: "no",
        header: "No",
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "totalProduk",
        header: "Total Produk",
    },
    {
        accessorKey: "totalHarga",
        header: "Total Harga",
        cell: ({ row }) => {
            const harga = row.getValue<number>("totalHarga")
            return `Rp ${harga.toLocaleString()}`
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DetailTransaksiDialog transaksi={row.original} />,
    },
]