import { z } from "zod";

export const umkmFormSchema = z.object({
    nama: z.string().min(1, "Nama UMKM wajib diisi!").max(50, "Masukan Maksimal 50 Karakter!"),
    alamat: z.string().min(1, "Alamat wajib diisi!").max(50, "Masukan Maksimal 50 Karakter!"),
    noTelp: z.string()
        .min(1, "Nomor telepon wajib diisi!")
        .regex(/^(\+62|62|0)[0-9]{9,13}$/, "Format nomor telepon tidak valid!")
});

export type UmkmFormSchema = z.infer<typeof umkmFormSchema>;