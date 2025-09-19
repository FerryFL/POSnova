import { Calendar, Download } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { BlobProvider } from "@react-pdf/renderer"
import { Button } from "~/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { Card } from "~/components/ui/card"
import type { Transaksi } from "~/utils/api"
import MonthlyPDFDocument from "~/components/features/transaction/MonthlyPDFDocument"
import dayjs from "dayjs"
import "dayjs/locale/id"

interface MonthlyReportDownloadProps {
    transaksi: Transaksi[]
}

export const MonthlyReportDownload = ({ transaksi }: MonthlyReportDownloadProps) => {
    const [bulanTerpilih, setBulanTerpilih] = useState<string>("")
    const [tahunTerpilih, setTahunTerpilih] = useState<string>("")

    const daftarBulan = Array.from({ length: 12 }, (_, i) => {
        const bulan = i + 1
        const namaBulan = dayjs().month(i).locale('id').format('MMMM')
        return { value: bulan.toString(), label: namaBulan }
    })

    const tahunSekarang = new Date().getFullYear()
    // Daftar tahun = 3 tahun terakhir, ubah length kalau mau set dropdown array
    const daftarTahun = Array.from({ length: 3 }, (_, i) => {
        const tahun = tahunSekarang - i
        return { value: tahun.toString(), label: tahun.toString() }
    })

    const getFilteredTransaksi = () => {
        if (!bulanTerpilih || !tahunTerpilih) return []

        return transaksi.filter(item => {
            const tanggalTransaksi = dayjs(item.tanggalTransaksi)
            return (
                tanggalTransaksi.month() + 1 === parseInt(bulanTerpilih) &&
                tanggalTransaksi.year() === parseInt(tahunTerpilih)
            )
        })
    }

    const filteredTransaksi = getFilteredTransaksi()
    const isSelected = bulanTerpilih && tahunTerpilih
    const count = useRef(0)

    const getNamaFile = () => {
        if (!bulanTerpilih || !tahunTerpilih) return "Laporan_Bulanan.pdf"

        const namaBulan = daftarBulan.find(m => m.value === bulanTerpilih)?.label ?? ""
        return `Laporan_Transaksi_${namaBulan}_${tahunTerpilih}.pdf`
    }

    useEffect(() => {
        count.current++
        // console.log(count)
        // console.log(filteredTransaksi)
    }, [filteredTransaksi, tahunTerpilih, bulanTerpilih])

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
                <Calendar className="size-5" />
                <h2 className="text-lg font-semibold">Download Laporan Bulanan</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 min-w-[150px]">
                    <label className="text-sm font-medium">Pilih Bulan</label>
                    <Select value={bulanTerpilih} onValueChange={setBulanTerpilih}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {daftarBulan.map((bulan) => (
                                <SelectItem key={bulan.value} value={bulan.value}>
                                    {bulan.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 min-w-[120px]">
                    <label className="text-sm font-medium">Pilih Tahun</label>
                    <Select value={tahunTerpilih} onValueChange={setTahunTerpilih}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {daftarTahun.map((tahun) => (
                                <SelectItem key={tahun.value} value={tahun.value}>
                                    {tahun.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isSelected && (
                    <BlobProvider
                        key={count.current}
                        document={
                            <MonthlyPDFDocument
                                transaksi={filteredTransaksi}
                                bulan={parseInt(bulanTerpilih)}
                                tahun={parseInt(tahunTerpilih)}
                            />
                        }
                    >
                        {({ url, loading }) => (
                            <Button
                                variant="default"
                                disabled={!url || loading}
                                asChild
                            >
                                {url ? (
                                    <a
                                        href={url}
                                        download={getNamaFile()}
                                        target="_blank"
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="size-4" />
                                        {loading ? "Memproses..." : "Download Laporan"}
                                    </a>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Download className="size-4" />
                                        {loading ? "Memproses..." : "Download Laporan"}
                                    </span>
                                )}
                            </Button>
                        )}
                    </BlobProvider>
                )}
            </div>

            {/* detail per bulan */}
            {isSelected && (
                <div className="text-sm text-gray-600 border-t pt-3">
                    <p>
                        <strong>Preview:</strong> {filteredTransaksi.length} transaksi ditemukan untuk{" "}
                        {daftarBulan.find(m => m.value === bulanTerpilih)?.label} {tahunTerpilih}
                    </p>
                    {filteredTransaksi.length > 0 && (
                        <p>
                            Total Pendapatan: Rp {filteredTransaksi.reduce((sum, t) => sum + t.totalHarga, 0).toLocaleString()}
                        </p>
                    )}
                </div>
            )}
        </Card>
    )
}