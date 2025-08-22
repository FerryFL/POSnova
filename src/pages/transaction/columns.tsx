"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Transaksi } from "~/utils/api"

export const columns: ColumnDef<Transaksi>[] = [
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
        accessorKey: "transaksiItem",
        header: "Detail",
        cell: ({ row }) => {
            const items = row.original.transaksiItem
            return (
                <ul className="space-y-1">
                    {items.map((item) => (
                        <li key={item.id}>
                            {item.jumlah}x {item.produk.nama} - ({item.varianNama}) Rp. {item.hargaSatuan}/pcs
                        </li>
                    ))}
                </ul>
            )
        },
    }
]