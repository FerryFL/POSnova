import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useState, type ChangeEvent } from "react";
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
    imageUrl: string | null
}

export const ProductForm = ({ onSubmit, onChangeImage, imageUrl }: ProductFormProps) => {

    const form = useFormContext<ProductFormSchema>()

    const { data: kategoriData } = api.kategori.lihatKategori.useQuery()
    const { data: varianData } = api.varian.lihatVarian.useQuery()
    const { mutateAsync: tambahImageSignedUrl } = api.produk.tambahGambarProdukSignedUrl.useMutation()
    // const { mutateAsync: hapusGambarProduk } = api.produk.hapusGambarProduk.useMutation()
    const [isUploading, setIsUploading] = useState(false)

    const changeImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if (files && files.length > 0) {
            const file = files[0]

            if (!file) {
                return
            }

            // if (imageUrl) {
            //     try {
            //         await hapusGambarProduk({ gambar: imageUrl })
            //     } catch (error) {
            //         console.error("Gagal menghapus gambar produk:", error)
            //         return
            //     }
            // }
            setIsUploading(true)

            try {
                const { path, token } = await tambahImageSignedUrl()

                const img = await uploadFileToSignedUrl({
                    bucket: Bucket.ProductImages,
                    file,
                    path,
                    token
                })

                onChangeImage(img)
            } catch (error) {
                console.error("Gagal mengupload gambar produk:", error)
            } finally {
                setIsUploading(false)
            }

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

            <div className="flex flex-row space-x-4">
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

                <FormField
                    control={form.control}
                    name="varianId"
                    render={({ field }) => (
                        <FormItem className="flex flex-row">
                            <FormControl>
                                <Select value={field.value} onValueChange={(value: string) => {
                                    field.onChange(value)
                                }}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Varian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            varianData?.map((item) => {
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
            </ div>

            <div className="space-y-2">
                <Label>Gambar Produk</Label>
                <Input onChange={changeImage} type="file" accept="image/*" placeholder="Gambar" />

                {
                    isUploading ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        imageUrl && (
                            <div className="mt-2">
                                <Image
                                    width={128}
                                    height={128}
                                    src={imageUrl}
                                    alt="Preview gambar produk"
                                    className="object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                            </div>
                        )
                    )
                }
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