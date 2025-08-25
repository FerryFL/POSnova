import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { useCartStore } from "~/store/cart"
import type { ProdukKeranjang } from "~/types/cart"

type DialogDeleteProduk = {
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
                            if (open && selectedProdukRemove) {
                                removeProduk(selectedProdukRemove.id, selectedProdukRemove.varianId)
                                onOpenChange(false)
                            }
                        }}
                    >
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogDeleteProduk