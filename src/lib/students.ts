import { signInAnonymously } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { firebaseAuth, firestore } from "@/lib/firebase";

export type Student = {
  name: string;
  arabicName: string;
  initials: string;
  id: string;
  level: string;
  status: "Lulus" | "Proses";
  score: number;
  tone: string;
  scores: number[];
};

function fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Student | null {
  const data = snapshot.data();
  if (
    typeof data.name !== "string" ||
    typeof data.arabicName !== "string" ||
    typeof data.level !== "string" ||
    !Array.isArray(data.scores) ||
    data.scores.length !== 11
  ) return null;

  const scores = data.scores.map(Number);
  if (scores.some((score) => !Number.isFinite(score))) return null;

  return {
    id: snapshot.id,
    name: data.name,
    arabicName: data.arabicName,
    initials: typeof data.initials === "string" ? data.initials : data.name.slice(0, 2).toUpperCase(),
    level: data.level,
    status: data.status === "Proses" ? "Proses" : "Lulus",
    score: typeof data.score === "number" ? data.score : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    tone: typeof data.tone === "string" ? data.tone : "sky",
    scores,
  };
}

async function ensureSignedIn() {
  if (!firebaseAuth || !firestore) throw new Error("Firebase belum dikonfigurasi.");
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
}

export async function subscribeToStudents(
  onStudents: (students: Student[]) => void,
  onError: (error: Error) => void,
): Promise<Unsubscribe> {
  await ensureSignedIn();
  const studentsQuery = query(collection(firestore!, "students"), orderBy("name"));
  return onSnapshot(
    studentsQuery,
    (snapshot) => onStudents(snapshot.docs.map(fromFirestore).filter((student): student is Student => student !== null)),
    onError,
  );
}

export async function seedStudents(students: Student[], academicYear: string) {
  await ensureSignedIn();
  const batch = writeBatch(firestore!);
  students.forEach((student) => {
    batch.set(doc(firestore!, "students", student.id), {
      ...student,
      academicYear,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function saveStudent(student: Student, academicYear: string) {
  await ensureSignedIn();
  await setDoc(
    doc(firestore!, "students", student.id),
    { ...student, academicYear, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
