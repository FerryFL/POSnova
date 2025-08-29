import { z } from "zod";

export const variantFormSchema = z.object({
    nama: z.string({ message: "Nama Varian Wajib Diisi" }).min(1, "Nama Varian Wajib Diisi").max(50, "Masukan Maksimal 50 Karakter!"),
    status: z.boolean(),
    UMKMId: z.string({ message: "Wajib Pilih UMKM yang Tersedia" }).min(1, "Wajib Pilih UMKM yang Tersedia")
})

export type VariantFormSchema = z.infer<typeof variantFormSchema>