import { ShoppingCart, Tags } from "lucide-react";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import type { Produk } from "~/utils/api";

type DialogRekomendasiProdukProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    filteredProducts: Produk[]
    onAddToCart: (item: Produk) => void
    onNavigate: () => void
}

const DialogRekomendasiProduk = (props: DialogRekomendasiProdukProps) => {
    const { filteredProducts, onAddToCart, open, onOpenChange, onNavigate } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                        <Button className="w-full" variant="outline" onClick={() => onAddToCart(item)} >
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
                    <Button onClick={onNavigate}>
                        Bayar Sekarang
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogRekomendasiProduk