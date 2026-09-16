import nextEnv from "@next/env";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, serverTimestamp, terminate, writeBatch } from "firebase/firestore";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
  throw new Error("Konfigurasi Firebase di .env.local belum lengkap.");
}

const students = [
  { name: "Ahmad Fauzan", arabicName: "أحمد فوزان", initials: "AF", id: "SYH-2026-001", level: "Ulya", status: "Lulus", score: 84, tone: "rose", scores: [82, 88, 76, 91, 84, 79, 86, 90, 81, 87, 85] },
  { name: "Siti Aisyah", arabicName: "ستي عائشة", initials: "SA", id: "SYH-2026-002", level: "Ulya", status: "Lulus", score: 92, tone: "lavender", scores: [92, 94, 90, 93, 88, 91, 95, 89, 90, 94, 92] },
  { name: "Muhammad Rizky", arabicName: "محمد رزقي", initials: "MR", id: "SYH-2026-003", level: "Wustha", status: "Proses", score: 74, tone: "mint", scores: [72, 76, 70, 78, 74, 71, 73, 75, 70, 77, 74] },
  { name: "Nurul Hidayah", arabicName: "نور الهداية", initials: "NH", id: "SYH-2026-004", level: "Ulya", status: "Lulus", score: 88, tone: "peach", scores: [88, 90, 84, 92, 86, 87, 89, 91, 85, 90, 86] },
  { name: "Abdullah Fikri", arabicName: "عبد الله فكري", initials: "AF", id: "SYH-2026-005", level: "Ulya", status: "Lulus", score: 83, tone: "sky", scores: [82, 85, 80, 86, 84, 79, 83, 87, 81, 85, 82] },
];
const profileData = [
  ["0061234501", "Jakarta", "2006-04-12", "Abdul Karim", "Belum"],
  ["0061234502", "Bandung", "2006-08-21", "Hasan Basri", "Terbit"],
  ["0071234503", "Bogor", "2007-01-17", "Fahmi Idris", "Belum"],
  ["0061234504", "Bekasi", "2006-11-02", "Muhammad Ilyas", "Terbit"],
  ["0061234505", "Depok", "2006-06-09", "Syamsul Arifin", "Belum"],
];
const subjects = [
  ["tauhid", "Tauhid", "التوحيد"], ["akhlak", "Akhlak", "الأخلاق"], ["tafsir", "Tafsir", "التفسير"],
  ["hadits", "Hadits", "الحديث"], ["fikih", "Fikih", "الفقه"], ["nahwu", "Nahwu", "النحو"],
  ["shorof", "Shorof", "الصرف"], ["bahasa-arab", "Bahasa Arab", "اللغة العربية"],
  ["tarikh-islam", "Tarikh Islam", "التاريخ الإسلامي"], ["tajwid", "Tajwid", "التجويد"],
  ["imla-khat", "Imla' & Khat", "الإملاء والخط"],
];

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
await signInAnonymously(auth);

const batch = writeBatch(db);
for (const [index, student] of students.entries()) {
  const [nisn, birthPlace, birthDate, guardian, certificateStatus] = profileData[index];
  batch.set(doc(db, "students", student.id), {
    ...student, nisn, birthPlace, birthDate, guardian, certificateStatus,
    academicYear: "2026/2027",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
for (const [order, [id, name, arabicName]] of subjects.entries()) {
  batch.set(doc(db, "subjects", id), { id, name, arabicName, order, active: true, updatedAt: serverTimestamp() }, { merge: true });
}
batch.set(doc(db, "settings", "institution"), {
  name: "Pesantren Digital", arabicName: "مَعْهَدُ التَّرْبِيَةِ الإِسْلَامِيَّةِ",
  foundation: "Yayasan Pendidikan Islam", arabicFoundation: "مُؤَسَّسَةُ التَّرْبِيَةِ الإِسْلَامِيَّةِ",
  city: "Jakarta", principal: "Ahmad Rasyid", address: "Jl. Pendidikan Islam No. 1",
  arabicAddress: "جَاكَرْتَا - إِنْدُونِيْسِيَا", updatedAt: serverTimestamp(),
}, { merge: true });
await batch.commit();

const [studentSnapshot, subjectSnapshot] = await Promise.all([getDocs(collection(db, "students")), getDocs(collection(db, "subjects"))]);
console.log(`Firebase siap: ${studentSnapshot.size} santri dan ${subjectSnapshot.size} mata pelajaran terverifikasi.`);
await signOut(auth);
await terminate(db);
