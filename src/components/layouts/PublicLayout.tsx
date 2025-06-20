import { Archive, Home, Moon, Package, Plus, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "../ui/button";
import Link from "next/link";
import { Toaster } from "../ui/sonner";

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
    }
]

export const PublicLayout = ({ children }: { children: ReactNode }) => {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (<SidebarProvider >
        <Sidebar>
            <SidebarHeader>
                <Button variant="ghost" onClick={toggleTheme}>
                    {mounted && resolvedTheme === "dark" ? <Moon /> : <Sun />}
                </Button>
                <h2 className="text-lg font-bold">POSnova</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className="gap-0">
                    <SidebarSeparator className="mt-2" />
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
                    <SidebarSeparator className="mb-4" />
                    {
                        item.map((item) => (
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
                </SidebarMenu>
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
        <Toaster />
    </SidebarProvider>
    )
}