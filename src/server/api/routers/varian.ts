import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const varianRouter = createTRPCRouter({
    lihatVarian: publicProcedure.input(
        z.object({
            umkmId: z.string()
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx

        const whereClause: Prisma.VarianWhereInput = {}
        if (input.umkmId) {
            whereClause.UMKMId = input.umkmId
        }

        const varian = await db.varian.findMany({
            select: {
                id: true,
                nama: true,
                status: true,
                UMKM: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            },
            where: whereClause
        })

        return varian
    }),
    tambahVarian: publicProcedure.input(
        z.object({
            nama: z.string(),
            status: z.boolean(),
            UMKMId: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const existing = await db.varian.findFirst({
            where: {
                nama: input.nama,
                UMKMId: input.UMKMId
            }
        })

        if (existing) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "Varian dengan nama ini sudah tersimpan!"
            })
        }

        const varianBaru = await db.varian.create({
            data: {
                nama: input.nama,
                status: input.status,
                UMKMId: input.UMKMId
            }
        })
        return varianBaru
    }),
    ubahVarian: publicProcedure.input(
        z.object({
            id: z.string(),
            nama: z.string(),
            status: z.boolean(),
            UMKMId: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const existing = await db.varian.findFirst({
            where: {
                nama: input.nama,
                UMKMId: input.UMKMId
            }
        })

        if (existing) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "Varian dengan nama ini sudah tersimpan!"
            })
        }

        await db.varian.update({
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
    hapusVarian: publicProcedure.input(
        z.object({
            id: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.varian.delete({
            where: {
                id: input.id
            }
        })
    })
})