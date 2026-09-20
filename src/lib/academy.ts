export type StudentLike = {
  id?: string;
  scores?: number[] | readonly number[];
  status?: 'Lulus' | 'Proses';
  certificateStatus?: 'Terbit' | 'Belum';
};

export function averageScore(scores: number[] | readonly number[]): number {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

export function getStudentStatus(scores: number[] | readonly number[]): 'Lulus' | 'Proses' {
  return averageScore(scores) >= 70 ? 'Lulus' : 'Proses';
}

export function getCertificateCandidates<T extends StudentLike & { id?: string }>(students: readonly T[]) {
  return students.filter((student) => {
    const scoreAverage = averageScore(student.scores ?? []);
    return student.status === 'Lulus' && student.certificateStatus !== 'Terbit' && scoreAverage >= 70;
  });
}
