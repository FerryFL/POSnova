import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import dayjs from 'dayjs'
import type { Transaksi } from '~/utils/api'

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
    invoiceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    status: {
        marginTop: 4,
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        padding: 4,
        borderRadius: 5,
        fontSize: 9,
        alignSelf: 'flex-start',
    },
    totalProduk: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#E6F0FA',
        padding: 8,
        borderRadius: 4,
        marginBottom: 16,
    },
    detailTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    produkCard: {
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    produkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    produkNama: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    produkQty: {
        fontSize: 10,
    },
    produkVarian: {
        fontSize: 10,
        color: '#555',
        marginVertical: 2,
    },
    produkFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    produkHarga: {
        fontSize: 10,
    },
    produkTotal: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    ringkasan: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#ddd'
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    label: {
        fontSize: 10,
        color: "#333",
    },
    value: {
        fontSize: 10,
        color: "#000",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        borderTopWidth: 1,
        borderColor: "#ddd",
        paddingTop: 4,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: "bold",
    },
    totalValue: {
        fontSize: 14,
        fontWeight: "bold",
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
        fontSize: 12,
        marginBottom: 4
    }
})

interface PDFDocumentProps {
    transaksi: Transaksi
}

const PDFDocument = ({ transaksi }: PDFDocumentProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Kiri */}
                    <View style={styles.left}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text>Invoice: {transaksi.id}</Text>
                        <Text>{dayjs(transaksi.tanggalTransaksi).locale('id').format('DD MMMM YYYY')}</Text>
                        <Text style={styles.status}>Lunas</Text>
                    </View>

                    {/* Kanan */}
                    <View style={styles.rightBox}>
                        <Text style={styles.tokoNama}>{transaksi.UMKM?.nama}</Text>
                        <Text>{transaksi.UMKM?.alamat}</Text>
                    </View>
                </View>

                <View style={styles.totalProduk}>
                    <Text>Total Produk</Text>
                    <Text>{transaksi.totalProduk} Produk / Rp {transaksi.totalHarga.toLocaleString()}</Text>
                </View>

                {/* Detail Produk */}
                <View>
                    <Text style={styles.detailTitle}>Detail Produk</Text>

                    {transaksi.transaksiItem.map((item) => (
                        <View key={item.id} style={styles.produkCard}>
                            {/* Nama produk & qty */}
                            <View style={styles.produkHeader}>
                                <Text style={styles.produkNama}>{item.produk.nama}</Text>
                                <Text style={styles.produkQty}>{item.jumlah}x</Text>
                            </View>

                            {/* Varian */}
                            <Text style={styles.produkVarian}>
                                Varian: {item.varianNama ?? "-"}
                            </Text>

                            {/* Harga satuan & total */}
                            <View style={styles.produkFooter}>
                                <Text style={styles.produkHarga}>Rp {item.hargaSatuan.toLocaleString()}/pcs</Text>
                                <Text style={styles.produkTotal}>
                                    Rp {(item.jumlah * item.hargaSatuan).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.ringkasan}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>Rp {transaksi.totalHarga.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Pajak ({transaksi.pajakPersen ?? 0}%)</Text>
                        <Text style={styles.value}>Rp {(transaksi.pajakNominal ?? 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>Rp {(transaksi.grandTotal ?? transaksi.totalHarga).toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerThanks}>Terima kasih atas pembelian Anda!</Text>
                    <Text>Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan - POSNova</Text>
                </View>
            </Page>
        </Document>
    )
}

export default PDFDocument
