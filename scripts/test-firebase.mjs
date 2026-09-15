import nextEnv from "@next/env";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import { deleteDoc, doc, getDoc, getFirestore, setDoc, terminate, updateDoc } from "firebase/firestore";

nextEnv.loadEnvConfig(process.cwd());
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}, "firebase-smoke-test");
const auth = getAuth(app);
const db = getFirestore(app);
await signInAnonymously(auth);

const testId = "SYH-SMOKE-TEST";
const testRef = doc(db, "students", testId);
await setDoc(testRef, {
  id: testId, name: "Santri Uji", arabicName: "طالب الاختبار", initials: "SU", level: "Ula",
  status: "Proses", score: 0, tone: "sky", scores: Array(11).fill(0), certificateStatus: "Belum",
});
if (!(await getDoc(testRef)).exists()) throw new Error("Create/read Firestore gagal.");
await updateDoc(testRef, { guardian: "Wali Uji" });
if ((await getDoc(testRef)).data()?.guardian !== "Wali Uji") throw new Error("Update Firestore gagal.");
await deleteDoc(testRef);
if ((await getDoc(testRef)).exists()) throw new Error("Delete Firestore gagal.");
if (!(await getDoc(doc(db, "settings", "institution"))).exists()) throw new Error("Pengaturan lembaga belum tersedia.");

console.log("Smoke test Firebase lulus: create, read, update, delete, dan settings.");
await signOut(auth);
await terminate(db);
