# Rencana: RSVP Form "Merajut Cinta" — Keluarga Besar BAM

## Ringkasan
Membuat satu halaman RSVP publik yang di-share via WhatsApp. Peserta memilih nama & qobilah, mengisi email + nomor WA, lalu konfirmasi kehadiran. Data tersimpan ke Database.

## Halaman & Alur
ambil dari data event, bisa masuk detail dan kasih button rsvp,

sesuaikan attribut dibawah ini dengan design database yg ada
1. **Hero acara**
   - Judul: "Merajut Cinta — Keluarga Besar BAM"
   - Tanggal: 3–4 Juli 2026
   - Lokasi: Vila Keeta, Pacet, Mojokerto
   - Deskripsi singkat acara (versi ringkas dari brief user)
   - Rundown singkat:
     - Kamis, 3 Juli · 11:00 — Kumpul di Miji (pembagian kaos & ceremony pemberangkatan)
     - Kamis, 3 Juli · 19:00 — Makrab (silsilah & tradisi BAM)
     - Jumat, 4 Juli · 07:00 — Fun Game / Outbound

2. **Form RSVP** dengan field:
   - Nama peserta — searchable dropdown dari daftar 55 peserta
   - konekkan nama peserta dengan data person untuk data silsilah
   - Qobilah — dropdown ambil dari master, (buatkan row baru untuk qobilah ngaglik)
   - Email — validasi format
   - Nomor WhatsApp — validasi angka + prefiks (default 62)
   - Konfirmasi kehadiran — radio: **Ikut** / **Tidak Ikut**

3. **Logika konfirmasi ekstra**
   - Setiap peserta punya status awal (mobil / dw / sopir / motor / "-").
   - Jika status awal ≠ "-" **dan** user memilih "Tidak Ikut" → tampilkan dialog konfirmasi: *"Kamu sebelumnya terdata akan hadir (status: <status>). Yakin ingin berubah menjadi Tidak Ikut?"* dengan tombol **Batal** / **Ya, saya tidak ikut**.
   - Jika status awal = "-" → langsung submit tanpa dialog tambahan.
   - Jika memilih "Ikut" → langsung submit.

4. **State submit**
   - Loading state saat kirim.
   - Success screen: pesan terima kasih + ringkasan pilihan + tombol "Isi untuk peserta lain".
   - Error state dengan tombol coba lagi.

## Data
- **Daftar peserta** 
Azil	motor
Nopal	mobil
Hikam	sopir
Oby	mobil
Alex	dw
Sadra	mobil
Humam	dw
Mamat	dw
Fayyadh	mobil
Rikza	mobil
Avis	mobil
Fathir	dw
Riski 	dw
Ashfa	mobil
Rifki	mobil
Ubay	mobil
Mahes	mobil
Kayla	mobil
Nada	-
Robet	mobil
Fateh	mobil
Syahrul	mobil
Ubed	mobil
Thoriq	dw
Faruqi	dw
Femi	mobil
Ochi	mobil
Mas Nehru	-
Panjalu	dw
Marsha	dw
Zahir	mobil
Kevin 	mobil
Zamira	dw
Zaul	-
Odi	dw
Anas	sopir
Zahra	mobil
Ilham	mobil
Sida	mobil
Azza	mobil
Ridho	mobil
Faza	mobil
Amik	-
Izzat	dw
Mila	-
Zidan	dw
Yakik	dw
Muhyi	dw
Salwa	-
Salsa	dw
Ara	-
Nilna	-
Aisy	-
mas muis	dw
Aldi	mobil
- **Qobilah** ambil dari master, (buatkan row baru untuk qobilah ngaglik)

## Desain
- Nuansa hangat & santai (sesuai vibe "seneng-seneng, liburan"), warna earthy hijau/krem, tipografi ramah, mobile-first (karena akses via WA).
- shadcn/ui components: Card, Combobox (Command), Select, Input, RadioGroup, Dialog konfirmasi, Button, Sonner untuk toast.
- SEO metadata di route: title & description spesifik acara.

## Catatan / batasan
- Form terbuka tanpa login (akan di share via WA dan ditampilkan di halaman detail event); tidak ada pencegahan submit ganda selain peringatan visual. Bisa ditambahkan cek "nama sudah RSVP" nanti bila diinginkan.
- Buat halaman admin section acara/event (dashboard,peserta,setting)
