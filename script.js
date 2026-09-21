// Data Produk dan Daftar Durasi/Harga
const DATA_PRODUK = {
  'DRIP APKMOD': [
    { durasi: '1Day', harga: 8500 },
    { durasi: '3Day', harga: 20000 },
    { durasi: '7Day', harga: 35000 },
    { durasi: '15Day', harga: 55000 },
    { durasi: '30Day', harga: 80000 }
  ],
  'DRIP PROXY': [
    { durasi: '1Day', harga: 8500 },
    { durasi: '3Day', harga: 20000 },
    { durasi: '7Day', harga: 35000 },
    { durasi: '30Day', harga: 70000 }
  ],
  'DRIP WIRE': [
    { durasi: '6Jam', harga: 6000 },
    { durasi: '1Day', harga: 16500 },
    { durasi: '7Day', harga: 35000 }
  ],
  'DRIP ROOT': [
    { durasi: '1Day', harga: 16000 },
    { durasi: '7Day', harga: 50000 },
    { durasi: '30Day', harga: 140000 }
  ]
};

// Variable Global
let selectedHarga = 0;
let selectedDurasi = '';
let selectedProduk = '';

// ==========================================
// 1. FUNGSI UTAMA MODAL CHECKOUT
// ==========================================

// Buka Modal Checkout
window.beliProduk = function (namaProduk) {
  selectedProduk = namaProduk;

  // Set judul di modal
  const checkoutTitleEl = document.getElementById('checkoutTitle');
  if (checkoutTitleEl) {
    checkoutTitleEl.innerText = namaProduk;
  }

  // Ambil daftar variasi harga berdasarkan produk yang dipilih
  const listVariasi = DATA_PRODUK[namaProduk] || [];
  const container = document.getElementById('voucherContainer');

  if (container && listVariasi.length > 0) {
    container.innerHTML = ''; // Kosongkan elemen lama

    listVariasi.forEach((item, index) => {
      const isFirst = index === 0;
      if (isFirst) {
        selectedDurasi = item.durasi;
        selectedHarga = item.harga;
      }

      const itemHtml = `
        <div class="voucher-item ${isFirst ? 'active' : ''}" onclick="pilihDurasi(this, '${item.durasi}', ${item.harga})">
            <div class="v-header">
                <span class="v-duration">${item.durasi}</span>
                <i class="fa-solid fa-circle-check v-check"></i>
            </div>
            <div class="v-price">Rp${item.harga.toLocaleString('id-ID')}</div>
        </div>
      `;
      container.innerHTML += itemHtml;
    });
  }

  // Update Tampilan Summary Harga
  updateSummaryHarga();

  // Tampilkan Modal
  const modalCheckoutEl = document.getElementById('modalCheckout');
  if (modalCheckoutEl) {
    modalCheckoutEl.style.display = 'flex';
  }
};

// Tutup Modal Checkout
window.tutupModalCheckout = function () {
  const modalCheckoutEl = document.getElementById('modalCheckout');
  if (modalCheckoutEl) {
    modalCheckoutEl.style.display = 'none';
  }
};

// Fungsi Klik Pilihan Durasi/Nominal
window.pilihDurasi = function (element, durasi, harga) {
  // Hapus kelas 'active' dari semua item
  document
    .querySelectorAll('.voucher-item')
    .forEach((el) => el.classList.remove('active'));

  // Tambah kelas 'active' ke item yang diklik
  if (element) {
    element.classList.add('active');
  }

  selectedDurasi = durasi;
  selectedHarga = harga;

  updateSummaryHarga();
};

function updateSummaryHarga() {
  const formattedHarga = 'Rp' + selectedHarga.toLocaleString('id-ID');
  const summaryHargaEl = document.getElementById('summaryHarga');
  const summaryTotalEl = document.getElementById('summaryTotal');

  if (summaryHargaEl) summaryHargaEl.innerText = formattedHarga;
  if (summaryTotalEl) summaryTotalEl.innerText = formattedHarga;
}

// ==========================================
// 2. PROSES PEMBELIAN & FIRESTORE INTEGRATION
// ==========================================

// Proses Beli
window.prosesBeliSekarang = async function () {
  const inputNamaEl = document.getElementById('inputNama');
  const inputWaEl = document.getElementById('inputWa');

  const nama = inputNamaEl ? inputNamaEl.value.trim() : '';
  const wa = inputWaEl ? inputWaEl.value.trim() : '';

  if (!nama || !wa) {
    alert('Harap isi Nama Pembeli dan Nomor WhatsApp!');
    return;
  }

  // Panggil fungsi penanganan stok Firestore
  await prosesBeliKeyDenganDurasi(selectedDurasi, nama, wa);
};

