import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const kategoriRouter = createTRPCRouter({
    lihatKategori: publicProcedure.query(async ({ ctx }) => {
        const { db } = ctx

        const kategori = await db.kategori.findMany({
            select: {
                id: true,
                nama: true,
                status: true,
                Produk: {
                    select: {
                        id: true,
                        status: true
                    }
                },
            }
        })

        return kategori
    }),
    tambahKategori: publicProcedure.input(
        z.object({
            nama: z.string(),
            status: z.boolean()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const kategoriBaru = await db.kategori.create({
            data: {
                nama: input.nama,
                status: input.status
            }
        })

        return kategoriBaru
    }),
    ubahKategori: publicProcedure.input(
        z.object({
            id: z.string(),
            nama: z.string(),
            status: z.boolean()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.kategori.update({
            where: {
                id: input.id
            },
            data: {
                nama: input.nama,
                status: input.status
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