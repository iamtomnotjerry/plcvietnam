# Known Issues & Technical Debt

## 🟡 Non-Critical Issues

### 1. Book Admin Routes Need Schema Update

**Files Affected**:

- `app/api/admin/books/route.ts`
- `app/api/admin/books/[id]/route.ts`

**Issue**: These routes reference fields that don't exist in the current `CreateBookSchema`:

- `coverUrl` (should be `cover_url`)
- `author` (field doesn't exist in schema)
- `publisher` (field doesn't exist in schema)
- `publishedYear` (should be `published_at`)
- `isbn` (field doesn't exist in schema)
- `downloadUrl` (should be `download_url`)
- `amazonUrl` (field doesn't exist in schema)
- `fieldId` (field doesn't exist in schema)

**Impact**: Book creation/update endpoints will fail type checking but may work at runtime if database schema matches.

**Resolution**: Update the routes to use the correct field names from `CreateBookSchema` or update the schema to match the database.

**Priority**: Medium - Book functionality may be affected

---

### 2. DOMPurify Type Definitions

**File**: `lib/security/sanitize.ts`

**Issue**: TypeScript cannot find module 'isomorphic-dompurify' type definitions despite `@types/dompurify` being installed.

**Workaround**: Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

**Impact**: Type checking fails but runtime works correctly.

**Priority**: Low - Does not affect functionality

---

### 3. Test Coverage Below Target

**Current Coverage**: ~10%  
**Target Coverage**: 80%

**Missing Tests**:

- API route tests (most routes untested)
- Data provider tests (Supabase provider has 0% coverage)
- Repository pattern tests
- Integration tests for auth flows
- E2E tests for critical user journeys

**Impact**: Limited confidence in refactoring, higher regression risk

**Priority**: High - Should be addressed before major refactoring

---

### 4. PostPublicationStatus Type Mismatch

**File**: `app/api/admin/posts/route.ts`

**Issue**: Schema allows 'archived' status but repository type only allows 'draft' | 'published'

**Resolution**: Update repository type to include 'archived' or remove from schema

**Priority**: Low - Can be fixed with type assertion

---

## ✅ Resolved Issues

### 1. ✅ XSS Protection

- **Status**: FIXED
- **Solution**: Implemented DOMPurify-based sanitization

### 2. ✅ Missing CSP Header

- **Status**: FIXED
- **Solution**: Added comprehensive CSP in next.config.ts

### 3. ✅ Rate Limiting Disabled

- **Status**: FIXED
- **Solution**: Added in-memory fallback with rate-limiter-flexible

### 4. ✅ Missing Database Indexes

- **Status**: FIXED
- **Solution**: Created migration with 20+ performance indexes

### 5. ✅ No Transaction Handling

- **Status**: FIXED
- **Solution**: Created atomic database functions

### 6. ✅ Overly Permissive Image Domains

- **Status**: FIXED
- **Solution**: Whitelisted specific domains only

---

## 📋 Technical Debt

### 1. Inconsistent Field Naming

**Issue**: Mix of camelCase (repository) and snake_case (database/schemas)

**Impact**: Requires manual transformation in API routes

**Resolution**: Standardize on one convention (recommend snake_case to match database)

**Priority**: Medium

---

### 2. Missing Error Boundary Coverage

**Issue**: Error boundaries exist but not consistently applied to all routes

**Resolution**: Wrap each route segment with error boundaries

**Priority**: Medium

---

### 3. No Caching Layer

**Issue**: Every request hits the database, no Redis cache for frequently accessed data

**Impact**: Unnecessary database load, slower response times

**Resolution**: Implement Redis caching for:

- Navigation tree
- Featured posts/books
- Category listings

**Priority**: Medium (becomes High at scale)

---

### 4. No Monitoring/Observability

**Issue**: No error tracking, performance monitoring, or analytics configured

**Impact**: Blind to production issues

**Resolution**: Configure:

- Sentry for error tracking
- Vercel Analytics for performance
- Database query logging

**Priority**: High for production

---

## 🚀 Future Enhancements

### 1. Full-Text Search Optimization

**Current**: Uses `ilike` for search  
**Recommended**: Use PostgreSQL full-text search with ts_vector

**Benefit**: 10-100x faster search on large datasets

---

### 2. Image Optimization Pipeline

**Current**: Basic Next.js Image component  
**Recommended**: Supabase image transformation + CDN

**Benefit**: Faster page loads, reduced bandwidth

---

### 3. Background Job Queue

**Current**: Synchronous operations  
**Recommended**: Message queue for:

- Email sending
- Image processing
- Search index updates

**Benefit**: Faster API responses, better scalability

---

### 4. Read Replicas

**Current**: Single database instance  
**Recommended**: Read replicas for read-heavy operations

**Benefit**: Better performance at scale (100k+ users)

---

## 📝 Notes

- All critical security issues have been resolved
- Application is production-ready with known limitations
- Book routes need attention before heavy use
- Test coverage should be improved incrementally
- Monitoring should be configured before production deployment

**Last Updated**: 2026-04-27
