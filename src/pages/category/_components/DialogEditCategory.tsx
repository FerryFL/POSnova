import { LoaderCircle } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { CategoryForm } from "~/components/shared/category/CategoryForm"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import type { CategoryFormSchema } from "~/forms/category"

interface DialogEditCategoryProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editForm: UseFormReturn<CategoryFormSchema>
    handleSubmitEdit: (data: CategoryFormSchema) => void
    ubahKategoriIsPending: boolean
}

const DialogEditCategory = (props: DialogEditCategoryProps) => {
    const { open, onOpenChange, editForm, handleSubmitEdit, ubahKategoriIsPending } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle><p className="text-lg font-semibold">Ubah Kategori</p></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                    <CategoryForm onSubmit={handleSubmitEdit} />
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                    <Button disabled={ubahKategoriIsPending} type="submit" onClick={editForm.handleSubmit(handleSubmitEdit)}>
                        {ubahKategoriIsPending && <LoaderCircle className="animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogEditCategory