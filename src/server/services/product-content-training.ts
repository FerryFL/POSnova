import type { PrismaClient } from "@prisma/client";

export const getProductsForContentTraining = (db: PrismaClient, umkmId: string) => {
    return db.produk.findMany({
        where: {
            status: true,
            UMKMId: umkmId,
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
                select: { varian: { select: { id: true, nama: true } } }
            },
            kategori: {
                select: { id: true, nama: true, status: true }
            },
            UMKM: {
                select: { id: true, nama: true }
            }
        }
    });
}

export type ProductForContentTraining = Awaited<ReturnType<typeof getProductsForContentTraining>>