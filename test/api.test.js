// Start the server first (npm start), then in another terminal: npm test
const { test } = require('node:test');
const assert = require('node:assert');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const H = { 'Content-Type': 'application/json' };
let id;

test('CREATE: upload a photo', async () => {
  const fd = new FormData();
  fd.append('username', 'tester'); fd.append('caption', 'first test photo');
  fd.append('photo', new Blob([PNG], { type: 'image/png' }), 'dot.png');
  const r = await fetch(BASE + '/api/posts', { method: 'POST', body: fd });
  assert.strictEqual(r.status, 201); id = (await r.json())._id; assert.ok(id);
});
test('READ: post is in the feed and image is served', async () => {
  const feed = await (await fetch(BASE + '/api/posts')).json();
  assert.ok(feed.some(p => p._id === id));
  const img = await fetch(`${BASE}/api/posts/${id}/image`);
  assert.strictEqual(img.headers.get('content-type'), 'image/png');
});
test('UPDATE: caption, like, comment', async () => {
  const u = await (await fetch(`${BASE}/api/posts/${id}`, { method: 'PUT', headers: H, body: JSON.stringify({ caption: 'edited' }) })).json();
  assert.strictEqual(u.caption, 'edited');
  const l = await (await fetch(`${BASE}/api/posts/${id}/like`, { method: 'POST' })).json();
  assert.strictEqual(l.likes, 1);
  const c = await (await fetch(`${BASE}/api/posts/${id}/comments`, { method: 'POST', headers: H, body: JSON.stringify({ username: 'a', text: 'nice' }) })).json();
  assert.strictEqual(c.length, 1);
});
test('INDEX: feed query uses an index scan', async () => {
  const e = await (await fetch(BASE + '/api/demo/explain')).json();
  assert.match(e.winningPlan, /IXSCAN/);
});
test('PROFILE: user stats and creators list', async () => {
  const users = await (await fetch(BASE + '/api/users')).json();
  assert.ok(Array.isArray(users));
  const profile = await (await fetch(BASE + '/api/users/tester')).json();
  assert.strictEqual(profile.username, 'tester');
  assert.strictEqual(profile.postCount, 1);
  assert.strictEqual(profile.totalLikes, 1);
  assert.strictEqual(profile.totalComments, 1);
});
test('VALIDATION: rejects upload without a photo', async () => {
  const fd = new FormData(); fd.append('username', 'tester');
  assert.strictEqual((await fetch(BASE + '/api/posts', { method: 'POST', body: fd })).status, 400);
});
test('DELETE: removes the post', async () => {
  assert.strictEqual((await fetch(`${BASE}/api/posts/${id}`, { method: 'DELETE' })).status, 200);
  assert.strictEqual((await fetch(`${BASE}/api/posts/${id}/image`)).status, 404);
});
