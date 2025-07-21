import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { supabaseAccess } from "~/server/supabase-access";
import { Bucket, BucketPath } from "~/server/bucket";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export const produkRouter = createTRPCRouter({
    lihatProduk: publicProcedure.input(
        z.object({
            kategoriId: z.string().optional()
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx

        const whereClause: Prisma.ProdukWhereInput = {}
        if (input.kategoriId !== "Semua") {
            whereClause.kategoriId = input.kategoriId
        }

        const produk = await db.produk.findMany({
            where: whereClause,
            orderBy: {
                nama: "asc"
            },
            select: {
                id: true,
                nama: true,
                harga: true,
                gambar: true,
                status: true,
                stok: true,
                ProdukVarian: {
                    select: {
                        varian: {
                            select: {
                                id: true,
                                nama: true
                            }
                        }
                    }
                },
                kategori: {
                    select: {
                        id: true,
                        nama: true,
                        status: true
                    }
                },
                UMKM: {
                    select: {
                        id: true,
                        nama: true,
                    }
                }
            }
        })

        return produk
    }),
    tambahProduk: publicProcedure.input(
        z.object({
            nama: z.string(),
            harga: z.coerce.number(),
            stok: z.coerce.number(),
            status: z.boolean(),
            kategoriId: z.string(),
            UMKMId: z.string(),
            varianIds: z.array(z.string()).nullable().default([]),
            gambar: z.string().url()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const produkBaru = await db.produk.create({
            data: {
                nama: input.nama,
                harga: input.harga,
                stok: input.stok,
                status: input.status,
                gambar: input.gambar,

                kategori: {
                  connect: {
                    id: input.kategoriId,
                  }
                },

                UMKM: {
                  connect: {
                    id: input.UMKMId,
                  }
                },

                ProdukVarian: {
                    create: input.varianIds?.map((varianId) => ({
                        varian: {
                            connect: { id: varianId }
                        }
                    })),
                },
            }
        })

        return produkBaru
    }),
    tambahGambarProdukSignedUrl: publicProcedure.mutation(async () => {
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
    ubahProduk: publicProcedure.input(
        z.object({
            id: z.string(),
            nama: z.string(),
            harga: z.coerce.number(),
            stok: z.coerce.number(),
            status: z.boolean(),
            kategoriId: z.string(),
            UMKMId: z.string(),
            varianIds: z.array(z.string()).optional().default([]),
            gambar: z.string().url()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

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
                ProdukVarian: {
                    deleteMany: {},
                    create: input.varianIds.map((variantId) => ({
                        varian: { connect: { id: variantId } }
                    }))
                },
                gambar: input.gambar
            }
        })
    }),
    hapusGambarProduk: publicProcedure.input(
        z.object({
            gambar: z.string().url()
        })
    ).mutation(async ({ input }) => {
        const imgUrl = input.gambar
        const pathPrefix = BucketPath.ProductImages
        const fileName = imgUrl.replace(pathPrefix, "")
        const { error } = await supabaseAccess.storage.from(Bucket.ProductImages).remove([fileName])
        if (error) {
            console.error("Error removing image:", error)
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Gagal Mengahapus gambar produk"
            })
        }
    }),
    hapusGambarProdukMultiple: publicProcedure.input(
        z.object({
            gambar: z.array(z.string().url())
        })
    ).mutation(async ({ input }) => {
        const pathPrefix = BucketPath.ProductImages
        const fileNames = input.gambar.map(imgUrl => imgUrl.replace(pathPrefix, ""))
        const { error } = await supabaseAccess.storage.from(Bucket.ProductImages).remove(fileNames)
        if (error) {
            console.error("Error removing images:", error)
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Gagal Mengahapus gambar produk"
            })
        }
    }),
    hapusProduk: publicProcedure.input(
        z.object({
            id: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const produk = await db.produk.findUnique({
            where: { id: input.id },
        })

        if (!produk) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Produk tidak ditemukan"
            })
        }

        const imgUrl = produk.gambar
        const pathPrefix = BucketPath.ProductImages
        const fileName = imgUrl.replace(pathPrefix, "")

        const { error } = await supabaseAccess.storage.from(Bucket.ProductImages).remove([fileName])

        if (error) {
            console.error("Error removing image:", error)
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Gagal Mengahapus gambar produk"
            })
        }

        await db.produkVarian.deleteMany({
          where: { produkId: input.id }
        })
        await db.produk.delete({
            where: {
                id: input.id
            }
        })
    }),
})
