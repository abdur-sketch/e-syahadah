import type { InstitutionSettings } from "@/lib/settings";
import type { Student } from "@/lib/students";
import type { Subject } from "@/lib/subjects";
import type { CertificateTemplate } from "@/lib/template";

export type AppBackup = {
  version: 1;
  exportedAt: string;
  students: Student[];
  subjects: Subject[];
  institution: InstitutionSettings;
  template: CertificateTemplate;
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createBackup(data: Omit<AppBackup, "version" | "exportedAt">): AppBackup {
  return { version: 1, exportedAt: new Date().toISOString(), ...data };
}

export function parseBackup(text: string): AppBackup {
  const value = JSON.parse(text) as Partial<AppBackup>;
  if (value.version !== 1 || !Array.isArray(value.students) || !Array.isArray(value.subjects) || !value.institution || !value.template) {
    throw new Error("Berkas backup tidak valid atau versinya tidak didukung.");
  }
  return value as AppBackup;
}

function stringValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (value && typeof value === "object" && "text" in value) return String((value as { text: string }).text);
  return String(value ?? "").trim();
}

export async function downloadImportTemplate(subjects: Subject[]) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "E-Syahadah";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Template Import", { views: [{ state: "frozen", ySplit: 1, xSplit: 2 }] });
  const identityHeaders = ["Nomor Syahadah", "Nama", "Nama Arab", "NISN", "Jenjang", "Tempat Lahir", "Tanggal Lahir", "Wali"];
  const scoreHeaders = Array.from({ length: 11 }, (_, index) => `Nilai ${index + 1}`);
  sheet.addRow([...identityHeaders, ...scoreHeaders]);
  sheet.columns = [
    { key: "id", width: 22 }, { key: "name", width: 27 }, { key: "arabicName", width: 25 }, { key: "nisn", width: 17 },
    { key: "level", width: 12 }, { key: "birthPlace", width: 18 }, { key: "birthDate", width: 16 }, { key: "guardian", width: 23 },
    ...scoreHeaders.map((_, index) => ({ key: `score${index + 1}`, width: 11 })),
  ];
  sheet.getRow(1).height = 30;
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6652C8" } };
  sheet.autoFilter = { from: "A1", to: "S101" };
  for (let row = 2; row <= 101; row += 1) {
    sheet.getCell(`A${row}`).numFmt = "@";
    sheet.getCell(`D${row}`).numFmt = "@";
    sheet.getCell(`E${row}`).dataValidation = { type: "list", allowBlank: true, formulae: ['"Ula,Wustha,Ulya"'], showErrorMessage: true, errorTitle: "Jenjang tidak valid", error: "Pilih Ula, Wustha, atau Ulya." };
    sheet.getCell(`G${row}`).numFmt = "yyyy-mm-dd";
    for (let column = 9; column <= 19; column += 1) {
      const cell = sheet.getCell(row, column);
      cell.numFmt = "0";
      cell.dataValidation = { type: "whole", operator: "between", allowBlank: true, formulae: [0, 100], showErrorMessage: true, errorTitle: "Nilai tidak valid", error: "Nilai harus berupa angka 0 sampai 100." };
    }
  }
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) row.alignment = { vertical: "middle" };
  });

  const guide = workbook.addWorksheet("Petunjuk");
  guide.columns = [{ width: 24 }, { width: 58 }];
  guide.addRows([
    ["TEMPLATE IMPORT E-SYAHADAH", "Isi data pada sheet Template Import, lalu unggah melalui menu Data & Backup."],
    ["Kolom wajib", "Nomor Syahadah dan Nama."],
    ["Nomor Syahadah / NISN", "Disimpan sebagai teks agar angka nol di depan tidak hilang."],
    ["Tanggal lahir", "Gunakan format tanggal yyyy-mm-dd, contoh 2006-04-12."],
    ["Jenjang", "Pilih Ula, Wustha, atau Ulya dari daftar."],
    ["Nilai", "Masukkan angka 0 sampai 100. Nilai kosong dianggap 0."],
    ...Array.from({ length: 11 }, (_, index) => [`Nilai ${index + 1}`, subjects.find((subject) => subject.order === index)?.name || `Mata Pelajaran ${index + 1}`]),
    ["Catatan", "Jangan mengubah nama header pada baris pertama."],
  ]);
  guide.getRow(1).height = 34;
  guide.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
  guide.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6652C8" } };
  guide.getColumn(1).font = { bold: true };
  guide.eachRow((row) => { row.alignment = { vertical: "middle", wrapText: true }; });
  guide.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "template-import-e-syahadah.xlsx");
}

export async function importStudentsExcel(file: File): Promise<Student[]> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("Workbook tidak memiliki lembar data.");
  const headers = (sheet.getRow(1).values as unknown[]).map((value) => stringValue(value).toLowerCase());
  const find = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const columns = {
    id: find("nomor syahadah", "id", "no syahadah"),
    name: find("nama", "nama lengkap"),
    arabicName: find("nama arab", "nama dalam bahasa arab"),
    nisn: find("nisn"),
    level: find("jenjang", "kelas"),
    birthPlace: find("tempat lahir"),
    birthDate: find("tanggal lahir"),
    guardian: find("wali", "nama wali"),
  };
  if (columns.id < 1 || columns.name < 1) throw new Error("Kolom Nomor Syahadah dan Nama wajib tersedia.");
  const students: Student[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (column: number) => (column < 1 ? "" : stringValue(row.getCell(column).value));
    const name = get(columns.name);
    const id = get(columns.id);
    if (!name || !id) return;
    const scores = Array.from({ length: 11 }, (_, index) => {
      const scoreColumn = find(`nilai ${index + 1}`, `mapel ${index + 1}`);
      const parsed = Number(get(scoreColumn));
      return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
    });
    const score = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
    students.push({
      id,
      name,
      arabicName: get(columns.arabicName),
      initials: name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase(),
      nisn: get(columns.nisn),
      level: get(columns.level) || "Ulya",
      birthPlace: get(columns.birthPlace),
      birthDate: get(columns.birthDate),
      guardian: get(columns.guardian),
      scores,
      score,
      status: score >= 70 ? "Lulus" : "Proses",
      tone: "sky",
      certificateStatus: "Belum",
      archiveStatus: "Aktif",
    });
  });
  if (!students.length) throw new Error("Tidak ada baris santri yang dapat diimpor.");
  return students;
}

export async function exportStudentsExcel(students: Student[], subjects: Subject[], filename: string) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data Santri");
  sheet.columns = [
    { header: "Nomor Syahadah", key: "id", width: 22 },
    { header: "Nama", key: "name", width: 28 },
    { header: "Nama Arab", key: "arabicName", width: 25 },
    { header: "NISN", key: "nisn", width: 17 },
    { header: "Jenjang", key: "level", width: 12 },
    { header: "Tempat Lahir", key: "birthPlace", width: 18 },
    { header: "Tanggal Lahir", key: "birthDate", width: 16 },
    ...subjects.slice(0, 11).map((subject, index) => ({ header: `Nilai ${index + 1}`, key: `score${index}`, width: 12 })),
  ];
  students.forEach((student) => sheet.addRow({ ...student, ...Object.fromEntries(student.scores.map((score, index) => [`score${index}`, score])) }));
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + sheet.columnCount)}1` };
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
}
