import { LoaderCircle } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface DialogDeleteProductProps {
    idToDelete: string | null
    setIdToDelete: (data: string | null) => void
    hapusProdukIsPending: boolean
    handleSubmitDelete: () => void
}

const DialogDeleteProduct = (props: DialogDeleteProductProps) => {
    const { idToDelete, setIdToDelete, hapusProdukIsPending, handleSubmitDelete } = props
    return (
        <AlertDialog
            open={!!idToDelete}
            onOpenChange={(open) => {
                if (!open) {
                    setIdToDelete(null);
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>Apakah yakin anda akan menghapus produk ini? </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                    <Button disabled={hapusProdukIsPending} variant="destructive" onClick={handleSubmitDelete}>
                        {hapusProdukIsPending && <LoaderCircle className="animate-spin" />}
                        Hapus
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DialogDeleteProduct