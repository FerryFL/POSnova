import { LoaderCircle } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface DialogDeleteVarianProps {
    idToDelete: string | null
    setIdToDelete: (data: string | null) => void
    hapusVarianIsPending: boolean
    handleSubmitDelete: () => void
}

const DialogDeleteVarian = (props: DialogDeleteVarianProps) => {
    const { idToDelete, setIdToDelete, hapusVarianIsPending, handleSubmitDelete } = props
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
                    <AlertDialogTitle>Hapus Varian</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>Apakah yakin anda akan menghapus varian ini?</AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                    <Button disabled={hapusVarianIsPending} variant="destructive" onClick={handleSubmitDelete}>
                        {hapusVarianIsPending && <LoaderCircle className="animate-spin" />}
                        Hapus
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DialogDeleteVarian