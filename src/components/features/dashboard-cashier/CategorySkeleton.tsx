import { Skeleton } from "~/components/ui/skeleton"

const CategorySkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14" />
            ))}
        </div>
    )
}

export default CategorySkeleton