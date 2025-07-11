import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { kategoriRouter } from "./routers/kategori";
import { produkRouter } from "./routers/produk";
import { umkmRouter } from "./routers/umkm";
import { varianRouter } from "./routers/varian";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  kategori: kategoriRouter,
  produk: produkRouter,
  umkm: umkmRouter,
  varian: varianRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
