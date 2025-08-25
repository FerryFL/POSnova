import type { Produk } from "~/utils/api"

export type ProdukKeranjang = Omit<Produk, "ProdukVarian"> & {
    jumlah: number
    varianId?: string
    varianNama?: string
}