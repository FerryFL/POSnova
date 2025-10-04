import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { produkKeranjangSchema } from "~/lib/schemas/produk-keranjang";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRecommendationApriori, trainApriori } from "~/server/services/apriori";
import { getRecommendationContent, trainContent } from "~/server/services/content-based";
import { fetchHealth } from "~/server/services/health";
import { getProductsForContentTraining } from "~/server/services/product-content-training";
import { getTransactionsForAprioriTraining } from "~/server/services/transaction-apriori-training";

export const rekomendasiRouter = createTRPCRouter({
    trainContentBased: publicProcedure
        .input(
            z.object({
                umkmId: z.string()
            }))
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;

            try {
                const products = await getProductsForContentTraining(db, input.umkmId)

                if (products.length === 0) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Tidak menemukan product untuk training"
                    })
                }

                const result = await trainContent(products, input.umkmId)
                return {
                    ...result,
                    total_products: products.length
                };

            } catch (e) {
                const error = e instanceof Error ? e.message : "Gagal untuk training model Content Based"

                console.error('Error training content-based model:', error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error
                })
            }
        }),

    trainApriori: publicProcedure
        .input(z.object({
            umkmId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;

            try {

                const transactions = await getTransactionsForAprioriTraining(db, input.umkmId)

                if (transactions.length === 0) {
                    throw new Error('No transactions found for Apriori training');
                }

                const result = await trainApriori(transactions, input.umkmId)

                return {
                    ...result,
                    total_transactions: transactions.length
                };

            } catch (e) {
                const error = e instanceof Error ? e.message : "Gagal untuk training model Apriori"

                console.error('Error training apriori model:', error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error
                })
            }
        }),

    getRecommendations: publicProcedure
        .input(z.object({
            items: z.array(produkKeranjangSchema),
            num_recommendations: z.number().default(5),
            umkmId: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const { db } = ctx;

            try {
                if (input.items.length === 0) {
                    return {
                        success: true,
                        recommendations: [],
                        method: 'content_based',
                        total_found: 0,
                        decision_info: {
                            method_used: 'content_based',
                            transaction_counts: [],
                            total_cart_items: 0
                        }
                    };
                }

                const productIds = input.items.map(item => item.id);

                const transactionCounts = await Promise.all(
                    productIds.map(async (productId) => {
                        const count = await db.transaksiItem.count({
                            where: { produkId: productId }
                        });
                        return { productId, count };
                    })
                );

                const useApriori = transactionCounts.some(item => item.count >= 10) && input.items.length > 1;

                const recommendations = useApriori ?
                    await getRecommendationApriori(input.items, input.umkmId, input.num_recommendations) :
                    await getRecommendationContent(input.items, input.umkmId, input.num_recommendations)

                return {
                    ...recommendations,
                    decision_info: {
                        method_used: useApriori ? 'apriori' : 'content_based',
                        transaction_counts: transactionCounts,
                        total_cart_items: input.items.length
                    }
                };

            } catch (e) {
                const error = e instanceof Error ? e.message : "Gagal mendapatkan rekomendasi"

                console.error('Gagal mendapatkan rekomendasi:', error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: error
                })
            }
        }),

    checkHealth: publicProcedure
        .query(async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            try {
                return await fetchHealth(controller.signal)
            } finally {
                clearTimeout(timeout);
            }
        }),
});