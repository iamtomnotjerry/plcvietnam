# 🐛 OAuth Troubleshooting Guide

## ❌ Error 401: invalid_client

### Lỗi

```
Access blocked: Authorization Error
Error 401: invalid_client
The OAuth client was not found.
```

### Nguyên nhân

1. `NEXTAUTH_SECRET` chưa được generate đúng
2. Server chưa restart sau khi thêm credentials
3. Google Client ID không đúng

### Giải pháp

#### ✅ Đã fix trong `.env.local`:

```env
NEXTAUTH_SECRET=lfNocSj4d7MIsubwhTHFpy5Lmgq8WDX6
GOOGLE_CLIENT_ID=1099143255402-u74fhvk8tahn63md5a47315dd5c69m.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

#### Restart server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

#### Nếu vẫn lỗi:

1. Clear browser cache
2. Thử incognito mode
3. Check console logs

---

## ❌ redirect_uri_mismatch

### Lỗi

```
Error 400: redirect_uri_mismatch
```

### Nguyên nhân

Redirect URI trong Google Cloud Console không khớp với URI thực tế.

### Giải pháp

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click vào OAuth Client ID
4. Kiểm tra **Authorized redirect URIs** có:
   ```
   http://localhost:3000/api/auth/callback/google
   https://plcvietnam.vercel.app/api/auth/callback/google
   ```
5. Không có dấu `/` ở cuối
6. Click **"SAVE"**
7. Đợi vài phút để Google cập nhật

---

## ❌ This app isn't verified

### Lỗi

```
This app isn't verified
This app hasn't been verified by Google yet.
```

### Nguyên nhân

App đang ở Testing mode.

### Giải pháp (Development)

1. Click **"Advanced"**
2. Click **"Go to [App Name] (unsafe)"**
3. Cho phép truy cập

### Giải pháp (Production)

1. Truy cập Google Cloud Console
2. **OAuth consent screen**
3. Click **"PUBLISH APP"**
4. Đợi Google review (1-3 ngày)

---

## ❌ Access blocked: This app's request is invalid

### Lỗi

```
Access blocked: This app's request is invalid
```

### Nguyên nhân

OAuth Consent Screen chưa setup đầy đủ.

### Giải pháp

1. Truy cập **OAuth consent screen**
2. Kiểm tra:
   - ✅ App name đã điền
   - ✅ User support email đã chọn
   - ✅ Authorized domains có `localhost`
   - ✅ Developer contact email đã điền
3. Thêm email của bạn vào **Test users**
4. Click **"SAVE"**

---

## ❌ Port 3000 is in use

### Lỗi

```
⚠ Port 3000 is in use by process 468
```

### Giải pháp

#### Windows:

```bash
# Tìm process
netstat -ano | findstr :3000

# Kill process (thay PID)
taskkill /PID 468 /F
```

#### Hoặc dùng port khác:

```bash
npm run dev -- -p 3001
```

Nhớ cập nhật redirect URI trong Google Console nếu đổi port!

---

## ❌ Session không persist

### Lỗi

Đăng nhập thành công nhưng refresh trang thì mất session.

### Nguyên nhân

`NEXTAUTH_SECRET` không đúng hoặc không có.

### Giải pháp

Kiểm tra `.env.local` có:

```env
NEXTAUTH_SECRET=lfNocSj4d7MIsubwhTHFpy5Lmgq8WDX6
```

---

## ❌ Email null từ Google

### Lỗi

User đăng nhập thành công nhưng email là `null`.

### Nguyên nhân

Scope không đủ hoặc user không có email public.

### Giải pháp

1. Kiểm tra OAuth Consent Screen → Scopes
2. Đảm bảo có:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. Yêu cầu user dùng tài khoản có email

---

## ❌ CORS Error

### Lỗi

```
Access to fetch at 'https://accounts.google.com/...' has been blocked by CORS policy
```

### Nguyên nhân

Authorized JavaScript origins chưa đúng.

### Giải pháp

1. Google Cloud Console → Credentials
2. Thêm vào **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://plcvietnam.vercel.app
   ```
3. Click **"SAVE"**

---

## 🔍 Debug Tips

### 1. Check Browser Console

```javascript
// Mở DevTools (F12)
// Tab Console
// Xem errors
```

### 2. Check Network Tab

```
// DevTools → Network
// Filter: XHR
// Xem request/response
```

### 3. Check Server Logs

```bash
# Terminal đang chạy npm run dev
# Xem logs
```

### 4. Verify Environment Variables

```bash
# Check .env.local
cat .env.local | grep GOOGLE

# Hoặc Windows
type .env.local | findstr GOOGLE
```

### 5. Test với curl

```bash
curl http://localhost:3000/api/auth/providers
```

Should return:

```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth"
  }
}
```

---

## 📞 Vẫn không được?

### Checklist cuối cùng:

- [ ] `.env.local` có đầy đủ credentials
- [ ] Server đã restart
- [ ] Browser cache đã clear
- [ ] Redirect URIs đúng trong Google Console
- [ ] Test users đã thêm (nếu Testing mode)
- [ ] Port 3000 không bị chiếm
- [ ] Internet connection ổn định

### Nếu vẫn lỗi:

1. Xóa OAuth Client ID cũ
2. Tạo lại OAuth Client ID mới
3. Cập nhật credentials trong `.env.local`
4. Restart server
5. Test lại

---

**Last Updated**: 2026-04-29
