import { type AppProps, type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { ThemeProvider } from "~/providers/theme-provider";

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
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
