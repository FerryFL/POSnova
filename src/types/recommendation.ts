// Training
export type TrainingResponse = {
    success: boolean
    message: string
    timestamp: string
    total_products?: number
    total_transactions?: number
}

// Recommendation
export type RecommendationItem = {
    id: string
    nama: string
    harga: number
    gambar: string
    stok: number
    status: boolean
    score: number
    UMKM: {
        id: string
        nama: string
    } | null
    kategori: {
        id: string
        nama: string
        status: boolean
    }
    ProdukVarian: Array<{
        varian: {
            id: string
            nama: string
        }
    }>
}

export type RecommendationResponse = {
    success: boolean,
    recommendations: RecommendationItem[]
    method: 'content_based' | 'apriori'
    total_found: number
    decision_info: {
        method_used: 'apriori' | 'content_based'
        transaction_counts: Array<{
            productId: string
            count: number
        }>
        total_cart_items: number
    }
}

// Health
export type HealthCheckResponse = {
    status: 'healthy' | 'unhealthy',
    service: string,
    content_trained: boolean,
    apriori_trained: boolean
}