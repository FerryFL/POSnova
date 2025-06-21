import { z } from "zod";

export const variantFormSchema = z.object({
    nama: z.string().min(1, "Masukan Minimal 1 Karakter!"),
    status: z.boolean()
})

export type VariantFormSchema = z.infer<typeof variantFormSchema>