import { LoaderCircle, Plus } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { ProductForm } from "~/components/features/product/ProductForm"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Form } from "~/components/ui/form"
import type { ProductFormSchema } from "~/lib/schemas/product"

interface DialogAddProductProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    addForm: UseFormReturn<ProductFormSchema>
    handleSubmit: (data: ProductFormSchema) => void
    handleImageChange: (newImage: string) => void
    imageUrl: string | null
    tambahProdukIsPending: boolean
}

const DialogAddProduct = (props: DialogAddProductProps) => {
    const { open, onOpenChange, addForm, handleSubmit, handleImageChange, imageUrl, tambahProdukIsPending } = props
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline"><Plus />Tambah Produk</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Tambah Produk</DialogTitle>
                    <DialogDescription></DialogDescription >
                </DialogHeader>
                <Form {...addForm}>
                    <ProductForm onSubmit={handleSubmit} onChangeImage={handleImageChange} imageUrl={imageUrl} />
                </Form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                    <Button type="submit" onClick={addForm.handleSubmit(handleSubmit)}>
                        {tambahProdukIsPending && <LoaderCircle className="animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogAddProduct