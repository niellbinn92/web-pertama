let produkDipilih = '';

// 1. Membuka Modal Durasi saat tombol Buy diklik
window.beliProduk = function(namaProduk) {
    produkDipilih = namaProduk;
    document.getElementById('judulModalDurasi').innerText = 'Pilih Durasi - ' + namaProduk;
    document.getElementById('modalDurasi').style.display = 'flex';
};

window.tutupModalDurasi = function() {
    document.getElementById('modalDurasi').style.display = 'none';
};

// 2. Mengambil Key dari Firestore sesuai Durasi yang dipilih
window.prosesBeliKeyDenganDurasi = async function(durasi) {
    tutupModalDurasi();
    
    try {
        // Cari key yang statusnya 'tersedia', produk sesuai, dan durasinya sesuai
        const q = query(
            collection(db, "stok_key"),
            where("produk", "==", produkDipilih),
            where("durasi", "==", durasi),
            where("status", "==", "tersedia"),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert(`Stok key ${produkDipilih} untuk durasi (${durasi}) sedang KOSONG/HABIS!`);
            return;
        }

        const keyDoc = querySnapshot.docs[0];
        const keyData = keyDoc.data();

        // Update status key jadi 'terjual'
        await updateDoc(doc(db, "stok_key", keyDoc.id), {
            status: "terjual"
        });

        // Tampilkan prompt/alert berisi key untuk disalin
        prompt(`[PEMBAYARAN SUKSES]\n\nBerikut License Key ${produkDipilih} (${durasi}) kamu (Silakan Copy):`, keyData.key);

    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat mengambil key.");
    }
};

// Fungsi Modal Login/Daftar
window.bukaModalAkun = function(tipe) {
    document.getElementById('modalAuthTitle').innerText = tipe === 'login' ? 'Login Akun' : 'Daftar Akun Baru';
    document.getElementById('modalAkun').style.display = 'flex';
};

window.tutupModalAkun = function() {
    document.getElementById('modalAkun').style.display = 'none';
};
