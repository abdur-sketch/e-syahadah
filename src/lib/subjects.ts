import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, writeBatch, type Unsubscribe } from "firebase/firestore";
import { ensureFirebaseAuth, firestore } from "@/lib/firebase";

export type Subject = { id: string; name: string; arabicName: string; order: number; active: boolean };

export const defaultSubjects: Subject[] = [
  ["tauhid", "Tauhid", "التوحيد"], ["akhlak", "Akhlak", "الأخلاق"], ["tafsir", "Tafsir", "التفسير"],
  ["hadits", "Hadits", "الحديث"], ["fikih", "Fikih", "الفقه"], ["nahwu", "Nahwu", "النحو"],
  ["shorof", "Shorof", "الصرف"], ["bahasa-arab", "Bahasa Arab", "اللغة العربية"],
  ["tarikh-islam", "Tarikh Islam", "التاريخ الإسلامي"], ["tajwid", "Tajwid", "التجويد"],
  ["imla-khat", "Imla' & Khat", "الإملاء والخط"],
].map(([id, name, arabicName], order) => ({ id: String(id), name: String(name), arabicName: String(arabicName), order, active: true }));

async function ensureSignedIn() {
  if (!firestore) throw new Error("Firebase belum dikonfigurasi.");
  await ensureFirebaseAuth();
}

export async function subscribeToSubjects(onData: (subjects: Subject[]) => void, onError: (error: Error) => void): Promise<Unsubscribe> {
  await ensureSignedIn();
  return onSnapshot(query(collection(firestore!, "subjects"), orderBy("order")), (snapshot) => {
    onData(snapshot.docs.map((item) => ({
      id: item.id,
      name: String(item.data().name ?? ""),
      arabicName: String(item.data().arabicName ?? ""),
      order: Number(item.data().order ?? 0),
      active: item.data().active !== false,
    })));
  }, onError);
}

export async function saveSubjects(subjects: Subject[]) {
  await ensureSignedIn();
  const batch = writeBatch(firestore!);
  subjects.forEach((subject, order) => batch.set(doc(firestore!, "subjects", subject.id), { ...subject, order, updatedAt: serverTimestamp() }, { merge: true }));
  await batch.commit();
}
