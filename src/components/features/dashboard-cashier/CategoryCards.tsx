import { Card } from "~/components/ui/card"
import type { Kategori } from "~/utils/api"

interface CategoryProps {
    categories: Kategori[]
    totalProducts: number
    onSelect: (kategoriId: string, nama: string) => void
}

const CategoryCards = (props: CategoryProps) => {
    const { categories, totalProducts, onSelect } = props

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-4 w-full">

            <Card className="hover:bg-gray-100 hover:text-black transition-colors p-3 shrink-0 gap-0 min-w-32 max-w-52 text-center flex justify-center items-center cursor-pointer"
                onClick={() => onSelect("Semua", "Semua")}>
                <h2 className="text-base font-semibold">Semua</h2>
                <p className="text-sm">{totalProducts} Produk</p>
            </Card>

            {
                categories.filter((category) => category.status === true).map((category) => (
                    <Card key={category.id} className="hover:bg-gray-100 hover:text-black transition-colors shrink-0 p-3 gap-1 min-w-32 max-w-52 text-center flex justify-center items-center cursor-pointer"
                        onClick={() => onSelect(category.id, category.nama)}>
                        <div className="w-full">
                            <h2 className="text-base font-semibold line-clamp-1 break-words">{category.nama}</h2>
                        </div>
                        <p className="text-sm">{category.Produk.filter(item => item.status === true).length} Produk</p>
                    </Card>
                ))
            }
        </div>
    )
}

export default CategoryCards