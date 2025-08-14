import type { inferRouterOutputs } from "@trpc/server";
import { Minus, Plus, ShoppingCart, Tags, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactElement } from "react";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import type { AppRouter } from "~/server/api/root";
import { useCartStore } from "~/store/cart";
import { api } from "~/utils/api";
import type { NextPageWithLayout } from "../_app";

export const DashboardCashier: NextPageWithLayout = () => {

    const router = useRouter()

    type Produk = inferRouterOutputs<AppRouter>["produk"]["lihatProduk"][number]
    type ProdukKeranjang = Omit<Produk, "ProdukVarian"> & {
        jumlah: number
        varianId?: string
        varianNama?: string
    }

    const { addToCart, items, jumlahProduk, minusProduk, plusProduk, removeProduk, totalProduk } = useCartStore()

    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [openDialogCart, setOpenDialogCart] = useState(false)

    const [selectedKategoriId, setSelectedKategoriId] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");

    const [selectedProdukRemove, setSelectedProdukRemove] = useState<ProdukKeranjang>()

    const [selectedVarianId, setSelectedVarianId] = useState("")
    const [selectedJumlah, setSelectedJumlah] = useState(1)

    const [selectedProdukCart, setSelectedProdukCart] = useState<Produk>()
    // const [selectedProduk, setSelectedProduk] = useState<ProdukKeranjang[]>([])
    // const [jumlah, setJumlah] = useState(0)
    // const [total, setTotal] = useState(0)

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

    const handleNavigate = () => {
        void router.push("/payment")
    }

    const handleClick = (kategoriId: string, nama: string) => {
        setSelectedKategoriId(kategoriId)
        setSelectedKategori(nama)
    };

    // const handleAddToCart = (product: Produk, selectedVarianId: string, jumlahToAdd: number) => {
    //     const normalizedVarianId = selectedVarianId || undefined;

    //     const selectedVarian = product.ProdukVarian.find(
    //         (item) => item.varian.id === normalizedVarianId
    //     )

    //     const totalExistingJumlah = selectedProduk
    //         .filter((item) => item.id === product.id)
    //         .reduce((sum, item) => sum + item.jumlah, 0)

    //     if (totalExistingJumlah >= product.stok) {
    //         toast.error("Jumlah melebihi stok tersedia!");
    //         return;
    //     }

    //     setSelectedProduk((prev: ProdukKeranjang[]) => {
    //         const existing = prev.find((item) => item.id === product.id && item.varianId === normalizedVarianId)
    //         if (existing) {
    //             return prev.map((item) => item.id === product.id && item.varianId === normalizedVarianId ? { ...item, jumlah: item.jumlah + jumlahToAdd } : item)
    //         }

    //         const { ...rest } = product

    //         return [
    //             ...prev,
    //             {
    //                 ...rest,
    //                 jumlah: jumlahToAdd,
    //                 varianId: selectedVarian?.varian.id,
    //                 varianNama: selectedVarian?.varian.nama,
    //             },
    //         ]
    //     })
    //     setJumlah((prev) => prev + jumlahToAdd)
    //     setTotal((prev) => prev + product.harga * jumlahToAdd)
    //     toast.success('Berhasil Ditambah')
    //     setOpenDialogCart(false)
    // }

    // const handlePlus = (id: string, varianId: string | undefined) => {
    //     const produk = selectedProduk.find((item) => item.id === id && item.varianId === varianId)
    //     if (!produk) return

    //     const totalExistingJumlah = selectedProduk
    //         .filter((item) => item.id === id)
    //         .reduce((sum, item) => sum + item.jumlah, 0)

    //     if (totalExistingJumlah >= produk.stok) {
    //         toast.error("Jumlah melebihi stok tersedia!")
    //         return
    //     }

    //     setSelectedProduk((prev) =>
    //         prev.map((item) => item.id === id && item.varianId === varianId ? { ...item, jumlah: item.jumlah + 1 } : item)
    //     )
    //     setJumlah((prev) => prev + 1)
    //     setTotal((prev) => prev + produk.harga)
    // }

    // const handleMinus = (id: string, varianId: string | undefined) => {
    //     const produk = selectedProduk.find((item) => item.id === id && item.varianId === varianId)
    //     if (!produk) return

    //     setSelectedProduk((prev) =>
    //         prev.map((item) => item.id === id && item.varianId === varianId ? { ...item, jumlah: item.jumlah - 1 } : item)
    //             .filter((item) => item.jumlah > 0)
    //     )
    //     setJumlah((prev) => prev - 1)
    //     setTotal((prev) => prev - produk.harga)
    // }

    // const handleRemove = (id: string, varianId: string | undefined) => {
    //     const produkToRemove = selectedProduk.find((item) => item.id === id && item.varianId === varianId)
    //     if (!produkToRemove) return
    //     setJumlah((prev) => Math.max(0, prev - produkToRemove.jumlah))
    //     setTotal((prev) => prev - produkToRemove.jumlah * produkToRemove.harga)
    //     setSelectedProduk((prev) => prev.filter((item) => !(item.id === id && item.varianId === varianId)))
    // }

    // useEffect(() => {
    //     if (selectedProdukCart?.ProdukVarian[0]) {
    //         setSelectedVarianId(selectedProdukCart.ProdukVarian[0].varian.id)
    //     } else {
    //         setSelectedVarianId("")
    //     }
    // }, [selectedProdukCart])

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
                isCategoriesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-14" />
                        ))}
                    </div>
                ) :
                    <div className="flex gap-3 overflow-x-auto pb-2 mb-4 w-full">

                        <Card className="hover:bg-gray-100 hover:text-black transition-colors p-3 shrink-0 gap-0 min-w-32 max-w-52 text-center flex justify-center items-center cursor-pointer" onClick={() => handleClick("Semua", "Semua")}>
                            <h2 className="text-base font-semibold">Semua</h2>
                            <p className="text-sm">{totalProducts} Products</p>
                        </Card>

                        {
                            categories?.filter((category) => category.status === true).map((category) => (
                                <Card key={category.id} className="hover:bg-gray-100 hover:text-black transition-colors shrink-0 p-3 gap-1 min-w-32 max-w-52 text-center flex justify-center items-center cursor-pointer" onClick={() => handleClick(category.id, category.nama)}>
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
                                                    <p className="text-lg font-bold text-green-700">Rp {item.harga}</p>
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
                                                {/* <Button className="w-full" variant="outline" onClick={() => handleAddToCart(item)} > */}
                                                <Button className="w-full" variant="outline" onClick={() => { setOpenDialogCart(true); setSelectedProdukCart(item) }} >
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


            <Sheet>
                <SheetTrigger asChild>
                    <div className="w-14 h-16 rounded-lg flex flex-col items-center justify-center fixed right-7 bottom-7 cursor-pointer border-2 shadow-lg hover:bg-gray-100 transition-colors bg-white z-50 text-black">
                        <ShoppingCart className="size-6" />
                        <span className="">{jumlahProduk}</span>
                    </div>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Keranjang Belanja</SheetTitle>
                    </SheetHeader>
                    <Separator />
                    <div className="space-y-2 p-3">
                        {
                            items.map((item) =>
                                <div key={item.id} className="flex items-center justify-between bg-gray-100 text-black p-3 rounded-lg">
                                    <div className="flex flex-col">
                                        <span>
                                            {item.nama}
                                            {item.varianNama ? ` - ${item.varianNama}` : ""}
                                        </span>
                                        <span className="text-sm">Rp {item.harga} / Produk</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-black p-0.5 rounded-lg cursor-pointer" onClick={() => minusProduk(item.id, item.varianId)}>
                                                <Minus className="size-4 text-white" />
                                            </div>
                                            <span>{item.jumlah}</span>
                                            <div className="bg-black p-0.5 rounded-lg cursor-pointer" onClick={() => plusProduk(item.id, item.varianId)}>
                                                <Plus className="size-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-destructive cursor-pointer" onClick={() => { setSelectedProdukRemove(item); setConfirmDelete(true) }}>
                                            <Trash className="size-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <SheetFooter>
                        <Separator />
                        <div className="flex justify-between py-2">
                            <span className="text-lg font-semibold">Total Harga</span>
                            <span className="text-xl font-semibold">Rp {totalProduk}</span>
                        </div>
                        <Button type="submit" onClick={() => setOpenDialog(true)}>Pesan</Button>
                        <SheetClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[90vw]">
                    <DialogHeader>
                        <DialogTitle>Produk Rekomendasi</DialogTitle>
                        <DialogDescription>Produk Rekomendasi</DialogDescription>
                    </DialogHeader>
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
                                                <p className="text-lg font-bold text-green-700">Rp {item.harga}</p>
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
                                            {/* <Button className="w-full" variant="outline" onClick={() => handleAddToCart(item)} > */}
                                            <Button className="w-full" variant="outline" onClick={() => { setOpenDialogCart(true); setSelectedProdukCart(item) }} >
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
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button onClick={handleNavigate}>
                            Bayar Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openDialogCart} onOpenChange={setOpenDialogCart}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedProdukCart?.nama}</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    {
                        selectedProdukCart?.ProdukVarian?.length ? (
                            <Select value={selectedVarianId} onValueChange={setSelectedVarianId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Varian" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        selectedProdukCart?.ProdukVarian?.map((item) => {
                                            return <SelectItem value={item.varian.id} key={item.varian.id}>{item.varian.nama}</SelectItem>
                                        })
                                    }
                                </SelectContent>
                            </Select>
                        ) : null
                    }
                    <div className="flex items-center gap-2 py-2">
                        <div
                            className="bg-black p-1 rounded-lg cursor-pointer"
                            onClick={() => setSelectedJumlah((prev) => Math.max(1, prev - 1))}
                        >
                            <Minus className="size-4 text-white" />
                        </div>
                        <span className="w-6 text-center">{selectedJumlah}</span>
                        <div
                            className="bg-black p-1 rounded-lg cursor-pointer"
                            onClick={() => {
                                const totalExistingJumlah = items
                                    .filter((item) => item.id === selectedProdukCart?.id)
                                    .reduce((sum, item) => sum + item.jumlah, 0)
                                const sisaStok = (selectedProdukCart?.stok ?? 0) - totalExistingJumlah

                                setSelectedJumlah((prev) => prev < sisaStok ? prev + 1 : prev)
                            }}
                        >
                            <Plus className="size-4 text-white" />
                        </div>
                    </div>


                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="destructive">Tutup</Button>
                        </DialogClose>
                        <Button
                            onClick={() => {
                                if (selectedProdukCart) {
                                    addToCart(selectedProdukCart, selectedVarianId, selectedJumlah)
                                    setOpenDialogCart(false)
                                }
                            }}
                            disabled={!selectedProdukCart || (selectedProdukCart?.ProdukVarian?.length > 0 && !selectedVarianId)}
                        >
                            Masukan Keranjang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Dari Keranjang</DialogTitle>
                        <DialogDescription>Apakah anda yakin?</DialogDescription>
                    </DialogHeader>

                    <div>
                        <p><span className="font-semibold">Nama Produk:</span> {selectedProdukRemove?.nama}</p>
                        <p><span className="font-semibold">Kategori:</span> {selectedProdukRemove?.kategori.nama}</p>
                        <p><span className="font-semibold">Jumlah:</span> {selectedProdukRemove?.jumlah}</p>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="destructive">Tutup</Button>
                        </DialogClose>
                        <Button
                            onClick={() => {
                                if (confirmDelete && selectedProdukRemove) {
                                    removeProduk(selectedProdukRemove.id, selectedProdukRemove.varianId)
                                    setConfirmDelete(false)
                                }
                            }}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );

}

DashboardCashier.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>;
}

export default DashboardCashier