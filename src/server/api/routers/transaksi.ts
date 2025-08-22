import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const transaksiRouter = createTRPCRouter({
    lihatTransaksi: publicProcedure.query(async ({ ctx }) => {
        const { db } = ctx

        const transaksi = await db.transaksi.findMany({
            include: {
                transaksiItem: {
                    select: {
                        id: true,
                        varianNama: true,
                        hargaSatuan: true,
                        jumlah: true,
                        produk: {
                            select: {
                                nama: true
                            }
                        }
                    }
                }
            }
        })
        return transaksi
    }),

    tambahTransaksi: publicProcedure
        .input(
            z.object({
                items: z.array(
                    z.object({
                        produkId: z.string(),
                        jumlah: z.number().min(1),
                        hargaSatuan: z.number().min(0),
                        hargaTotal: z.number().min(0),
                        varianId: z.string().nullable().optional(),
                        varianNama: z.string().nullable().optional(),
                    })
                ),
                totalProduk: z.number().min(1),
                totalHarga: z.number().min(0),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            return db.transaksi.create({
                data: {
                    totalProduk: input.totalProduk,
                    totalHarga: input.totalHarga,
                    transaksiItem: {
                        create: input.items.map((item) => ({
                            produkId: item.produkId,
                            jumlah: item.jumlah,
                            hargaSatuan: item.hargaSatuan,
                            hargaTotal: item.hargaTotal,
                            varianId: item.varianId ?? null,
                            varianNama: item.varianNama ?? null,
                        })),
                    },
                },
            });
        }),
})