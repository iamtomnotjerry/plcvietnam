# Hướng dẫn cấu hình Google OAuth từ A-Z

## 📋 Tổng quan

Google OAuth cho phép người dùng đăng nhập bằng tài khoản Google của họ mà không cần tạo tài khoản mới. Hướng dẫn này sẽ giúp bạn setup từ đầu.

---

## Bước 1: Truy cập Google Cloud Console

1. Mở trình duyệt và truy cập: **https://console.cloud.google.com/**
2. Đăng nhập bằng tài khoản Google của bạn (Gmail)
3. Nếu lần đầu sử dụng, bạn sẽ thấy màn hình chào mừng

---

## Bước 2: Tạo Project mới

### 2.1. Click vào dropdown "Select a project"

- Ở góc trên bên trái, bên cạnh logo "Google Cloud"
- Click vào tên project hiện tại (hoặc "Select a project")

### 2.2. Tạo project mới

1. Click nút **"NEW PROJECT"** ở góc trên bên phải popup
2. Điền thông tin:
   - **Project name**: `PLC Vietnam` (hoặc tên bạn muốn)
   - **Organization**: Để mặc định (No organization)
   - **Location**: Để mặc định
3. Click **"CREATE"**
4. Đợi vài giây để Google tạo project
5. Chọn project vừa tạo từ dropdown

---

## Bước 3: Kích hoạt Google+ API (Không bắt buộc nhưng nên làm)

1. Trong sidebar bên trái, click **"APIs & Services"** → **"Library"**
2. Tìm kiếm: `Google+ API`
3. Click vào **"Google+ API"**
4. Click nút **"ENABLE"**

---

## Bước 4: Cấu hình OAuth Consent Screen

### 4.1. Truy cập OAuth consent screen

1. Trong sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
2. Chọn **"External"** (cho phép bất kỳ ai có tài khoản Google đăng nhập)
3. Click **"CREATE"**

### 4.2. Điền thông tin App (Trang 1/4)

**App information:**

- **App name**: `PLC Việt Nam` (tên hiển thị cho user)
- **User support email**: Chọn email của bạn từ dropdown
- **App logo**: (Optional) Upload logo 120x120px nếu có

**App domain:**

- **Application home page**: `http://localhost:3000` (dev) hoặc `https://your-domain.com` (prod)
- **Application privacy policy link**: `http://localhost:3000/privacy` (dev) hoặc `https://your-domain.com/privacy` (prod)
- **Application terms of service link**: `http://localhost:3000/terms` (dev) hoặc `https://your-domain.com/terms` (prod)

**Authorized domains:**

