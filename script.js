document.getElementById('sapaBtn').addEventListener('click', function() {
    const nama = document.getElementById('namaInput').value.trim();
    const output = document.getElementById('hasilOutput');

    if (nama === "") {
        output.style.color = "red";
        output.textContent = "Wah, namanya jangan dikosongkan dong, Bos!";
    } else {
        output.style.color = "#764ba2";
        output.textContent = `Halo, ${nama}! Senang berkenalan dengan Anda.`;
    }
});
