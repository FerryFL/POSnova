import type { PrismaClient } from "@prisma/client";

export const getTransactionsForAprioriTraining = (db: PrismaClient, umkmId: string) => {
    return db.transaksi.findMany({
        where: {
            UMKMId: umkmId,
        },
        select: {
            id: true,
            tanggalTransaksi: true,
            totalHarga: true,
            totalProduk: true,
            transaksiItem: {
                where: { produk: { stok: { gt: 0 } } },
                select: {
                    id: true,
                    jumlah: true,
                    hargaSatuan: true,
                    varianNama: true,
                    produkId: true,
                    produk: {
                        select: {
                            id: true,
                            nama: true,
                            harga: true,
                            gambar: true,
                            stok: true,
                            status: true,
                            kategori: {
                                select: { id: true, nama: true, status: true }
                            },
                            UMKM: {
                                select: { id: true, nama: true }
                            },
                            ProdukVarian: {
                                select: { varian: { select: { id: true, nama: true } } }
                            }
                        }
                    }
                }
            }
        }
    });
}

export type TransactionForAprioriTraining = Awaited<ReturnType<typeof getTransactionsForAprioriTraining>>