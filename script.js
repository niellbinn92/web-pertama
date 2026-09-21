// Database Harga Sesuai Rincian Kamu
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

// HERO BANNER SLIDER
const heroBanners = [
  "https://i.ibb.co.com/gZk0y1Mw/banner1.jpg",
  "https://i.ibb.co.com/v4jVwCNy/banner2.jpg"
];
let currentSlide = 0;

window.setSlide = function(index) {
  currentSlide = index;
  const imgEl = document.getElementById('heroImage');
  const dots = document.querySelectorAll('.slider-dots .dot');
  
  if (imgEl) imgEl.src = heroBanners[currentSlide];
  
  dots.forEach((dot, idx) => {
    if (idx === currentSlide) dot.classList.add('active');
    else dot.classList.remove('active');
  });
};

window.nextSlide = function() {
  currentSlide = (currentSlide + 1) % heroBanners.length;
  window.setSlide(currentSlide);
};

window.prevSlide = function() {
  currentSlide = (currentSlide - 1 + heroBanners.length) % heroBanners.length;
  window.setSlide(currentSlide);
};

// Auto slide banner setiap 5 detik
setInterval(() => {
  window.nextSlide();
}, 5000);

// ==========================================
// 1. FUNGSI UTAMA MODAL CHECKOUT
// ==========================================

window.beliProduk = function (namaProduk) {
  selectedProduk = namaProduk;

  const checkoutTitleEl = document.getElementById('checkoutTitle');
  if (checkoutTitleEl) {
    checkoutTitleEl.innerText = namaProduk;
  }

  const listVariasi = DATA_PRODUK[namaProduk] || [];
  const container = document.getElementById('voucherContainer');

  if (container && listVariasi.length > 0) {
    container.innerHTML = '';

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

  updateSummaryHarga();

  const modalCheckoutEl = document.getElementById('modalCheckout');
  if (modalCheckoutEl) {
    modalCheckoutEl.style.display = 'flex';
  }
};

window.tutupModalCheckout = function () {
  const modalCheckoutEl = document.getElementById('modalCheckout');
  if (modalCheckoutEl) {
    modalCheckoutEl.style.display = 'none';
  }
};

window.pilihDurasi = function (element, durasi, harga) {
  document
    .querySelectorAll('.voucher-item')
    .forEach((el) => el.classList.remove('active'));

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

window.prosesBeliSekarang = async function () {
  const inputNamaEl = document.getElementById('inputNama');
  const inputWaEl = document.getElementById('inputWa');

  const nama = inputNamaEl ? inputNamaEl.value.trim() : '';
  const wa = inputWaEl ? inputWaEl.value.trim() : '';

  if (!nama || !wa) {
    alert('Harap isi Nama Pembeli dan Nomor WhatsApp!');
    return;
  }

  await prosesBeliKeyDenganDurasi(selectedDurasi, nama, wa);
};

async function prosesBeliKeyDenganDurasi(durasi, nama, wa) {
  try {
    if (typeof db === 'undefined') {
      kirimKeWhatsApp(nama, wa, null);
      return;
    }

    const snapshot = await db
      .collection('keys')
      .where('produk', '==', selectedProduk)
      .where('durasi', '==', durasi)
      .where('status', '==', 'available')
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert(`Stok key untuk ${selectedProduk} (${durasi}) sedang habis. Silakan hubungi admin!`);
      kirimKeWhatsApp(nama, wa, 'STOK_HABIS');
      return;
    }

    let keyData = null;
    let docId = '';
    snapshot.forEach((doc) => {
      docId = doc.id;
      keyData = doc.data();
    });

    await db.collection('keys').doc(docId).update({
      status: 'pending_payment',
      pembeliNama: nama,
      pembeliWa: wa,
      tanggalPesan: new Date(),
    });

    kirimKeWhatsApp(nama, wa, keyData ? keyData.key : 'Tersedia');
  } catch (error) {
    console.error('Terjadi kesalahan Firestore:', error);
    kirimKeWhatsApp(nama, wa, null);
  }
}

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

  window.tutupModalCheckout();
}

// ==========================================
// 3. FUNGSI MODAL AKUN
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
// 4. FLOATING COMMUNITY MENU (CS TOGGLE)
// ==========================================

window.toggleCommunityMenu = function () {
  const menu = document.getElementById('floatMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
};
