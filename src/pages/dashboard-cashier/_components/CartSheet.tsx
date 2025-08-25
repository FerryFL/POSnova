import { Minus, Plus, ShoppingCart, Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { useCartStore } from "~/store/cart";
import type { ProdukKeranjang } from "~/types/cart";

type CartSheetProps = {
    onOpenDialog: (val: boolean) => void
    onRemoveProduct: (item: ProdukKeranjang) => void
}

const CartSheet = (props: CartSheetProps) => {

    const { jumlahProduk, items, totalProduk, minusProduk, plusProduk } = useCartStore()
    const { onOpenDialog, onRemoveProduct } = props

    return (
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
                <div className="space-y-2 p-3 max-10/12 overflow-y-auto">
                    {
                        items.map((item) =>
                            <div key={`${item.id}-${item.varianId ?? "no-varian"}`} className="flex items-center justify-between bg-gray-100 text-black p-3 rounded-lg">
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
                                    <div className="p-2 rounded-lg bg-destructive cursor-pointer" onClick={() => onRemoveProduct(item)}>
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
                    <Button type="submit" onClick={() => onOpenDialog(true)}>Pesan</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default CartSheet