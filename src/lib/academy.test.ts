import test from 'node:test';
import assert from 'node:assert/strict';

import { averageScore, getCertificateCandidates, getStudentStatus } from './academy';

test('averageScore calculates the rounded mean for a score array', () => {
  assert.equal(averageScore([80, 90, 70]), 80);
  assert.equal(averageScore([84, 88, 90, 92]), 89);
});

test('getStudentStatus marks passing average as Lulus', () => {
  assert.equal(getStudentStatus([70, 75, 80]), 'Lulus');
  assert.equal(getStudentStatus([60, 70, 69]), 'Proses');
});

test('getCertificateCandidates returns only eligible and unissued students', () => {
  const students = [
    { id: 'a', name: 'Lulus Terbit', status: 'Lulus', certificateStatus: 'Terbit', scores: [80, 80, 80] },
    { id: 'b', name: 'Lulus Belum', status: 'Lulus', certificateStatus: 'Belum', scores: [80, 80, 80] },
    { id: 'c', name: 'Proses', status: 'Proses', certificateStatus: 'Belum', scores: [60, 60, 60] },
  ] as const;

  assert.deepEqual(getCertificateCandidates(students).map((student) => student.id), ['b']);
});
