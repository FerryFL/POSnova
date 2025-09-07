import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Mail, Lock, UserPlus, Undo2, UserRound } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { toast } from "sonner";
import { registerFormSchema, type RegisterFormSchema } from "~/lib/schemas/register";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useRouter } from "next/router";

export const RegisterPage = () => {
    const route = useRouter()

    const form = useForm<RegisterFormSchema>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: []
        }
    })

    const mutation = api.user.signUp.useMutation()
    const { data } = api.umkm.lihatUMKM.useQuery()

    const onSubmit = async (data: RegisterFormSchema) => {
        try {
            const result = await mutation.mutateAsync({
                name: data.name,
                email: data.email,
                password: data.password,
                umkmId: data.umkmId,
                role: data.role
            });

            if (!result.success) {
                toast.error(result.message)
                return
            }

            // console.log("User created:", result.user);
            toast.success("Registrasi Berhasil!");
            form.reset()
        } catch (error) {
            console.error('Signup error:', error)
            if (error instanceof Error) {
                toast.error(error.message)
            }
        }
    }

    const roles = [
        { id: "RL001", nama: "Kasir" },
        { id: "RL002", nama: "Pemilik" },
        { id: "RL003", nama: "Admin" }
    ]

    const handleClick = async () => {
        await route.push("/")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-[360px]">
                {/* Header */}
                <h1 className="text-2xl font-bold text-center text-slate-800">POSNOVA</h1>
                <p className="text-center text-sm text-gray-500 mb-6">Buat Akun Baru</p>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Nama</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <UserRound className="size-5 text-slate-400" />
                                            <Input
                                                type="text"
                                                placeholder="Masukan Nama"
                                                className="text-gray-600 border-slate-300"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Email</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Mail className="size-5 text-slate-400" />
                                            <Input
                                                type="email"
                                                placeholder="Masukan Email"
                                                className="text-gray-600 border-slate-300"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Password</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <Lock className="size-5 text-slate-400" />
                                            <Input
                                                type="password"
                                                placeholder="Masukan Password"
                                                className="text-gray-600 border-slate-300"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Roles</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            {roles.map((role) => (
                                                <div className="flex items-center gap-2" key={role.id}>
                                                    <Checkbox
                                                        className="border-slate-300"
                                                        id={role.id}
                                                        checked={field.value?.includes(role.id) ?? false}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([...(field.value ?? []), role.id]);
                                                            } else {
                                                                field.onChange(
                                                                    (field.value ?? []).filter((id) => id !== role.id)
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={role.id}
                                                        className="text-gray-600 cursor-pointer"
                                                    >
                                                        {role.nama}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="umkmId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">UMKM</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="text-gray-600 border-slate-300">
                                                <SelectValue placeholder="Pilih UMKM" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent >
                                            {
                                                data?.map((item) => (
                                                    <SelectItem value={item.id} key={item.id}>{item.nama}</SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <Button
                                type="submit"
                                className="w-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center gap-2"
                            >
                                <UserPlus className="h-5 w-5" />
                                Register
                            </Button>

                            <Button
                                type="button"
                                className="w-full"
                                variant="default"
                                onClick={handleClick}
                            >
                                <Undo2 className="size-4" />
                                <span>Kembali</span>
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </div >
    );
}

export default RegisterPage