
import type { inferRouterOutputs } from '@trpc/server'
import { toast } from 'sonner'
import { create } from 'zustand'
import type { AppRouter } from '~/server/api/root'

type Produk = inferRouterOutputs<AppRouter>["produk"]["lihatProduk"][number]
type ProdukKeranjang = Omit<Produk, "ProdukVarian"> & {
    jumlah: number
    varianId?: string
    varianNama?: string
}

interface ItemState {
    items: ProdukKeranjang[]
    totalProduk: number
    jumlahProduk: number
    addToCart: (
        product: Produk,
        selectedVarianId: string,
        jumlahToAdd: number
    ) => void
    plusProduk: (id: string, varianId?: string) => void
    minusProduk: (id: string, varianId?: string) => void
    removeProduk: (id: string, varianId?: string) => void
    clear: () => void
}

export const useCartStore = create<ItemState>()((set, get) => ({
    items: [],
    jumlahProduk: 0,
    totalProduk: 0,

    addToCart: (product, selectedVarianId, jumlahToAdd) => {
        const normalizedVarianId = selectedVarianId || undefined;

        const selectedVarian = product.ProdukVarian.find(
            (item) => item.varian.id === normalizedVarianId
        )

        const totalExistingJumlah = get().items
            .filter((item) => item.id === product.id)
            .reduce((sum, item) => sum + item.jumlah, 0)

        if (totalExistingJumlah >= product.stok) {
            toast.error("Jumlah melebihi stok tersedia!");
            return;
        }

        set((state) => {
            const existing = state.items.find((item) => item.id === product.id && item.varianId === normalizedVarianId)

            let newItems
            if (existing) {
                newItems = state.items.map((item) => item.id === product.id && item.varianId === normalizedVarianId ? { ...item, jumlah: item.jumlah + jumlahToAdd } : item)
            } else {
                const { ...rest } = product
                newItems = [
                    ...state.items,
                    {
                        ...rest,
                        jumlah: jumlahToAdd,
                        varianId: selectedVarian?.varian.id,
                        varianNama: selectedVarian?.varian.nama,
                    },
                ]
            }

            return {
                items: newItems,
                jumlahProduk: state.jumlahProduk + jumlahToAdd,
                totalProduk: state.totalProduk + product.harga * jumlahToAdd
            }
        })

        toast.success("Berhasil Ditambahkan")
    },

    plusProduk: (id, varianId) => {
        const produk = get().items.find((item) => item.id === id && item.varianId === varianId)
        if (!produk) return

        const totalExistingJumlah = get().items
            .filter((item) => item.id === id)
            .reduce((sum, item) => sum + item.jumlah, 0)

        if (totalExistingJumlah >= produk.stok) {
            toast.error("Jumlah melebihi stok tersedia!")
            return
        }

        set((state) => ({
            items: state.items.map((item) => item.id === id && item.varianId === varianId ? { ...item, jumlah: item.jumlah + 1 } : item),
            jumlahProduk: state.jumlahProduk + 1,
            totalProduk: state.totalProduk + produk.harga
        }))
    },

    minusProduk: (id, varianId) => {
        const produk = get().items.find((item) => item.id === id && item.varianId === varianId)
        if (!produk) return

        set((state) => {
            const newItems = state.items.map((item) => item.id === id && item.varianId === varianId ? { ...item, jumlah: item.jumlah - 1 } : item)
                .filter((item) => item.jumlah > 0)
            return {
                items: newItems,
                jumlahProduk: state.jumlahProduk - 1,
                totalProduk: state.totalProduk - produk.harga
            }
        })
    },

    removeProduk: (id, varianId) => {
        const produkToRemove = get().items.find((item) => item.id === id && item.varianId === varianId)
        if (!produkToRemove) return

        set((state) => ({
            items: state.items.filter((item) => !(item.id === id && item.varianId === varianId)),
            jumlahProduk: Math.max(0, state.jumlahProduk - produkToRemove.jumlah),
            totalProduk: state.totalProduk - produkToRemove.jumlah * produkToRemove.harga
        }))
    },

    clear: () => set({ items: [], jumlahProduk: 0, totalProduk: 0 })
}))