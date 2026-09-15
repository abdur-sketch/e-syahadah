"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BookOpen, Check, ChevronDown, ClipboardList, FileCheck2, FileText, GraduationCap, LayoutDashboard, Menu, MoreHorizontal, Printer, Search, Settings, SlidersHorizontal, Sparkles, Users, X } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { saveStudent, seedStudents, subscribeToStudents, type Student } from "@/lib/students";

const subjects = ["Tauhid", "Akhlak", "Tafsir", "Hadits", "Fikih", "Nahwu", "Shorof", "Bahasa Arab", "Tarikh Islam", "Tajwid", "Imla' & Khat"];
const initialScores = [82, 88, 76, 91, 84, 79, 86, 90, 81, 87, 85];
const demoStudents: Student[] = [
  { name: "Ahmad Fauzan", arabicName: "أحمد فوزان", initials: "AF", id: "SYH-2026-001", level: "Ulya", status: "Lulus", score: 84, tone: "rose", scores: initialScores },
  { name: "Siti Aisyah", arabicName: "ستي عائشة", initials: "SA", id: "SYH-2026-002", level: "Ulya", status: "Lulus", score: 92, tone: "lavender", scores: [92, 94, 90, 93, 88, 91, 95, 89, 90, 94, 92] },
  { name: "Muhammad Rizky", arabicName: "محمد رزقي", initials: "MR", id: "SYH-2026-003", level: "Wustha", status: "Proses", score: 74, tone: "mint", scores: [72, 76, 70, 78, 74, 71, 73, 75, 70, 77, 74] },
  { name: "Nurul Hidayah", arabicName: "نور الهداية", initials: "NH", id: "SYH-2026-004", level: "Ulya", status: "Lulus", score: 88, tone: "peach", scores: [88, 90, 84, 92, 86, 87, 89, 91, 85, 90, 86] },
  { name: "Abdullah Fikri", arabicName: "عبد الله فكري", initials: "AF", id: "SYH-2026-005", level: "Ulya", status: "Lulus", score: 83, tone: "sky", scores: [82, 85, 80, 86, 84, 79, 83, 87, 81, 85, 82] },
];
const navItems = [{ label: "Dashboard", icon: LayoutDashboard }, { label: "Data Santri", icon: Users }, { label: "Input Nilai", icon: ClipboardList }, { label: "Ijazah", icon: FileCheck2 }];
function numberToArabic(value: number) { return value.toString().replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]); }
function scoreWord(score: number) { if (score >= 90) return "ممتاز"; if (score >= 80) return "جيد جداً"; if (score >= 70) return "جيد"; return "مقبول"; }
const today = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date()).toUpperCase();
const currentYear = Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date()));
const currentMonth = Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: "Asia/Jakarta" }).format(new Date()));
const academicYear = currentMonth >= 7 ? `${currentYear}/${currentYear + 1}` : `${currentYear - 1}/${currentYear}`;

