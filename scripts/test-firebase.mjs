import nextEnv from "@next/env";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore, terminate } from "firebase/firestore";

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

let denied = false;
try { await getDoc(doc(db, "settings", "institution")); }
catch (error) { denied = error?.code === "permission-denied"; }
if (!denied) throw new Error("Akun anonim masih dapat membaca data. Aturan admin belum aktif.");
console.log("Tes keamanan lulus: akun anonim tidak dapat membaca data.");
await signOut(auth);
await terminate(db);
