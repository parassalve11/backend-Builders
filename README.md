# ॠKABH Backend

Node.js, Express, and MongoDB API for ॠKABH's construction professional discovery, lead management, verification, and project workflows.

## Run locally

Requirements: Node.js 20+ and MongoDB (local or Atlas).

```bash
npm install
copy .env.example .env
npm run seed
npm run dev
```

For local MongoDB through Docker Desktop:

```bash
docker compose up -d
npm run dev
```

The included container is bound only to `127.0.0.1:27018` (avoiding common local port conflicts) and persists development data in a named Docker volume. For Atlas, replace `MONGODB_URI` in `.env` with the Atlas connection string instead.

On macOS/Linux, use `cp .env.example .env`. The API defaults to `http://localhost:5000/api`; the frontend should use:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Set a strong `JWT_SECRET` before using admin authentication. Production startup rejects secrets shorter than 32 characters.

Before running the seed, set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ENGINEER_EMAIL`, and `SEED_ENGINEER_PASSWORD`. Both passwords must contain at least 12 characters with upper/lowercase letters, a number, and a symbol. The seed refuses to run without them; there are no hardcoded login credentials.

The seed is idempotent: it updates the demo records and never clears a collection. It creates:

- an admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`;
- Yavatmal, Nagpur, and Amravati;
- three anonymous verified engineer profiles, with portal credentials from `SEED_ENGINEER_EMAIL` / `SEED_ENGINEER_PASSWORD` assigned to `ENG-YVT-01`;
- approved portfolio samples and a customer-safe project view at `KABH-PROJ-0102`.

Keep seed credentials out of source control and rotate them before a production launch.

## Deploy on Render

