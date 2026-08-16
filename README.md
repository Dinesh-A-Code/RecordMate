# RecordMate

A hyperlocal student-to-student platform for coordinating help with physical
college record books. Requesters post record-writing tasks; nearby providers
can accept them, chat, and get rated once the task is complete.

**Status:** MVP under active development, built phase by phase.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT, bcrypt
- **Realtime:** Socket.IO

## Project Structure

```
recordmate/
├── client/     # React + Vite frontend
└── server/     # Express + MongoDB backend
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local install, or a free MongoDB Atlas cluster)

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env — set MONGO_URI to your local or Atlas connection string,
# and set JWT_SECRET to any long random string
npm install
npm run dev
```

The API starts on `http://localhost:5000`. Confirm it's working:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{"status":"ok","message":"RecordMate API is running"}
```

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

## Development Progress

- [x] Phase 1 — Project setup, MongoDB connection, environment config
- [ ] Phase 2 — Authentication (register/login/JWT)
- [ ] Phase 3 — User profile & mode switching
- [ ] Phase 4 — Create/list/view record requests
- [ ] Phase 5 — Nearby matching (Haversine distance)
- [ ] Phase 6 — Accept request & status transitions
- [ ] Phase 7 — Socket.IO chat
- [ ] Phase 8 — Ratings
- [ ] Phase 9 — Reporting/blocking & security hardening
- [ ] Phase 10 — Responsive UI cleanup & final testing

## API Structure

All endpoints are namespaced under `/api`:

```
/api/auth
/api/users
/api/requests
/api/conversations
/api/messages
/api/ratings
/api/reports
```

The frontend never talks to MongoDB directly — all data access goes through
these Express routes.
