import { Eye, HandCoins, Package, ReceiptText, Tag } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Separator } from "~/components/ui/separator"
import type { Transaksi } from "~/utils/api"

type DetailTransaksiDialogProps = {
    transaksi: Transaksi
}

export const DetailTransaksiDialog = (props: DetailTransaksiDialogProps) => {
    const { transaksi } = props

    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="outline">
                <Eye className="size-5" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ReceiptText className="size-5" />
                            <span>Detail Transaksi</span>
                        </DialogTitle>
                        <DialogDescription>Lihat rincian produk dalam transaksi ini</DialogDescription>
                    </DialogHeader>

                    <Separator />

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-1">
                                <HandCoins className="size-4" />
                                <span className="text-sm">Grand Total</span>
                            </div>
                            <span className="text-base font-semibold">Rp {transaksi.grandTotal ? transaksi.grandTotal.toLocaleString() : transaksi.totalHarga.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <div className="flex items-center gap-1">
                                <Package className="size-4" />
                                <span className="text-sm">Total Produk</span>
                            </div>
                            <span className="text-sm font-semibold">{transaksi.totalProduk} Produk / Rp {transaksi.totalHarga.toLocaleString()}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {
                            transaksi.transaksiItem.map((item) => {
                                return (
                                    <Card key={item.id} className="p-3 rounded-lg gap-2">
                                        <div className="flex justify-between">
                                            <h1 className="text-md font-bold">{item.produk.nama}</h1>
                                            <p className="text-sm">{item.jumlah}x</p>
                                        </div>

                                        <p className="text-sm">Varian: {item.varianNama ?? "-"}</p>

                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2">
                                                <Tag className="size-4" />
                                                <span className="text-sm">{item.hargaSatuan.toLocaleString()}/pcs</span>
                                            </div>

                                            <p className="text-md font-semibold">Rp {(item.jumlah * item.hargaSatuan).toLocaleString()}</p>
                                        </div>

                                    </Card>
                                )
                            })
                        }
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="destructive">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}