- Thêm: `localhost` (cho development)
- Thêm: `your-domain.com` (cho production, không có https://)

**Developer contact information:**

- **Email addresses**: Nhập email của bạn

Click **"SAVE AND CONTINUE"**

### 4.3. Scopes (Trang 2/4)

1. Click **"ADD OR REMOVE SCOPES"**
2. Tìm và chọn các scopes sau:
   - ✅ `.../auth/userinfo.email` - Xem địa chỉ email
   - ✅ `.../auth/userinfo.profile` - Xem thông tin cá nhân (tên, ảnh)
   - ✅ `openid` - Xác thực danh tính
3. Click **"UPDATE"**
4. Click **"SAVE AND CONTINUE"**

### 4.4. Test users (Trang 3/4)

⚠️ **Quan trọng**: Khi app ở chế độ "Testing", chỉ test users mới đăng nhập được.

1. Click **"ADD USERS"**
2. Thêm email của bạn và các tester (mỗi email một dòng):
   ```
   your-email@gmail.com
   tester1@gmail.com
   tester2@gmail.com
   ```
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

### 4.5. Summary (Trang 4/4)

- Review lại thông tin
- Click **"BACK TO DASHBOARD"**

---

## Bước 5: Tạo OAuth 2.0 Client ID

### 5.1. Truy cập Credentials

1. Trong sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click nút **"+ CREATE CREDENTIALS"** ở trên
3. Chọn **"OAuth client ID"**

### 5.2. Chọn Application type

1. **Application type**: Chọn **"Web application"**
2. **Name**: `PLC Vietnam Web Client` (tên để bạn nhận biết)

### 5.3. Cấu hình Authorized redirect URIs

**Authorized JavaScript origins** (Optional):

- Thêm: `http://localhost:3000`
- Thêm: `https://your-domain.com` (production)

**Authorized redirect URIs** (QUAN TRỌNG):

1. Click **"+ ADD URI"**
2. Thêm URI cho development:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
3. Click **"+ ADD URI"** lần nữa
4. Thêm URI cho production (Vercel):
   ```
   https://plcvietnam.vercel.app/api/auth/callback/google
   ```

✅ **ĐÃ CẤU HÌNH**

⚠️ **Lưu ý**:

- URI phải chính xác 100%, không có dấu `/` ở cuối
- Phân biệt `http` (dev) và `https` (prod)
- Path phải là `/api/auth/callback/google`

### 5.4. Tạo Client ID

1. Click **"CREATE"**
2. Popup hiện ra với **Client ID** và **Client Secret**
3. **QUAN TRỌNG**: Copy 2 giá trị này ngay!

---

## Bước 6: Lưu Credentials vào Project

### 6.1. Copy Client ID và Client Secret

✅ **ĐÃ LẤY ĐƯỢC**:

**Client ID**:

```
1099143255402-u74fhvk8tahn63md5a47315dd5c69m.apps.googleusercontent.com
```

**Client Secret**:

```
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
```

### 6.2. Thêm vào file `.env.local`

✅ **ĐÃ THÊM VÀO `.env.local`**:

```env
# Google OAuth
GOOGLE_CLIENT_ID=1099143255402-u74fhvk8tahn63md5a47315dd5c69m.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

✅ **ĐÃ THÊM VÀO VERCEL PRODUCTION**

⚠️ **Bảo mật**:

- **KHÔNG** commit file `.env.local` lên Git
- **KHÔNG** share Client Secret với ai
- File `.env.local` đã có trong `.gitignore`

---

## Bước 7: Verify cấu hình

### 7.1. Kiểm tra file `.env.local`

File của bạn nên có các biến sau:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc...xyz

# Supabase (nếu có)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 7.2. Restart Development Server

```bash
# Stop server hiện tại (Ctrl+C)
npm run dev
```

---

## Bước 8: Test Google Login

### 8.1. Test trên Development

1. Mở trình duyệt: `http://localhost:3000`
2. Truy cập bất kỳ bài viết nào
3. Scroll xuống phần comment
4. Click nút **"Đăng nhập với Google"**
5. Chọn tài khoản Google
6. Cho phép app truy cập thông tin
7. Kiểm tra:
   - ✅ Redirect về trang bài viết
   - ✅ Có thể comment ngay
   - ✅ Avatar và tên hiển thị đúng

### 8.2. Nếu gặp lỗi

**Lỗi: "Error 400: redirect_uri_mismatch"**

**Nguyên nhân**: Redirect URI không khớp

**Giải pháp**:

1. Quay lại Google Cloud Console
2. **Credentials** → Click vào OAuth Client ID vừa tạo
3. Kiểm tra **Authorized redirect URIs**
4. Đảm bảo có: `http://localhost:3000/api/auth/callback/google`
5. Không có dấu `/` ở cuối
6. Click **"SAVE"**
7. Đợi vài phút để Google cập nhật
8. Thử lại

**Lỗi: "Access blocked: This app's request is invalid"**

**Nguyên nhân**: OAuth Consent Screen chưa setup đúng

**Giải pháp**:

1. Quay lại **OAuth consent screen**
2. Kiểm tra đã điền đầy đủ thông tin
3. Kiểm tra **Authorized domains** có `localhost`
4. Thêm email của bạn vào **Test users**

**Lỗi: "This app isn't verified"**

**Nguyên nhân**: App đang ở chế độ Testing

**Giải pháp**:

- Đây là bình thường khi development
- Click **"Advanced"** → **"Go to [App Name] (unsafe)"**
- Hoặc publish app (xem Bước 9)

---

## Bước 9: Publish App (Production)

⚠️ **Chỉ làm khi deploy lên production**

### 9.1. Chuyển từ Testing sang Production

1. Truy cập **OAuth consent screen**
2. Click **"PUBLISH APP"**
3. Google sẽ review app của bạn (có thể mất vài ngày)
4. Sau khi approve, tất cả user có thể đăng nhập

### 9.2. Cập nhật Redirect URI cho Production

1. Truy cập **Credentials**
2. Click vào OAuth Client ID
3. Thêm production redirect URI:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
4. Click **"SAVE"**

### 9.3. Cập nhật Environment Variables trên Vercel/Hosting

Nếu deploy trên Vercel:

1. Truy cập Vercel Dashboard
2. Chọn project
3. **Settings** → **Environment Variables**
4. Thêm:
   - `GOOGLE_CLIENT_ID` = `your-client-id`
   - `GOOGLE_CLIENT_SECRET` = `your-client-secret`
   - `NEXTAUTH_URL` = `https://your-domain.com`
5. Redeploy app

---

## 📊 Checklist hoàn thành

- [ ] Tạo Google Cloud Project
- [ ] Cấu hình OAuth Consent Screen
- [ ] Thêm Test Users
- [ ] Tạo OAuth 2.0 Client ID
- [ ] Cấu hình Authorized redirect URIs
- [ ] Copy Client ID và Client Secret
- [ ] Thêm vào `.env.local`
- [ ] Restart development server
- [ ] Test đăng nhập thành công
- [ ] (Production) Publish app
- [ ] (Production) Cập nhật production redirect URI

---

## 🔍 Troubleshooting

### Không thấy nút "Đăng nhập với Google"

**Kiểm tra**:

1. File `.env.local` có `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` chưa?
2. Đã restart server chưa?
3. Check browser console có lỗi không?

### Redirect về trang khác sau khi đăng nhập

**Nguyên nhân**: NextAuth callback URL

**Giải pháp**: Đã xử lý trong code với `callbackUrl: window.location.href`

### Email không được trả về

**Nguyên nhân**: Scope không đủ

**Giải pháp**:

1. Kiểm tra OAuth Consent Screen → Scopes
2. Đảm bảo có scope `userinfo.email`

---

## 📚 Tài liệu tham khảo

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 💡 Tips

1. **Development**: Dùng `http://localhost:3000`
2. **Production**: Dùng `https://your-domain.com`
3. **Bảo mật**: Không share Client Secret
4. **Testing**: Thêm email vào Test Users trước khi test
5. **Publish**: Chỉ publish khi deploy production

---

**Hoàn thành!** 🎉

Bây giờ bạn có thể cho phép user đăng nhập bằng Google. Tiếp theo, setup Facebook OAuth theo hướng dẫn trong `FACEBOOK-OAUTH-SETUP.md`.
