import { useEffect } from "react";
import { useFormContext } from "react-hook-form"
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input";
import type { VariantFormSchema } from "~/lib/schemas/variant";
import { useUserStore } from "~/store/user";

interface VariantFormProps {
    onSubmit: (data: VariantFormSchema) => void;
}

export const VariantForm = ({ onSubmit }: VariantFormProps) => {
    const { profile } = useUserStore()
    const form = useFormContext<VariantFormSchema>();
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
                        <FormLabel>Nama Varian</FormLabel>
                        <FormControl>
                            <Input placeholder="Varian" {...field} />
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
                                checked={field.value ?? true}
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