let selectedHarga = 6000;
let selectedDurasi = '1 Hari';
let selectedProduk = '';

// Buka Modal Checkout
window.beliProduk = function(namaProduk) {
    selectedProduk = namaProduk;
    document.getElementById('checkoutTitle').innerText = namaProduk;
    document.getElementById('modalCheckout').style.display = 'flex';
};

window.tutupModalCheckout = function() {
    document.getElementById('modalCheckout').style.display = 'none';
};

// Fungsi Klik Pilihan Durasi/Nominal
window.pilihDurasi = function(element, durasi, harga) {
    // Hapus kelas 'active' dari semua item
    document.querySelectorAll('.voucher-item').forEach(el => el.classList.remove('active'));
    
    // Tambah kelas 'active' ke item yang diklik
    element.classList.add('active');
    
    selectedDurasi = durasi;
    selectedHarga = harga;

    // Format Rupiah
    const formattedHarga = 'Rp' + harga.toLocaleString('id-ID');
    document.getElementById('summaryHarga').innerText = formattedHarga;
    document.getElementById('summaryTotal').innerText = formattedHarga;
};

// Proses Beli
window.prosesBeliSekarang = async function() {
    const nama = document.getElementById('inputNama').value;
    const wa = document.getElementById('inputWa').value;

    if (!nama || !wa) {
        alert('Harap isi Nama Pembeli dan Nomor WhatsApp!');
        return;
    }

    // Ambil Key dari Firestore sesuai selectedProduk & selectedDurasi
    await prosesBeliKeyDenganDurasi(selectedDurasi);
};
