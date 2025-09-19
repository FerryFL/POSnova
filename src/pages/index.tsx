import type { ReactElement } from "react";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { useUserStore } from "~/store/user";
import type { NextPageWithLayout } from "./_app";

export const Home: NextPageWithLayout = () => {
    const { profile } = useUserStore();
    return (
        <div className="space-y-2">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-foreground">POSnova</h1>
                <h2 className="text-xl text-foreground"> Selamat datang, {profile?.name}!</h2>
                {profile?.UMKM?.nama && (
                    <p className="text-foreground">{profile?.UMKM.nama}</p>
                )}
            </div>
        </div>
    );
};

Home.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>;
};

export default Home;