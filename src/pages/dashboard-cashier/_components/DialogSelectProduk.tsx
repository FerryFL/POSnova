import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useCartStore } from "~/store/cart"
import type { Produk } from "~/utils/api"

interface DialogSelectProduk {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedProdukCart?: Produk
    selectedVarianId: string
    onSelectedVarianId: (val: string) => void
    selectedJumlah: number
    onSelectedJumlah: (val: number) => void
    onOpenDialogCart: (open: boolean) => void
    onOpenDialog: (open: boolean) => void
}

const DialogSelectProduk = (props: DialogSelectProduk) => {
    const { addToCart, items } = useCartStore()
    const {
        open,
        onOpenChange,
        selectedProdukCart,
        selectedVarianId,
        onSelectedVarianId,
        selectedJumlah,
        onSelectedJumlah,
        onOpenDialogCart,
        onOpenDialog
    } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedProdukCart?.nama}</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                {
                    selectedProdukCart?.ProdukVarian?.length ? (
                        <Select value={selectedVarianId} onValueChange={onSelectedVarianId}>
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
                        onClick={() => onSelectedJumlah(Math.max(1, selectedJumlah - 1))}
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

                            onSelectedJumlah(selectedJumlah < sisaStok ? selectedJumlah + 1 : selectedJumlah)
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
                                onOpenDialogCart(false)
                                onOpenDialog(false)
                            }
                        }}
                        disabled={!selectedProdukCart || (selectedProdukCart?.ProdukVarian?.length > 0 && !selectedVarianId)}
                    >
                        <ShoppingCart />
                        Masukan Keranjang
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogSelectProduk