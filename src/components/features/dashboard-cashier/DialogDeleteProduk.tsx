import { Archive, Package, Trash } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { useCartStore } from "~/store/cart"
import type { ProdukKeranjang } from "~/types/cart"

interface DialogDeleteProduk {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedProdukRemove?: ProdukKeranjang
}

const DialogDeleteProduk = (props: DialogDeleteProduk) => {
    const { removeProduk } = useCartStore()
    const { selectedProdukRemove, open, onOpenChange } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex gap-2 items-center"><Trash />Hapus Dari Keranjang</DialogTitle>
                    <DialogDescription>Apakah anda yakin?</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                        <Package className="size-5" />
                        <div className="flex gap-1">
                            <span>Nama Produk:</span>
                            <span className="font-semibold">{selectedProdukRemove?.nama}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Archive className="size-5" />
                        <div className="flex gap-1">
                            <span>Kategori:</span>
                            <span className="font-semibold">{selectedProdukRemove?.kategori.nama}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-1">
                            <span>Jumlah:</span>
                            <span className="font-semibold">{selectedProdukRemove?.jumlah}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Tutup</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        className="flex gap-1"
                        onClick={() => {
                            if (open && selectedProdukRemove) {
                                removeProduk(selectedProdukRemove.id, selectedProdukRemove.varianId)
                                onOpenChange(false)
                            }
                        }}
                    >
                        <Trash className="size-4" />
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogDeleteProduk