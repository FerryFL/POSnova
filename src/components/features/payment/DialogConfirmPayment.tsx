import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"

interface DialogConfirmProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export const DialogConfirmPayment = (props: DialogConfirmProps) => {
    const { open, onOpenChange, onConfirm } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex gap-2 items-center">Lakukan Pembayaran</DialogTitle>
                    <DialogDescription>Apakah anda yakin?</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                    <Button className="flex gap-1" onClick={() => {
                        onOpenChange(false);
                        onConfirm()
                    }}>Bayar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}