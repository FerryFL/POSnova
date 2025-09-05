import { Archive, Building, CopyPlus, HandCoins, Home, LogOut, Moon, Package, Plus, ReceiptText, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "../ui/button";
import Link from "next/link";
import { createClient } from "~/utils/supabase/component";
import { useRouter } from "next/router";
import { useUserData } from "~/hooks/use-user-data";
import { useUserStore } from "~/store/user";
import { toast } from "sonner";

const item = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home
    },
    {
        title: "Kategori",
        url: "/category",
        icon: Archive
    },
    {
        title: "Produk",
        url: "/product",
        icon: Package
    },
    {
        title: "UMKM",
        url: "/UMKM",
        icon: Building
    },
    {
        title: "Varian",
        url: "/variant",
        icon: CopyPlus
    },
    {
        title: "Pembayaran",
        url: "/payment",
        icon: HandCoins
    },
    {
        title: "Transaksi",
        url: "/transaction",
        icon: ReceiptText
    }
]

export const PublicLayout = ({ children }: { children: ReactNode }) => {

    const { clearUserData } = useUserData()
    const { profile, hasRole } = useUserStore()
    const router = useRouter()

    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const supabase = createClient()

    const getFilteredItem = () => {
        let menu: typeof item = []

        if (hasRole('RL001')) {
            menu = [...menu]
        }
        if (hasRole('RL002')) {
            const filter = item.filter((menu) => menu.title !== "UMKM" && menu.title !== "Pembayaran")
            menu = [...menu, ...filter]
        }
        if (hasRole('RL003')) {
            const filter = item.filter((menu) => menu.title === "UMKM")
            menu = [...menu, ...filter]
        }
        return menu
    }

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut()
        clearUserData()
        toast.success("Berhasil Logout")
        await router.push("/login")
    };

    return (
        <SidebarProvider >
            <Sidebar>
                <SidebarHeader>
                    <Button variant="ghost" onClick={toggleTheme}>
                        {mounted && resolvedTheme === "dark" ? <Moon /> : <Sun />}
                    </Button>
                    <h2 className="text-lg font-bold">POSnova</h2>
                </SidebarHeader>
                <SidebarContent>
                    {mounted && profile && (
                        <SidebarMenu className="gap-0">
                            <SidebarSeparator className="mt-2" />
                            {
                                hasRole('RL001') && (
                                    <SidebarMenuItem>
                                        <Link href="/dashboard-cashier">
                                            <SidebarMenuButton className="py-6" asChild>
                                                <div className="flex items-center gap-2">
                                                    <Plus />
                                                    <span>Tambah Transaksi</span>
                                                </div>
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                )
                            }
                            <SidebarSeparator className="mb-4" />
                            {
                                getFilteredItem().map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <Link href={item.url}>
                                            <SidebarMenuButton className="py-6" asChild>
                                                <div className="flex items-center gap-2">
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </div>
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                ))
                            }
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="py-6 text-red-500 hover:text-red-700 cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    <div className="flex items-center gap-2">
                                        <LogOut />
                                        <span>Logout</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    )}
                </SidebarContent>
            </Sidebar>
            <main className="w-full">
                <SidebarTrigger />
                <Suspense fallback={<div>Loading...</div>}>
                    <div className="p-8">
                        {children}
                    </div>
                </Suspense>
            </main>
        </SidebarProvider>
    )
}