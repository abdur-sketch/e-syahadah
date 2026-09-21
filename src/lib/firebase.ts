import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

const app = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();

export function isAdminUser(user: User | null): user is User {
  return Boolean(user && adminEmail && user.email?.toLowerCase() === adminEmail && user.emailVerified && user.providerData.some((provider) => provider.providerId === "google.com"));
}

export function observeAdmin(callback: (user: User | null) => void): () => void {
  if (!firebaseAuth) { callback(null); return () => undefined; }
  return onAuthStateChanged(firebaseAuth, (user) => callback(isAdminUser(user) ? user : null));
}

export async function signInAdmin(): Promise<User> {
  if (!firebaseAuth) throw new Error("Firebase belum dikonfigurasi.");
  if (!adminEmail) throw new Error("Email admin belum dikonfigurasi.");
  const credential = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  if (!isAdminUser(credential.user)) {
    await signOut(firebaseAuth);
    throw new Error("Akun Google ini tidak memiliki akses admin.");
  }
  return credential.user;
}

export async function signOutAdmin(): Promise<void> {
  if (firebaseAuth) await signOut(firebaseAuth);
}

export async function ensureFirebaseAuth(): Promise<User> {
  if (!firebaseAuth || !firestore) throw new Error("Firebase belum dikonfigurasi.");
  const user = firebaseAuth.currentUser ?? await new Promise<User | null>((resolve) => {
    const stop = onAuthStateChanged(firebaseAuth, (next) => { stop(); resolve(next); }, () => { stop(); resolve(null); });
  });
  if (!isAdminUser(user)) throw new Error("Masuk sebagai admin terlebih dahulu.");
  return user;
}
