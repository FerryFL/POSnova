import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input";
import type { VariantFormSchema } from "~/forms/variant";

interface VariantFormProps {
    onSubmit: (data: VariantFormSchema) => void;
}

export const VariantForm = ({ onSubmit }: VariantFormProps) => {
    const form = useFormContext<VariantFormSchema>();
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
        </form>
    )

}