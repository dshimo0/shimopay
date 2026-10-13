import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const documents = [
  'SPEC.md', 'AGENTS.md', 'README.md', '.project/spec-status.md',
  'docs/spec.md', 'docs/plans.md', 'docs/progress.md', 'docs/prd.md',
  'docs/architecture.md', 'docs/source-registry.md', 'docs/DEMO.md',
  'docs/business/DEMO_DELIVERY.md', 'docs/SOLANA_INTEGRATION_ASSESSMENT.md',
];
const contents = new Map();
const failures = [];
let localLinks = 0;
for (const document of documents) {
  const text = await readFile(resolve(root, document), 'utf8');
  contents.set(document, text);
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
    const target = resolve(root, dirname(document), decodeURIComponent(href));
    localLinks++;
    try { await stat(target); }
    catch { failures.push(`${document}: missing local link ${href}`); }
  }
}
function requirePattern(document, pattern, message) {
  if (!pattern.test(contents.get(document))) failures.push(`${document}: ${message}`);
}
for (let i = 1; i <= 15; i++) {
  const id = `AC-${String(i).padStart(2, '0')}`;
  requirePattern('SPEC.md', new RegExp(`^\\| ${id} \\|`, 'm'), `${id} missing from acceptance matrix`);
}
for (let i = 0; i <= 9; i++) {
  const id = `D${String(i).padStart(2, '0')}`;
  for (const document of ['docs/plans.md', 'docs/progress.md']) {
    requirePattern(document, new RegExp(`^\\| ${id} `, 'm'), `${id} missing`);
  }
}
for (let i = 1; i <= 6; i++) {
  const id = `B${String(i).padStart(2, '0')}`;
  requirePattern('docs/business/DEMO_DELIVERY.md', new RegExp(`^\\| ${id} \\|`, 'm'), `${id} missing`);
}
requirePattern('docs/spec.md', /\[SPEC\.md\]\(\.\.\/SPEC\.md\)/, 'canonical pointer missing');
for (const gate of ['GATE-CORE', 'GATE-RAILS']) {
  for (const document of ['SPEC.md', 'docs/plans.md', 'docs/progress.md']) {
    requirePattern(document, new RegExp(gate), `${gate} missing`);
  }
}
const result = {
  checkedAt: new Date().toISOString(), documents: documents.length, localLinks,
  acceptanceCriteria: 15, deliveryMilestones: 10, businessDeliverables: 6,
  failures, passed: failures.length === 0,
  scope: 'Documentation links and traceability; not financial runtime verification',
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
