import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const umkmRouter = createTRPCRouter({
    lihatUMKM: publicProcedure.query(async ({ ctx }) => {
        const { db } = ctx

        const umkm = await db.uMKM.findMany({
            select: {
                id: true,
                nama: true,
                alamat: true,
                noTelp: true
            }
        })

        return umkm
    }),

    tambahUMKM: publicProcedure.input(
        z.object({
            nama: z.string(),
            alamat: z.string(),
            noTelp: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const umkmBaru = await db.uMKM.create({
            data: {
                nama: input.nama,
                alamat: input.alamat,
                noTelp: input.noTelp
            }
        })

        return umkmBaru
    }),

    ubahUMKM: publicProcedure.input(
        z.object({
            id: z.string(),
            nama: z.string(),
            alamat: z.string(),
            noTelp: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.uMKM.update({
            where: {
                id: input.id
            },
            data: {
                nama: input.nama,
                alamat: input.alamat,
                noTelp: input.noTelp
            }
        })
    }),

    hapusUMKM: publicProcedure.input(
        z.object({
            id: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.uMKM.delete({
            where: {
                id: input.id
            }
        })
    })
})