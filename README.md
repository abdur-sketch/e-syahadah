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
2. Salin `.env.example` ke `.env.local` dan isi konfigurasi Firebase.
3. Aktifkan provider Google di Firebase Authentication dan pastikan domain aplikasi tercantum sebagai authorized domain.
4. `npm run dev`, lalu buka http://localhost:3000.

Hanya `baikganteng88@gmail.com` yang diberi akses admin oleh aplikasi dan Firestore Security Rules. Provider Anonymous dinonaktifkan. Jangan gunakan passcode di variabel `NEXT_PUBLIC_*` sebagai pengaman; nilainya dapat dibaca dari browser. `npm run firebase:test` menguji penolakan akses non-admin tanpa mengubah data produksi. Jangan menjalankan `firebase:seed` pada database yang sudah berisi data nyata.

Akun admin baru muncul di daftar Firebase Authentication setelah pemilik masuk pertama kali melalui tombol **Masuk dengan Google** pada situs.

## Verifikasi

`npm run lint` · `npm run build` · `npx tsx --test src/lib/academy.test.ts` · `npm run firebase:test`
