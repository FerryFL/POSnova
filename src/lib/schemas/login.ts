import { z } from "zod";

export const loginFormSchema = z.object({
    email: z.string({ message: "Email wajib diisi" }).min(1, "Email wajib diisi").email("Masukan format email yang sesuai"),
    password: z.string({ message: "Password wajib diisi" }).min(6, "Password minimal 6 karakter"),
    remember: z.boolean().optional()
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>