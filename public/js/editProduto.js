
document.addEventListener('DOMContentLoaded', () => {
    const barcodeElement = document.getElementById('barcode');

    const codBarraElement = document.getElementById('cod-barra-valor');
    let barcodeValue = "";

    if (codBarraElement) {
        barcodeValue = codBarraElement.getAttribute('data-cod-barra') || "";
    }

    if (!barcodeValue || String(barcodeValue).trim() === "") {
        console.warn("Atenção: Código de barras não encontrado. Usando código de barras de teste.");
        barcodeValue = "1234567890128"; 
    }

    if (barcodeElement && barcodeValue && typeof JsBarcode === 'function' && String(barcodeValue).trim() !== "") {
        try {
            let format = "AUTO";
            if (String(barcodeValue).length === 13) format = "EAN13";
            else if (String(barcodeValue).length === 12) format = "UPC";
            else if (String(barcodeValue).length === 8) format = "EAN8";

            JsBarcode(barcodeElement, String(barcodeValue), {
                format: format,
                lineColor: "#000",
                width: 2,
                height: 60,
                displayValue: true
            });
        } catch (e) {
            console.error("Erro ao gerar código de barras:", e);
            barcodeElement.parentElement.innerHTML = '<span class="text-danger small">Erro ao gerar código de barras. Verifique se o código é válido.</span>';
        }
    } else if (barcodeElement) {
        barcodeElement.parentElement.innerHTML = '<span class="text-muted small">Código de barras não disponível.</span>';
    }
});
