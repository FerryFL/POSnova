import { z } from "zod";

export const categoryFormSchema = z.object({
    nama: z.string().min(1, "Masukan Minimal 1 Karakter!").max(50, "Masukan Maksimal 50 Karakter!"),
    status: z.boolean()
})

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>