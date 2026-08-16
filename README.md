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
the# RecordMate

RecordMate is a hyperlocal student-to-student platform that connects students who need help completing physical college record books with nearby students who can take those requests.

The platform supports two roles:

- **Requester** — creates and manages record-writing requests.
- **Provider** — discovers nearby requests, accepts tasks, and updates their progress.

**Status:** MVP under active development.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **Realtime:** Socket.IO

## Current Features

- User registration and login
- JWT-based authentication
- User profile management
- Requester / Provider mode switching
- Location updates using browser Geolocation API
- Create and manage record requests
- Request cancellation
- Nearby request matching using Haversine distance
- Same-college / all-nearby filtering
- Sort by distance, payment, or deadline
- Request acceptance by providers
- Atomic request acceptance to prevent double assignment
- Task status workflow:
  - OPEN
  - ACCEPTED
  - IN_PROGRESS
  - COMPLETED
  - CANCELLED
- Provider's accepted task list
- Real-time Socket.IO notifications
- Real-time request availability updates
- Toast notifications
- Editorial UI design system

## Development Progress

- [x] Phase 1 — Project setup and foundation
- [x] Phase 2 — Authentication
- [x] Phase 3 — User profile, mode switching and location
- [x] Phase 4 — Record request creation, listing, viewing and cancellation
- [x] Phase 5 — Nearby request matching
- [x] Phase 6 — Request acceptance and task status workflow
- [x] Phase 7 — Real-time updates with Socket.IO
- [ ] Phase 8 — Editorial UI redesign
  - [x] Part 1 — Global editorial design system
  - [ ] Part 2 — Authentication and profile UI
  - [ ] Part 3 — Requester dashboard
  - [ ] Part 4 — Requester request pages
  - [ ] Part 5 — Provider dashboard
  - [ ] Part 6 — Provider request and task pages
  - [ ] Part 7 — Responsive polish and regression testing

## Project Structure

```text
recordmate/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── socket.js
│
└── README.md
