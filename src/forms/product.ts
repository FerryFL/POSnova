import { z } from "zod";

// Schema for new variants that will be created
export const newVariantSchema = z.object({
    tempId: z.string(),
    nama: z.string().min(1, "Nama varian wajib diisi").max(50, "Maksimal 50 karakter"),
    status: z.boolean()
});

// Schema for existing variant updates
export const existingVariantUpdateSchema = z.object({
    id: z.string(),
    nama: z.string(),
    status: z.boolean(),
    isDeleted: z.boolean()
});

// Base schema without newVariants for the form
export const productFormSchema = z.object({
    nama: z.string({ message: "Nama Produk Wajib Diisi" }).min(1, "Nama Produk Wajib Diisi").max(50, "Masukan Maksimal 50 Karakter!"),
    harga: z.coerce.number({ message: "Harga Produk Wajib Diisi" }).min(1000, "Masukan Minimal Rp. 1000").max(100000000, "Masukan Maksimal Rp. 100.000.000"),
    stok: z.coerce.number({ message: "Jumlah Stok Wajib Diisi" }).max(999, "Masukan Maksimal 999"),
    status: z.boolean(),
    kategoriId: z.string({ message: "Wajib Pilih Kategori yang Tersedia" }).min(1, "Wajib Pilih Kategori yang Tersedia"),
    UMKMId: z.string({ message: "Wajib Pilih UMKM yang Tersedia" }).min(1, "Wajib Pilih UMKM yang Tersedia"),
    varianIds: z.array(z.string()).optional()
});

export type ProductFormSchema = z.infer<typeof productFormSchema>
export type NewVariantSchema = z.infer<typeof newVariantSchema>
export type ExistingVariantUpdateSchema = z.infer<typeof existingVariantUpdateSchema>

// Extended type that includes new variants and existing variant updates for submission
export interface ProductFormWithVariants extends ProductFormSchema {
    newVariants: Array<{
        nama: string;
        status: boolean;
        tempId: string;
    }>;
    existingVariantUpdates?: Array<{
        id: string;
        nama: string;
        status: boolean;
        isDeleted: boolean;
    }>;
}