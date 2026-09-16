import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";
import { ensureFirebaseAuth, firestore } from "@/lib/firebase";

export type TemplatePosition = { x: number; y: number };
export type TemplateTextStyle = { fontFamily: string; fontSize: number };
export type TemplateElementId =
  | "coverLogo" | "coverWatermark" | "coverTitle" | "coverInstitution" | "coverYear" | "coverOpening"
  | "coverStudent" | "coverDecision" | "coverPhoto" | "coverSignature"
  | "transcriptLogo" | "transcriptWatermark" | "transcriptTitle" | "transcriptStudent" | "transcriptTable" | "transcriptSignature";

export type CertificateTemplate = {
  logoDataUrl: string;
  watermarkDataUrl: string;
  watermarkOpacity: number;
  logoSize: number;
  watermarkSize: number;
  positions: Record<TemplateElementId, TemplatePosition>;
  texts: Partial<Record<TemplateElementId, string>>;
  styles: Partial<Record<TemplateElementId, TemplateTextStyle>>;
};

export const templateLabels: Record<TemplateElementId, string> = {
  coverLogo: "Logo sekolah", coverWatermark: "Watermark halaman 1", coverTitle: "Judul syahadah", coverInstitution: "Identitas lembaga",
  coverYear: "Tahun ajaran", coverOpening: "Mukadimah", coverStudent: "Data santri",
  coverDecision: "Teks keputusan", coverPhoto: "Foto 3×4", coverSignature: "Tanggal & tanda tangan",
  transcriptLogo: "Logo halaman 2", transcriptWatermark: "Watermark halaman 2", transcriptTitle: "Judul daftar nilai", transcriptStudent: "Identitas santri", transcriptTable: "Tabel nilai",
  transcriptSignature: "Tanda tangan halaman nilai",
};

export const defaultTemplate: CertificateTemplate = {
  logoDataUrl: "",
  watermarkDataUrl: "",
  watermarkOpacity: 0.07,
  logoSize: 12,
  watermarkSize: 44,
  positions: {
    coverLogo: { x: 50, y: 8 }, coverWatermark: { x: 50, y: 52 }, coverTitle: { x: 50, y: 17 }, coverInstitution: { x: 50, y: 25 },
    coverYear: { x: 50, y: 31 }, coverOpening: { x: 50, y: 38 }, coverStudent: { x: 58, y: 48 },
    coverDecision: { x: 50, y: 61 }, coverPhoto: { x: 18, y: 82 }, coverSignature: { x: 69, y: 82 },
    transcriptLogo: { x: 12, y: 9 }, transcriptWatermark: { x: 50, y: 54 }, transcriptTitle: { x: 50, y: 10 }, transcriptStudent: { x: 68, y: 18 }, transcriptTable: { x: 50, y: 53 },
    transcriptSignature: { x: 50, y: 90 },
  },
  texts: {
    coverWatermark: "{{nama_pesantren}}",
    coverTitle: "الشَّهَادَةُ",
    coverInstitution: "{{yayasan_arab}}\n{{pesantren_arab}}\n{{alamat_arab}}",
    coverYear: "العام الدراسي: ١٤٤٧ - ١٤٤٨ هـ",
    coverOpening: "الحمد لله رب العالمين والصلاة والسلام على أشرف الأنبياء والمرسلين وعلى آله وصحبه أجمعين، أما بعد:\nتُقَرِّرُ إِدَارَةُ {{pesantren_arab}} بِأَنَّ الطَّالِبَ:",
    coverStudent: "اسم الطالب|{{nama_arab}}\nالمولود في|{{tempat_lahir}}، {{tanggal_lahir}}\nرقم القيد|{{nomor_induk}}",
    coverDecision: "قَدْ أَتَمَّ الدِّرَاسَةَ فِي {{pesantren_arab}} لِـ{{jenjang_arab}} {{status_arab}} فِي امْتِحَانِهِ النِّهَائِيِّ بِتَقْدِيْرٍ عَامٍّ: {{nilai_rata}} وَالْمُعَدَّلِ: {{predikat}}. وَبِنَاءً عَلَى ذَلِكَ مُنِحَ هَذِهِ الشَّهَادَةَ لِيَنْتَفِعَ بِهَا، وَاللهُ وَلِيُّ التَّوْفِيْقِ.",
    coverPhoto: "صورة\n٣ × ٤",
    coverSignature: "تاريخ: {{tanggal_cetak}}\nمدير المعهد\n{{kepala_sekolah}}",
    transcriptWatermark: "{{nama_pesantren}}",
    transcriptTitle: "بَيَانٌ بِالدَّرَجَاتِ الْمُكْتَسَبَةِ بِالِامْتِحَانِ النِّهَائِيِّ",
    transcriptStudent: "اسم الطالب|{{nama_arab}}\nالمولود في|{{tempat_lahir}}، {{tanggal_lahir}}\nرقم القيد|{{nomor_induk}}",
    transcriptTable: "رقم|المواد الدراسية|رقماً|كتابة|الملاحظة\nمجموع الدرجات|النسبة المئوية|النتيجة|بتقدير",
    transcriptSignature: "مدير المعهد\n{{kepala_sekolah}}",
  },
  styles: {
    coverWatermark: { fontFamily: "Times New Roman", fontSize: 16 }, coverTitle: { fontFamily: "Times New Roman", fontSize: 52 },
    coverInstitution: { fontFamily: "Times New Roman", fontSize: 12 }, coverYear: { fontFamily: "Times New Roman", fontSize: 11 },
    coverOpening: { fontFamily: "Times New Roman", fontSize: 10 }, coverStudent: { fontFamily: "Times New Roman", fontSize: 10 },
    coverDecision: { fontFamily: "Times New Roman", fontSize: 10 }, coverPhoto: { fontFamily: "Times New Roman", fontSize: 10 },
    coverSignature: { fontFamily: "Times New Roman", fontSize: 10 }, transcriptWatermark: { fontFamily: "Times New Roman", fontSize: 16 },
    transcriptTitle: { fontFamily: "Times New Roman", fontSize: 24 }, transcriptStudent: { fontFamily: "Times New Roman", fontSize: 9 },
    transcriptTable: { fontFamily: "Times New Roman", fontSize: 8 }, transcriptSignature: { fontFamily: "Times New Roman", fontSize: 11 },
  },
};

async function ensureReady() {
  if (!firestore) throw new Error("Firebase belum dikonfigurasi.");
  await ensureFirebaseAuth();
}

export async function subscribeToTemplate(onData: (template: CertificateTemplate) => void, onError: (error: Error) => void): Promise<Unsubscribe> {
  await ensureReady();
  return onSnapshot(doc(firestore!, "settings", "certificate-template"), (snapshot) => {
    if (!snapshot.exists()) return onData(defaultTemplate);
    const data = snapshot.data() as Partial<CertificateTemplate>;
    onData({ ...defaultTemplate, ...data, positions: { ...defaultTemplate.positions, ...(data.positions ?? {}) }, texts: { ...defaultTemplate.texts, ...(data.texts ?? {}) }, styles: { ...defaultTemplate.styles, ...(data.styles ?? {}) } });
  }, onError);
}

export async function saveTemplate(template: CertificateTemplate) {
  await ensureReady();
  await setDoc(doc(firestore!, "settings", "certificate-template"), { ...template, updatedAt: serverTimestamp() });
}
