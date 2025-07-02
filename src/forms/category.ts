import { z } from "zod";

export const categoryFormSchema = z.object({
    nama: z.string({ message: "Nama Kategori Wajib Diisi" }).min(1, "Nama Kategori Wajib Diisi").max(50, "Masukan Maksimal 50 Karakter!"),
    status: z.boolean(),
    UMKMId: z.string({ message: "Wajib Pilih UMKM yang Tersedia" }).min(1, "Wajib Pilih UMKM yang Tersedia")
})

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>