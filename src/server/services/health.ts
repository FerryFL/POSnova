import { TRPCError } from "@trpc/server"
import axios, { type AxiosError } from "axios"
import type { ApiError } from "next/dist/server/api-utils"
import type { HealthCheckResponse } from "~/types/recommendation"

const API_BASE_URL = process.env.RECOMMENDATION_API_URL!

export const fetchHealth = async (signal?: AbortSignal) => {
    try {
        const { data } = await axios.get<HealthCheckResponse>(`${API_BASE_URL}/health`, { signal })
        return data
    } catch (e) {
        const error = e as AxiosError<ApiError>

        const status = error.response?.status
        const apiMessage = error.response?.data.message

        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Health check gagal [${status}]: ${apiMessage ?? error.message}`
        });
    }
}