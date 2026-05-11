# CMS screen audit (vs inventory)

Operational checklist against `current-system-state.md` → **CMS inventory**. Last pass: 2026-05-11.

### UX / i18n quick checks (C)

| Check                                                                     | Status                             |
| ------------------------------------------------------------------------- | ---------------------------------- |
| Sidebar brand matches public site (`site.brand`), not hardcoded VI string | Done                               |
| “Về site” / Back link: no duplicate arrow (icon + `←` in copy)            | Done earlier                       |
| Back link has explicit `aria-label` (`sidebar.backToSite`)                | Done                               |
| Admin strings live under `messages/admin/*`; site name under `site.*`     | Pattern enforced for sidebar brand |

| Screen / area         | Route / entry                                 | Client / server                   | Admin APIs used                                                      | Status                                                                                |
| --------------------- | --------------------------------------------- | --------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Admin shell           | `admin/layout.tsx`, `AdminSidebar.tsx`        | Client sidebar + layout wrapper   | —                                                                    | OK — nav groups; **brand** from `site` i18n (`site.brand`), not hardcoded             |
| Admin home            | `/admin` → redirect                           | RSC `redirect` → `/admin/posts`   | —                                                                    | OK                                                                                    |
| Posts list            | `/admin/posts`                                | RSC + `AdminPostsClient`          | `GET /api/admin/posts` (client list), `DELETE /api/admin/posts/[id]` | OK — filters client + `adminFetchJson`; composer `?compose=1` preserved in URL helper |
| Post edit (full page) | `/admin/posts/[id]/edit`                      | RSC + editor stack                | `PATCH/DELETE /api/admin/posts/[id]`, `check-slug`, `upload`         | OK                                                                                    |
| Books                 | `/admin/books`                                | `AdminBooksClient`                | `GET/PATCH/POST /api/admin/books`, `DELETE .../[id]`                 | OK                                                                                    |
| Fields                | `/admin/fields`                               | `AdminFieldsClient`               | `GET/PATCH/POST /api/admin/fields`, `check-slug`, `DELETE`           | OK                                                                                    |
| Categories            | `/admin/categories`                           | Parallel load fields + categories | Same pattern + `check-slug`                                          | OK                                                                                    |
| Tags                  | `/admin/tags`                                 | Client CRUD                       | Tags routes + `check-slug`                                           | OK                                                                                    |
| Reorder               | `/admin/reorder`                              | `ReorderClient`                   | `GET` fields/categories/posts, `PATCH /api/admin/reorder`            | OK — posts use **`for_reorder=1`** + **`limit=500`** scoped by **`category_id`**      |
| About (author CMS)    | `/admin/about/edit`                           | `AuthorEditorForm`                | `PUT /api/admin/author`                                              | OK                                                                                    |
| Composer (new post)   | Launcher from posts hero                      | Modal + split workspace           | `POST /api/admin/posts`, `upload`                                    | OK                                                                                    |
| Related admin UIs     | `/checklog`, `/integrations`, `/architecture` | Separate features                 | `checklog`, `integrations-status`                                    | OK — linked from sidebar                                                              |

**Shared library**

| Module                                       | Role                                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `lib/admin/admin-fetch.ts`                   | `adminFetch`, `adminFetchJson`, `adminFetchFormDataJson` — all `/api/admin` JSON + multipart→JSON upload |
| `lib/admin/parse-admin-api-error.ts`         | Standard error envelope                                                                                  |
| `lib/admin/normalize-post-from-json.ts`      | Admin post table dates                                                                                   |
| `lib/admin/replace-path-query-preserving.ts` | List URL without RSC refetch; keeps `compose`                                                            |

**Gaps / follow-ups (not blocking)**

- Expand route-level tests for remaining `app/api/admin/*` (fields/tags/categories CRUD, etc.).
- Reorder: categories with **>500** posts still need paging or a dedicated reorder API.

**Fix applied during audit (2026-05-11)**

- `GET /api/admin/posts`: `page` query omitted must parse as `undefined`, not `null`, so `PaginationSchema` does not return 400 for a valid bare list request (tests lock this in).

**Enterprise pass (2026-05-11)**

- **`category_id`** on `GET /api/admin/posts` + reorder UI uses server-side filter.
- **`x-request-id`** on `/api/admin/*` middleware path.
- Vitest: reorder, **`PATCH` posts by id**, users, check-slug, upload, posts list + **`for_reorder`**, `logRouteError` (see `current-system-state.md`).
