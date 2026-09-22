export type StudentLike = {
  id?: string;
  scores?: number[] | readonly number[];
  status?: 'Lulus' | 'Proses';
  certificateStatus?: 'Terbit' | 'Validasi' | 'Belum';
};

export function averageScore(scores: number[] | readonly number[]): number {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

export function getStudentStatus(scores: number[] | readonly number[], passingGrade = 70): 'Lulus' | 'Proses' {
  return averageScore(scores) >= passingGrade ? 'Lulus' : 'Proses';
}

export function getCertificateCandidates<T extends StudentLike & { id?: string }>(students: readonly T[], passingGrade = 70) {
  return students.filter((student) => {
    const scoreAverage = averageScore(student.scores ?? []);
    return student.status === 'Lulus' && student.certificateStatus !== 'Terbit' && scoreAverage >= passingGrade;
  });
}

export function certificateValidationIssues(student: StudentLike & { name?: string; arabicName?: string; nisn?: string; birthPlace?: string; birthDate?: string }, passingGrade = 70): string[] {
  const issues: string[] = [];
  if (!student.name?.trim() || !student.arabicName?.trim()) issues.push('nama Latin dan Arab');
  if (!student.nisn?.trim()) issues.push('NISN');
  if (!student.birthPlace?.trim() || !student.birthDate?.trim()) issues.push('tempat dan tanggal lahir');
  if (student.scores?.length !== 11 || student.scores.some((score) => !Number.isFinite(score) || score < 1 || score > 100)) issues.push('11 nilai mata pelajaran');
  if (student.status !== 'Lulus' || averageScore(student.scores ?? []) < passingGrade) issues.push(`kelulusan (rata-rata minimal ${passingGrade})`);
  return issues;
}
