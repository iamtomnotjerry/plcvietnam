# 🔐 Hướng dẫn Setup OAuth cho Social Login

## 📚 Tổng quan

Hệ thống hỗ trợ 2 phương thức đăng nhập social:

- ✅ **Google OAuth** - Đăng nhập bằng tài khoản Google
- ✅ **Facebook OAuth** - Đăng nhập bằng tài khoản Facebook

Người dùng có thể comment ngay sau khi đăng nhập, không cần đăng ký tài khoản riêng.

---

## 🚀 Quick Start

### Bước 1: Chọn hướng dẫn phù hợp

| Provider     | Hướng dẫn                                            | Độ khó          | Thời gian |
| ------------ | ---------------------------------------------------- | --------------- | --------- |
| **Google**   | [GOOGLE-OAUTH-SETUP.md](./GOOGLE-OAUTH-SETUP.md)     | ⭐⭐ Trung bình | ~15 phút  |
| **Facebook** | [FACEBOOK-OAUTH-SETUP.md](./FACEBOOK-OAUTH-SETUP.md) | ⭐⭐⭐ Khó hơn  | ~20 phút  |

### Bước 2: Làm theo hướng dẫn

Mỗi hướng dẫn có:

- ✅ Screenshots minh họa
- ✅ Giải thích từng bước
- ✅ Troubleshooting phổ biến
- ✅ Checklist hoàn thành

### Bước 3: Thêm credentials vào `.env.local`

Sau khi hoàn thành setup, file `.env.local` của bạn sẽ có:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc...xyz

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Bước 4: Restart server và test

```bash
npm run dev
```

Truy cập bất kỳ bài viết nào → Scroll xuống comment → Test đăng nhập!

---

## 📖 Chi tiết từng Provider

### 1. Google OAuth

**File hướng dẫn**: [GOOGLE-OAUTH-SETUP.md](./GOOGLE-OAUTH-SETUP.md)

**Các bước chính**:

1. Tạo Google Cloud Project
2. Cấu hình OAuth Consent Screen
3. Thêm Test Users
4. Tạo OAuth 2.0 Client ID
5. Cấu hình Authorized redirect URIs
6. Copy credentials vào `.env.local`

**Redirect URI cần thiết**:

```
http://localhost:3000/api/auth/callback/google
https://your-domain.com/api/auth/callback/google
```

**Scopes cần thiết**:

- `userinfo.email` - Email của user
- `userinfo.profile` - Tên và avatar
- `openid` - Xác thực danh tính

**Lưu ý**:

- App mặc định ở chế độ "Testing" - chỉ Test Users đăng nhập được
- Cần "Publish App" để cho phép tất cả user (production)
- Review có thể mất vài ngày

---

### 2. Facebook OAuth

**File hướng dẫn**: [FACEBOOK-OAUTH-SETUP.md](./FACEBOOK-OAUTH-SETUP.md)

**Các bước chính**:

1. Tạo Facebook App
2. Thêm Facebook Login product
3. Cấu hình OAuth Redirect URIs
4. Lấy App ID và App Secret
5. Cấu hình App Domains
6. Chuyển app sang Live Mode

**Redirect URI cần thiết**:

```
http://localhost:3000/api/auth/callback/facebook
https://your-domain.com/api/auth/callback/facebook
```

**Permissions mặc định**:

- `public_profile` - Tên và avatar
- `email` - Email của user

**Lưu ý**:

- App mặc định ở "Development Mode" - chỉ admin/tester đăng nhập được
- **PHẢI** chuyển sang "Live Mode" để cho phép tất cả user
- Cần Privacy Policy URL và App Icon để publish

---

## 🔧 Environment Variables

### Development (`.env.local`)

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### Production (Vercel/Hosting)

Thêm các biến sau vào hosting platform:

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=same-as-development
GOOGLE_CLIENT_ID=same-as-development
GOOGLE_CLIENT_SECRET=same-as-development
FACEBOOK_CLIENT_ID=same-as-development
FACEBOOK_CLIENT_SECRET=same-as-development
```

⚠️ **Lưu ý**: Phải thêm production redirect URIs vào cả Google và Facebook!

---

## 🧪 Testing

### Test Checklist

- [ ] **Google Login**
  - [ ] Click "Đăng nhập với Google"
  - [ ] Chọn tài khoản Google
  - [ ] Cho phép truy cập
  - [ ] Redirect về trang bài viết
  - [ ] Có thể comment ngay
  - [ ] Avatar và tên hiển thị đúng

- [ ] **Facebook Login**
  - [ ] Click "Đăng nhập với Facebook"
  - [ ] Đăng nhập Facebook (nếu chưa)
  - [ ] Cho phép truy cập
  - [ ] Redirect về trang bài viết
  - [ ] Có thể comment ngay
  - [ ] Avatar và tên hiển thị đúng

- [ ] **Session Persistence**
  - [ ] Refresh trang → Vẫn đăng nhập
  - [ ] Đóng tab → Mở lại → Vẫn đăng nhập
  - [ ] Comment → Hiển thị đúng user

---

## 🐛 Troubleshooting

### Google OAuth

| Lỗi                       | Nguyên nhân             | Giải pháp                                   |
| ------------------------- | ----------------------- | ------------------------------------------- |
| `redirect_uri_mismatch`   | Redirect URI không khớp | Kiểm tra lại URI trong Google Console       |
| `Access blocked: invalid` | OAuth Consent chưa đủ   | Kiểm tra Authorized domains và Test users   |
| `This app isn't verified` | App ở Testing mode      | Click "Advanced" → "Go to app" hoặc Publish |

