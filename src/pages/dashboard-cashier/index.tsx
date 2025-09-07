import { useRouter } from "next/router";
import { useEffect, useState, type ReactElement } from "react";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { api, type Produk } from "~/utils/api";
import type { NextPageWithLayout } from "../_app";
import type { ProdukKeranjang } from "~/types/cart";
import CategorySkeleton from "./_components/CategorySkeleton";
import CategoryCards from "./_components/CategoryCards";
import ProductSkeleton from "./_components/ProductSkeleton";
import ProductCards from "./_components/ProductCards";
import CartSheet from "./_components/CartSheet";
import DialogRekomendasiProduk from "./_components/DialogRekomendasiProduk";
import DialogSelectProduk from "./_components/DialogSelectProduk";
import DialogDeleteProduk from "./_components/DialogDeleteProduk";
import { useUserStore } from "~/store/user";

export const DashboardCashier: NextPageWithLayout = () => {

    const router = useRouter()
    const { profile } = useUserStore()

    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [openDialogCart, setOpenDialogCart] = useState(false)

    const [selectedKategoriId, setSelectedKategoriId] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");

    const [selectedProdukRemove, setSelectedProdukRemove] = useState<ProdukKeranjang>()

    const [selectedVarianId, setSelectedVarianId] = useState("")
    const [selectedJumlah, setSelectedJumlah] = useState(1)

    const [selectedProdukCart, setSelectedProdukCart] = useState<Produk>()

    const { data: products, isLoading } = api.produk.lihatProduk.useQuery(
        {
            kategoriId: selectedKategoriId,
            umkmId: profile?.UMKM?.id ?? ""
        },
        {
            enabled: !!profile?.UMKM?.id
        }
    );

    const filteredProducts = products?.filter((product) => product.status && product.kategori.status) ?? [];

    const { data: categories, isLoading: isCategoriesLoading } = api.kategori.lihatKategori.useQuery(
        { umkmId: profile?.UMKM?.id ?? "" },
        {
            enabled: !!profile?.UMKM?.id
        }
    );

    const totalProducts = categories?.reduce((a, b) => {
        if (b.status) {
            const activeProduct = b.Produk.filter((product) => product.status)
            return a + activeProduct.length;
        }
        return a;
    }, 0) ?? 0;

    const handleNavigate = () => {
        void router.push("/payment")
    }

    const handleClick = (kategoriId: string, nama: string) => {
        setSelectedKategoriId(kategoriId)
        setSelectedKategori(nama)
    };

    const handleAddToCart = (item: Produk) => {
        setSelectedProdukCart(item)
        setOpenDialogCart(true)
    }

    const handleRemoveProduct = (item: ProdukKeranjang) => {
        setSelectedProdukRemove(item)
        setConfirmDelete(true)
    }

    useEffect(() => {
        if (!openDialogCart) {
            setSelectedJumlah(1)
            setSelectedVarianId("")
            setSelectedProdukCart(undefined)
            setSelectedProdukRemove(undefined)
        }
    }, [openDialogCart])

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Dashboard Kasir</h1>
            {
                isCategoriesLoading ?
                    <CategorySkeleton /> :
                    <CategoryCards
                        categories={categories ?? []}
                        totalProducts={totalProducts}
                        onSelect={handleClick} />
            }
            {
                isLoading ?
                    <ProductSkeleton /> :
                    <ProductCards
                        filteredProducts={filteredProducts}
                        selectedKategori={selectedKategori}
                        onAddToCart={handleAddToCart} />
            }

            <CartSheet
                onOpenDialog={() => setOpenDialog(true)}
                onRemoveProduct={handleRemoveProduct} />

            <DialogRekomendasiProduk
                filteredProducts={filteredProducts}
                onAddToCart={handleAddToCart}
                open={openDialog}
                onOpenChange={setOpenDialog}
                onNavigate={handleNavigate} />

            <DialogSelectProduk
                open={openDialogCart}
                onOpenChange={setOpenDialogCart}
                selectedProdukCart={selectedProdukCart}
                selectedVarianId={selectedVarianId}
                onSelectedVarianId={setSelectedVarianId}
                selectedJumlah={selectedJumlah}
                onSelectedJumlah={setSelectedJumlah}
                onOpenDialogCart={setOpenDialogCart}
                onOpenDialog={setOpenDialog} />

            <DialogDeleteProduk
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                selectedProdukRemove={selectedProdukRemove}
            />
        </div >
    );

}

DashboardCashier.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>;
}

export default DashboardCashier