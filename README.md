# Backend Intern Assignment — Task Manager API

A REST API with JWT authentication, role-based access control (user/admin),
and full CRUD on a `tasks` entity — plus a small React frontend to exercise it.

## Stack
- **Backend:** Node.js, Express, MySQL (mysql2), JWT, bcryptjs
- **Frontend:** React (Vite), React Router
- **Docs:** Swagger / OpenAPI (swagger-jsdoc + swagger-ui-express)

## Project Structure
```
backend/
  src/
    config/       # DB pool + Swagger config
    models/       # raw SQL queries (User, Task)
    middleware/    # JWT auth, role check, error handler
    controllers/   # request handlers
    routes/        # route definitions + Swagger annotations
    utils/         # input validation rules
    app.js         # Express app (middleware + routes)
    server.js      # entry point
  schema.sql        # MySQL schema
  Dockerfile
  .env.example
frontend/
  src/
    pages/         # Login, Register, Dashboard
    api/client.js  # fetch wrapper, attaches JWT
    AuthContext.jsx
  Dockerfile
  nginx.conf        # serves the built React app + proxies /api to backend
docker-compose.yml   # spins up MySQL + backend + frontend together
```

## Setup

### 1. Database
```bash
mysql -u root -p < backend/schema.sql
```
This creates the `intern_assignment` database with `users` and `tasks` tables.

### 2. Backend
```bash
cd backend
cp .env.example .env    # fill in DB_PASSWORD and JWT_SECRET
npm install
npm run dev              # http://localhost:5000
```
Swagger docs: **http://localhost:5000/api-docs**
Health check: **http://localhost:5000/health**

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

### Option: Run everything with Docker
No need to install MySQL/Node locally — this spins up MySQL, the backend, and
the frontend (served via nginx) together:
```bash
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000 (Swagger at http://localhost:5000/api-docs)
- MySQL: exposed on localhost:3306, schema auto-loaded from `backend/schema.sql` on first run

Optionally set your own secrets before running:
```bash
export DB_PASSWORD=your_password
export JWT_SECRET=your_long_random_secret
docker compose up --build
```
To reset the database completely: `docker compose down -v`

## API Overview

| Method | Endpoint                | Auth        | Description                     |
|--------|--------------------------|-------------|----------------------------------|
| POST   | /api/v1/auth/register    | Public      | Register a new user              |
| POST   | /api/v1/auth/login       | Public      | Log in, returns JWT              |
| GET    | /api/v1/auth/me          | JWT         | Current user profile             |
| GET    | /api/v1/tasks            | JWT         | List tasks (own, or all if admin)|
| POST   | /api/v1/tasks            | JWT         | Create a task                    |
| GET    | /api/v1/tasks/:id        | JWT         | Get one task                     |
| PUT    | /api/v1/tasks/:id        | JWT, owner/admin | Update a task               |
| DELETE | /api/v1/tasks/:id        | JWT, owner/admin | Delete a task                |

All responses follow `{ success, data | message | errors }`. Full request/response
schemas are in Swagger UI (`/api-docs`) — import that as a Postman collection too
via **File > Import > Link** using `/api-docs.json` if a raw OpenAPI JSON is needed.

## Security Notes
- Passwords hashed with bcrypt (10 salt rounds), never stored or returned in plaintext.
- JWT signed with a server-side secret, sent via `Authorization: Bearer <token>`, 1-day expiry (configurable).
- `helmet` for secure HTTP headers, `express-rate-limit` for basic abuse protection.
- All input validated with `express-validator` before touching the DB.
- Ownership checks on tasks: a normal `user` can only read/update/delete their own
  tasks; `admin` can act on all tasks (see `taskController.js`).
- Parameterized SQL queries throughout (`mysql2` placeholders) — no string-concatenated SQL, so no SQL injection surface.

## Scalability Note
- **Connection pooling** is already used (`mysql2.createPool`) instead of a single connection, so concurrent requests don't block on one connection.
- **Pagination** is built into `GET /tasks` (`page`, `limit`) so listing endpoints don't return unbounded result sets as data grows.
- **Stateless auth (JWT)** means the API has no server-side session store, so it can be horizontally scaled behind a load balancer without sticky sessions.
- **Next steps for scale:** add Redis for caching hot reads (e.g. task lists) and for a shared rate-limit store across instances; move to a managed MySQL with read replicas if reads dominate; containerize with Docker and run multiple API instances behind Nginx/a load balancer; consider splitting `auth` and `tasks` into separate services if either grows independently (microservices) once there's a real reason to.

## Testing the RBAC quickly
1. Register a `user` and an `admin` (role dropdown on the Register page, or `role: "admin"` in the API body).
2. Create a couple of tasks as the `user`.
3. Log in as `admin` — the task list will show tasks from *all* users, while a plain `user` only ever sees their own.
