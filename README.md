## E-Syahadah

MVP dashboard untuk membuat ijazah pesantren berbahasa Arab.

Live: [https://e-syahadah-2026.web.app](https://e-syahadah-2026.web.app)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
## Fitur MVP saat ini

- Dashboard metrik santri, ijazah, kelulusan, dan validasi.
- Pencarian dan pemilihan santri demo.
- Input nilai 0-100 untuk 11 mata pelajaran diniyah.
- Perhitungan rata-rata, predikat, dan status lulus secara live.
- Konversi angka ke angka Arab (`84` menjadi `٨٤`) dan redaksi hasil Arab.
- Preview ijazah dua halaman: syahadah dan daftar nilai.
- Print A4 / simpan sebagai PDF melalui dialog print browser.
- Layout responsif untuk desktop dan mobile.
- Metrik dashboard dihitung langsung dari data Firestore.
- CRUD data santri lengkap dengan pencarian dan filter.
- Input nilai realtime untuk setiap mata pelajaran.
- Penerbitan, pratinjau, cetak A4, dan simpan PDF ijazah.
- Pengelolaan nama mata pelajaran Indonesia/Arab dan status aktif.
- Pengaturan identitas yayasan, pesantren, kota, dan kepala pesantren.
- Notifikasi hasil operasi serta validasi data dasar.

Data santri dan nilai sudah terintegrasi dengan Firebase Authentication anonim dan Cloud Firestore. Tanpa konfigurasi Firebase, aplikasi otomatis memakai state demo di browser.

## Menyiapkan Firebase

1. Buat/register Web App di Firebase Console dan aktifkan Cloud Firestore.
2. Aktifkan provider **Anonymous** di Authentication → Sign-in method.
3. Salin `.env.example` menjadi `.env.local`, lalu isi konfigurasi Web App Firebase.
4. Deploy rules dengan `firebase deploy --only firestore:rules` (Firebase CLI diperlukan).
5. Jalankan `npm run firebase:seed` untuk mengisi data awal, lalu `npm run dev`.

Gunakan `npm run firebase:test` untuk menguji operasi create, read, update, dan delete terhadap Firestore dan Security Rules aktif.

Struktur data utama berada di koleksi `students`; ID dokumen sama dengan nomor syahadah, misalnya `SYH-2026-001`. Untuk produksi, ganti autentikasi anonim dengan login administrator dan tambahkan role pada Security Rules.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