// Fungsi mengambil Key dari Firestore berdasarkan produk & durasi
async function prosesBeliKeyDenganDurasi(durasi, nama, wa) {
  try {
    // Pastikan Firebase SDK Firestore sudah di-load di HTML
    if (typeof db === 'undefined') {
      console.warn('Firebase Firestore belum terinisialisasi.');
      // Kirim pesan WhatsApp fallback jika Firebase tidak terhubung
      kirimKeWhatsApp(nama, wa, null);
      return;
    }

    // Query Firestore: Mengambil key yang masih tersedia ('available')
    const snapshot = await db
      .collection('keys')
      .where('produk', '==', selectedProduk)
      .where('durasi', '==', durasi)
      .where('status', '==', 'available')
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert(
        `Stok key untuk ${selectedProduk} (${durasi}) sedang habis. Silakan hubungi admin!`
      );

      // Tetap alihkan ke WhatsApp jika ingin admin cek manual
      kirimKeWhatsApp(nama, wa, 'STOK_HABIS');
      return;
    }

    // Ambil data key
    let keyData = null;
    let docId = '';
    snapshot.forEach((doc) => {
      docId = doc.id;
      keyData = doc.data();
    });

    // Tandai key sebagai dibeli
    await db.collection('keys').doc(docId).update({
      status: 'pending_payment',
      pembeliNama: nama,
      pembeliWa: wa,
      tanggalPesan: new Date(),
    });

    // Lanjutkan kirim rincian ke WhatsApp Admin
    kirimKeWhatsApp(nama, wa, keyData ? keyData.key : 'Tersedia');
  } catch (error) {
    console.error('Terjadi kesalahan Firestore:', error);
    // Jika ada error Firestore, tetap lanjutkan alur ke WhatsApp agar transaksi tidak batal
    kirimKeWhatsApp(nama, wa, null);
  }
}

// Fungsi Helper untuk mengirim format pesanan ke WhatsApp
function kirimKeWhatsApp(nama, wa, key) {
  const nomorAdmin = '62895603099950';

  let infoKey = '';
  if (key && key !== 'STOK_HABIS') {
    infoKey = `🔑 *Key Status:* Ready (Diproses Otomatis)\n`;
  } else if (key === 'STOK_HABIS') {
    infoKey = `🔑 *Key Status:* Stok Habis (Mohon Cek Manual)\n`;
  }

  const pesan =
    `*PESANAN BARU - DRIP STORE*\n` +
    `----------------------------------\n` +
    `📌 *Produk:* ${selectedProduk}\n` +
    `⏱️ *Durasi:* ${selectedDurasi}\n` +
    `💰 *Total Harga:* Rp${selectedHarga.toLocaleString('id-ID')}\n` +
    infoKey +
    `----------------------------------\n` +
    `👤 *Nama Pembeli:* ${nama}\n` +
    `📱 *No. WhatsApp:* ${wa}\n` +
    `----------------------------------\n` +
    `Mohon konfirmasi pembayaran dan pengiriman pesanan, terima kasih!`;

  const urlWA = `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesan)}`;
  window.open(urlWA, '_blank');

  // Tutup modal setelah proses
  window.tutupModalCheckout();
}

// ==========================================
// 3. FUNGSI MODAL AKUN & MODAL TAMBAHAN
// ==========================================

window.bukaModalAkun = function (tipe) {
  const titleEl = document.getElementById('modalAuthTitle');
  if (titleEl) {
    titleEl.innerText = tipe === 'login' ? 'Login Akun' : 'Daftar Akun Baru';
  }
  const modalAkunEl = document.getElementById('modalAkun');
  if (modalAkunEl) {
    modalAkunEl.style.display = 'flex';
  }
};

window.tutupModalAkun = function () {
  const modalAkunEl = document.getElementById('modalAkun');
  if (modalAkunEl) {
    modalAkunEl.style.display = 'none';
  }
};

window.simpanAkunUser = function () {
  const namaEl = document.getElementById('inputNamaUser');
  const emailEl = document.getElementById('inputEmailUser');

  const nama = namaEl ? namaEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';

  if (!nama || !email) {
    alert('Harap isi Nama dan Email!');
    return;
  }

  localStorage.setItem('userDripStore', JSON.stringify({ nama, email }));
  alert(`Selamat datang, ${nama}! Data berhasil disimpan.`);
  window.tutupModalAkun();
};

// ==========================================
// 4. FUNGSI FLOATING COMMUNITY MENU (CS TOGGLE)
// ==========================================

window.toggleCommunityMenu = function () {
  const menu = document.getElementById('floatMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
};
