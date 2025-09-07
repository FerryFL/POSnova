import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { type CategoryFormSchema } from "~/forms/category"
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { useUserStore } from "~/store/user";
import { useEffect } from "react";

interface CategoryFormProps {
    onSubmit: (data: CategoryFormSchema) => void;
}

export const CategoryForm = ({ onSubmit }: CategoryFormProps) => {
    const { profile } = useUserStore()

    const form = useFormContext<CategoryFormSchema>();

    useEffect(() => {
        if (profile?.UMKM?.id) {
            form.setValue("UMKMId", profile.UMKM.id)
        }
    }, [form, profile?.UMKM?.id])

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nama Kategori</FormLabel>
                        <FormControl>
                            <Input placeholder="Makanan" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

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