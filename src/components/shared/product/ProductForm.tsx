import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { ProductFormSchema } from "~/forms/product";
import { Bucket } from "~/server/bucket";
import { api } from "~/utils/api";
import { MultiSelectCombobox } from "../MultiSelectCombobox";
import { createClient } from "~/utils/supabase/component";

interface ProductFormProps {
    onSubmit: (data: ProductFormSchema) => void
    onChangeImage: (imageUrl: string) => void
    imageUrl: string | null
}

export const ProductForm = ({ onSubmit, onChangeImage, imageUrl }: ProductFormProps) => {
    const form = useFormContext<ProductFormSchema>()
    const supabase = createClient()

    const initialUMKM = form.getValues("UMKMId")
    const [currUMKM, setCurrUMKM] = useState(initialUMKM ?? "")

    const { data: kategoriData } = api.kategori.lihatKategori.useQuery()
    const { data: umkmData } = api.umkm.lihatUMKM.useQuery()
    const { data: varians = [] } = api.varian.lihatVarian.useQuery()

    const filteredKategori = currUMKM ? kategoriData?.filter((item) => item.UMKM?.id === currUMKM && item.status === true) : null
    const filteredVarian = currUMKM ? varians.filter((item) => item.UMKM?.id === currUMKM && item.status === true) : null

    const { mutateAsync: tambahImageSignedUrl } = api.produk.tambahGambarProdukSignedUrl.useMutation()
    const [isUploading, setIsUploading] = useState(false)

    const uploadFileToSignedUrl = async ({
        file,
        path,
        token,
        bucket
    }: {
        file: File,
        path: string,
        token: string,
        bucket: Bucket
    }) => {
        try {
            const { data, error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
            if (error) throw error
            if (!data) throw new Error("No Data Returned from uploadToSignedUrl")
            const fileUrl = supabase.storage.from(bucket).getPublicUrl(data.path)

            return fileUrl.data.publicUrl

        } catch (error) {
            throw error
        }
    }

    const changeImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if (files && files.length > 0) {
            const file = files[0]

            if (!file) {
                return
            }

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


    const variantOptions = (filteredVarian ?? []).map((v) => ({
        value: v.id,
        label: v.nama,
    }))

    useEffect(() => {
        const currentCategory = form.getValues("categoryId")
        const valid = filteredKategori?.some((item) => item.id === currentCategory)

        if (!valid) {
            form.setValue("categoryId", "")
        }
    }, [filteredKategori, form])

    useEffect(() => {
        const currentUMKM = form.getValues("UMKMId")
        if (currentUMKM) {
            setCurrUMKM(currentUMKM)
        }
    }, [setCurrUMKM, form])

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
                    <FormItem>
                        <FormLabel>Daftar Kategori</FormLabel>
                        <FormControl>
                            <Select value={field.value} onValueChange={(value: string) => {
                                field.onChange(value)
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        filteredKategori?.map((item) => {
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
                name="UMKMId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>UMKM</FormLabel>
                        <FormControl>
                            <Select value={field.value} onValueChange={(value: string) => {
                                field.onChange(value)
                                setCurrUMKM(value)
                            }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="UMKM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        umkmData?.map((item) => {
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
                name="varianIds"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Varian</FormLabel>
                        <FormControl>
                            <MultiSelectCombobox
                                options={variantOptions}
                                value={field.value ?? []}
                                onChange={(value) => {
                                    field.onChange(value)
                                }}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

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