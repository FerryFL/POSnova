import { LoaderCircle, Plus } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { VariantForm } from "~/components/shared/variant/VariantForm"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import type { VariantFormSchema } from "~/forms/variant"

interface DialogAddVarianProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    addForm: UseFormReturn<VariantFormSchema>
    handleSubmit: (data: VariantFormSchema) => void
    tambahVarianIsPending: boolean
}

const DialogAddVarian = (props: DialogAddVarianProps) => {
    const { open, onOpenChange, addForm, handleSubmit, tambahVarianIsPending } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline"><Plus />Tambah Varian</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle><p className="text-lg font-semibold">Tambah Varian</p></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                    <VariantForm onSubmit={handleSubmit} />
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                    <Button disabled={tambahVarianIsPending} type="submit" onClick={addForm.handleSubmit(handleSubmit)}>
                        {tambahVarianIsPending && <LoaderCircle className="animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogAddVarian