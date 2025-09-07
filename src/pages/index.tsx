import type { ReactElement } from "react";
import { PublicLayout } from "~/components/layouts/PublicLayout";
import { useUserStore } from "~/store/user";
import type { NextPageWithLayout } from "./_app";

export const Home: NextPageWithLayout = () => {
    const {
        profile,
        roles,
        hasRole,
    } = useUserStore()
    return (
        <div>
            {
                profile ? (
                    <div>
                        <h1>Selamat datang, {profile?.name}</h1>
                        <p>(PROFILE){profile?.id} === (ROLE){roles[0]?.profileId}</p>
                        <p>(PROFILE){profile?.email}</p>
                        <p>UMKM: {profile?.UMKM?.nama}</p>
                        <p>Roles: {roles.map((item) => item.role.name)}</p>
                        {
                            roles.map((role) => role.role.id)
                        }
                        {
                            hasRole('RL001') && (
                                <p>Kamu adalah Kasir</p>
                            )
                        }
                        {
                            hasRole('RL002') && (
                                <p>Kamu adalah Pemilik</p>
                            )
                        }
                        {
                            hasRole('RL003') && (
                                <p>Kamu adalah Admin</p>
                            )
                        }
                    </div>
                ) : (
                    <div>No Data</div>
                )
            }
        </div>
    );
}

Home.getLayout = (page: ReactElement) => {
    return <PublicLayout>{page}</PublicLayout>
}

export default Home

