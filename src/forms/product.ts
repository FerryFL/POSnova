import { z } from "zod";

export const productFormSchema = z.object({
    nama: z.string({ message: "Nama Produk Wajib Diisi" }).min(1, "Nama Produk Wajib Diisi").max(50, "Masukan Maksimal 50 Karakter!"),
    harga: z.coerce.number({ message: "Harga Produk Wajib Diisi" }).min(1000, "Masukan Minimal Rp. 1000").max(100000000, "Masukan Maksimal Rp. 100.000.000"),
    stok: z.coerce.number({ message: "Jumlah Stok Wajib Diisi" }).max(999, "Masukan Maksimal 999"),
    status: z.boolean(),
    categoryId: z.string({ message: "Wajib Pilih Kategori yang Tersedia" }).min(1, "Wajib Pilih Kategori yang Tersedia"),
    UMKMId: z.string({ message: "Wajib Pilih UMKM yang Tersedia" }).min(1, "Wajib Pilih UMKM yang Tersedia"),
    varianIds: z.array(z.string()).optional()
})

export type ProductFormSchema = z.infer<typeof productFormSchema>