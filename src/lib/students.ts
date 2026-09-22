import {
  collection,
  deleteDoc,
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

import { ensureFirebaseAuth, firestore } from "@/lib/firebase";

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
  nisn?: string;
  birthPlace?: string;
  birthDate?: string;
  guardian?: string;
  certificateStatus?: "Belum" | "Validasi" | "Terbit";
  academicYear?: string;
  archiveStatus?: "Aktif" | "Lulus" | "Arsip";
  certificateNumber?: string;
  verificationCode?: string;
  issuedAt?: string;
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
    nisn: typeof data.nisn === "string" ? data.nisn : "",
    birthPlace: typeof data.birthPlace === "string" ? data.birthPlace : "",
    birthDate: typeof data.birthDate === "string" ? data.birthDate : "",
    guardian: typeof data.guardian === "string" ? data.guardian : "",
    certificateStatus: data.certificateStatus === "Terbit" ? "Terbit" : data.certificateStatus === "Validasi" ? "Validasi" : "Belum",
    academicYear: typeof data.academicYear === "string" ? data.academicYear : "",
    archiveStatus: data.archiveStatus === "Lulus" ? "Lulus" : data.archiveStatus === "Arsip" ? "Arsip" : "Aktif",
    certificateNumber: typeof data.certificateNumber === "string" ? data.certificateNumber : "",
    verificationCode: typeof data.verificationCode === "string" ? data.verificationCode : "",
    issuedAt: typeof data.issuedAt === "string" ? data.issuedAt : "",
  };
}

async function ensureSignedIn() {
  if (!firestore) throw new Error("Firebase belum dikonfigurasi.");
  await ensureFirebaseAuth();
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

export async function saveStudents(students: Student[], academicYear: string) {
  await ensureSignedIn();
  const chunks = Array.from({ length: Math.ceil(students.length / 400) }, (_, index) => students.slice(index * 400, (index + 1) * 400));
  for (const chunk of chunks) {
    const batch = writeBatch(firestore!);
    chunk.forEach((student) => batch.set(doc(firestore!, "students", student.id), { ...student, academicYear: student.academicYear || academicYear, updatedAt: serverTimestamp() }, { merge: true }));
    await batch.commit();
  }
}

export async function deleteStudent(studentId: string) {
  await ensureSignedIn();
  await deleteDoc(doc(firestore!, "students", studentId));
}
