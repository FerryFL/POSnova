import { useRouter } from "next/router";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { api, type Produk } from "~/utils/api";
import type { NextPageWithLayout } from "../_app";
import type { ProdukKeranjang } from "~/types/cart";
import CategorySkeleton from "../../components/features/dashboard-cashier/CategorySkeleton";
import CategoryCards from "../../components/features/dashboard-cashier/CategoryCards";
import ProductSkeleton from "../../components/features/dashboard-cashier/ProductSkeleton";
import ProductCards from "../../components/features/dashboard-cashier/ProductCards";
import CartSheet from "../../components/features/dashboard-cashier/CartSheet";
import DialogRekomendasiProduk from "../../components/features/dashboard-cashier/DialogRekomendasiProduk";
import DialogSelectProduk from "../../components/features/dashboard-cashier/DialogSelectProduk";
import DialogDeleteProduk from "../../components/features/dashboard-cashier/DialogDeleteProduk";
import { useUserStore } from "~/store/user";
import { useCartStore } from "~/store/cart";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

export const DashboardCashier: NextPageWithLayout = () => {

    const router = useRouter()
    const { profile } = useUserStore()
    const { items } = useCartStore()

    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [openDialogCart, setOpenDialogCart] = useState(false)

    const [selectedKategoriId, setSelectedKategoriId] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");

    const [selectedProdukRemove, setSelectedProdukRemove] = useState<ProdukKeranjang>()

    const [selectedVarianId, setSelectedVarianId] = useState("")
    const [selectedJumlah, setSelectedJumlah] = useState(1)

    const [selectedProdukCart, setSelectedProdukCart] = useState<Produk>()
    const { hasRole } = useUserStore()
    const [mounted, setMounted] = useState(false)

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

    const filteredCategories = categories?.filter((category) => category.status === true).map((category) => ({
        ...category,
        Produk: category.Produk.filter((produk) => produk.status && produk.stok > 0)
    }))

    // const { data: rekomendasi } = api.transaksi.rekomendasiProduk.useQuery({
    //     umkmId: profile?.UMKM?.id ?? "",
    //     produkIds: items.map((item) => item.id),
    // });

    const preparedItems = useMemo(() =>
        items.map(item => ({
            ...item,
            ProdukVarian: item.ProdukVarian ?? []
        })), [items]
    )

    const { data: rekomendasiAi } = api.rekomendasi.getRecommendations.useQuery({
        umkmId: profile?.UMKM?.id ?? "",
        items: preparedItems,
        num_recommendations: 3
    },
        {
            enabled: openDialog && items.length > 0,
        }
    )

    const totalProduct = categories?.reduce((a, b) => {
        if (b.status) {
            const activeProduct = b.Produk.filter((product) => product.status && product.stok > 0)
            return a + activeProduct.length;
        }
        return a;
    }, 0) ?? 0;

    const { mutate: trainContent, isPending: trainContentIsPending } = api.rekomendasi.trainContentBased.useMutation({
        onSuccess: () => {
            toast.success("Berhasil train Content-Based model!");
        },
        onError: (error) => {
            toast.error(`Gagal train Content-Based: ${error.message}`);
        }
    });

    const { mutate: trainApriori, isPending: trainAprioriIsPending } = api.rekomendasi.trainApriori.useMutation({
        onSuccess: () => {
            toast.success("Berhasil train Apriori model!");
        },
        onError: (error) => {
            toast.error(`Gagal train Apriori: ${error.message}`);
        }
    });

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

    const handleTrainContent = () => {
        if (profile?.UMKM?.id) {
            trainContent({ umkmId: profile.UMKM.id });
        }
    }

    const handleTrainApriori = () => {
        if (profile?.UMKM?.id) {
            trainApriori({ umkmId: profile.UMKM.id });
        }
    }

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Dashboard Kasir</h1>

            {
                mounted && hasRole("RL002") && <div className="mb-4">
                    <h2 className="text-sm font-medium mb-3">Training AI Models</h2>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            onClick={handleTrainContent}
                            disabled={trainContentIsPending}
                        >
                            {trainContentIsPending ? 'Training...' : 'Train Content-Based'}
                        </Button>

                        <Button
                            onClick={handleTrainApriori}
                            disabled={trainAprioriIsPending}
                        >
                            {trainAprioriIsPending ? 'Training...' : 'Train Apriori'}
                        </Button>
                    </div>
                </div>
            }

            {
                isCategoriesLoading ?
                    <CategorySkeleton /> :
                    <CategoryCards
                        categories={filteredCategories ?? []}
                        totalProducts={totalProduct}
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
                rekomendasi={rekomendasiAi}
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