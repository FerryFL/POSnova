import type { ReactElement } from "react";
import { PublicLayout } from "~/components/layouts/PublicLayout";

export default function Home() {
  return (
    <>
      <main>
        Ini Index
      </main >
    </>
  );
}

Home.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>
}

