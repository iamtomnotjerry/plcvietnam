# Backend Integration Guide

**Status:** ✅ Ready for Integration  
**Last Updated:** 2026-04-25

---

## Quick Start

### 1. Update API Configuration

**File:** `lib/data/providers/api/index.example.ts`

```typescript
const API_BASE_URL = 'https://your-backend-api.com';
```

### 2. Switch Provider

**File:** `lib/data/factory.ts`

```typescript
// Change from:
import { MockProvider } from './providers/mock';
export const contentRepository = new MockProvider();

// To:
import { ApiProvider } from './providers/api';
export const contentRepository = new ApiProvider();
```

### 3. Verify API Contract

Ensure your backend returns data matching these types:

**File:** `lib/types/api.ts`

Key points:

- Use `snake_case` for field names
- Return ISO 8601 date strings
- Include full tag objects (not just IDs)
- Provide pagination metadata

---

## Architecture

### Data Flow

```
Client Component → fetch('/api/...') → API Route → Repository → Provider → Backend
```

### Key Files

- `lib/data/repository.ts` - Repository interface
- `lib/data/factory.ts` - Provider factory
- `lib/types/api.ts` - API response types
- `lib/types/domain.ts` - Domain types
- `lib/utils/api-transformers.ts` - Response transformers

---

## API Endpoints Required

### Posts

- `GET /posts` - List posts (paginated)
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create post (admin)
- `PATCH /posts/:id` - Update post (admin)
- `DELETE /posts/:id` - Delete post (admin)

### Comments

- `GET /comments?postId=:id` - Get comments for post
- `POST /comments` - Create comment

### Auth

- `POST /auth/register` - Register user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Other

- `GET /fields` - List fields
- `GET /categories` - List categories
- `GET /tags` - List tags
- `GET /books` - List books
- `GET /author` - Get author info
- `PUT /author` - Update author (admin)

---

## Testing Checklist

Before deploying:

- [ ] All pages load without errors
- [ ] Error messages display correctly
- [ ] Comments submission works
- [ ] Search functionality works
- [ ] Admin CMS operations work
- [ ] Mobile responsive
- [ ] Dark mode works

---

## Common Issues

### Issue: API returns null for optional fields

**Solution:** Transformers handle this with null coalescing:

```typescript
excerpt: apiPost.excerpt || '',
thumbnailUrl: apiPost.thumbnail_url || undefined,
```

### Issue: Date format mismatch

**Solution:** Transformers validate dates:

```typescript
const publishedAt = new Date(apiPost.published_at);
if (isNaN(publishedAt.getTime())) {
  throw new Error(`Invalid date: ${apiPost.published_at}`);
}
```

### Issue: Tags field structure

**Note:** Backend should return full tag objects:

```json
{
  "tags": [{ "id": "tag-1", "slug": "plc", "name": "PLC", "post_count": 10 }]
}
```

Not just IDs: `"tag_ids": ["tag-1", "tag-2"]`

---

## Support

For issues, check:

1. Browser console for errors
2. Network tab for API responses
3. Server logs for backend errors
4. `lib/utils/api-transformers.ts` for transformation errors
