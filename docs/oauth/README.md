# 🔐 OAuth Setup Guide

Hướng dẫn setup Google và Facebook OAuth cho social login.

---

## 🚀 Quick Start

### Bước 1: Đọc hướng dẫn nhanh

📖 [Quick Start Guide](./quick-start.md) - Bắt đầu từ đây (5 phút)

### Bước 2: Setup Google OAuth (15 phút)

📖 [Google OAuth Setup](./google-setup.md) - Hướng dẫn chi tiết từng bước

**Credentials đã có**:

```env
GOOGLE_CLIENT_ID=1099143255402-u74fhvk8tahn63md5a47315dd5c69m.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

✅ Đã thêm vào `.env.local`  
✅ Đã thêm vào Vercel production

### Bước 3: Setup Facebook OAuth (20 phút)

📖 [Facebook OAuth Setup](./facebook-setup.md) - Hướng dẫn chi tiết từng bước

---

## 📚 Tài liệu đầy đủ

| File                                                     | Mô tả                         |
| -------------------------------------------------------- | ----------------------------- |
| [quick-start.md](./quick-start.md)                       | Hướng dẫn bắt đầu nhanh       |
| [google-setup.md](./google-setup.md)                     | Setup Google OAuth chi tiết   |
| [facebook-setup.md](./facebook-setup.md)                 | Setup Facebook OAuth chi tiết |
| [setup-guide.md](./setup-guide.md)                       | Tổng hợp cả 2 providers       |
| [authentication-changes.md](./authentication-changes.md) | Chi tiết thay đổi code        |

---

## ✅ Đã hoàn thành

### Google OAuth

- ✅ Tạo Google Cloud Project
- ✅ Cấu hình OAuth Consent Screen
- ✅ Tạo OAuth Client ID
- ✅ Thêm redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://plcvietnam.vercel.app/api/auth/callback/google`
- ✅ Lấy Client ID và Secret
- ✅ Thêm vào `.env.local`
- ✅ Deploy lên Vercel production

### Tiếp theo

- [ ] Setup Facebook OAuth
- [ ] Test trên localhost
- [ ] Test trên production
- [ ] Redeploy Vercel

---

## 🧪 Test

### Localhost

```bash
npm run dev
```

Truy cập http://localhost:3000 → Vào bài viết → Test Google login

### Production

Truy cập https://plcvietnam.vercel.app → Vào bài viết → Test Google login

---

## 🔄 Redeploy Vercel

Sau khi thêm env vars, cần redeploy:

```bash
vercel --prod
```

Hoặc push code lên Git để trigger auto-deploy.

---

**Tiếp theo**: Setup Facebook OAuth theo [facebook-setup.md](./facebook-setup.md)
