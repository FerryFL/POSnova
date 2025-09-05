import { LoaderCircle } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { ProductForm } from "~/components/shared/product/ProductForm"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import type { ProductFormSchema } from "~/forms/product"

interface DialogEditProductProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editForm: UseFormReturn<ProductFormSchema>
    handleSubmitEdit: (data: ProductFormSchema) => void
    handleImageChange: (newImage: string) => void
    imageUrl: string | null
    ubahProdukIsPending: boolean
}

const DialogEditProduct = (props: DialogEditProductProps) => {
    const { open, onOpenChange, editForm, handleSubmitEdit, handleImageChange, imageUrl, ubahProdukIsPending } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Ubah Produk</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                    <ProductForm onSubmit={handleSubmitEdit} onChangeImage={handleImageChange} imageUrl={imageUrl} />
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                    <Button type="submit" onClick={editForm.handleSubmit(handleSubmitEdit)}>
                        {ubahProdukIsPending && <LoaderCircle className="animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogEditProduct