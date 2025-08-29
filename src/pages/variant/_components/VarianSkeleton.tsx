import { Card } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"

const VarianSkeleton = () => {
    return (
        Array.from({ length: 20 }, (_, i) => (
            <Card key={i} className="h-36 p-3 flex flex-col gap-2 justify-center">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-1/2 h-4" />
                <div className="flex flex-row gap-2">
                    <Skeleton className="w-1/2 h-9" />
                    <Skeleton className="w-1/2 h-9" />
                </div>
            </Card>
        ))
    )
}

export default VarianSkeleton