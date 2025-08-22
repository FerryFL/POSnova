import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { supabaseAccess } from "~/server/supabase-access";
import { Bucket, BucketPath } from "~/server/bucket";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export const produkRouter = createTRPCRouter({
    lihatProduk: publicProcedure
        .input(z.object({
            kategoriId: z.string().optional()
        }).optional())
        .query(async ({ ctx, input }) => {
            const { db } = ctx

            const whereClause: Prisma.ProdukWhereInput = {}
            if (input?.kategoriId && input.kategoriId !== "Semua") {
                whereClause.kategoriId = input.kategoriId
            }

            const produk = await db.produk.findMany({
                where: whereClause,
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
                harga: z.coerce.number(),
                stok: z.coerce.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string().url(),
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
                harga: z.coerce.number(),
                stok: z.coerce.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string().url(),
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
                harga: z.coerce.number(),
                stok: z.coerce.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string().url(),
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
                harga: z.coerce.number(),
                stok: z.coerce.number(),
                status: z.boolean(),
                kategoriId: z.string(),
                UMKMId: z.string(),
                varianIds: z.array(z.string()).optional(),
                gambar: z.string().url(),
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

    tambahGambarProdukSignedUrl: publicProcedure
        .mutation(async () => {
            const { data, error } = await supabaseAccess.storage.from(Bucket.ProductImages)
                .createSignedUploadUrl(`${Date.now()}.jpeg`)

            if (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error.message
                })
            }

            return data
        }),

    hapusGambarProduk: publicProcedure
        .input(
            z.object({
                gambar: z.string().url()
            })
        )
        .mutation(async ({ input }) => {
            const imgUrl = input.gambar
            const pathPrefix = BucketPath.ProductImages
            const fileName = imgUrl.replace(pathPrefix, "")
            const { error } = await supabaseAccess.storage.from(Bucket.ProductImages).remove([fileName])
            if (error) {
                console.error("Error removing image:", error)
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal Menghapus gambar produk"
                })
            }
        }),

    hapusGambarProdukMultiple: publicProcedure
        .input(
            z.object({
                gambar: z.array(z.string().url())
            })
        )
        .mutation(async ({ input }) => {
            const pathPrefix = BucketPath.ProductImages
            const fileNames = input.gambar.map(imgUrl => imgUrl.replace(pathPrefix, ""))
            const { error } = await supabaseAccess.storage.from(Bucket.ProductImages).remove(fileNames)
            if (error) {
                console.error("Error removing images:", error)
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Gagal Menghapus gambar produk"
                })
            }
        }),

    hapusProduk: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            const produk = await db.produk.findUnique({
                where: { id: input.id },
                select: { gambar: true }
            })

            if (!produk) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Produk tidak ditemukan"
                })
            }

            const linkedVariants = await db.produkVarian.findMany({
                where: { produkId: input.id },
                select: { varianId: true }
            })
            const variantIds = linkedVariants.map(v => v.varianId)

            await db.produkVarian.deleteMany({
                where: { produkId: input.id }
            })

            for (const varianId of variantIds) {
                const count = await db.produkVarian.count({
                    where: { varianId }
                })
                if (count === 0) {
                    await db.varian.delete({
                        where: { id: varianId }
                    })
                }
            }

            const imgUrl = produk.gambar
            const pathPrefix = BucketPath.ProductImages
            const fileName = imgUrl.replace(pathPrefix, "")

            const { error } = await supabaseAccess.storage.from(Bucket.ProductImages).remove([fileName])

            if (error) {
                console.error("Error removing image:", error)
            }

            await db.produk.delete({
                where: { id: input.id }
            })
        }),
})