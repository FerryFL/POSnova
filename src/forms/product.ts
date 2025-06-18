import { z } from "zod";

export const productFormSchema = z.object({
    nama: z.string().min(1, "Masukan Minimal 1 Karakter!"),
    harga: z.coerce.number().min(1000, "Masukan Minimal Rp. 1000"),
    stok: z.coerce.number(),
    status: z.boolean(),
    categoryId: z.string()
})

export type ProductFormSchema = z.infer<typeof productFormSchema>