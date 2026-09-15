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

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
await signInAnonymously(auth);

const batch = writeBatch(db);
for (const student of students) {
  batch.set(doc(db, "students", student.id), {
    ...student,
    academicYear: "2026/2027",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
await batch.commit();

const snapshot = await getDocs(collection(db, "students"));
console.log(`Firebase siap: ${snapshot.size} dokumen santri terverifikasi.`);
await signOut(auth);
await terminate(db);
