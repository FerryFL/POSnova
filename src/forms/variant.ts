import { z } from "zod";

export const variantFormSchema = z.object({
    nama: z.string({ message: "Nama Varian Wajib Diisi" }).min(1, "Nama Varian Wajib Diisi").max(50, "Masukan Maksimal 50 Karakter!"),
})

export type VariantFormSchema = z.infer<typeof variantFormSchema>