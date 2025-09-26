import axios, { type AxiosError } from "axios"
import type { RecommendationResponse, TrainingResponse } from "~/types/recommendation"
import type { ProductForContentTraining } from "./product-content-training"
import type { ApiError } from "next/dist/server/api-utils"
import { TRPCError } from "@trpc/server"
import type { ProdukKeranjangSchema } from "~/lib/schemas/produk-keranjang"

const API_BASE_URL = process.env.RECOMMENDATION_API_URL!

export const trainContent = async (products: ProductForContentTraining) => {
    try {
        const { data } = await axios.post<TrainingResponse>(`${API_BASE_URL}/train-content`, { products })
        return data
    } catch (e) {
        const error = e as AxiosError<ApiError>

        const status = error.response?.status
        const apiMessage = error.response?.data.message

        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Train Content Based gagal [${status}]: ${apiMessage ?? error.message}`
        });
    }
}

export const getRecommendationContent = async (items: ProdukKeranjangSchema[], num_recommendations: number) => {
    try {
        const { data } = await axios.post<RecommendationResponse>(`${API_BASE_URL}/recommend-content`, { items, num_recommendations })
        return data
    } catch (e) {
        const error = e as AxiosError<ApiError>

        const status = error.response?.status
        const apiMessage = error.response?.data.message

        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Gagal mendapat rekomendasi Content Based [${status}]: ${apiMessage ?? error.message}`
        });
    }
}