Create a MongoDB Atlas database, allow the Render service's outbound IP addresses in
the Atlas IP access list, and set these environment variables on the Render web service:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/rkabh?retryWrites=true&w=majority
JWT_SECRET=replace-with-at-least-32-random-characters
FRONTEND_URL=https://your-frontend.example
```

`MONGODB_URL` is accepted as a backwards-compatible alias, but `MONGODB_URI` is the
canonical name. Production must not point to `localhost` or `127.0.0.1`, because those
addresses refer to the Render instance itself. After saving the variables, redeploy the
service.

## Privacy boundary

Public routes never return a Mongoose engineer document. They use:

1. safe-field query projections;
2. explicit public DTO allowlists;
3. approval flags for portfolio, reviews, projects, stages, and photos;
4. contact-pattern redaction for approved free text.

Names, phone numbers, emails, exact addresses, documents, employee IDs, cost details, emergency contacts, and internal notes are excluded from public responses. Their schema fields are also `select: false` where applicable. Admin controllers opt into those fields only after JWT authorization.

When adding a public field, add it intentionally to the relevant projection and serializer, then extend the privacy tests.

## Response format

Successful responses follow:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

Errors follow:

```json
{
  "success": false,
  "message": "Request validation failed",
  "errors": [{ "location": "body", "path": "phone", "message": "..." }]
}
```

## Public API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API and database state |
| GET | `/api/cities` | Active service cities |
| GET | `/api/engineers` | Filtered, paginated anonymous directory |
| GET | `/api/engineers/:code` | Anonymous profile and approved portfolio |
| POST | `/api/leads` | General quote or engineer request |
| GET | `/api/projects/:projectCode/public` | Approved project and stage updates |
| GET | `/api/reviews/engineer/:code` | Approved engineer reviews |

Engineer list filters: `search`, `city`, `specialization`, `engineerType`, `availability`, `minRating`, `minExperience`, `minRate`, `maxRate`, `sort`, `page`, and `limit`. Sort values are `rating`, `experience`, `projects`, `rate_low`, and `newest`.

General quote example:

```json
{
  "customerName": "Rahul Patil",
  "phone": "+91 98765 43210",
  "email": "rahul@example.com",
  "city": "Yavatmal",
  "projectType": "Residential",
  "projectDetails": "Build a two-storey family home.",
  "approximateArea": 2200,
  "budgetRange": "₹35–45 lakh",
  "preferredStartDate": "2026-11-01",
  "source": "quote",
  "consentToContact": true
}
```

For a selected engineer, add `"engineerCode": "ENG-YVT-01"`. The backend verifies that the code belongs to an active verified engineer. `consentToContact` must explicitly be `true`; both public forms present required contact-consent wording before submission.

The lead receipt contains only:

```json
{
  "success": true,
  "data": { "leadCode": "KABH-LD-2026-ABC123", "status": "new" }
}
```

## Admin API

Login with `POST /api/admin/auth/login`, then send:

```http
Authorization: Bearer <token>
```

| Area | Routes |
| --- | --- |
| Auth | `POST /admin/auth/login`, `GET /admin/auth/me`, `POST /admin/auth/logout` |
| Dashboard | `GET /admin/dashboard` |
| Engineers | list/get/create/update, status, availability, portal access, and soft-delete under `/admin/engineers` |
| Portfolio | list/create at `/admin/engineers/:id/portfolio`; update/delete at `/admin/portfolios/:id` |
| Leads | list/get/update and `/admin/leads/:id/assign-engineer` |
| Projects | list/get/create/update and nested stage/estimate creation |
| Stages | `POST /admin/projects/:id/stages`, `PUT /admin/projects/:id/stages/:stageId` |
| Estimates | `POST /admin/projects/:id/estimates`, `PUT /admin/estimates/:id` |
| Verification | list, engineer upsert, and update under `/admin/verifications` |
| Documents | all/list/create/update/delete under `/admin/documents` and engineer nesting |
| Performance | list/get/upsert under `/admin/performance` and engineer nesting |
| Reviews | list/create/update/delete under `/admin/reviews` |
| Cities | list/create/update/deactivate under `/admin/cities` |

`DELETE /api/admin/engineers/:id` is deliberately recoverable: it deactivates the engineer and makes them unavailable instead of erasing linked history.

Provision or reset an engineer login as a `superadmin` or `admin`:

```http
PUT /api/admin/engineers/:id/portal-access
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "engineer@example.com",
  "password": "UniquePortalPass1!"
}
```

The password must be 12–128 characters and include uppercase, lowercase, number, and symbol characters. A reset increments the engineer's token version, immediately revoking existing engineer sessions. Passwords and hashes are never returned. The response data is limited to:

```json
{
  "engineerId": "...",
  "pseudonymCode": "ENG-YVT-01",
  "portalAccess": {
    "enabled": true,
    "canLogin": true,
    "email": "engineer@example.com",
    "lastLoginAt": null,
    "sessionsRevoked": false
  }
}
```

## Engineer portal API

Login with `POST /api/engineer/auth/login`, then send the returned token as `Authorization: Bearer <token>`. Engineer tokens use a separate `rkabh-engineer` JWT audience and cannot be used on admin routes (or vice versa).

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/engineer/auth/login` | Login with the seeded engineer email/password |
| GET | `/api/engineer/auth/me` | Current engineer account |
| POST | `/api/engineer/auth/logout` | Revoke all existing tokens for the engineer |
| GET | `/api/engineer/dashboard` | Own summary, recent projects/opportunities, and performance |
| GET | `/api/engineer/profile` | Own private profile |
| PATCH | `/api/engineer/profile/availability` | Set `available`, `limited`, or `unavailable` |
| GET | `/api/engineer/projects` | Paginated assigned projects with stages |
| GET | `/api/engineer/opportunities` | Paginated relevant/assigned requests without customer identity or contact |
| GET | `/api/engineer/performance` | Own performance metrics |

`projects` and `opportunities` accept `page` and `limit`; each also accepts its corresponding `status` value. Scope is always derived from the authenticated engineer ID, never from a request parameter. Opportunity responses include city, type, area, dates, and a contact-redacted project brief; customer name, phone, email, budget, and admin notes remain behind the admin introduction workflow. Once a project is assigned, its customer contact and exact site location are available to that engineer for delivery, while cost fields, admin ownership/remarks, delay reasons, and internal notes remain excluded.

## Security controls

- bcrypt password hashing, expiring HS256 JWTs with issuer/audience checks, and token-version revocation on logout;
- Helmet, explicit CORS allowlist, rate limits, and request-size limits;
- Zod allowlist validation (unknown request fields are stripped);
- rejection of Mongo operator/dotted-key payloads;
- non-PII request logging (paths only; no query strings or bodies);
- generic production errors and protected document URLs;
- public DTO privacy tests.

SMTP is optional. When configured, a new lead sends the admin an email. Missing SMTP or delivery failure never loses the lead and never exposes PII in logs.

## Quality checks

```bash
npm run check
npm test
```

The tests cover engineer identity leakage, project/customer leakage, public content redaction, unapproved content, lead formats, unknown-field stripping, and Mongo operator rejection.
