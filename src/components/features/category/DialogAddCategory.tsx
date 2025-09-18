import { LoaderCircle, Plus } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { CategoryForm } from "~/components/features/category/CategoryForm"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import type { CategoryFormSchema } from "~/lib/schemas/category"

interface DialogAddCategoryProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    addForm: UseFormReturn<CategoryFormSchema>
    handleSubmit: (data: CategoryFormSchema) => void
    tambahKategoriIsPending: boolean
}

const DialogAddCategory = (props: DialogAddCategoryProps) => {
    const { open, onOpenChange, addForm, handleSubmit, tambahKategoriIsPending } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline"><Plus />Tambah Kategori</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle><p className="text-lg font-semibold">Tambah Kategori</p></DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                    <CategoryForm onSubmit={handleSubmit} />
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                    <Button disabled={tambahKategoriIsPending} type="submit" onClick={addForm.handleSubmit(handleSubmit)}>
                        {tambahKategoriIsPending && <LoaderCircle className="animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogAddCategory