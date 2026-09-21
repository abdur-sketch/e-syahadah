import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCsv } from './admin';

test('CSV escapes quotes, preserves Unicode, and blocks spreadsheet formulas', () => {
  const csv = buildCsv([['Nama', 'Nilai'], ['أحمد "فوزان"', 84], ['=HYPERLINK("evil")', 90]]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /"أحمد ""فوزان""","84"/);
  assert.match(csv, /"'=HYPERLINK\(""evil""\)","90"/);
});
