const calculateTax = (subTotal: number, pajakPersen: number) => {
    const pajakNominal = Math.round(subTotal * (pajakPersen / 100))
    const grandTotal = subTotal + pajakNominal

    return {
        pajakNominal,
        grandTotal
    }
}

export default calculateTax