export default function Home() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [students, setStudents] = useState(demoStudents);
  const [selectedStudentId, setSelectedStudentId] = useState(demoStudents[0].id);
  const selectedStudentIdRef = useRef(demoStudents[0].id);
  const [scores, setScores] = useState(initialScores);
  const [showPreview, setShowPreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [syncState, setSyncState] = useState<"demo" | "connecting" | "connected" | "saving" | "saved" | "error">(isFirebaseConfigured ? "connecting" : "demo");
  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const currentStudent = students.find((student) => student.id === selectedStudentId) ?? students[0];
  const filteredStudents = useMemo(() => students.filter((student) => student.name.toLowerCase().includes(search.toLowerCase())), [search, students]);
  const passed = average >= 70;
  function chooseStudent(student: Student) { selectedStudentIdRef.current = student.id; setSelectedStudentId(student.id); setScores([...student.scores]); }
  function navigate(label: string) { setActiveNav(label); setMobileMenuOpen(false); }
  async function handleSave() {
    const updatedStudent: Student = { ...currentStudent, scores, score: average, status: passed ? "Lulus" : "Proses" };
    setStudents((current) => current.map((student) => student.id === updatedStudent.id ? updatedStudent : student));
    if (!isFirebaseConfigured) { setShowPreview(true); return; }
    setSyncState("saving");
    try {
      await saveStudent(updatedStudent, academicYear);
      setSyncState("saved");
      setShowPreview(true);
    } catch (error) {
      console.error(error);
      setSyncState("error");
    }
  }
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setShowPreview(false); setMobileMenuOpen(false); }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void subscribeToStudents(async (remoteStudents) => {
      if (!active) return;
      if (remoteStudents.length === 0) {
        try { await seedStudents(demoStudents, academicYear); }
        catch (error) { console.error(error); setSyncState("error"); }
        return;
      }
      const selected = remoteStudents.find((student) => student.id === selectedStudentIdRef.current) ?? remoteStudents[0];
      selectedStudentIdRef.current = selected.id;
      setStudents(remoteStudents);
      setSelectedStudentId(selected.id);
      setScores([...selected.scores]);
      setSyncState("connected");
    }, (error) => { console.error(error); setSyncState("error"); })
      .then((stop) => { if (active) unsubscribe = stop; else stop(); })
      .catch((error) => { console.error(error); setSyncState("error"); });
    return () => { active = false; unsubscribe?.(); };
  }, []);
  return (
    <main className="app-shell">
      {mobileMenuOpen && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`} aria-label="Navigasi utama"><div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><div><strong>E-SYAHADAH</strong><span>Pesantren Digital</span></div><button className="sidebar-close" aria-label="Tutup menu" onClick={() => setMobileMenuOpen(false)}><X size={18} /></button></div><div className="sidebar-section"><p className="eyebrow">WORKSPACE</p>{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => navigate(label)}><Icon size={18} /><span>{label}</span>{label === "Ijazah" && <span className="nav-count">12</span>}</button>)}</div><div className="sidebar-section sidebar-bottom"><p className="eyebrow">KONFIGURASI</p><button className={`nav-item ${activeNav === "Mata Pelajaran" ? "active" : ""}`} onClick={() => navigate("Mata Pelajaran")}><BookOpen size={18} /><span>Mata Pelajaran</span></button><button className={`nav-item ${activeNav === "Pengaturan" ? "active" : ""}`} onClick={() => navigate("Pengaturan")}><Settings size={18} /><span>Pengaturan</span></button><div className="help-card"><div className="help-icon"><GraduationCap size={18} /></div><strong>Butuh bantuan?</strong><span>Pelajari cara membuat ijazah</span><button>Lihat panduan <span>↗</span></button></div></div><div className="profile"><div className="avatar small">AR</div><div><strong>Ahmad Rasyid</strong><span>Administrator</span></div><MoreHorizontal size={18} className="muted-icon" /></div></aside>
      <section className="main-content"><header className="topbar"><button className="mobile-menu" aria-label="Buka menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div><div className="topbar-actions"><div className="year-select"><span className="status-dot"></span>Tahun Ajaran {academicYear}<ChevronDown size={15} /></div><button className="icon-button" aria-label="Notifikasi"><Bell size={18} /><i /></button><div className="avatar">AR</div></div></header><div className="page-body"><div className="page-heading"><div><p className="eyebrow accent">{today}</p><h1>Selamat datang, Ahmad <span>✦</span></h1><div className="heading-meta"><p className="subheading">Pantau proses penerbitan ijazah pesantren dalam satu ruang.</p><span className={`sync-badge ${syncState}`}><i />{syncState === "demo" ? "Mode demo" : syncState === "connecting" ? "Menghubungkan Firebase" : syncState === "saving" ? "Menyimpan" : syncState === "saved" ? "Tersimpan" : syncState === "error" ? "Firebase bermasalah" : "Firebase tersinkron"}</span></div></div><button className="primary-button" onClick={() => setShowPreview(true)}><FileText size={17} /> Buat Ijazah Baru</button></div>
        <section className="metrics-grid"><Metric icon={<Users />} label="Total Santri" value="128" delta="+12%" note="dari bulan lalu" tone="yellow" /><Metric icon={<FileCheck2 />} label="Ijazah Dibuat" value="96" delta="+8%" note="dari bulan lalu" tone="green" /><Metric icon={<Check />} label="Santri Lulus" value="91" delta="+5%" note="dari bulan lalu" tone="blue" /><Metric icon={<ClipboardList />} label="Menunggu Validasi" value="5" delta="Perlu ditinjau" note="segera" tone="orange" urgent /></section>
        <section className="workflow-strip"><div className="workflow-title"><div className="step-badge"><Sparkles size={16} /></div><div><strong>Alur penerbitan ijazah</strong><span>Selesaikan 5 ijazah yang masih menunggu validasi</span></div></div><div className="progress-line"><div className="progress-done"></div></div><span className="progress-label">76% selesai</span><button className="text-button" onClick={() => setActiveNav("Ijazah")}>Lihat semua <span>→</span></button></section>
        <div className="content-grid"><section className="panel students-panel"><div className="panel-header"><div><h2>Santri terbaru</h2><p>Daftar santri dan status ijazah tahun ini.</p></div><button className="ghost-button" onClick={() => setActiveNav("Data Santri")}>Lihat semua <span>→</span></button></div><div className="toolbar"><div className="search-box"><Search size={16} /><input placeholder="Cari nama santri..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><button className="filter-button"><SlidersHorizontal size={15} /> Filter</button></div><div className="student-table"><div className="table-head"><span>Nama santri</span><span>Jenjang</span><span>Status</span><span>Nilai akhir</span><span></span></div>{filteredStudents.map((student) => <button className={`student-row ${selectedStudentId === student.id ? "selected" : ""}`} key={student.id} onClick={() => chooseStudent(student)}><span className="student-name"><span className={`avatar avatar-${student.tone}`}>{student.initials}</span><span><strong>{student.name}</strong><small>{student.id}</small></span></span><span className="level">{student.level}</span><span><em className={`status ${student.status === "Lulus" ? "success" : "pending"}`}><i />{student.status}</em></span><span className="table-score">{student.score}</span><MoreHorizontal size={17} className="muted-icon" /></button>)}</div></section>
        <section className="panel grade-panel"><div className="panel-header"><div><h2>Input nilai</h2><p>{currentStudent.name} · {currentStudent.id}</p></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="grade-summary"><div><span>Nilai rata-rata</span><strong>{average}</strong><small className={passed ? "good" : "bad"}>{passed ? "Lulus" : "Belum lulus"} · {scoreWord(average)}</small></div><div className="ring" style={{ "--score": `${average * 3.6}deg` } as React.CSSProperties}><div><strong>{numberToArabic(average)}</strong><span>/ ١٠٠</span></div></div></div><div className="grade-list">{subjects.map((subject, index) => <label className="grade-row" key={subject}><span>{subject}</span><input aria-label={`Nilai ${subject}`} type="number" min="0" max="100" value={scores[index]} onChange={(event) => setScores(scores.map((score, scoreIndex) => scoreIndex === index ? Math.max(0, Math.min(100, Number(event.target.value))) : score))} /><span className="arabic-number">{numberToArabic(scores[index])}</span></label>)}</div><button className="save-button" disabled={syncState === "saving"} onClick={handleSave}><Check size={16} /> {syncState === "saving" ? "Menyimpan ke Firebase..." : "Simpan & lihat preview"}</button></section></div></div></section>
      {showPreview && <div className="modal-backdrop" onClick={() => setShowPreview(false)}><section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" onClick={(event) => event.stopPropagation()}><div className="preview-header"><div><p className="eyebrow accent">PREVIEW DOKUMEN</p><h2 id="preview-title">Ijazah {currentStudent.name}</h2><p>Siap ditinjau sebelum dicetak atau disimpan.</p></div><button className="close-button" aria-label="Tutup preview" onClick={() => setShowPreview(false)}><X size={20} /></button></div><div className="certificate-preview"><div className="cert-page cert-cover"><div className="cert-topline">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div><div className="cert-logo">✦</div><p className="cert-kicker">YAYASAN PENDIDIKAN ISLAM</p><h3>مَعْهَدُ التَّرْبِيَةِ الإِسْلَامِيَّةِ</h3><div className="cert-rule"></div><h4>شَهَادَةُ إِتْمَامِ الدِّرَاسَةِ</h4><p className="cert-copy">Dengan ini menerangkan bahwa:</p><strong className="cert-name">{currentStudent.name}</strong><p className="arabic-cert-name">{currentStudent.arabicName}</p><p className="cert-copy">telah menyelesaikan pendidikan dengan hasil</p><strong className="cert-result">{passed ? "نَاجِح" : "غَيْرُ نَاجِح"}</strong><div className="cert-footer"><span>Nomor: {currentStudent.id}</span><span>Jakarta, {today.toLowerCase().replace(/^\w+,\s*/, "")}<br /><b>Kepala Pesantren</b></span></div></div><div className="cert-page cert-transcript"><div className="cert-topline">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div><h4>كِشْفُ الدَّرَجَاتِ</h4><p className="transcript-sub">Daftar Nilai Ujian Akhir</p><div className="transcript-table"><div><b>No.</b><b>Mata Pelajaran</b><b>Nilai</b></div>{subjects.map((subject, index) => <div key={subject}><span>{index + 1}</span><span>{subject}</span><strong>{numberToArabic(scores[index])}</strong></div>)}<div className="total"><span></span><b>المجموع / Jumlah</b><strong>{numberToArabic(scores.reduce((sum, score) => sum + score, 0))}</strong></div></div><div className="transcript-average"><span>المعدل العام / Rata-rata</span><strong>{numberToArabic(average)} — {scoreWord(average)}</strong></div></div></div><div className="preview-actions"><button className="ghost-button" onClick={() => window.print()}><Printer size={16} /> Cetak A4</button><button className="primary-button" onClick={() => window.print()}><FileText size={16} /> Simpan sebagai PDF</button></div></section></div>}
    </main>
  );
}
function Metric({ icon, label, value, delta, note, tone, urgent = false }: { icon: React.ReactNode; label: string; value: string; delta: string; note: string; tone: string; urgent?: boolean }) { return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className={urgent ? "urgent" : "positive"}>{!urgent && <span>↗</span>} {delta} <i>{note}</i></small></div></div>; }
