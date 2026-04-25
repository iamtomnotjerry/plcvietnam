# Supabase Database

## Quick Start

### 1. Tạo Supabase Project

Truy cập https://supabase.com/dashboard và tạo project mới tên `plcvietnam-blog`.

### 2. Link Project

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Push Migrations

```bash
npx supabase db push
```

### 4. Generate Types

```bash
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

### 5. Configure Environment

Cập nhật `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATA_PROVIDER=supabase
```

---

## Migrations

### Current Migrations

1. **20260425053315_initial_schema.sql** - Database schema
   - Tables: profiles, fields, categories, tags, posts, comments, books, author_info
   - RLS policies
   - Triggers for auto-update counts

2. **20260425053404_seed_data.sql** - Sample data
   - Fields: PLC, SCADA, Siemens, HMI
   - Categories: PLC Cơ Bản, PLC Nâng Cao, etc.
   - Tags: Ladder Logic, TIA Portal, etc.

### Create New Migration

```bash
npx supabase migration new migration_name
```

---

## Database Schema

```
auth.users (Supabase Auth)
  └── profiles (1:1)
       └── posts (1:N)
            ├── post_tags (N:M) ─── tags
            ├── comments (1:N)
            ├── field (N:1) ─── fields
            └── category (N:1) ─── categories

books ─── fields
author_info (singleton)
```

---

## Local Development

### Start Local Supabase

```bash
npx supabase start
```

### Stop Local Supabase

```bash
npx supabase stop
```

### Reset Local Database

```bash
npx supabase db reset
```

---

## Documentation

Xem chi tiết: [docs/SUPABASE-SETUP.md](../docs/SUPABASE-SETUP.md)
