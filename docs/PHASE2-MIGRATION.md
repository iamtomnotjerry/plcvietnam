# Phase 2 — Production migration (outline)

This project currently uses **mock-first** data and auth (in-memory users, SHA256 mock passwords, reset tokens in memory, `MockProvider` for posts/comments). To move to production, plan the following layers (no implementation in this phase unless requested).

## Users and authentication

- Persist users in **PostgreSQL** (Prisma or Drizzle) or **Supabase** with the NextAuth **database adapter**.
- Replace mock password hashing with **bcrypt** or **argon2**; enforce password policy and rate limiting on register/login/reset.
- **Email verification** on sign-up and **password reset** via time-limited tokens in a `password_reset_tokens` table with TTL; send mail through **Resend**, **Postmark**, or SMTP.
- Optional: OAuth-only in production and disable Credentials provider.

## CMS and content

- Implement `ContentRepository` for **`SupabaseProvider`** (or Prisma) with row-level security or application-level checks keyed by `user_id`.
- Store **draft/published** status and revisions in the database; use a real **slug uniqueness** constraint per category (or globally, depending on URL strategy).
- Add **media uploads** (S3, R2, or Supabase Storage) and optional rich text (Tiptap, MDX).

## Comments

- Move comments from in-memory maps to a **comments** table; keep `GET`/`POST` API shapes stable for the client.

## Ops

- **Secrets** in env (never commit); **HTTPS** everywhere; monitor failed logins and consider CAPTCHA on auth endpoints.

This file is a roadmap only; Phase 1 mock behavior remains the source of truth until the above is implemented.
