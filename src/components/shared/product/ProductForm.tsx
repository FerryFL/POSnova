import { type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { ProductFormSchema } from "~/forms/product";
import { uploadFileToSignedUrl } from "~/lib/supabase";
import { Bucket } from "~/server/bucket";
import { api } from "~/utils/api";

interface ProductFormProps {
    onSubmit: (data: ProductFormSchema) => void
    onChangeImage: (imageUrl: string) => void
}

export const ProductForm = ({ onSubmit, onChangeImage }: ProductFormProps) => {

    const form = useFormContext<ProductFormSchema>();

    const { data: kategoriData } = api.kategori.lihatKategori.useQuery()
    const { mutateAsync: tambahImageSignedUrl } = api.produk.tambahGambarProdukSignedUrl.useMutation()

    const changeImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if (files && files.length > 0) {
            const file = files[0]

            if (!file) {
                return
            }

            const { path, token } = await tambahImageSignedUrl()

            const imageUrl = await uploadFileToSignedUrl({
                bucket: Bucket.ProductImages,
                file,
                path,
                token
            })

            onChangeImage(imageUrl)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} id="category-form" className="space-y-4">
            <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nama Produk</FormLabel>
                        <FormControl>
                            <Input placeholder="Pizza" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="harga"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Harga</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="stok"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Stok</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                    <FormItem className="flex flex-row">
                        <FormControl>
                            <Select value={field.value} onValueChange={(value: string) => {
                                field.onChange(value)
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        kategoriData?.map((item) => {
                                            return <SelectItem value={item.id} key={item.id}>{item.nama}</SelectItem>
                                        })
                                    }
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="space-y-2">
                <Label>Gambar Produk</Label>
                <Input onChange={changeImage} type="file" accept="image/*" />
            </div>

            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem className="flex flex-row">
                        <FormControl>
                            <Checkbox
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <FormLabel>Aktif</FormLabel>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </form>
    )

}