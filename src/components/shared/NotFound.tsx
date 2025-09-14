import { PackageSearch } from "lucide-react"
import type { ReactNode } from "react"

interface NotFoundProps {
    children: ReactNode
    className?: string
}

const NotFound = ({ children, className }: NotFoundProps) => {
    return (
        <div className={`w-full min-h-72 col-span-full flex flex-col items-center justify-center py-12 text-center ${className}`}>
            <h2 className="flex flex-col gap-2 items-center font-semibold text-muted-foreground">
                <PackageSearch className="size-11" /> Belum ada {children} yang tersedia saat ini.
            </h2>
        </div>
    )
}

export default NotFound