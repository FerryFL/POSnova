import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const produkRouter = createTRPCRouter({
    lihatProduk: publicProcedure
        .input(z.object({}).optional())
        .query(async ({ ctx }) => {
            const { db } = ctx

            const produk = await db.produk.findMany({
                select: {
                    id: true,
                    nama: true,
                    harga: true,
                    gambar: true,
                    stok: true,
                    status: true,
                    kategori: {
                        select: {
                            id: true,
                            nama: true
                        }
                    },
                    UMKM: {
                        select: {
                            id: true,
                            nama: true
                        }
                    },
                    ProdukVarian: {
                        select: {
                            varian: {
                                select: {
                                    id: true,
                                    nama: true,
                                    status: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            return produk
        }),

    tambahProduk: publicProcedure
        .input(
            z.object({
                nama: z.string(),
                harga: z.number(),
                stok: z.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            const produkBaru = await db.produk.create({
                data: {
                    nama: input.nama,
                    harga: input.harga,
                    stok: input.stok,
                    status: input.status,
                    kategoriId: input.kategoriId,
                    UMKMId: input.UMKMId,
                    gambar: input.gambar,
                    ProdukVarian: {
                        create: input.varianIds?.map((varianId) => ({
                            varianId
                        })) ?? []
                    }
                }
            })

            return produkBaru
        }),

    tambahProdukWithVariants: publicProcedure
        .input(
            z.object({
                nama: z.string(),
                harga: z.number(),
                stok: z.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string(),
                newVariants: z.array(z.object({
                    nama: z.string(),
                    status: z.boolean()
                })).optional(),
                existingVariantUpdates: z.array(z.object({
                    id: z.string(),
                    nama: z.string(),
                    status: z.boolean(),
                    isDeleted: z.boolean()
                })).optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            // Handle existing variant updates first
            if (input.existingVariantUpdates && input.existingVariantUpdates.length > 0) {
                for (const update of input.existingVariantUpdates) {
                    if (update.isDeleted) {
                        // Delete the variant and its relations
                        await db.produkVarian.deleteMany({
                            where: { varianId: update.id }
                        })
                        await db.varian.delete({
                            where: { id: update.id }
                        })
                    } else {
                        // Update the variant status and name
                        await db.varian.update({
                            where: { id: update.id },
                            data: { 
                                status: update.status,
                                nama: update.nama
                            }
                        })
                    }
                }
            }

            // Create new variants if any
            const createdVariants = []
            if (input.newVariants && input.newVariants.length > 0) {
                for (const newVariant of input.newVariants) {
                    const createdVariant = await db.varian.create({
                        data: {
                            nama: newVariant.nama,
                            status: newVariant.status,
                            UMKMId: input.UMKMId
                        }
                    })
                    createdVariants.push(createdVariant.id)
                }
            }

            // Filter out deleted variants from varianIds
            const deletedVariantIds = input.existingVariantUpdates
                ?.filter(update => update.isDeleted)
                .map(update => update.id) ?? []
            
            const filteredVarianIds = (input.varianIds ?? [])
                .filter(id => !deletedVariantIds.includes(id))

            // Combine existing (non-deleted) and new variant IDs
            const allVariantIds = [...filteredVarianIds, ...createdVariants]

            // Create the product with all variants
            const produkBaru = await db.produk.create({
                data: {
                    nama: input.nama,
                    harga: input.harga,
                    stok: input.stok,
                    status: input.status,
                    kategoriId: input.kategoriId,
                    UMKMId: input.UMKMId,
                    gambar: input.gambar,
                    ProdukVarian: {
                        create: allVariantIds.map((varianId) => ({
                            varianId
                        }))
                    }
                }
            })

            return produkBaru
        }),

    ubahProduk: publicProcedure
        .input(
            z.object({
                id: z.string(),
                nama: z.string(),
                harga: z.number(),
                stok: z.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            // First, delete existing variant relations
            await db.produkVarian.deleteMany({
                where: {
                    produkId: input.id
                }
            })

            // Update product and create new variant relations
            await db.produk.update({
                where: {
                    id: input.id
                },
                data: {
                    nama: input.nama,
                    harga: input.harga,
                    stok: input.stok,
                    status: input.status,
                    kategoriId: input.kategoriId,
                    UMKMId: input.UMKMId,
                    gambar: input.gambar,
                    ProdukVarian: {
                        create: input.varianIds?.map((varianId) => ({
                            varianId
                        })) ?? []
                    }
                }
            })
        }),

    ubahProdukWithVariants: publicProcedure
        .input(
            z.object({
                id: z.string(),
                nama: z.string(),
                harga: z.number(),
                stok: z.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string(),
                newVariants: z.array(z.object({
                    nama: z.string(),
                    status: z.boolean()
                })).optional(),
                existingVariantUpdates: z.array(z.object({
                    id: z.string(),
                    nama: z.string(),
                    status: z.boolean(),
                    isDeleted: z.boolean()
                })).optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            // Handle existing variant updates first
            if (input.existingVariantUpdates && input.existingVariantUpdates.length > 0) {
                for (const update of input.existingVariantUpdates) {
                    if (update.isDeleted) {
                        // Delete the variant and its relations
                        await db.produkVarian.deleteMany({
                            where: { varianId: update.id }
                        })
                        await db.varian.delete({
                            where: { id: update.id }
                        })
                    } else {
                        // Update the variant status and name
                        await db.varian.update({
                            where: { id: update.id },
                            data: { 
                                status: update.status,
                                nama: update.nama
                            }
                        })
                    }
                }
            }

            // Create new variants if any
            const createdVariants = []
            if (input.newVariants && input.newVariants.length > 0) {
                for (const newVariant of input.newVariants) {
                    const createdVariant = await db.varian.create({
                        data: {
                            nama: newVariant.nama,
                            status: newVariant.status,
                            UMKMId: input.UMKMId
                        }
                    })
                    createdVariants.push(createdVariant.id)
                }
            }

            // Filter out deleted variants from varianIds
            const deletedVariantIds = input.existingVariantUpdates
                ?.filter(update => update.isDeleted)
                .map(update => update.id) ?? []
            
            const filteredVarianIds = (input.varianIds ?? [])
                .filter(id => !deletedVariantIds.includes(id))

            // Combine existing (non-deleted) and new variant IDs
            const allVariantIds = [...filteredVarianIds, ...createdVariants]

            // Delete existing variant relations for this product
            await db.produkVarian.deleteMany({
                where: {
                    produkId: input.id
                }
            })

            // Update product and create new variant relations
            await db.produk.update({
                where: {
                    id: input.id
                },
                data: {
                    nama: input.nama,
                    harga: input.harga,
                    stok: input.stok,
                    status: input.status,
                    kategoriId: input.kategoriId,
                    UMKMId: input.UMKMId,
                    gambar: input.gambar,
                    ProdukVarian: {
                        create: allVariantIds.map((varianId) => ({
                            varianId
                        }))
                    }
                }
            })
        }),

    hapusProduk: publicProcedure
        .input(
            z.object({
                id: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            // First delete variant relations
            await db.produkVarian.deleteMany({
                where: {
                    produkId: input.id
                }
            })

            // Then delete the product
            await db.produk.delete({
                where: {
                    id: input.id
                }
            })
        }),

    tambahGambarProdukSignedUrl: publicProcedure
        .mutation(async () => {
            // Your existing signed URL logic here
            // This should return { path: string, token: string }
            return {
                path: `products/${Date.now()}_${Math.random()}.jpg`,
                token: "your-signed-token-here"
            }
        }),

    hapusGambarProdukMultiple: publicProcedure
        .input(
            z.object({
                gambar: z.array(z.string())
            })
        )
        .mutation(async ({ input }) => {
            // Your existing image deletion logic here
            // This should handle deleting multiple images from storage
            console.log("Deleting images:", input.gambar)
        })
})