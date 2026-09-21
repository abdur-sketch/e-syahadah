# E-Syahadah

Aplikasi administrasi pesantren dan ijazah dua halaman berbahasa Arab. Situs: https://e-syahadah-2026.web.app

## Fitur

- Dashboard responsif dengan mode terang/gelap.
- Data santri, input nilai E-Raport, filter kelas, rekap nilai CSV untuk Excel, dan cetak rekap PDF dari browser.
- Alur ijazah draf → validasi → terbit → pratinjau/cetak A4. Perubahan identitas atau nilai mengembalikan dokumen ke draf.
- Editor kedua halaman ijazah: teks, font, ukuran, posisi, logo, dan watermark halaman pertama.
- Sinkronisasi Cloud Firestore dan login admin Google melalui Firebase Authentication.

## Menjalankan lokal

1. `npm install`
2. Salin `.env.example` ke `.env.local` dan isi konfigurasi Firebase serta `NEXT_PUBLIC_ADMIN_EMAIL`.
3. Aktifkan provider Google di Firebase Authentication dan pastikan domain aplikasi tercantum sebagai authorized domain.
4. `npm run dev`, lalu buka http://localhost:3000.

Aturan Firestore harus dibatasi ke email admin yang sama dengan konfigurasi aplikasi sebelum aplikasi dipublikasikan. Jangan gunakan passcode di variabel `NEXT_PUBLIC_*` sebagai pengaman; nilainya dapat dibaca dari browser. `npm run firebase:test` hanya menguji bahwa akun anonim ditolak dan tidak mengubah data produksi. Jangan menjalankan `firebase:seed` pada database yang sudah berisi data nyata.

## Verifikasi

`npm run lint` · `npm run build` · `npx tsx --test src/lib/academy.test.ts` · `npm run firebase:test`
