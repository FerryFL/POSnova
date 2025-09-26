import axios, { type AxiosError } from "axios";
import type { TransactionForAprioriTraining } from "./transaction-apriori-training";
import type { RecommendationResponse, TrainingResponse } from "~/types/recommendation";
import type { ApiError } from "next/dist/server/api-utils";
import { TRPCError } from "@trpc/server";
import type { ProdukKeranjangSchema } from "~/lib/schemas/produk-keranjang";

const API_BASE_URL = process.env.RECOMMENDATION_API_URL!

export const trainApriori = async (transactions: TransactionForAprioriTraining) => {
    try {
        const { data } = await axios.post<TrainingResponse>(`${API_BASE_URL}/train-apriori`, { transactions })
        return data
    } catch (e) {
        const error = e as AxiosError<ApiError>

        const status = error.response?.status
        const apiMessage = error.response?.data.message

        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Train Apriori gagal [${status}]: ${apiMessage ?? error.message}`
        });
    }
}

export const getRecommendationApriori = async (items: ProdukKeranjangSchema[], num_recommendations: number) => {
    try {
        const { data } = await axios.post<RecommendationResponse>(`${API_BASE_URL}/recommend-apriori`, { items, num_recommendations })
        return data
    } catch (e) {
        const error = e as AxiosError<ApiError>

        const status = error.response?.status
        const apiMessage = error.response?.data.message

        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Gagal mendapat rekomendasi Apriori [${status}]: ${apiMessage ?? error.message}`
        });
    }
}