import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button"
import type { ProductFormSchema } from "~/forms/product";
import { uploadFileToSignedUrl } from "~/lib/supabase";
import { Bucket } from "~/server/bucket";
import { api } from "~/utils/api";
import { MultiSelectCombobox } from "../MultiSelectCombobox";

interface ProductFormProps {
    onSubmit: (data: ProductFormSchema) => void
    onChangeImage: (imageUrl: string) => void
    imageUrl: string | null
}

export const ProductForm = ({ onSubmit, onChangeImage, imageUrl }: ProductFormProps) => {
    const form = useFormContext<ProductFormSchema>()

    const produkId = form.watch("produkId");
    const umkmId = form.getValues("UMKMId")
    const [currUMKM, setCurrUMKM] = useState(form.getValues("UMKMId"))

    useEffect(() => {
      const subscription = form.watch((value, { name }) => {
        if (name === "UMKMId" && typeof value.UMKMId === "string") {
          setCurrUMKM(value.UMKMId)
        }
      });
      return () => subscription.unsubscribe();
    }, [form]);
    // Reset selected variants when UMKM changes
    useEffect(() => {
      setCustomVariants([]);
      form.setValue("varianIds", []);
    }, [currUMKM]);

    const { data: kategoriData } = api.kategori.lihatKategori.useQuery()
    const { data: umkmData } = api.umkm.lihatUMKM.useQuery()

    const filteredKategori = currUMKM ? kategoriData?.filter((item) => item.UMKM?.id === currUMKM) : null

    const { data: varians = [] } = api.varian.lihatVarianByUMKM.useQuery(
      { umkmId: currUMKM },
      { enabled: !!currUMKM }
    );
    const { mutateAsync: tambahImageSignedUrl } = api.produk.tambahGambarProdukSignedUrl.useMutation()
    const [newVariant, setNewVariant] = useState("")
    const [customVariants, setCustomVariants] = useState<string[]>(form.getValues("varianIds") ?? [])
    const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(" ")

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

    const variantOptions = varians.map((v) => ({
        value: v.id,
        label: v.nama,
    }))

    const getVariantLabel = (id: string) => {
      return variantOptions.find((v) => v.value === id)?.label ?? id
    }

    const handleAddVariant = () => {
      const trimmed = newVariant.trim()
      const existing = variantOptions.find((v) => v.label === trimmed)
      if (trimmed && existing && !customVariants.includes(existing.value)) {
        const updated = [...customVariants, existing.value]
        setCustomVariants(updated)
        form.setValue("varianIds", updated)
      }
      setNewVariant("")
    }

    const handleToggleVariant = (id: string) => {
      const updated = customVariants.includes(id)
        ? customVariants.filter((v) => v !== id)
        : [...customVariants, id]

        setCustomVariants(updated)
        form.setValue("varianIds", updated)
    }

    const handleRemoveVariant = (id: string) => {
      const updated = customVariants.filter((v) => v !== id)
      setCustomVariants(updated)
      form.setValue("varianIds", updated)
    }

    useEffect(() => {
        const currentCategory = form.getValues("kategoriId")
        const valid = filteredKategori?.some((item) => item.id === currentCategory)

        if (!valid) {
            form.setValue("kategoriId", "")
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
                name="kategoriId"
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
            render={() => (
              <FormItem>
              <FormLabel>Varian</FormLabel>
              <FormControl>
              <div className="space-y-2">
              {/* Input field + add button */}
              <div className="flex items-center gap-2">
              <Input
              placeholder="Masukkan varian"
              value={newVariant}
              onChange={(e) => setNewVariant(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddVariant()
                }
              }}
              />
              <Button type="button" onClick={handleAddVariant}>
              Tambah
              </Button>
              </div>

              {/* Toggle chips for all variants */}
              <div className="flex flex-wrap gap-2">
              {variantOptions.map(({ value, label }) => {
                const isSelected = customVariants.includes(value)
                return (
                  <button
                  key={value}
                  type="button"
                  onClick={() => handleToggleVariant(value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-colors",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  )}
                  >
                  {label}
                  {isSelected && (
                    <span
                    onClick={(e) => {
                      e.stopPropagation() // prevent toggle on delete click
                      handleRemoveVariant(value)
                    }}
                    className="text-white hover:text-red-300"
                    >
                    &times;
                    </span>
                  )}
                  </button>
                )
              })}
              </div>
              </div>
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
