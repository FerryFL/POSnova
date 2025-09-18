import { LoaderCircle } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface DialogDeleteCategoryProps {
    idToDelete: string | null
    setIdToDelete: (data: string | null) => void
    hapusKategoriIsPending: boolean
    handleSubmitDelete: () => void
}

const DialogDeleteCategory = (props: DialogDeleteCategoryProps) => {
    const { idToDelete, setIdToDelete, hapusKategoriIsPending, handleSubmitDelete } = props
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
                    <AlertDialogTitle>Hapus Category</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>Apakah yakin anda akan menghapus kategori ini?</AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                    <Button disabled={hapusKategoriIsPending} variant="destructive" onClick={handleSubmitDelete}>
                        {hapusKategoriIsPending && <LoaderCircle className="animate-spin" />}
                        Hapus
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DialogDeleteCategory