### Facebook OAuth

| Lỗi              | Nguyên nhân                 | Giải pháp                                  |
| ---------------- | --------------------------- | ------------------------------------------ |
| `URL Blocked`    | Redirect URI chưa whitelist | Thêm URI vào Valid OAuth Redirect URIs     |
| `App Not Setup`  | App ở Development mode      | Chuyển sang Live Mode hoặc thêm Test Users |
| `Can't Load URL` | Domain chưa thêm            | Thêm domain vào App Domains                |

### Chung

| Vấn đề                      | Kiểm tra                                             |
| --------------------------- | ---------------------------------------------------- |
| Không thấy nút social login | `.env.local` có credentials chưa? Đã restart server? |
| Redirect về trang khác      | NextAuth callback URL - đã xử lý trong code          |
| Email null                  | User Facebook không có email public                  |
| Session không persist       | Kiểm tra NEXTAUTH_SECRET                             |

---

## 🔒 Security Best Practices

### 1. Bảo vệ Credentials

- ✅ **KHÔNG** commit `.env.local` lên Git
- ✅ **KHÔNG** share Client Secret với ai
- ✅ Dùng environment variables trên hosting
- ✅ Rotate secrets định kỳ (6 tháng/năm)

### 2. Redirect URI Whitelist

- ✅ Chỉ thêm URIs bạn kiểm soát
- ✅ Không dùng wildcard (`*`)
- ✅ Dùng HTTPS cho production
- ✅ Kiểm tra chính tả (không có `/` cuối)

### 3. Scopes/Permissions

- ✅ Chỉ yêu cầu permissions cần thiết
- ✅ Giải thích rõ tại sao cần permission
- ✅ Không yêu cầu sensitive data không cần

### 4. Testing

- ✅ Test cả Google và Facebook
- ✅ Test trên nhiều browsers
- ✅ Test trên mobile
- ✅ Test error cases (deny permission, cancel)

---

## 📊 So sánh Google vs Facebook

| Tiêu chí               | Google           | Facebook              |
| ---------------------- | ---------------- | --------------------- |
| **Độ khó setup**       | ⭐⭐ Trung bình  | ⭐⭐⭐ Khó hơn        |
| **Thời gian setup**    | ~15 phút         | ~20 phút              |
| **Review process**     | Có (nếu publish) | Có (nếu publish)      |
| **Test mode**          | Test Users       | Test Users hoặc Roles |
| **Email availability** | Luôn có          | Có thể null           |
| **Avatar quality**     | Tốt              | Tốt                   |
| **Phổ biến ở VN**      | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐            |

**Khuyến nghị**: Setup cả 2 để user có nhiều lựa chọn!

---

## 🚀 Production Deployment

### Checklist trước khi deploy

- [ ] Đã test kỹ trên development
- [ ] Đã thêm production redirect URIs
- [ ] Đã cập nhật environment variables trên hosting
- [ ] Đã publish Google app (nếu cần)
- [ ] Đã chuyển Facebook app sang Live Mode
- [ ] Đã test trên production URL
- [ ] Đã setup monitoring/logging

### Sau khi deploy

1. Test ngay trên production
2. Monitor error logs
3. Check analytics (conversion rate)
4. Collect user feedback
5. Optimize UX nếu cần

---

## 📚 Tài liệu liên quan

- [GOOGLE-OAUTH-SETUP.md](./GOOGLE-OAUTH-SETUP.md) - Hướng dẫn chi tiết Google
- [FACEBOOK-OAUTH-SETUP.md](./FACEBOOK-OAUTH-SETUP.md) - Hướng dẫn chi tiết Facebook
- [AUTHENTICATION-CHANGES.md](./AUTHENTICATION-CHANGES.md) - Tổng quan thay đổi
- [../SETUP-SOCIAL-LOGIN.md](../SETUP-SOCIAL-LOGIN.md) - Quick start guide

---

## 💡 Tips & Tricks

1. **Development**: Dùng `http://localhost:3000` cho cả Google và Facebook
2. **Production**: Nhớ thêm production URIs trước khi deploy
3. **Testing**: Thêm nhiều test users để team test dễ dàng
4. **Monitoring**: Log OAuth errors để debug nhanh
5. **UX**: Hiển thị loading state rõ ràng khi đăng nhập
6. **Fallback**: Vẫn giữ email/password login cho admin

---

## ❓ FAQ

**Q: Có bắt buộc phải setup cả Google và Facebook không?**

A: Không. Bạn có thể chỉ setup 1 trong 2. Nhưng setup cả 2 sẽ tốt hơn cho user experience.

**Q: Mất bao lâu để Google/Facebook approve app?**

A: Google: 1-3 ngày. Facebook: 1-7 ngày. Nhưng có thể dùng Test Mode ngay.

**Q: Có tốn phí không?**

A: Không. Google và Facebook OAuth hoàn toàn miễn phí.

**Q: Có giới hạn số lượng users không?**

A: Không có giới hạn cho cả Google và Facebook OAuth.

**Q: Nếu user không có Google/Facebook thì sao?**

A: Họ vẫn có thể đăng ký bằng email/password (nếu bạn giữ tính năng này).

**Q: Có thể thêm Apple Sign In không?**

A: Có thể! NextAuth hỗ trợ Apple provider. Tương tự như Google/Facebook.

---

**Chúc bạn setup thành công!** 🎉

Nếu gặp vấn đề, check phần Troubleshooting hoặc đọc kỹ hướng dẫn chi tiết cho từng provider.
