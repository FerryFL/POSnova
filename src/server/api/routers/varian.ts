import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const varianRouter = createTRPCRouter({
    lihatVarian: publicProcedure.query(async ({ ctx }) => {
        const { db } = ctx

        const varian = await db.varian.findMany({
            select: {
                id: true,
                nama: true,
                status: true,
                ProdukVarian: {
                    select: {
                      produk: {
                        select: {
                          id: true,
                          nama: true,
                          status: true
                        }
                      }
                    }
                },
                UMKM: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        })

        return varian
    }),
    tambahVarian: publicProcedure.input(
        z.object({
            nama: z.string(),
            umkmId: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const varianBaru = await db.varian.create({
            data: {
                nama: input.nama,
                UMKMId: input.umkmId,
            }
        })
        return varianBaru
    }),
    ubahVarian: publicProcedure.input(
        z.object({
            id: z.string(),
            nama: z.string(),
            umkmId: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.varian.update({
            where: {
                id: input.id
            },
            data: {
                nama: input.nama,
                UMKMId: input.umkmId,
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
    }),
    lihatVarianByUMKM: publicProcedure
    .input(z.object({ umkmId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.varian.findMany({
        where: {
          UMKMId: input.umkmId,
        },
        orderBy: {
          nama: 'asc',
        },
      });
    }),
})
