# 🚀 BẮT ĐẦU TỪ ĐÂY - Setup Social Login

## 📋 Bạn cần làm gì?

Hệ thống đã được cập nhật để hỗ trợ **đăng nhập bằng Google và Facebook** cho phần comment. Bạn cần cấu hình OAuth để kích hoạt tính năng này.

---

## ⚡ Quick Start (5 phút đọc)

### Bước 1: Đọc tổng quan

📖 **Đọc file này trước**: [SETUP-SOCIAL-LOGIN.md](./SETUP-SOCIAL-LOGIN.md)

File này giải thích:

- ✅ Những gì đã thay đổi
- ✅ Checklist cần làm
- ✅ Cách test

### Bước 2: Setup Google OAuth (15 phút)

📖 **Hướng dẫn chi tiết**: [docs/GOOGLE-OAUTH-SETUP.md](./docs/GOOGLE-OAUTH-SETUP.md)

**Tóm tắt**:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Tạo Project → OAuth Consent Screen → OAuth Client ID
3. Copy credentials vào `.env.local`
4. Restart server

### Bước 3: Setup Facebook OAuth (20 phút)

📖 **Hướng dẫn chi tiết**: [docs/FACEBOOK-OAUTH-SETUP.md](./docs/FACEBOOK-OAUTH-SETUP.md)

**Tóm tắt**:

1. Truy cập [Facebook Developers](https://developers.facebook.com)
2. Tạo App → Facebook Login → Cấu hình
3. Copy credentials vào `.env.local`
4. Chuyển app sang Live Mode

### Bước 4: Test (5 phút)

```bash
npm run dev
```

1. Mở `http://localhost:3000`
2. Vào bất kỳ bài viết nào
3. Scroll xuống phần comment
4. Thấy 2 nút: "Đăng nhập với Google" và "Đăng nhập với Facebook"
5. Click và test!

---

## 📚 Tài liệu đầy đủ

| File                                                               | Mục đích                    | Đọc khi nào         |
| ------------------------------------------------------------------ | --------------------------- | ------------------- |
| **[START-HERE.md](./START-HERE.md)**                               | Điểm bắt đầu                | ⭐ ĐỌC ĐẦU TIÊN     |
| **[SETUP-SOCIAL-LOGIN.md](./SETUP-SOCIAL-LOGIN.md)**               | Quick start guide           | ⭐ ĐỌC THỨ 2        |
| [docs/GOOGLE-OAUTH-SETUP.md](./docs/GOOGLE-OAUTH-SETUP.md)         | Hướng dẫn Google chi tiết   | Khi setup Google    |
| [docs/FACEBOOK-OAUTH-SETUP.md](./docs/FACEBOOK-OAUTH-SETUP.md)     | Hướng dẫn Facebook chi tiết | Khi setup Facebook  |
| [docs/OAUTH-SETUP-GUIDE.md](./docs/OAUTH-SETUP-GUIDE.md)           | Tổng hợp cả 2 providers     | Tham khảo thêm      |
| [docs/AUTHENTICATION-CHANGES.md](./docs/AUTHENTICATION-CHANGES.md) | Chi tiết thay đổi code      | Cho developers      |
| [CHANGES-SUMMARY.md](./CHANGES-SUMMARY.md)                         | Tóm tắt toàn bộ             | Review sau khi xong |

---

## 🎯 Lộ trình đề xuất

### Nếu bạn chưa biết gì về OAuth (30-40 phút)

```
1. Đọc START-HERE.md (file này) ← BẠN ĐANG Ở ĐÂY
   ↓
2. Đọc SETUP-SOCIAL-LOGIN.md (5 phút)
   ↓
3. Làm theo docs/GOOGLE-OAUTH-SETUP.md (15 phút)
   ↓
4. Làm theo docs/FACEBOOK-OAUTH-SETUP.md (20 phút)
   ↓
5. Test trên localhost (5 phút)
   ↓
6. ✅ HOÀN THÀNH!
```

### Nếu bạn đã biết OAuth (15-20 phút)

```
1. Đọc SETUP-SOCIAL-LOGIN.md (3 phút)
   ↓
2. Setup Google (10 phút)
   ↓
3. Setup Facebook (10 phút)
   ↓
4. Test (2 phút)
   ↓
5. ✅ XONG!
```

---

## ⚠️ Lưu ý quan trọng

### 1. File `.env.local`

Sau khi setup xong, file `.env.local` của bạn sẽ có:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

⚠️ **KHÔNG commit file này lên Git!**

### 2. Redirect URIs

Phải chính xác 100%:

**Google**:

```
http://localhost:3000/api/auth/callback/google
```

**Facebook**:

```
http://localhost:3000/api/auth/callback/facebook
```

❌ Sai: `http://localhost:3000/api/auth/callback/google/`  
❌ Sai: `http://localhost:3000/auth/callback/google`  
✅ Đúng: `http://localhost:3000/api/auth/callback/google`

### 3. Test Mode vs Live Mode

- **Google**: App mặc định ở "Testing" → Chỉ Test Users đăng nhập được
- **Facebook**: App mặc định ở "Development" → Chỉ admin/tester đăng nhập được

⚠️ **Phải chuyển sang Live/Production để cho phép tất cả user!**

---

## 🐛 Gặp vấn đề?

### Lỗi phổ biến

| Lỗi                         | File hướng dẫn fix                                                             |
| --------------------------- | ------------------------------------------------------------------------------ |
| `redirect_uri_mismatch`     | [docs/GOOGLE-OAUTH-SETUP.md](./docs/GOOGLE-OAUTH-SETUP.md#troubleshooting)     |
| `URL Blocked`               | [docs/FACEBOOK-OAUTH-SETUP.md](./docs/FACEBOOK-OAUTH-SETUP.md#troubleshooting) |
| Không thấy nút social login | [SETUP-SOCIAL-LOGIN.md](./SETUP-SOCIAL-LOGIN.md#troubleshooting)               |

### Cần help?

1. Đọc phần **Troubleshooting** trong từng hướng dẫn
2. Check browser console logs
3. Check Network tab (XHR requests)
4. Xem logs trong Google/Facebook Dashboard

---

## ✅ Checklist hoàn thành

- [ ] Đã đọc START-HERE.md (file này)
- [ ] Đã đọc SETUP-SOCIAL-LOGIN.md
- [ ] Đã setup Google OAuth
- [ ] Đã setup Facebook OAuth
- [ ] Đã thêm credentials vào `.env.local`
- [ ] Đã restart development server
- [ ] Đã test Google login thành công
- [ ] Đã test Facebook login thành công
- [ ] Đã kiểm tra comment hoạt động
- [ ] Đã kiểm tra avatar và tên hiển thị đúng

---

## 🎉 Sau khi hoàn thành

Bạn sẽ có:

- ✅ User có thể đăng nhập bằng Google
- ✅ User có thể đăng nhập bằng Facebook
- ✅ User có thể comment ngay sau khi đăng nhập
- ✅ Nút đăng nhập ẩn khỏi header
- ✅ Admin vẫn truy cập được `/auth/sign-in`

---

## 🚀 Tiếp theo

### Development

- Test kỹ trên localhost
- Thử nhiều scenarios (deny permission, cancel, etc.)
- Check responsive trên mobile

### Production

- Thêm production redirect URIs
- Publish Google app (nếu cần)
- Chuyển Facebook app sang Live Mode
- Deploy và test trên production
- Monitor logs và analytics

---

**Bắt đầu ngay!** 🚀

Đọc tiếp: [SETUP-SOCIAL-LOGIN.md](./SETUP-SOCIAL-LOGIN.md)
