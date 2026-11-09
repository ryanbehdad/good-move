import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { categories, categoryFor, parseRoute, requiresReview, escapeHtml } from '../assets/model.js';

const data = JSON.parse(await readFile(new URL('../assets/data.json', import.meta.url)));
test('all routines and exercises are present with complete image references where applicable', async () => {
  assert.equal(data.exercises.length, 37);
  assert.equal(data.routines.length, 11);
  const ids = new Set(data.exercises.map(e => e.id));
  assert.equal(ids.size, 37);
  assert.equal(new Set(data.routines.map(r => r.id)).size, 11);
  for (const e of data.exercises) {
    for (const field of ['name', 'how', 'watch', 'alternatives']) assert.ok(e[field], `${e.id}: ${field}`);
    assert.ok(e.defaultDose || e.reviewRequired, `${e.id}: dose required unless clinician review needed`);
    if (e.photo) {
      for (const field of ['url', 'source']) {
        if (e.photo.kind === 'generated') {
          assert.match(e.photo[field], /^assets\/images\/e\d{2}\.png$/);
          await readFile(new URL(`../${e.photo[field]}`, import.meta.url));
        } else assert.equal(new URL(e.photo[field]).protocol, 'https:');
      }
      assert.ok(e.photo.publisher);
    } else assert.equal(e.id, 'E35', 'Only the unspecified approved-lift step is text-only');
  }
  for (const r of data.routines) {
    assert.ok(categories[categoryFor(r.group)]);
    assert.ok(r.core.length);
    for (const item of [...r.core, ...r.optional]) assert.ok(ids.has(item.id), `${r.id}: ${item.id}`);
  }
});
test('replacement images are labelled and unspecified gym lift has no misleading image', () => {
  assert.deepEqual(data.exercises.filter(e => e.photo?.kind === 'generated').map(e => e.id), ['E04', 'E24', 'E26', 'E33']);
  const rehearsal = data.exercises.find(e => e.id === 'E35');
  assert.equal(rehearsal.photo, null);
  assert.match(rehearsal.how, /If no lift has been approved, skip this step/);
});
test('shareable links and old source links resolve, malformed hashes safely return home', () => {
  for (const r of data.routines) {
    for (const hash of [`#r/${r.id}`, `#${r.id}`, `#/r/${r.id.toLowerCase()}`]) assert.equal(parseRoute(hash, data.routines), r);
  }
  for (const hash of ['', '#routines', '#unknown', '#%E0%A4%A', '#%']) assert.equal(parseRoute(hash, data.routines), null);
});
test('approval conditions survive import and cannot be overridden by routine items', () => {
  assert.deepEqual(data.exercises.filter(e => e.reviewRequired).map(e => e.id), ['E09', 'E31', 'E32', 'E33']);
  for (const e of data.exercises.filter(e => e.reviewRequired)) assert.equal(requiresReview(e, { condition: '' }), true);
  assert.equal(requiresReview({ reviewRequired: false }, { condition: 'review' }), true);
  assert.equal(requiresReview({ reviewRequired: false, condition: '' }, { condition: '' }), false);
  for (const id of ['R04', 'R06', 'R09', 'R10', 'R11']) assert.ok(data.routines.find(r => r.id === id).safety);
});
test('text content is escaped before entering HTML', () => {
  assert.equal(escapeHtml('<a "x" & \'y\'>'), '&lt;a &quot;x&quot; &amp; &#39;y&#39;&gt;');
});
test('entry point uses relative local assets for GitHub project Pages', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const paths = [...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)].map(match => match[1]);
  assert.ok(paths.length >= 3);
  for (const path of paths) await readFile(new URL(`../${path}`, import.meta.url));
  assert.doesNotMatch(html, /(?:src|href)="\/assets\//);
});
