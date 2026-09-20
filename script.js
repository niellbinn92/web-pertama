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

// Konfigurasi Firebase milik kamu
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

// Fungsi untuk mengambil Key berdasarkan nama produk
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

    // Ubah status key menjadi 'terjual' di Firestore agar tidak dipakai ulang
    const keyRef = doc(db, "stok_key", docId);
    await updateDoc(keyRef, {
      status: "terjual"
    });

    return keyData;

  } catch (error) {
    console.error("Gagal mengambil key:", error);
    alert("Terjadi kesalahan saat mengambil key dari database.");
    return null;
  }
}

// Bikin fungsi global supaya tombol di HTML bisa panggil
window.beliProduk = async function(namaProduk) {
  const btn = event.target;
  const textAwal = btn.innerText;
  
  // Efek loading tombol
  btn.innerText = "Mengambil Key...";
  btn.disabled = true;

  const keyResult = await ambilKey(namaProduk);

  if (keyResult) {
    // Tampilkan key ke pembeli lewat alert / prompt
    prompt(`Pembayaran Sukses! Berikut License Key ${namaProduk} kamu (Silakan Copy):`, keyResult);
  }

  // Kembalikan tombol seperti semula
  btn.innerText = textAwal;
  btn.disabled = false;
};
