import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { ensureFirebaseAuth, firestore } from "@/lib/firebase";
import type { InstitutionSettings } from "@/lib/settings";
import type { Student } from "@/lib/students";

export type PublicVerification = {
  code: string;
  certificateNumber: string;
  studentName: string;
  nisn: string;
  level: string;
  finalScore: number;
  academicYear: string;
  institutionName: string;
  principal: string;
  issuedAt: string;
  valid: true;
};

export function createVerificationCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function createCertificateNumber(sequence: number, academicYear: string) {
  return `SYH/${academicYear.replace("/", "-")}/${String(sequence).padStart(4, "0")}`;
}

export async function publishVerification(student: Student, institution: InstitutionSettings, academicYear: string) {
  if (!firestore || !student.verificationCode || !student.certificateNumber) throw new Error("Data verifikasi belum lengkap.");
  await ensureFirebaseAuth();
  const record: PublicVerification = {
    code: student.verificationCode,
    certificateNumber: student.certificateNumber,
    studentName: student.name,
    nisn: student.nisn || "-",
    level: student.level,
    finalScore: student.score,
    academicYear,
    institutionName: institution.name,
    principal: institution.principal,
    issuedAt: student.issuedAt || new Date().toISOString(),
    valid: true,
  };
  await setDoc(doc(firestore, "verifications", student.verificationCode), { ...record, updatedAt: serverTimestamp() });
}

export async function readPublicVerification(code: string): Promise<PublicVerification | null> {
  if (!firestore || !/^[A-F0-9]{18}$/.test(code)) return null;
  const snapshot = await getDoc(doc(firestore, "verifications", code));
  return snapshot.exists() ? (snapshot.data() as PublicVerification) : null;
}
