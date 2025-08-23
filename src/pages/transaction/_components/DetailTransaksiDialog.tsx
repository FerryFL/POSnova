import { Eye, ReceiptText, Tag } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
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

                    <div className="space-y-2">
                        {
                            transaksi.transaksiItem.map((item) => {
                                return (
                                    <Card key={item.id} className="p-3 rounded gap-2">
                                        <div className="flex justify-between">
                                            <h1 className="text-md font-bold">{item.produk.nama}</h1>
                                            <p>{item.jumlah}x</p>
                                        </div>
                                        {
                                            item.varianNama && (
                                                <p className="text-sm">Varian: {item.varianNama}</p>
                                            )
                                        }
                                        <div className="flex items-center gap-2">
                                            <Tag className="size-4" />
                                            <span className="text-sm">{item.hargaSatuan.toLocaleString()}/pcs</span>
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