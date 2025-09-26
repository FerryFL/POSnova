import type { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const kategoriRouter = createTRPCRouter({
    lihatKategori: publicProcedure.input(
        z.object({
            umkmId: z.string(),
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx

        const whereClause: Prisma.KategoriWhereInput = {}
        if (input.umkmId) {
            whereClause.UMKMId = input.umkmId
        }

        const kategori = await db.kategori.findMany({
            select: {
                id: true,
                nama: true,
                status: true,
                Produk: {
                    select: {
                        id: true,
                        status: true,
                        stok: true
                    }
                },
                UMKM: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            },
            where: whereClause
        })

        return kategori
    }),
    tambahKategori: publicProcedure.input(
        z.object({
            nama: z.string(),
            status: z.boolean(),
            UMKMId: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const kategoriBaru = await db.kategori.create({
            data: {
                nama: input.nama,
                status: input.status,
                UMKMId: input.UMKMId,
            }
        })

        return kategoriBaru
    }),
    ubahKategori: publicProcedure.input(
        z.object({
            id: z.string(),
            nama: z.string(),
            status: z.boolean(),
            UMKMId: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.kategori.update({
            where: {
                id: input.id
            },
            data: {
                nama: input.nama,
                status: input.status,
                UMKMId: input.UMKMId
            }
        })
    }),
    hapusKategori: publicProcedure.input(
        z.object({
            id: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.kategori.delete({
            where: {
                id: input.id
            }
        })
    })
})