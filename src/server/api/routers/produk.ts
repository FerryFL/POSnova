import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { supabaseAccess } from "~/server/supabase-access";
import { Bucket } from "~/server/bucket";
import { TRPCError } from "@trpc/server";

export const produkRouter = createTRPCRouter({
    lihatProduk: publicProcedure.query(async ({ ctx }) => {
        const { db } = ctx

        const produk = await db.produk.findMany({
            select: {
                id: true,
                nama: true,
                harga: true,
                gambar: true,
                status: true,
                stok: true,
                kategori: {
                    select: {
                        id: true,
                        nama: true
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
            categoryId: z.string(),
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
                kategoriId: input.categoryId,
                gambar: input.gambar
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
            categoryId: z.string(),
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
                kategoriId: input.categoryId,
                gambar: input.gambar
            }
        })
    }),
    hapusProduk: publicProcedure.input(
        z.object({
            id: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.produk.delete({
            where: {
                id: input.id
            }
        })
    })
})