# Frame: Instagram-like photo app on MongoDB

Node.js + Express + Mongoose backend, plain HTML/JS frontend. Photos are stored inside MongoDB (binary data in the `posts` collection).

## Run locally
```bash
npm install
cp .env.example .env      # paste your MongoDB connection string into MONGODB_URI
npm start                 # http://localhost:3000
npm test                  # second terminal, server running
```

## How it covers each requirement
| Requirement | Where |
|---|---|
| Backend with MongoDB | `server.js` (Express + Mongoose, `posts` collection) |
| CRUD | Create `POST /api/posts`, Read `GET /api/posts`, Update `PUT /api/posts/:id` plus `$inc` likes and `$push` comments, Delete `DELETE /api/posts/:id` |
| Queries and indexes | `createdAt` (feed), `username + createdAt` (compound), text index on `caption`. Feed query skips photo bytes with `.select('-image.data')`. Proof at `/api/demo/indexes` and `/api/demo/explain` (look for `IXSCAN`) |
| Replication | Atlas clusters are 3-node replica sets. Show it live at `/api/demo/replication` (set name, primary, members). Locally: `mongod --replSet rs0`, then `rs.initiate()` |
| Backup | `scripts/backup.sh` (`mongodump`), restore with `mongorestore`. Atlas Cloud Backup snapshots on paid tiers |
| Deployment and testing | Render or Railway: build `npm install`, start `npm start`, env var `MONGODB_URI`. Vercel works via `vercel.json` but uploads are capped near 4.5 MB. Tests in `test/api.test.js` |

## Atlas checklist
1. Database Access: create a user. Network Access: allow your IP (or 0.0.0.0/0 for the demo).
2. Put the connection string in `MONGODB_URI`, and add the same variable in your host's dashboard.
3. Never commit `.env`.

## Sample data
`npm run seed` adds 12 placeholder posts (random fake usernames, photos from picsum.photos, so it needs internet). Use `npm run seed -- 30` for more and `npm run seed:clear` to remove only the sample posts. The "Frame is in beta" banner in `public/index.html` also uses picsum.photos images.
