import { useRouter } from "next/router";
import { supabase } from "../utils/supabase/component";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Mail, Lock, LogIn } from "lucide-react";
import { useUserData } from "~/hooks/use-user-data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { toast } from "sonner";
import { loginFormSchema, type LoginFormSchema } from "~/lib/schemas/login";

export default function LoginPage() {
    const router = useRouter();
    const { loadAfterLogin } = useUserData();

    const form = useForm<LoginFormSchema>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmit = async (data: LoginFormSchema) => {
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });

            if (error) {
                console.error(error);
                toast.error(error.message);
                return;
            }

            if (authData.user) {
                console.log('Login successful, loading user data...');

                const success = await loadAfterLogin();

                if (success) {
                    console.log('User data loaded successfully');
                    toast.success("Login Berhasil!");
                    form.reset()
                    await router.push("/");
                } else {
                    toast.error("Gagal melakukan User Load setelah login");
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Login Gagal!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-[360px]">
                {/* Header */}
                <h1 className="text-2xl font-bold text-center text-slate-800">POSNOVA</h1>
                <p className="text-center text-sm text-gray-500 mb-6">Masuk ke Akunmu</p>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-600">Email</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Mail className="size-5 text-gray-400" />
                                            <Input
                                                type="email"
                                                placeholder="Masukan Email"
                                                className="text-black"
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
                                            <Lock className="size-5 text-gray-400" />
                                            <Input
                                                type="password"
                                                placeholder="Masukan Password"
                                                className="text-black"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* <div className="flex items-center justify-between text-sm">
                            <FormField
                                control={form.control}
                                name="remember"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="remember"
                                                    className="border-gray-400"
                                                    checked={field.value ?? false}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label htmlFor="remember" className="text-gray-600 cursor-pointer">
                                                    Ingat Saya
                                                </Label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <a href="#" className="text-red-500 hover:underline">Lupa Password?</a>
                        </div> */}

                        <Button
                            type="submit"
                            className="w-full bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center gap-2"
                        >
                            <LogIn className="h-5 w-5" />
                            Login
                        </Button>
                    </form>
                </Form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Belum Ada Akun?{" "}
                    <a href="#" className="text-red-500 hover:underline">
                        Kontak Administrator
                    </a>
                </p>
            </div>
        </div>
    );
}