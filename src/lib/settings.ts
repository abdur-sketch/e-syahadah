import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";
import { ensureFirebaseAuth, firestore } from "@/lib/firebase";

export type InstitutionSettings = {
  name: string;
  arabicName: string;
  foundation: string;
  city: string;
  principal: string;
  address: string;
};

export const defaultSettings: InstitutionSettings = {
  name: "Pesantren Digital",
  arabicName: "مَعْهَدُ التَّرْبِيَةِ الإِسْلَامِيَّةِ",
  foundation: "Yayasan Pendidikan Islam",
  city: "Jakarta",
  principal: "Ahmad Rasyid",
  address: "Jl. Pendidikan Islam No. 1",
};

async function ensureSignedIn() {
  if (!firestore) throw new Error("Firebase belum dikonfigurasi.");
  await ensureFirebaseAuth();
}

export async function subscribeToSettings(onData: (settings: InstitutionSettings) => void, onError: (error: Error) => void): Promise<Unsubscribe> {
  await ensureSignedIn();
  return onSnapshot(doc(firestore!, "settings", "institution"), (snapshot) => {
    if (!snapshot.exists()) return onData(defaultSettings);
    onData({ ...defaultSettings, ...snapshot.data() } as InstitutionSettings);
  }, onError);
}

export async function saveSettings(settings: InstitutionSettings) {
  await ensureSignedIn();
  await setDoc(doc(firestore!, "settings", "institution"), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
}
