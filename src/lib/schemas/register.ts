import { z } from "zod";

export const registerFormSchema = z.object({
    name: z.string({ message: "Nama wajib diisi" }).min(1, "Nama wajib diisi").max(50, "Nama maksimal 50 karakter"),
    email: z.string({ message: "Email wajib diisi" }).min(1, "Email wajib diisi").email("Masukan format email yang sesuai").max(50, "Email maksimal 50 karakter"),
    password: z.string({ message: "Password wajib diisi" }).min(6, "Password minimal 6 karakter"),
    role: z.array(z.string()).optional(),
    umkmId: z.string({ message: "Pilih minimal 1 UMKM" }).min(1, { message: "Pilih minimal 1 UMKM" })
})

export type RegisterFormSchema = z.infer<typeof registerFormSchema>