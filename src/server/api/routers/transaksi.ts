import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Prisma } from "@prisma/client";
import { rekomendasiRouter } from "./rekomendasi";

export const transaksiRouter = createTRPCRouter({
    lihatTransaksi: publicProcedure.input(
        z.object({
            umkmId: z.string()
        })
    ).query(async ({ ctx, input }) => {
        const { db } = ctx

        const whereClause: Prisma.TransaksiWhereInput = {}
        if (input.umkmId) {
            whereClause.UMKMId = input.umkmId
        }

        const transaksi = await db.transaksi.findMany({
            select: {
                id: true,
                totalHarga: true,
                totalProduk: true,
                UMKM: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                tanggalTransaksi: true,
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
            },
            where: whereClause
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
                umkmId: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;

            // 1. Simpan transaksi ke DB
            const transaksiBaru = await db.transaksi.create({
            data: {
                totalProduk: input.totalProduk,
                totalHarga: input.totalHarga,
                UMKMId: input.umkmId,
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

            // 2. Kurangi stok produk sesuai jumlah yang dibelanjakan
            for (const item of input.items) {
                await db.produk.update({
                    where: { id: item.produkId },
                    data: { stok: { decrement: item.jumlah } },
                });
            }

            // 3. Setelah transaksi berhasil, latih ulang model rekomendasi
            try {
                const caller = rekomendasiRouter.createCaller(ctx);
                const result = await caller.trainModel({ umkmId: input.umkmId });
                console.log(`[rekomendasi] Retrained for UMKM ${input.umkmId}`, result);
            } catch (err) {
                console.error(`[rekomendasi] Training gagal untuk UMKM ${input.umkmId}`, err);
            }

            return transaksiBaru;
        }),
})