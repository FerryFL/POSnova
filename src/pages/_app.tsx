import { type AppProps, type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { useEffect, type ReactElement, type ReactNode } from "react";
import type { NextPage } from "next";
import { ThemeProvider } from "~/providers/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { supabase } from "~/utils/supabase/component";
import { useUserData } from "~/hooks/use-user-data";
import { useCartStore } from "~/store/cart";


const geist = Geist({
    subsets: ["latin"],
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
    const getLayout = Component.getLayout ?? ((page) => page);
    const { loadAfterLogin, clearUserData } = useUserData()
    const { clearCart } = useCartStore()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                    setTimeout(() => {
                        void loadAfterLogin()
                    }, 0)
                } else if (event === "SIGNED_OUT") {
                    clearUserData()
                    clearCart()
                }
            }
        )
        return () => subscription.unsubscribe()
    }, [loadAfterLogin, clearUserData, clearCart])

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className={geist.className}>
                {getLayout(<Component {...pageProps} />)}
            </div>
            <Toaster />
        </ThemeProvider>
    );
};

export default api.withTRPC(MyApp);
