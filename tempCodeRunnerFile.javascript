// Contoh: Mengambil list Pelanggan
async function getPelanggan() {
    const response = await fetch('http://localhost:3000/api/pelanggan');
    const result = await response.json();
    console.log("Data Pelanggan:", result.data);
}

// Contoh: Menyimpan data layanan baru
async function tambahLayanan() {
    const dataLayanan = {
        service_name: "Cuci Karpet",
        category: "Laundry",
        estimated_days: 3
    };

    const response = await fetch('http://localhost:3000/api/layanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataLayanan)
    });
    
    const result = await response.json();
    alert(result.pesan); // Memunculkan notifikasi "Layanan berhasil ditambahkan"
}

// Contoh: Mengedit pelanggan dengan ID = 1
async function editPelanggan(id) {
    const dataEdit = {
        name: "Joko Widodo Update",
        phone: "08111222333",
        address: "Jl. Baru No. 1",
        email: "joko.baru@email.com"
    };

    const response = await fetch(`http://localhost:3000/api/pelanggan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataEdit)
    });
    
    const result = await response.json();
    alert(result.pesan);
}

// Contoh: Menghapus pelanggan dengan ID = 2
async function hapusPelanggan(id) {
    if(confirm("Yakin ingin menghapus data ini?")) {
        const response = await fetch(`http://localhost:3000/api/pelanggan/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        alert(result.pesan);
    }
}