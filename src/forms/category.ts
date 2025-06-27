import { z } from "zod";

export const categoryFormSchema = z.object({
    nama: z.string().min(1, "Nama Kategori Wajib Diisi").max(50, "Masukan Maksimal 50 Karakter!"),
    status: z.boolean()
})

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>