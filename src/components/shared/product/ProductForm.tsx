import { LoaderCircle, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { ProductFormSchema, ProductFormWithVariants } from "~/forms/product";
import { uploadFileToSignedUrl } from "~/lib/supabase";
import { Bucket } from "~/server/bucket";
import { api } from "~/utils/api";

interface NewVariant {
    tempId: string;
    nama: string;
    status: boolean;
}

interface ExistingVariantUpdate {
    id: string;
    nama: string;
    status: boolean;
    isDeleted: boolean;
}

interface ProductFormProps {
    onSubmit: (data: ProductFormWithVariants) => void
    onChangeImage: (imageUrl: string) => void
    imageUrl: string | null
    newVariants?: NewVariant[]
    onNewVariantsChange?: (variants: NewVariant[]) => void
    existingVariants?: Array<{
        id: string;
        nama: string;
        status: boolean;
    }>
    isEditMode?: boolean
}

export const ProductForm = ({ 
    onSubmit, 
    onChangeImage, 
    imageUrl,
    newVariants = [],
    onNewVariantsChange,
    existingVariants = [],
    isEditMode = false
}: ProductFormProps) => {
    const form = useFormContext<ProductFormSchema>()

    // Watch UMKMId changes with proper memoization
    const watchedUMKMId = form.watch("UMKMId")
    const [currUMKM, setCurrUMKM] = useState<string>("")

    // Variant states
    const [customVariants, setCustomVariants] = useState<string[]>([])
    const [localNewVariants, setLocalNewVariants] = useState<NewVariant[]>(newVariants)
    const [newVariantName, setNewVariantName] = useState("")
    const [existingVariantUpdates, setExistingVariantUpdates] = useState<Record<string, ExistingVariantUpdate>>({})

    const [isUploading, setIsUploading] = useState(false)

    // Memoize the UMKM change handler to prevent infinite loops
    const handleUMKMChange = useCallback((newUMKMId: string) => {
        if (newUMKMId !== currUMKM) {
            setCurrUMKM(newUMKMId)
            // Reset variants when UMKM changes (only for new products)
            if (!isEditMode) {
                setCustomVariants([])
                setLocalNewVariants([])
                setExistingVariantUpdates({})
                form.setValue("varianIds", [])
                onNewVariantsChange?.([])
            }
        }
    }, [currUMKM, form, onNewVariantsChange, isEditMode])

    // Watch for UMKMId changes
    useEffect(() => {
        if (watchedUMKMId && watchedUMKMId !== currUMKM) {
            handleUMKMChange(watchedUMKMId)
        }
    }, [watchedUMKMId, currUMKM, handleUMKMChange])

    // Sync local new variants with parent (only when props change)
    useEffect(() => {
        if (JSON.stringify(newVariants) !== JSON.stringify(localNewVariants)) {
            setLocalNewVariants(newVariants)
        }
    }, [newVariants])

    // Initialize form values on mount
    useEffect(() => {
        const currentVarianIds = form.getValues("varianIds")
        const currentUMKM = form.getValues("UMKMId")
        
        if (currentVarianIds) {
            setCustomVariants(currentVarianIds)
        }
        if (currentUMKM) {
            setCurrUMKM(currentUMKM)
        }
    }, [])

    const { data: kategoriData } = api.kategori.lihatKategori.useQuery()
    const { data: umkmData } = api.umkm.lihatUMKM.useQuery()

    const filteredKategori = currUMKM ? kategoriData?.filter((item) => item.UMKM?.id === currUMKM) : null

    // For new products, use empty array. For existing products, use provided existing variants
    const variantOptions = isEditMode ? existingVariants.map((v) => ({
        value: v.id,
        label: v.nama,
        status: v.status
    })) : []

    const { mutateAsync: tambahImageSignedUrl } = api.produk.tambahGambarProdukSignedUrl.useMutation()

    const cn = (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(" ")

    // SIMPLIFIED IMAGE UPLOAD (to avoid errors for now)
    const changeImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files

        if (files && files.length > 0) {
            const file = files[0]

            if (!file) {
                return
            }

            setIsUploading(true)

            try {
                // Try your original upload method first
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
                
                // FALLBACK: Use a temporary URL for testing
                const tempUrl = URL.createObjectURL(file)
                console.log("Using temporary URL for testing:", tempUrl)
                onChangeImage(tempUrl)
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleToggleVariant = useCallback((id: string) => {
        const updated = customVariants.includes(id)
            ? customVariants.filter((v) => v !== id)
            : [...customVariants, id]

        setCustomVariants(updated)
        form.setValue("varianIds", updated)
    }, [customVariants, form])

    const handleRemoveVariant = useCallback((id: string) => {
        const updated = customVariants.filter((v) => v !== id)
        setCustomVariants(updated)
        form.setValue("varianIds", updated)
    }, [customVariants, form])

    const handleToggleNewVariantStatus = useCallback((tempId: string) => {
        const updated = localNewVariants.map(v => 
            v.tempId === tempId ? { ...v, status: !v.status } : v
        );
        setLocalNewVariants(updated);
        onNewVariantsChange?.(updated);
    }, [localNewVariants, onNewVariantsChange]);

    // Handle existing variant status toggle
    const handleToggleExistingVariantStatus = useCallback((variantId: string) => {
        const variant = variantOptions.find(v => v.value === variantId);
        if (!variant) return;

        setExistingVariantUpdates(prev => ({
            ...prev,
            [variantId]: {
                id: variantId,
                nama: variant.label,
                status: prev[variantId] ? !prev[variantId].status : !variant.status,
                isDeleted: prev[variantId]?.isDeleted ?? false
            }
        }));
    }, [variantOptions]);

    // Handle existing variant deletion
    const handleDeleteExistingVariant = useCallback((variantId: string) => {
        const variant = variantOptions.find(v => v.value === variantId);
        if (!variant) return;

        // Remove from selected variants
        const updatedSelected = customVariants.filter(id => id !== variantId);
        setCustomVariants(updatedSelected);
        form.setValue("varianIds", updatedSelected);

        // Mark as deleted in updates
        setExistingVariantUpdates(prev => ({
            ...prev,
            [variantId]: {
                id: variantId,
                nama: variant.label,
                status: prev[variantId]?.status ?? variant.status,
                isDeleted: true
            }
        }));
    }, [variantOptions, customVariants, form]);

    // Handle new variant creation - check if it's existing first
    const handleAddNewVariant = useCallback(() => {
        if (!newVariantName.trim()) return;
        
        const trimmedName = newVariantName.trim();
        
        // Check if this variant name already exists (only in edit mode)
        if (isEditMode) {
            const existing = variantOptions.find((v) => v.label.toLowerCase() === trimmedName.toLowerCase());
            
            if (existing) {
                // If it exists, add it to selected variants instead
                if (!customVariants.includes(existing.value)) {
                    const updated = [...customVariants, existing.value];
                    setCustomVariants(updated);
                    form.setValue("varianIds", updated);
                }
                setNewVariantName("");
                return;
            }
        }
        
        // Create new variant
        const newVariantItem: NewVariant = {
            tempId: `temp_${Date.now()}_${Math.random()}`,
            nama: trimmedName,
            status: true
        };
        
        const updated = [...localNewVariants, newVariantItem];
        setLocalNewVariants(updated);
        onNewVariantsChange?.(updated);
        setNewVariantName("");
    }, [newVariantName, variantOptions, customVariants, localNewVariants, form, onNewVariantsChange, isEditMode]);

    const handleRemoveNewVariant = useCallback((tempId: string) => {
        const updated = localNewVariants.filter(v => v.tempId !== tempId);
        setLocalNewVariants(updated);
        onNewVariantsChange?.(updated);
    }, [localNewVariants, onNewVariantsChange]);

    // Enhanced submit handler
    const handleSubmit = useCallback((data: ProductFormSchema) => {
        const enhancedData: ProductFormWithVariants = {
            ...data,
            newVariants: localNewVariants,
            existingVariantUpdates: Object.values(existingVariantUpdates)
        };
        onSubmit(enhancedData);
    }, [localNewVariants, existingVariantUpdates, onSubmit]);

    // Handle category validation when filtered categories change
    useEffect(() => {
        const currentCategory = form.getValues("kategoriId")
        const currentUMKM = form.getValues("UMKMId")
        
        // Only validate/reset if we have both UMKM and filtered categories loaded
        if (currentUMKM && filteredKategori && currentCategory) {
            const valid = filteredKategori.some((item) => item.id === currentCategory)
            
            // Only reset if the category is actually invalid for this UMKM
            if (!valid) {
                form.setValue("kategoriId", "")
            }
        }
    }, [filteredKategori, form])

    // Initialize UMKM and ensure category stays valid on mount
    useEffect(() => {
        const currentUMKM = form.getValues("UMKMId")
        if (currentUMKM && currentUMKM !== currUMKM) {
            setCurrUMKM(currentUMKM)
        }
    }, [form, currUMKM])

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} id="product-form" className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <FormField
                control={form.control}
                name="UMKMId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>UMKM</FormLabel>
                        <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih UMKM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {umkmData?.map((item) => (
                                        <SelectItem value={item.id} key={item.id}>{item.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <FormLabel>Kategori</FormLabel>
                        <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredKategori?.map((item) => (
                                        <SelectItem value={item.id} key={item.id}>{item.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
                <Label>Gambar Produk</Label>
                <Input onChange={changeImage} type="file" accept="image/*" placeholder="Gambar" />

                {isUploading ? (
                    <div className="flex items-center gap-2">
                        <LoaderCircle className="animate-spin h-4 w-4" />
                        <span className="text-sm">Mengupload...</span>
                    </div>
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
                )}
            </div>

            {/* VARIANTS SECTION */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Kelola Varian Produk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {isEditMode 
                            ? "Kelola varian untuk produk ini atau buat varian baru. Perubahan akan disimpan saat produk disimpan."
                            : "Tambahkan varian untuk produk baru ini. Varian akan disimpan saat produk disimpan."
                        }
                    </p>

                    {/* Add new variant input */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Tambah varian baru"
                            value={newVariantName}
                            onChange={(e) => setNewVariantName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddNewVariant();
                                }
                            }}
                        />
                        <Button 
                            type="button" 
                            onClick={handleAddNewVariant}
                            variant="outline"
                            size="icon"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Existing variants section - only show in edit mode */}
                    {isEditMode && variantOptions.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Varian produk ini:</p>
                            <div className="space-y-2">
                                {variantOptions
                                    .filter(variant => !existingVariantUpdates[variant.value]?.isDeleted)
                                    .map(({ value, label, status }) => {
                                    const update = existingVariantUpdates[value]
                                    const currentStatus = update ? update.status : status
                                    const hasChanges = update && (update.status !== status)
                                    
                                    return (
                                        <div 
                                            key={value}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${
                                                hasChanges 
                                                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' 
                                                    : 'bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">{label}</span>
                                                <Badge variant={currentStatus ? "outline" : "secondary"}>
                                                    {currentStatus ? "Aktif" : "Tidak Aktif"}
                                                </Badge>
                                                {hasChanges && (
                                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                                        Diubah
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Status toggle checkbox */}
                                                <Checkbox
                                                    checked={currentStatus}
                                                    onCheckedChange={() => handleToggleExistingVariantStatus(value)}
                                                />
                                                <span className="text-xs text-muted-foreground">Aktif</span>
                                                {/* Delete button */}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteExistingVariant(value)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            {Object.values(existingVariantUpdates).some(update => update.isDeleted) && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-red-600">Varian yang akan dihapus:</p>
                                    <div className="space-y-2">
                                        {Object.values(existingVariantUpdates)
                                            .filter(update => update.isDeleted)
                                            .map((update) => (
                                            <div 
                                                key={update.id}
                                                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium line-through text-muted-foreground">{update.nama}</span>
                                                    <Badge variant="destructive">
                                                        Akan Dihapus
                                                    </Badge>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        // Restore variant
                                                        setExistingVariantUpdates(prev => {
                                                            const newUpdates = { ...prev };
                                                            delete newUpdates[update.id];
                                                            return newUpdates;
                                                        });
                                                    }}
                                                    className="h-8 w-8 text-green-600 hover:text-green-700"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* New variants section */}
                    {localNewVariants.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Varian baru yang akan dibuat:</p>
                            <div className="space-y-2">
                                {localNewVariants.map((variant) => (
                                    <div 
                                        key={variant.tempId}
                                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{variant.nama}</span>
                                            <Badge variant={variant.status ? "default" : "secondary"}>
                                                {variant.status ? "Aktif" : "Tidak Aktif"}
                                            </Badge>
                                            <Badge variant="default" className="bg-green-600">
                                                Baru
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={variant.status}
                                                onCheckedChange={() => handleToggleNewVariantStatus(variant.tempId)}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveNewVariant(variant.tempId)}
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isEditMode && localNewVariants.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">
                            Tambahkan varian untuk produk ini di atas
                        </p>
                    )}

                    {isEditMode && variantOptions.length === 0 && localNewVariants.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">
                            Produk ini belum memiliki varian. Tambahkan varian baru di atas.
                        </p>
                    )}

                    {/* Hidden form field for varianIds */}
                    <FormField
                        control={form.control}
                        name="varianIds"
                        render={() => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input type="hidden" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
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