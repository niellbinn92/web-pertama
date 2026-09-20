function beliProduk(namaProduk, harga) {
    const pesan = `Halo Min, saya mau order *${namaProduk}* seharga Rp ${harga}. Mohon info cara pembayaran via GoPay ya.`;
    const urlWhatsApp = `https://wa.me/62838XXXXXXXX?text=${encodeURIComponent(pesan)}`;
    
    window.open(urlWhatsApp, '_blank');
}
