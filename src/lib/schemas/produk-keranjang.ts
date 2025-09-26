import { z } from "zod";

export const produkKeranjangSchema = z.object({
    id: z.string(),
    nama: z.string(),
    harga: z.number(),
    gambar: z.string(),
    stok: z.number(),
    status: z.boolean(),
    jumlah: z.number(),
    varianId: z.string().optional(),
    varianNama: z.string().optional(),
    kategori: z.object({
        id: z.string(),
        nama: z.string(),
        status: z.boolean(),
    }),
    UMKM: z.object({
        id: z.string(),
        nama: z.string(),
    }).nullable(),
    ProdukVarian: z.array(z.object({
        varian: z.object({
            id: z.string(),
            nama: z.string(),
        })
    }))
})

export type ProdukKeranjangSchema = z.infer<typeof produkKeranjangSchema>