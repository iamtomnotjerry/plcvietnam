# Supabase Setup Guide

## 1. Tạo Supabase Project

### Option A: Qua Dashboard (Khuyên dùng)

1. Truy cập: https://supabase.com/dashboard
2. Click "New Project"
3. Điền thông tin:
   - **Name**: `plcvietnam-blog`
   - **Database Password**: (tạo password mạnh)
   - **Region**: `East US (North Virginia)` hoặc gần nhất
4. Click "Create new project"
5. Đợi ~2 phút để project được khởi tạo

### Option B: Qua CLI (Nếu có Supabase Pro)

```bash
npx supabase projects create plcvietnam-blog --org-id vercel_icfg_MZmUEF5hFVqpEzCmIxBn97bZ --region us-east-1
```

---

## 2. Lấy API Credentials

Sau khi project được tạo:

1. Vào **Project Settings** → **API**
2. Copy 2 giá trị:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 3. Cấu Hình Local Environment

Cập nhật `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Switch to Supabase provider
DATA_PROVIDER=supabase
```

---

## 4. Link Local Project với Remote

```bash
npx supabase link --project-ref xxxxx
```

Thay `xxxxx` bằng **Project Reference ID** (tìm trong Project Settings → General).

---

## 5. Push Database Schema

```bash
# Push migrations to remote
npx supabase db push

# Verify migrations
npx supabase migration list
```

---

## 6. Generate TypeScript Types

```bash
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

---

## 7. Tạo Admin User

### Qua Supabase Dashboard:

1. Vào **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Điền email và password
4. Sau khi tạo, copy **User ID**

### Update Role thành Admin:

Vào **SQL Editor** và chạy:

```sql
-- Insert profile for admin user
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'user-id-from-step-3',
  'admin@plcvietnam.com',
  'Admin',
  'admin'
);
```

---

## 8. Seed Sample Data (Optional)

Nếu muốn có data mẫu để test:

```sql
-- Run in SQL Editor
-- (Copy content from supabase/migrations/20260425053404_seed_data.sql)
```

---

## 9. Cấu Hình Vercel Environment Variables

Trong Vercel Dashboard:

1. Vào **Project Settings** → **Environment Variables**
2. Thêm:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGci...`
   - `DATA_PROVIDER` = `supabase`

---

## 10. Test Connection

```bash
# Start dev server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/admin/posts
```

---

## Database Schema Overview

### Tables

- **profiles** - User profiles (extends auth.users)
- **fields** - Lĩnh vực (PLC, SCADA, Siemens, HMI)
- **categories** - Danh mục bài viết
- **tags** - Tags
- **posts** - Bài viết
- **post_tags** - Many-to-many relationship
- **comments** - Bình luận
- **books** - Sách tham khảo
- **author_info** - Thông tin tác giả

### Row Level Security (RLS)

- ✅ All tables have RLS enabled
- ✅ Public read access for published content
- ✅ Admin-only write access for sensitive data
- ✅ User can update own profile/comments

### Triggers

- Auto-update `updated_at` timestamp
- Auto-update `post_count` in fields/categories/tags
- Auto-update `comment_count` in posts

---

## Useful Commands

```bash
# Check Supabase status
npx supabase status

# View remote database
npx supabase db remote

# Pull remote changes
npx supabase db pull

# Reset local database
npx supabase db reset

# Generate new migration
npx supabase migration new migration_name

# View logs
npx supabase functions logs
```

---

## Troubleshooting

### Issue: "relation does not exist"

**Solution:** Push migrations to remote:

```bash
npx supabase db push
```

### Issue: "Invalid API key"

**Solution:** Verify credentials in `.env.local` match Supabase dashboard.

### Issue: "Row Level Security policy violation"

**Solution:** Check if user has correct role in `profiles` table.

### Issue: TypeScript errors with database types

**Solution:** Regenerate types:

```bash
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Configure environment variables
3. ✅ Push database schema
4. ✅ Create admin user
5. ⏭️ Implement Supabase provider (`lib/data/providers/supabase/`)
6. ⏭️ Update API routes to use Supabase
7. ⏭️ Test authentication flow
8. ⏭️ Deploy to Vercel

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
