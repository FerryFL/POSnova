import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Prisma } from "@prisma/client";

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
                pajakPersen: true,
                pajakNominal: true,
                grandTotal: true,
                createdBy: true,
                UMKM: {
                    select: {
                        id: true,
                        nama: true,
                        alamat: true,
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
                },
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
                pajakPersen: z.number().default(0),
                pajakNominal: z.number().default(0),
                grandTotal: z.number(),
                totalProduk: z.number().min(1),
                totalHarga: z.number().min(0),
                umkmId: z.string(),
                createdBy: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx

            const transaksi = db.transaksi.create({
                data: {
                    totalProduk: input.totalProduk,
                    totalHarga: input.totalHarga,
                    pajakPersen: input.pajakPersen,
                    pajakNominal: input.pajakNominal,
                    grandTotal: input.grandTotal,
                    UMKMId: input.umkmId,
                    createdBy: input.createdBy,
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

            for (const item of input.items) {
                await db.produk.update({
                    where: { id: item.produkId },
                    data: {
                        stok: {
                            decrement: item.jumlah
                        }
                    }
                })
            }

            return transaksi
        }),

    rekomendasiProduk: publicProcedure
        .input(
            z.object({
                umkmId: z.string(),
                produkIds: z.array(z.string()),
            })
        )
        .query(async ({ ctx, input }) => {
            const { db } = ctx;

            if (input.produkIds.length === 0) {
                return [];
            }

            const transaksi = await db.transaksi.findMany({
                where: { UMKMId: input.umkmId },
                select: {
                    id: true,
                    transaksiItem: {
                        select: {
                            produkId: true,
                        },
                    },
                },
            });

            const cooccurrence: Record<string, Record<string, number>> = {};

            transaksi.forEach((t) => {
                const produkIds = t.transaksiItem.map((i) => i.produkId);

                produkIds.forEach((p1) => {
                    produkIds.forEach((p2) => {
                        if (p1 === p2) return;
                        cooccurrence[p1] ??= {};
                        cooccurrence[p1][p2] = (cooccurrence[p1][p2] ?? 0) + 1;
                    });
                });
            });

            const candidateCounts: Record<string, number> = {};

            input.produkIds.forEach((pid) => {
                const related = cooccurrence[pid] ?? {};
                Object.entries(related).forEach(([otherId, count]) => {
                    if (input.produkIds.includes(otherId)) return;
                    candidateCounts[otherId] = (candidateCounts[otherId] ?? 0) + count;
                });
            });

            const sorted = Object.entries(candidateCounts).sort((a, b) => b[1] - a[1]);

            if (sorted.length === 0) return [];

            const rekomendasi = await db.produk.findMany({
                where: {
                    id: { in: sorted.map(([id]) => id) },
                    stok: { gt: 0 }
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
                                    nama: true,
                                },
                            },
                        },
                    },
                    kategori: {
                        select: {
                            id: true,
                            nama: true,
                            status: true,
                        },
                    },
                    UMKM: {
                        select: {
                            id: true,
                            nama: true,
                        },
                    },
                },
            });

            const hasil = rekomendasi.map((produk) => ({
                ...produk,
                count: candidateCounts[produk.id] ?? 0,
            }));

            return hasil.sort((a, b) => b.count - a.count).slice(0, 1);
        }),
})