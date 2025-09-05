import { LoaderCircle } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { VariantForm } from "~/components/shared/variant/VariantForm"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import type { VariantFormSchema } from "~/forms/variant"

interface DialogEditVarianProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editForm: UseFormReturn<VariantFormSchema>
    handleSubmitEdit: (data: VariantFormSchema) => void
    ubahVarianIsPending: boolean
}

const DialogEditVarian = (props: DialogEditVarianProps) => {
    const { open, onOpenChange, editForm, handleSubmitEdit, ubahVarianIsPending } = props

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle><p className="text-lg font-semibold">Ubah Varian</p></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                    <VariantForm onSubmit={handleSubmitEdit} />
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                    <Button disabled={ubahVarianIsPending} type="submit" onClick={editForm.handleSubmit(handleSubmitEdit)}>
                        {ubahVarianIsPending && <LoaderCircle className="animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogEditVarian