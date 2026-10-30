// Adds sample posts: random fake users + placeholder photos from picsum.photos.
//   npm run seed          -> 12 sample posts
//   npm run seed -- 30    -> 30 sample posts
//   npm run seed:clear    -> removes only the sample posts
require('dotenv').config();
const mongoose = require('mongoose');
const { Post } = require('../server');

const pick = a => a[Math.floor(Math.random() * a.length)];
const adj = ['quiet', 'golden', 'wandering', 'paper', 'velvet', 'northern', 'slow', 'neon', 'hazy', 'wild'];
const noun = ['fox', 'lens', 'harbor', 'kite', 'ember', 'orchid', 'drift', 'atlas', 'moth', 'tide'];
const captions = [
  'Last light before the rain.', 'Found this corner by accident.', 'Sunday walk, no plan.',
  'Early train, empty platform.', 'Everything looks better in grain.', 'Coffee went cold. Worth it.',
  'The quiet part of the city.', 'Blue hour never gets old.', 'Took the long way home.', 'Saving this one for later.'
];
const comments = ['Love this.', 'That light!', 'Where was this taken?', 'Saving this.', 'So calm.', 'Great frame.'];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  await Post.init();

  if (process.argv.includes('--clear')) {
    const r = await Post.deleteMany({ seeded: true });
    console.log(`Removed ${r.deletedCount} sample posts`);
    return;
  }

  const count = parseInt(process.argv.find(a => /^\d+$/.test(a)), 10) || 12;
  let added = 0;
  for (let i = 0; i < count; i++) {
    const seed = Math.random().toString(36).slice(2, 10);
    const res = await fetch(`https://picsum.photos/seed/${seed}/800/800`);
    if (!res.ok) { console.warn('Skipped one photo:', res.status); continue; }
    const data = Buffer.from(await res.arrayBuffer());
    const created = new Date(Date.now() - Math.random() * 7 * 864e5);
    await Post.create({
      username: `${pick(adj)}_${pick(noun)}${Math.floor(Math.random() * 90 + 10)}`,
      caption: pick(captions),
      image: { data, contentType: res.headers.get('content-type') || 'image/jpeg' },
      likes: Math.floor(Math.random() * 120),
      comments: Math.random() < 0.5 ? [] : [{ username: `${pick(adj)}_${pick(noun)}${Math.floor(Math.random() * 90 + 10)}`, text: pick(comments) }],
      seeded: true,
      createdAt: created, updatedAt: created
    });
    added++; process.stdout.write('.');
  }
  console.log(`\nAdded ${added} sample posts`);
}

main().catch(e => { console.error('Seed failed:', e.message); process.exitCode = 1; })
      .finally(() => mongoose.disconnect());
