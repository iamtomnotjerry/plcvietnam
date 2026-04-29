# Cache Revalidation Strategy

## Overview

This document describes the cache revalidation strategy implemented to ensure the posts page and other cached pages update immediately when content is modified through the admin panel.

## Problem

The posts page (`/posts`) has a 15-minute cache (`revalidate = 900`). When fields, categories, tags, or posts were created/updated/deleted through the admin panel, the posts page would not update until the cache expired, causing stale data to be displayed.

## Solution

Added `revalidatePath()` calls to all admin mutation endpoints to immediately invalidate relevant caches when content changes.

## Implementation

### 1. Fields Admin API (`app/api/admin/fields/route.ts`)

**Endpoints affected:**

- `POST` - Create field
- `PATCH` - Update field
- `DELETE` - Delete field

**Revalidation paths:**

```typescript
revalidatePath('/api/navigation'); // Navigation tree cache
revalidatePath('/'); // Homepage cache
revalidatePath('/posts'); // Posts listing cache
```

**Why:** When fields are modified, the navigation tree, homepage (which may show field-based content), and posts page (which displays posts from those fields) all need to update.

### 2. Categories Admin API (`app/api/admin/categories/route.ts`)

**Endpoints affected:**

- `POST` - Create category
- `PATCH` - Update category
- `DELETE` - Delete category

**Revalidation paths:**

```typescript
revalidatePath('/api/navigation'); // Navigation tree cache
revalidatePath('/'); // Homepage cache
revalidatePath('/posts'); // Posts listing cache
```

**Why:** Categories are part of the navigation tree and posts are organized by categories, so all three caches need invalidation.

### 3. Tags Admin API (`app/api/admin/tags/route.ts`)

**Endpoints affected:**

- `POST` - Create tag
- `DELETE` - Delete tag

**Revalidation paths:**

```typescript
revalidatePath('/api/tags'); // Tags API cache
revalidatePath('/'); // Homepage cache
revalidatePath('/posts'); // Posts listing cache
```

**Why:** Tags are displayed on posts, so the posts page and homepage need to update when tags change.

### 4. Posts Admin API (`app/api/admin/posts/route.ts` and `app/api/admin/posts/[id]/route.ts`)

**Endpoints affected:**

- `POST` - Create post
- `PATCH` - Update post
- `DELETE` - Delete post

**Revalidation paths:**

```typescript
revalidatePath('/posts'); // Posts listing cache
revalidatePath('/'); // Homepage cache
```

**Why:** When posts are created, updated, or deleted, both the posts listing page and homepage (which may feature recent posts) need to update.

## Database Behavior

### Foreign Key Constraints

From `supabase/migrations/20260425053315_initial_schema.sql`:

```sql
-- Posts table foreign keys
field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
```

**Behavior:**

- When a field is deleted, all posts with that `field_id` have it set to `NULL`
- When a category is deleted, all posts with that `category_id` have it set to `NULL`
- Posts are NOT deleted when their field/category is deleted (orphaned posts remain)

### Post Count Triggers

The database has triggers to automatically update `post_count` on fields, categories, and tags:

- `update_field_post_count_trigger` - Updates field post count on post insert/update/delete
- `update_category_post_count_trigger` - Updates category post count on post insert/update/delete
- `update_tag_post_count_trigger` - Updates tag post count on post_tags insert/delete

Additional triggers from `supabase/migrations/20260429_fix_field_count_on_category_delete.sql`:

- `update_field_count_on_category_delete()` - Subtracts category's post_count from field when category is deleted
- `update_field_count_on_category_move()` - Handles category moving between fields

## Testing

All 691 tests pass after implementing these changes.

## Future Considerations

### Orphaned Posts

Currently, when a field or category is deleted, posts with that field/category have their `field_id` or `category_id` set to `NULL`. This creates "orphaned" posts that may not be properly categorized.

**Options to consider:**

1. **CASCADE DELETE** - Delete posts when their field/category is deleted
   - Pros: No orphaned posts
   - Cons: Data loss, may be unexpected for users

2. **PREVENT DELETION** - Don't allow deleting fields/categories that have posts
   - Pros: Prevents orphaned posts, no data loss
   - Cons: Users must manually reassign or delete posts first

3. **CURRENT BEHAVIOR (SET NULL)** - Keep posts but remove field/category reference
   - Pros: No data loss, flexible
   - Cons: Creates orphaned posts that may not display properly

**Recommendation:** Consider adding a check in the admin UI to warn users when deleting a field/category that has posts, and offer to reassign posts to another field/category before deletion.

### Cache Granularity

Currently, we invalidate the entire `/posts` path. For better performance, consider:

- Invalidating specific post detail pages: `revalidatePath(\`/posts/\${slug}\`)`
- Invalidating category pages: `revalidatePath(\`/fields/\${fieldSlug}/\${categorySlug}\`)`
- Invalidating field pages: `revalidatePath(\`/fields/\${fieldSlug}\`)`

This would require passing the affected slugs to the revalidation logic.

## Related Files

- `app/(routes)/posts/page.tsx` - Posts listing page with 15-minute cache
- `app/api/admin/fields/route.ts` - Fields CRUD endpoints
- `app/api/admin/categories/route.ts` - Categories CRUD endpoints
- `app/api/admin/tags/route.ts` - Tags CRUD endpoints
- `app/api/admin/posts/route.ts` - Posts create/list endpoints
- `app/api/admin/posts/[id]/route.ts` - Posts update/delete endpoints
- `supabase/migrations/20260425053315_initial_schema.sql` - Database schema with foreign keys
- `supabase/migrations/20260429_fix_field_count_on_category_delete.sql` - Post count triggers
