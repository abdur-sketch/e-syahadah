import test from 'node:test';
import assert from 'node:assert/strict';

import { averageScore, certificateValidationIssues, getCertificateCandidates, getStudentStatus } from './academy';

test('averageScore calculates the rounded mean for a score array', () => {
  assert.equal(averageScore([80, 90, 70]), 80);
  assert.equal(averageScore([84, 88, 90, 92]), 89);
});

test('getStudentStatus marks passing average as Lulus', () => {
  assert.equal(getStudentStatus([70, 75, 80]), 'Lulus');
  assert.equal(getStudentStatus([60, 70, 69]), 'Proses');
  assert.equal(getStudentStatus([75, 76, 77], 80), 'Proses');
  assert.equal(getStudentStatus([80, 82, 84], 80), 'Lulus');
});

test('getCertificateCandidates returns only eligible and unissued students', () => {
  const students = [
    { id: 'a', name: 'Lulus Terbit', status: 'Lulus', certificateStatus: 'Terbit', scores: [80, 80, 80] },
    { id: 'b', name: 'Lulus Belum', status: 'Lulus', certificateStatus: 'Belum', scores: [80, 80, 80] },
    { id: 'c', name: 'Proses', status: 'Proses', certificateStatus: 'Belum', scores: [60, 60, 60] },
  ] as const;

  assert.deepEqual(getCertificateCandidates(students).map((student) => student.id), ['b']);
});

test('certificate validation requires identity, full scores, and passing result', () => {
  const valid = { name: 'Ahmad', arabicName: 'أحمد', nisn: '123', birthPlace: 'Jakarta', birthDate: '2006-01-01', status: 'Lulus' as const, scores: Array(11).fill(80) };
  assert.deepEqual(certificateValidationIssues(valid), []);
  assert.deepEqual(certificateValidationIssues({ ...valid, scores: [80, 80, 0] }), ['11 nilai mata pelajaran', 'kelulusan (rata-rata minimal 70)']);
  assert.deepEqual(certificateValidationIssues(valid, 85), ['kelulusan (rata-rata minimal 85)']);
});
