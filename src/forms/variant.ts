import { z } from "zod";

export const variantFormSchema = z.object({
    nama: z.string().min(1, "Masukan Minimal 1 Karakter!").max(100, "Masukan Maksimal 100 Karakter!"),
})

export type VariantFormSchema = z.infer<typeof variantFormSchema>