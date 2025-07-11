import { ShoppingCart, Tags } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";

const DashboardCashier = () => {
    const [selectedKategoriId, setSelectedKategoriId] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");

    const { data: products, isLoading } = api.produk.lihatProduk.useQuery({
        kategoriId: selectedKategoriId,
    });

    const filteredProducts = products?.filter((product) => product.status && product.kategori.status) ?? [];

    const { data: categories, isLoading: isCategoriesLoading } = api.kategori.lihatKategori.useQuery();

    const totalProducts = categories?.reduce((a, b) => {
        if (b.status) {
            const activeProduct = b.Produk.filter((product) => product.status)
            return a + activeProduct.length;
        }
        return a;
    }, 0) ?? 0;


    const handleClick = (kategoriId: string, nama: string) => {
        setSelectedKategoriId(kategoriId)
        setSelectedKategori(nama)
    };

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Dashboard Kasir</h1>
            {
                isCategoriesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-14" />
                        ))}
                    </div>
                ) :
                    <div className="flex gap-4 overflow-x-auto pb-2 mb-4 w-full">

                        <Card className="p-3 shrink-0 gap-0 w-32 text-center flex justify-center items-center cursor-pointer" onClick={() => handleClick("Semua", "Semua")}>
                            <h2 className="text-base font-semibold">Semua</h2>
                            <p className="text-sm">{totalProducts} Products</p>
                        </Card>

                        {
                            categories?.filter((category) => category.status === true).map((category) => (
                                <Card key={category.id} className="shrink-0 p-3 gap-1 w-32 text-center flex justify-center items-center cursor-pointer" onClick={() => handleClick(category.id, category.nama)}>
                                    <div className="w-full">
                                        <h2 className="text-base font-semibold line-clamp-1 break-words">{category.nama}</h2>
                                    </div>
                                    <p className="text-sm">{category.Produk.filter(item => item.status === true).length} Produk</p>
                                </Card>
                            ))
                        }
                    </div>
            }

            <div>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {
                            Array.from({ length: 20 }, (_, i) => (
                                <Card key={i} className="h-80 flex flex-col gap-2 pt-0">
                                    <Skeleton className="w-full h-40" />
                                    <div className="p-3 flex flex-col gap-2">
                                        <Skeleton className="w-3/4 h-5" />
                                        <Skeleton className="w-1/2 h-5" />
                                        <div className="flex flex-row gap-2">
                                            <Skeleton className="w-1/2 h-9" />
                                            <Skeleton className="w-1/2 h-9" />
                                        </div>
                                        <Skeleton className="w-full h-9" />
                                    </div>
                                </Card>
                            ))
                        }
                    </div>
                ) : (
                    <div>
                        <p>
                            Kategori :
                            <span className="font-semibold"> {selectedKategori}</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                            {
                                filteredProducts.length > 0 ? (
                                    filteredProducts?.map((item) => (
                                        <Card key={item.id} className="pt-0 gap-2 justify-between">
                                            <CardHeader className="p-0">
                                                <div className="relative h-40 w-full overflow-hidden">
                                                    {item.gambar ? (
                                                        <Image src={item.gambar} alt={item.nama} fill unoptimized className="rounded-t-lg object-cover" />
                                                    ) : (
                                                        <div className="bg-muted flex h-full w-full items-center justify-center">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>

                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-2.5 h-full">

                                                <div className="flex justify-between">
                                                    <Badge variant={item.status ? "success" : "destructive"}>{item.status ? "Aktif" : "Inaktif"}</Badge>
                                                    <p className="text-sm text-destructive">{item.stok} Tersisa</p>
                                                </div>
                                                <div className="text-lg font-medium w-full ">
                                                    <span className="line-clamp-1 break-words font-bold">{item.nama}</span>
                                                    <span className="text-sm flex gap-1 items-center text-muted-foreground line-clamp-1 break-words">
                                                        <Tags className="size-4 shrink-0" />
                                                        {item.kategori.nama}
                                                    </span>
                                                    <p className="text-lg font-bold text-green-700">Rp. {item.harga}</p>
                                                </div>

                                                <div className="flex gap-2 flex-wrap grow h-fit">
                                                    {
                                                        item.ProdukVarian.map((varian) =>
                                                            <Badge key={varian.varian.id} variant="outline" className="h-6 font-semibold max-w-full">
                                                                <span className="line-clamp-1 break-words">{varian.varian.nama}</span>
                                                            </Badge>
                                                        )
                                                    }
                                                </div>
                                            </CardContent>
                                            <CardFooter className="gap-2">
                                                <Button className="w-full" variant="outline" onClick={() => alert(`Menambahkan ${item.nama} ke keranjang`)} >
                                                    <ShoppingCart className="text-primary cursor-pointer" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-4 text-center p-4">
                                        <p className="text-muted-foreground">Tidak ada produk yang tersedia di kategori ini</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )}
            </div>
        </div >
    );

}
export default DashboardCashier

DashboardCashier.getLayout = (page: React.ReactNode) => {
    return <PublicLayout>{page}</PublicLayout>;
}