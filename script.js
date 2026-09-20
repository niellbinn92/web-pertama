// Import SDK Firebase modular dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase milik Drip Store
const firebaseConfig = {
  apiKey: "AIzaSyBsNz0BS6cQq2HOl4RIIPf4Rr9OJCeN61I",
  authDomain: "dripstore-db.firebaseapp.com",
  projectId: "dripstore-db",
  storageBucket: "dripstore-db.firebasestorage.app",
  messagingSenderId: "296010248275",
  appId: "1:296010248275:web:fb1ce779089f336c8dd6a6",
  measurementId: "G-9MXTJ6SLMV"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FUNGSI UTAMA: PEMBELIAN & PENGAMBILAN KEY DARI FIRESTORE ---
async function ambilKey(namaProduk) {
  try {
    const q = query(
      collection(db, "stok_key"),
      where("produk", "==", namaProduk),
      where("status", "==", "tersedia"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`Maaf, stok license key untuk ${namaProduk} sedang habis!`);
      return null;
    }

    let keyData = null;
    let docId = "";

    querySnapshot.forEach((docSnap) => {
      keyData = docSnap.data().key;
      docId = docSnap.id;
    });

    // Ubah status key menjadi 'terjual' di Firestore
    const keyRef = doc(db, "stok_key", docId);
    await updateDoc(keyRef, {
      status: "terjual"
    });

    return keyData;

  } catch (error) {
    console.error("Gagal mengambil key:", error);
    alert("Terjadi kesalahan saat terhubung ke server Firestore.");
    return null;
  }
}

// Bikin fungsi transaksi global agar bisa dipanggil onclick dari HTML
window.beliProduk = async function(namaProduk, harga) {
  const btn = event.target.closest('button');
  const textAwal = btn.innerHTML;
  
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading...`;
  btn.disabled = true;

  const keyResult = await ambilKey(namaProduk);

  if (keyResult) {
    // Simpan ke riwayat lokal browser
    simpanRiwayatLokal(namaProduk, keyResult, harga);
    
    // Tampilkan Key kepada pembeli
    prompt(`[PEMBAYARAN SUKSES]\n\nBerikut License Key ${namaProduk} kamu (Silakan Copy):`, keyResult);
  }

  btn.innerHTML = textAwal;
  btn.disabled = false;
};

// --- FUNGSI KELOLA AKUN & MODAL ---
window.bukaModalAkun = function() {
  document.getElementById("modalAkun").style.display = "flex";
  cekStatusLogin();
};

window.tutupModalAkun = function() {
  document.getElementById("modalAkun").style.display = "none";
};

window.simpanAkunUser = function() {
  const nama = document.getElementById("inputNamaUser").value;
  const email = document.getElementById("inputEmailUser").value;

  if (!nama || !email) {
    alert("Harap isi Nama dan Email!");
    return;
  }

  localStorage.setItem("drip_user", JSON.stringify({ nama, email }));
  cekStatusLogin();
};

window.logoutUser = function() {
  localStorage.removeItem("drip_user");
  cekStatusLogin();
};

function cekStatusLogin() {
  const userData = JSON.parse(localStorage.getItem("drip_user"));
  const formArea = document.getElementById("formLoginArea");
  const infoArea = document.getElementById("infoUserArea");

  if (userData) {
    formArea.style.display = "none";
    infoArea.style.display = "block";
    document.getElementById("profileNama").innerText = userData.nama;
    document.getElementById("profileEmail").innerText = userData.email;
    tampilkanRiwayat();
  } else {
    formArea.style.display = "block";
    infoArea.style.display = "none";
  }
}

function simpanRiwayatLokal(produk, key, harga) {
  let riwayat = JSON.parse(localStorage.getItem("drip_riwayat")) || [];
  riwayat.unshift({
    produk: produk,
    key: key,
    harga: harga,
    tanggal: new Date().toLocaleString("id-ID")
  });
  localStorage.setItem("drip_riwayat", JSON.stringify(riwayat));
}

function tampilkanRiwayat() {
  const container = document.getElementById("riwayatList");
  const riwayat = JSON.parse(localStorage.getItem("drip_riwayat")) || [];

  if (riwayat.length === 0) {
    container.innerHTML = "<p style='color: #a78bfa; font-size: 13px;'>Belum ada transaksi.</p>";
    return;
  }

  container.innerHTML = riwayat.map(item => `
    <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 8px; border-radius: 6px; font-size: 13px;">
      <div style="display:flex; justify-content:space-between; font-weight:bold; color:#fff;">
        <span>${item.produk}</span>
        <span style="color:#c084fc;">Rp${item.harga.toLocaleString("id-ID")}</span>
      </div>
      <div style="color: #4ade80; margin: 4px 0; font-family: monospace;">Key: ${item.key}</div>
      <div style="color: #94a3b8; font-size: 10px;">${item.tanggal}</div>
    </div>
  `).join("");
}
