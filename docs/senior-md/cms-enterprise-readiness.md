# CMS enterprise readiness (target state)

This doc defines what **production-grade / enterprise** means for **this** codebase’s CMS surface (`/admin/*`, `features/cms/*`, `app/api/admin/*`) and how to close gaps **incrementally**. It aligns with `engineering-standards.md`, `scalability-and-operations.md`, and `testing-strategy.md`.

## 1) Pillars (definition of “enterprise-ready” here)

| Pillar                     | Meaning in-repo                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Security & governance**  | RBAC enforced on routes + middleware; secrets server-only; dangerous mutations audited (**Checklog**); uploads validated (type, size, path).                                                           |
| **Contract reliability**   | Admin APIs return stable JSON + `lib/api/responses` envelope; **automated tests** for authz + validation + happy paths on critical routes.                                                             |
| **Observability**          | Errors logged with **operation context** (no secrets); **`x-request-id`** on `/api/admin/*` plus **`logRouteError`** on admin error paths and **`request_id`** on Checklog rows / insert-failure logs. |
| **Operational discipline** | CI runs **lint + type-check + tests**; env validated at boot (`lib/env.ts`); deployment/runbooks exist under `docs/senior-md/`.                                                                        |
| **Data integrity**         | Multi-write flows ideally **transactional** where correctness requires it (posts/tags noted as gap).                                                                                                   |

## 2) Current maturity (honest snapshot)

**Strong**

- Central admin HTTP client (`lib/admin/admin-fetch.ts`), shared error parsing, Checklog for admin mutations, rate limits on APIs, sanitize parity for post HTML.
- Screen audit: `docs/senior-md/cms-screen-audit.md`.
- Contract tests: critical **`app/api/admin/*`** routes + **`lib/api/request-id`** (see `current-system-state.md` **Known Remaining Gaps** for the live list).

**Gaps (must plan work)**

- Broad **admin route test coverage** still incomplete (`tags`/`fields` CRUD, `comments`, etc.) — see `current-system-state.md` **Known Remaining Gaps** for Vitest inventory.
- **Reorder / huge categories**: **`for_reorder=1`** + **`category_id`** allows **`limit` up to 500** on `GET /api/admin/posts`; beyond that still needs paging or a dedicated reorder API.
- **Transactional** multi-step mutations (post + tags) — DB-level transactions/RPC when business rules demand atomicity.

## 3) Phased roadmap (recommended order)

**Phase A — Safety net (highest ROI)** — _substantially in progress_

1. Expand **`app/api/admin/**/\*.test.ts`** — done for: **`GET /api/admin/posts`** (incl. **`for_reorder` / category / limit`**), **`GET /api/admin/me`**, **`POST /api/admin/upload`**, **`PATCH /api/admin/reorder`**, **`GET` + `PATCH` + `DELETE /api/admin/posts/[id]`**, **`GET /api/admin/users`**, **`GET /api/admin/posts/check-slug`**, **`lib/api/request-id`\*\* (`logRouteError`). Remaining: other CRUD routes as needed.
2. Keep **`npm run validate`** green in CI for default branch / PRs.

**Phase B — Operability** — _started_

3. **Request correlation:** `/api/admin/*` middleware sets and forwards **`x-request-id`** (`lib/api/request-id.ts`, `middleware.ts`). **`logRouteError`** attaches the id to admin-route **`console.error`**; successful CMS **`logAdminChecklogEvent`** rows already store **`request_id`**; checklog insert failures log **`request_id`** when known.
4. Define **SLO-style checks**: rate-limit alerts, integration dashboard (`/integrations`) as operational smoke page.

**Phase C — Scale / correctness** — _partial_

5. **Reorder post list:** `GET /api/admin/posts` supports **`category_id`** and **`for_reorder=1`** (requires category) with **`limit` up to 500**; `ReorderClient` uses that pair. Categories with **>500** posts still need paging or a dedicated reorder API later.
6. **DB transactions** for coupled writes when product rules require atomicity.

## 4) What we do _not_ claim

“Enterprise” is not a single PR: it is **evidence** (tests, runbooks, monitoring, incident process). This repo already has runbooks; closing **Phase A + B** typically moves a team from “shipping” to “operationally defensible.”

## 5) References

- `docs/senior-md/cms-screen-audit.md` — screen/API mapping.
- `docs/senior-md/current-system-state.md` — live behavior snapshot.
- `docs/senior-md/testing-strategy.md` — where tests live.

### Testing note

`app/api/admin/upload/route.test.ts` uses **`@vitest-environment node`** so `File` + multipart bodies behave like Node/web APIs; jsdom’s `File` can fail `instanceof File` checks inside the upload handler.
