import test from "node:test";
import assert from "node:assert/strict";

import { createBackup, parseBackup } from "./data-tools";
import { defaultSettings } from "./settings";
import { defaultSubjects } from "./subjects";
import { defaultTemplate } from "./template";

test("backup round-trip preserves application data", () => {
  const backup = createBackup({ students: [], subjects: defaultSubjects, institution: defaultSettings, template: defaultTemplate });
  const restored = parseBackup(JSON.stringify(backup));
  assert.equal(restored.version, 1);
  assert.equal(restored.subjects.length, defaultSubjects.length);
  assert.equal(restored.institution.passingGrade, 70);
});

test("invalid backup is rejected", () => {
  assert.throws(() => parseBackup('{"version":2}'), /tidak valid/);
});
