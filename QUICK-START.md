# ⚡ Quick Start - PLC Việt Nam

## 🚀 Chạy project

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

File `.env.local` đã có sẵn với:

- ✅ Supabase credentials
- ✅ Google OAuth credentials
- ⏳ Facebook OAuth (chưa setup)

### 3. Start development server

```bash
npm run dev
```

Mở http://localhost:3000

---

## 🔐 OAuth Status

| Provider     | Status        | Action                                        |
| ------------ | ------------- | --------------------------------------------- |
| **Google**   | ✅ Sẵn sàng   | Test ngay!                                    |
| **Facebook** | ⏳ Chưa setup | [Setup guide](./docs/oauth/facebook-setup.md) |

---

## 🧪 Test Google Login

1. Mở http://localhost:3000
2. Click vào bất kỳ bài viết nào
3. Scroll xuống phần comment
4. Click **"Đăng nhập với Google"**
5. Chọn tài khoản Google
6. Cho phép truy cập
7. Thử comment!

---

## 📚 Documentation

### OAuth Setup

- [OAuth README](./docs/oauth/README.md) - Tổng quan
- [Google Setup](./docs/oauth/google-setup.md) - Chi tiết Google
- [Facebook Setup](./docs/oauth/facebook-setup.md) - Chi tiết Facebook
- [Status](./docs/oauth/STATUS.md) - Trạng thái hiện tại

### API Documentation

- [API Docs](./docs/API-DOCUMENTATION.md)

---

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm run start

# Test
npm run test

# Lint
npm run lint

# Deploy to Vercel
vercel --prod
```

---

## 🌐 URLs

- **Development**: http://localhost:3000
- **Production**: https://plcvietnam.vercel.app
- **Vercel Dashboard**: https://vercel.com/23560004-4800s-projects/plcvietnam

---

## ⚠️ Important Notes

### Google OAuth

- ✅ Đã setup và deploy
- ⚠️ App đang ở **Testing mode** - chỉ test users đăng nhập được
- 📝 Cần thêm email vào test users trong Google Cloud Console
- 🚀 Cần publish app để cho phép tất cả user (production)

### Facebook OAuth

- ⏳ Chưa setup
- 📖 Xem hướng dẫn: [docs/oauth/facebook-setup.md](./docs/oauth/facebook-setup.md)

---

## 🐛 Troubleshooting

### Google login không hoạt động

1. Check `.env.local` có đúng credentials không
2. Restart development server
3. Clear browser cache
4. Check console logs

### "This app isn't verified"

- Đây là bình thường khi testing
- Click "Advanced" → "Go to [App Name] (unsafe)"
- Hoặc thêm email vào test users

### Redirect URI mismatch

- Check Google Cloud Console
- Verify redirect URI: `http://localhost:3000/api/auth/callback/google`
- Không có dấu `/` ở cuối

---

**Ready to go!** 🎉

Start with: `npm run dev`
