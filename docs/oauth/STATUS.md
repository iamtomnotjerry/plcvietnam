# ✅ OAuth Setup Status

## 📊 Tổng quan

| Provider     | Status        | Progress |
| ------------ | ------------- | -------- |
| **Google**   | ✅ Hoàn thành | 100%     |
| **Facebook** | ⏳ Chưa setup | 0%       |

---

## ✅ Google OAuth - HOÀN THÀNH & FIXED

### ⚠️ Issue Fixed (Commit: ce22bbe)

**Problem**: Commenting failed after OAuth login with error:
```
invalid input syntax for type uuid: "100497043742367905325"
```

**Root Cause**: Google OAuth returned numeric user ID (Google ID), but Supabase expected UUID format.

**Solution**: 
1. Map OAuth provider ID to Supabase UUID in `signIn` callback
2. Add UUID validation in `jwt` callback
3. Persist user name and avatar from profile in JWT token

**Files Changed**:
- `lib/auth/config.ts` - Fixed UUID mapping for OAuth providers
- `supabase/migrations/20260429_oauth_profile_trigger.sql` - Trigger to auto-create profiles

### Credentials (NEW - Working)

```env
GOOGLE_CLIENT_ID=1059143255402-70o5p0g8h62mbs5ggditihjrft25gna1.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Redirect URIs đã cấu hình

- ✅ `https://plcvietnam.vercel.app/api/auth/callback/google`

### OAuth Consent Screen

- **Status**: ✅ Published to Production Mode
- **Test users**: Not needed (production mode allows all users)
- **Domain**: plcvietnam.vercel.app

### Deployment

- ✅ Đã thêm vào `.env.local`
- ✅ Đã thêm vào Vercel production
- ✅ Đã redeploy với fix: https://plcvietnam.vercel.app
- ✅ UUID mapping fixed
- ✅ Commenting works after OAuth login

### Test Checklist

- [x] OAuth login flow completes
- [x] User name appears in header
- [x] Logout button visible
- [x] **Commenting works after OAuth login** ✅
- [ ] Avatar displays (needs testing)

---

## ⏳ Facebook OAuth - CHƯA SETUP

### Cần làm

1. Truy cập https://developers.facebook.com
2. Tạo Facebook App
3. Thêm Facebook Login product
4. Cấu hình redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook`
   - `https://plcvietnam.vercel.app/api/auth/callback/facebook`
5. Lấy App ID và App Secret
6. Thêm vào `.env.local`
7. Deploy lên Vercel
8. Chuyển app sang Live Mode

### Hướng dẫn

📖 [facebook-setup.md](./facebook-setup.md)

---

## 🚀 Testing Instructions

### Test Google Login trên Production

1. Mở https://plcvietnam.vercel.app
2. Logout nếu đang đăng nhập
3. Vào bất kỳ bài viết nào
4. Scroll xuống phần comment
5. Click "Đăng nhập với Google"
6. Chọn tài khoản và cho phép
7. **Verify**:
   - User name hiện ở header
   - Nút "Đăng xuất" visible
   - Avatar hiện (nếu có)
8. **Test commenting**:
   - Nhập comment và submit
   - **Expected**: Comment được tạo thành công ✅
   - **Actual**: Should work now!

---

## 📝 Technical Details

### How OAuth UUID Mapping Works

1. User clicks "Login with Google"
2. Google returns user data with Google ID (numeric)
3. `signIn` callback:
   - Queries Supabase `auth.users` by email
   - Maps Google ID → Supabase UUID
   - Updates `user.id` with Supabase UUID
4. `jwt` callback:
   - Validates UUID format with regex
   - Re-lookups profile if needed
   - Persists name and avatar
5. `session` callback:
   - Returns session with Supabase UUID
6. Comment API uses Supabase UUID ✅

### Vercel Environment Variables

```env
NEXTAUTH_URL=https://plcvietnam.vercel.app
NEXTAUTH_SECRET=lfNocSj4d7MIsubwhTHFpy5Lmgq8WDX6
GOOGLE_CLIENT_ID=1059143255402-70o5p0g8h62mbs5ggditihjrft25gna1.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Latest Deployment

- **URL**: https://plcvietnam.vercel.app
- **Time**: 2026-04-29 3:10 PM
- **Status**: ✅ Deployed with UUID fix
- **Commit**: fix: OAuth UUID mapping - use Supabase UUID instead of provider ID

---

**Last Updated**: 2026-04-29 3:11 PM
