import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { UmkmFormSchema } from "~/lib/schemas/umkm";

interface UMKMFormProps {
    onSubmit: (data: UmkmFormSchema) => void;
}

export const UMKMForm = ({ onSubmit }: UMKMFormProps) => {
    const form = useFormContext<UmkmFormSchema>();

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} id="umkm-form" className="space-y-4">
            <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nama UMKM</FormLabel>
                        <FormControl>
                            <Input placeholder="Toko Kelontong Sejahtera" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                            <Input placeholder="Jl. Raya No. 123, Jakarta" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="noTelp"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="08123456789 atau +6281234567890"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </form>
    );
};