import { z } from "zod";

export const productFormSchema = z.object({
    nama: z.string().min(1, "Masukan Minimal 1 Karakter!").max(100, "Masukan Maksimal 100 Karakter!"),
    harga: z.coerce.number().min(1000, "Masukan Minimal Rp. 1000").max(100000000, "Masukan Maksimal Rp. 100.000.000"),
    stok: z.coerce.number().max(999, "Masukan Maksimal 999"),
    status: z.boolean(),
    categoryId: z.string(),
    varianIds: z.array(z.string()).optional()
})

export type ProductFormSchema = z.infer<typeof productFormSchema>