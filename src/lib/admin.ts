import type { Student } from "@/lib/students";

export type AuditEntry = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
};

export function buildStudentsCsv(students: Student[]): string {
  const rows: string[][] = [
    ["Nomor Syahadah", "Nama", "NISN", "Jenjang", "Status", "Nilai", "Status Ijazah"],
    ...students.map((student) => [
      student.id ?? "",
      student.name ?? "",
      student.nisn || "-",
      student.level ?? "",
      student.status ?? "",
      String(student.score ?? 0),
      student.certificateStatus ?? "",
    ]),
  ];

  return buildCsv(rows);
}

export function buildCsv(rows: (string | number)[][]): string {
  return '\uFEFF' + rows.map((row) => row.map((value) => {
    const text = String(value ?? '');
    const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  }).join(',')).join('\r\n');
}

export function loadAuditEntries(storageKey: string): AuditEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAuditEntries(storageKey: string, entries: AuditEntry[]): AuditEntry[] {
  if (typeof window === "undefined") return entries;

  const next = entries.slice(0, 20);
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  return next;
}

export function appendAuditEntry(storageKey: string, entry: Omit<AuditEntry, "id">): AuditEntry[] {
  const existing = loadAuditEntries(storageKey);
  const next = [{ ...entry, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` }, ...existing].slice(0, 20);
  return saveAuditEntries(storageKey, next);
}
