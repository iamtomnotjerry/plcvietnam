# 🚀 Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Security (CRITICAL)

- [x] **XSS Protection**: DOMPurify installed and configured
- [x] **CSP Header**: Content-Security-Policy configured in next.config.ts
- [x] **Rate Limiting**: In-memory fallback added (configure Redis for production)
- [x] **Input Validation**: Zod schemas for all API routes
- [x] **Image Domains**: Whitelisted specific domains only
- [ ] **Environment Variables**: All secrets configured in production
- [ ] **HTTPS**: SSL certificate configured
- [ ] **Security Headers**: Verified in production

### 2. Performance

- [x] **Database Indexes**: Performance indexes migration created
- [x] **Transaction Functions**: Atomic operations for post creation/update
- [ ] **Redis Cache**: Configure Upstash Redis for production
- [ ] **CDN**: Configure Vercel Edge Network or Cloudflare
- [ ] **Image Optimization**: Verify Next.js Image component usage
- [ ] **Bundle Size**: Run `npm run analyze` and optimize

### 3. Testing

- [x] **API Tests**: Auth and admin routes covered
- [x] **Test Coverage**: Vitest configured with coverage thresholds
- [ ] **Integration Tests**: Add E2E tests for critical flows
- [ ] **Load Testing**: Test with expected production traffic
- [ ] **Security Testing**: Run OWASP ZAP or similar

### 4. Monitoring & Observability

- [ ] **Error Tracking**: Configure Sentry or similar
- [ ] **Performance Monitoring**: Configure Vercel Analytics
- [ ] **Database Monitoring**: Configure Supabase monitoring
- [ ] **Uptime Monitoring**: Configure UptimeRobot or similar
- [ ] **Log Aggregation**: Configure log management

### 5. Database

- [x] **Migrations**: All migrations tested
- [x] **Indexes**: Performance indexes added
- [x] **RLS Policies**: Row Level Security configured
- [ ] **Backup Strategy**: Configure automated backups
- [ ] **Restore Testing**: Test backup restore procedure

### 6. Infrastructure

- [ ] **Environment Variables**: All required vars set in Vercel
- [ ] **Domain Configuration**: Custom domain configured
- [ ] **DNS Configuration**: DNS records configured
- [ ] **Email Service**: Supabase email configured or custom SMTP
- [ ] **File Storage**: Supabase Storage configured

---

## 🔧 Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://your-domain.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Upstash Redis (Recommended for Production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Node Environment
NODE_ENV=production
```

### Validation

Run environment validation:

```bash
npm run type-check
```

The app will fail fast on startup if required variables are missing.

---

## 📊 Database Setup

### 1. Run Migrations

```bash
# Apply all migrations
npm run db:migrate

# Or manually via Supabase CLI
supabase db push
```

### 2. Verify Indexes

```sql
-- Check if indexes are created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 3. Verify RLS Policies

```sql
-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🚦 Deployment Steps

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### 2. Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Redeploy

### 3. Configure Custom Domain

In Vercel Dashboard:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records

### 4. Enable Vercel Analytics

In Vercel Dashboard:

1. Go to Analytics tab
2. Enable Web Analytics
3. Enable Speed Insights

---

## 🔍 Post-Deployment Verification

### 1. Security Headers

Check security headers:

```bash
curl -I https://your-domain.com
```

Verify:

- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options

### 2. API Endpoints

Test critical endpoints:

```bash
# Health check
curl https://your-domain.com/api/health

# Rate limiting
for i in {1..35}; do curl https://your-domain.com/api/posts; done
# Should return 429 after 30 requests
```

### 3. Performance

Run Lighthouse audit:

```bash
npx lighthouse https://your-domain.com --view
```

Target scores:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### 4. Database Performance

Check slow queries:

```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Check slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 📈 Monitoring Setup

### 1. Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure in `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### 2. Vercel Analytics

Already configured if enabled in dashboard.

### 3. Database Monitoring

In Supabase Dashboard:

1. Go to Database → Query Performance
2. Enable slow query logging
3. Set up alerts for high CPU/memory usage

---

## 🔄 Rollback Procedure

### If deployment fails:

1. **Immediate Rollback**

   ```bash
   vercel rollback
   ```

2. **Database Rollback**

   ```bash
   # Revert last migration
   supabase db reset --version <previous-version>
   ```

3. **Verify Rollback**
   - Check application health
   - Verify database integrity
   - Test critical user flows

---

## 📞 Incident Response

### Critical Issues

1. **Application Down**
   - Check Vercel status
   - Check Supabase status
   - Review error logs in Sentry
   - Rollback if necessary

2. **Database Issues**
   - Check Supabase dashboard
   - Review slow queries
   - Check connection pool
   - Scale database if needed

3. **Security Breach**
   - Rotate all secrets immediately
   - Review access logs
   - Notify users if data compromised
   - Document incident

---

## 🎯 Performance Targets

### Response Times

- Homepage: < 1s
- API endpoints: < 200ms
- Database queries: < 50ms

### Availability

- Uptime: 99.9%
- Error rate: < 0.1%

### Scalability

- Support 10,000 concurrent users
- Handle 1M requests/day
- Database: 100k+ posts

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

---

## ✅ Final Checklist

Before going live:

- [ ] All tests passing (`npm run test`)
- [ ] Type checking passing (`npm run type-check`)
- [ ] Linting passing (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers verified
- [ ] Performance targets met
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback procedure tested
- [ ] Team trained on incident response

---

**Last Updated**: 2026-04-27
**Version**: 1.0.0
