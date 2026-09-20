// Cek status akun saat halaman dibuka
document.addEventListener("DOMContentLoaded", function() {
    muatDataUser();
});

function bukaModalAkun() {
    document.getElementById('modalAkun').style.display = 'flex';
}

function tutupModalAkun() {
    document.getElementById('modalAkun').style.display = 'none';
}

function simpanAkunUser() {
    const nama = document.getElementById('inputNamaUser').value.trim();
    const email = document.getElementById('inputEmailUser').value.trim();

    if(nama === "" || email === "") {
        alert("Nama dan Email wajib diisi ya, Bos!");
        return;
    }

    const userData = { nama: nama, email: email };
    localStorage.setItem('drip_user', JSON.stringify(userData));
    
    muatDataUser();
    tutupModalAkun();
}

function muatDataUser() {
    const savedUser = localStorage.getItem('drip_user');
    const formLoginArea = document.getElementById('formLoginArea');
    const infoUserArea = document.getElementById('infoUserArea');
    const greetingUser = document.getElementById('greetingUser');
    const statusUser = document.getElementById('statusUser');
    const authActionBtn = document.getElementById('authActionBtn');

    if(savedUser) {
        const user = JSON.parse(savedUser);
        formLoginArea.style.display = 'none';
        infoUserArea.style.display = 'block';

        greetingUser.textContent = `Halo, ${user.nama}`;
        statusUser.textContent = user.email;
        authActionBtn.textContent = 'Akun Saya';

        document.getElementById('profileNama').textContent = user.nama;
        document.getElementById('profileEmail').textContent = user.email;

        tampilkanRiwayat();
    } else {
        formLoginArea.style.display = 'block';
        infoUserArea.style.display = 'none';
        greetingUser.textContent = 'Halo, Tamu';
        statusUser.textContent = 'Belum masuk akun';
        authActionBtn.textContent = 'Masuk / Daftar';
    }
}

function logoutUser() {
    localStorage.removeItem('drip_user');
    muatDataUser();
}

// Simulasi Pembelian dan Generate Key Otomatis Masuk Riwayat
function beliProduk(namaProduk, harga) {
    const savedUser = localStorage.getItem('drip_user');
    
    if(!savedUser) {
        alert("Silakan buat akun / masuk terlebih dahulu di pojok kanan atas agar key tersimpan di riwayat Anda!");
        bukaModalAkun();
        return;
    }

    // Buat random license key
    const randomKey = 'DRIP-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const transaksiBaru = {
        produk: namaProduk,
        harga: 'Rp ' + harga.toLocaleString('id-ID'),
        key: randomKey,
        tanggal: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})
    };

    // Ambil riwayat lama atau buat baru
    let riwayat = JSON.parse(localStorage.getItem('drip_riwayat')) || [];
    riwayat.unshift(transaksiBaru); // Masukkan ke urutan paling atas
    localStorage.setItem('drip_riwayat', JSON.stringify(riwayat));

    alert(`Pembelian Sukses!\nProduk: ${namaProduk}\nKey Anda: ${randomKey}\n\nKey telah disimpan ke riwayat akun Anda.`);
    
    // Otomatis buka modal riwayat
    bukaModalAkun();
}

function tampilkanRiwayat() {
    const riwayatList = document.getElementById('riwayatList');
    let riwayat = JSON.parse(localStorage.getItem('drip_riwayat')) || [];

    if(riwayat.length === 0) {
        riwayatList.innerHTML = '<p style="font-size:11px; color:#9ca3af; text-align:center; padding:10px;">Belum ada riwayat pembelian.</p>';
        return;
    }

    let html = '';
    riwayat.forEach(item => {
        html += `
            <div class="riwayat-item">
                <div class="r-top">
                    <span>${item.produk}</span>
                    <span style="color: #34d399;">${item.harga}</span>
                </div>
                <small style="color: #9ca3af;">${item.tanggal}</small>
                <span class="r-key">Key: ${item.key}</span>
            </div>
        `;
    });

    riwayatList.innerHTML = html;
}
