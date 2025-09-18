import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import type { Transaksi } from '~/utils/api'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

const styles = StyleSheet.create({
    page: {
        padding: 24,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottom: 1,
        borderColor: '#ddd'
    },
    left: {
        flexDirection: 'column',
        gap: 4,
    },
    rightBox: {
        backgroundColor: '#E6F0FA',
        padding: 8,
        borderRadius: 4,
        maxWidth: 200,
    },
    tokoNama: {
        fontWeight: 'bold',
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    periode: {
        fontSize: 12,
        color: '#555',
        marginBottom: 4,
    },
    summaryBox: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 4,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 9,
        color: '#666',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 6,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        minHeight: 24,
    },
    tableCell: {
        fontSize: 9,
        color: '#374151',
        textAlign: 'left',
    },
    tableCellCenter: {
        fontSize: 9,
        color: '#374151',
        textAlign: 'center',
    },
    tableCellRight: {
        fontSize: 9,
        color: '#374151',
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: 'grey'
    },
    footerThanks: {
        fontSize: 10,
        marginBottom: 4
    },
    // Lebar column (set sesuai selera)
    col1: { width: '6%' },   // No
    col2: { width: '28%' },  // ID
    col3: { width: '16%' },  // Tanggal
    col4: { width: '12%' },  // Total Produk
    col5: { width: '20%' },  // Total Harga
    col6: { width: '18%' },  // Status
})

interface MonthlyPDFDocumentProps {
    transaksi: Transaksi[]
    bulan: number
    tahun: number
}

const MonthlyPDFDocument = ({ transaksi, bulan, tahun }: MonthlyPDFDocumentProps) => {
    const namaBulan = dayjs().month(bulan - 1).locale('id').format('MMMM')
    
    const totalTransaksi = transaksi.length
    const totalProduk = transaksi.reduce((sum, t) => sum + t.totalProduk, 0)
    const totalPendapatan = transaksi.reduce((sum, t) => sum + t.totalHarga, 0)
    const rataRataTransaksi = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.left}>
                        <Text style={styles.reportTitle}>LAPORAN TRANSAKSI BULANAN</Text>
                        <Text style={styles.periode}>Periode: {namaBulan} {tahun}</Text>
                        <Text>Tanggal Cetak: {dayjs().locale('id').format('DD MMMM YYYY')}</Text>
                    </View>

                    <View style={styles.rightBox}>
                        <Text style={styles.tokoNama}>Toko ABC</Text>
                        <Text>Jl. Contoh No. 123</Text>
                        <Text>Jakarta Selatan, 12345</Text>
                        <Text>Tel: (021) 1234-5678</Text>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryBox}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Transaksi</Text>
                        <Text style={styles.summaryValue}>{totalTransaksi}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Produk Terjual</Text>
                        <Text style={styles.summaryValue}>{totalProduk}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Pendapatan</Text>
                        <Text style={styles.summaryValue}>Rp {totalPendapatan.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Rata-rata per Transaksi</Text>
                        <Text style={styles.summaryValue}>Rp {Math.round(rataRataTransaksi).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <View style={[styles.col1]}>
                        <Text style={styles.tableHeaderCell}>No</Text>
                    </View>
                    <View style={[styles.col2]}>
                        <Text style={styles.tableHeaderCell}>ID Transaksi</Text>
                    </View>
                    <View style={[styles.col3]}>
                        <Text style={styles.tableHeaderCell}>Tanggal</Text>
                    </View>
                    <View style={[styles.col4]}>
                        <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Qty</Text>
                    </View>
                    <View style={[styles.col5]}>
                        <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Total Harga</Text>
                    </View>
                    <View style={[styles.col6]}>
                        <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>Status</Text>
                    </View>
                </View>

                {/* Table Rows */}
                {transaksi.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                        <View style={[styles.col1]}>
                            <Text style={styles.tableCellCenter}>{index + 1}</Text>
                        </View>
                        <View style={[styles.col2]}>
                            <Text style={[styles.tableCell, { fontSize: 6 }]}>{item.id}</Text>
                        </View>
                        <View style={[styles.col3]}>
                            <Text style={styles.tableCell}>
                                {dayjs(item.tanggalTransaksi).locale('id').format('DD MMM YYYY')}
                            </Text>
                        </View>
                        <View style={[styles.col4]}>
                            <Text style={styles.tableCellCenter}>{item.totalProduk}</Text>
                        </View>
                        <View style={[styles.col5]}>
                            <Text style={styles.tableCellRight}>Rp {item.totalHarga.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.col6]}>
                            <Text style={styles.tableCellCenter}>Lunas</Text>
                        </View>
                    </View>
                ))}

                {transaksi.length === 0 && (
                    <View style={styles.tableRow}>
                        <View style={{ width: '100%' }}>
                            <Text style={[styles.tableCellCenter, { fontStyle: 'italic' }]}>
                                Tidak ada transaksi pada periode ini
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerThanks}>
                        Laporan Transaksi Bulanan - {namaBulan} {tahun}
                    </Text>
                    <Text>Laporan ini dibuat secara otomatis - POSNova</Text>
                </View>
            </Page>
        </Document>
    )
}

export default MonthlyPDFDocument