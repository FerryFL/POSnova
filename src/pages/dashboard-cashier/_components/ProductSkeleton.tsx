import { Card } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"

const ProductSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {
                Array.from({ length: 20 }, (_, i) => (
                    <Card key={i} className="h-80 flex flex-col gap-2 pt-0">
                        <Skeleton className="w-full h-40" />
                        <div className="p-3 flex flex-col gap-2">
                            <Skeleton className="w-3/4 h-5" />
                            <Skeleton className="w-1/2 h-5" />
                            <div className="flex flex-row gap-2">
                                <Skeleton className="w-1/2 h-9" />
                                <Skeleton className="w-1/2 h-9" />
                            </div>
                            <Skeleton className="w-full h-9" />
                        </div>
                    </Card>
                ))
            }
        </div>
    )
}

export default ProductSkeleton