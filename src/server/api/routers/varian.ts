import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const varianRouter = createTRPCRouter({
    lihatVarian: publicProcedure
    .input(z.object({ produkId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx

      if (input.produkId) {
        const varian = await db.varian.findMany({
          where: {
            ProdukVarian: {
              some: {
                produkId: input.produkId,
              },
            },
          },
        })

        return varian
      }

      // fallback: return all variants if no produkId is passed
      return await db.varian.findMany()
    }),
    tambahVarian: publicProcedure.input(
        z.object({
            nama: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        const varianBaru = await db.varian.create({
            data: {
                nama: input.nama,
            }
        })
        return varianBaru
    }),
    ubahVarian: publicProcedure.input(
        z.object({
            id: z.string(),
            nama: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        const { db } = ctx

        await db.varian.update({
            where: {
                id: input.id
            },
            data: {
                nama: input.nama,
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
