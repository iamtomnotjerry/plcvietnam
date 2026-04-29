# Thay đổi Authentication & Comment System

## Tổng quan thay đổi

### 1. Ẩn nút đăng nhập khỏi Header

**Trước đây**: Nút "Đăng nhập" hiển thị ở header cho tất cả người dùng

**Bây giờ**:

- Nút đăng nhập đã được ẩn khỏi header
- Người dùng phải biết URL trực tiếp để đăng nhập: `/auth/sign-in`
- Chỉ admin/author cần biết URL này để quản lý nội dung

### 2. Đăng nhập Social cho Comment

**Trước đây**: Người dùng phải đăng ký tài khoản bằng email/password

**Bây giờ**:

- Người dùng có thể đăng nhập nhanh bằng **Google** hoặc **Facebook**
- Không cần đăng ký tài khoản riêng
- Thông tin profile tự động được tạo từ OAuth provider

## Files đã thay đổi

### 1. `components/layout/SiteHeader.tsx`

- ✅ Xóa import `AuthButton`
- ✅ Xóa component `<AuthButton />` khỏi header

### 2. `lib/auth/config.ts`

- ✅ Thêm `FacebookProvider` từ `next-auth/providers/facebook`
- ✅ Thêm biến `facebookConfigured` để kiểm tra env vars
- ✅ Cập nhật `signIn` callback để hỗ trợ Facebook OAuth
- ✅ Thêm Facebook provider vào danh sách providers

### 3. `features/comments/components/SocialLoginPrompt.tsx` (MỚI)

- ✅ Component mới hiển thị 2 nút đăng nhập social
- ✅ Nút "Đăng nhập với Google" với logo Google
- ✅ Nút "Đăng nhập với Facebook" với logo Facebook
- ✅ Loading states khi đang đăng nhập
- ✅ Responsive design (mobile-friendly)

### 4. `features/comments/components/CommentSection.tsx`

- ✅ Import `SocialLoginPrompt`
- ✅ Thay thế text prompt đơn giản bằng `<SocialLoginPrompt />`

### 5. `.env.example`

- ✅ Thêm `FACEBOOK_CLIENT_ID`
- ✅ Thêm `FACEBOOK_CLIENT_SECRET`
- ✅ Thêm hướng dẫn lấy credentials từ Facebook Developers

### 6. `features/comments/components/CommentSection.test.tsx`

- ✅ Cập nhật test cases cho social login buttons
- ✅ Kiểm tra hiển thị nút Google và Facebook khi chưa đăng nhập
- ✅ Kiểm tra ẩn nút social khi đã đăng nhập

## Cấu hình cần thiết

### Bước 1: Cấu hình Google OAuth (Đã có)

Nếu chưa cấu hình, xem: [Google OAuth Setup](https://console.cloud.google.com)

### Bước 2: Cấu hình Facebook OAuth (MỚI)

Xem hướng dẫn chi tiết: [FACEBOOK-OAUTH-SETUP.md](./FACEBOOK-OAUTH-SETUP.md)

**Tóm tắt**:

1. Tạo Facebook App tại https://developers.facebook.com
2. Thêm Facebook Login product
3. Cấu hình OAuth Redirect URI: `http://localhost:3000/api/auth/callback/facebook`
4. Lấy App ID và App Secret
5. Thêm vào `.env.local`:
   ```env
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```
6. Chuyển app sang Live Mode để cho phép tất cả user đăng nhập

### Bước 3: Restart Development Server

```bash
npm run dev
```

## Cách sử dụng

### Đối với người dùng thông thường

1. Truy cập bất kỳ bài viết nào
2. Scroll xuống phần comment
3. Click **"Đăng nhập với Google"** hoặc **"Đăng nhập với Facebook"**
4. Cho phép app truy cập thông tin cơ bản
5. Tự động quay lại trang và có thể comment

### Đối với Admin/Author

1. Truy cập trực tiếp: `https://your-domain.com/auth/sign-in`
2. Đăng nhập bằng email/password hoặc Google
3. Truy cập admin panel: `/admin`

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User đọc bài viết                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Muốn để lại comment                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         Thấy SocialLoginPrompt với 2 nút:                    │
│         [Đăng nhập với Google] [Đăng nhập với Facebook]     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Click nút đăng nhập                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         Redirect đến Google/Facebook OAuth                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Cho phép truy cập                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         Redirect về trang bài viết                           │
│         Profile tự động tạo trong Supabase                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         Có thể comment ngay lập tức                          │
└─────────────────────────────────────────────────────────────┘
```

## Security Notes

### OAuth Providers

- ✅ Google và Facebook đã verify email của user
- ✅ Không cần email verification flow
- ✅ Avatar tự động lấy từ OAuth provider
- ✅ Profile tự động tạo trong Supabase qua `ensureProfile()`

### Hidden Login URL

- ✅ URL `/auth/sign-in` không hiển thị công khai
- ✅ Chỉ admin/author biết URL này
- ✅ Giảm spam registration
- ✅ User thông thường chỉ cần OAuth để comment

### Rate Limiting

- ⚠️ Cần thêm rate limiting cho OAuth endpoints nếu cần
- ⚠️ Facebook có thể rate limit nếu quá nhiều requests

## Testing

### Manual Testing

1. **Test Google Login**:

   ```bash
   # Đảm bảo có GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
   npm run dev
   # Truy cập bài viết → Click "Đăng nhập với Google"
   ```

2. **Test Facebook Login**:

   ```bash
   # Đảm bảo có FACEBOOK_CLIENT_ID và FACEBOOK_CLIENT_SECRET
   npm run dev
   # Truy cập bài viết → Click "Đăng nhập với Facebook"
   ```

3. **Test Hidden Login**:
   ```bash
   # Kiểm tra header không có nút đăng nhập
   # Truy cập trực tiếp /auth/sign-in vẫn hoạt động
   ```

### Automated Testing

```bash
npm run test features/comments/components/CommentSection.test.tsx
```

## Troubleshooting

### Facebook Login không hoạt động

1. Kiểm tra App có ở Live Mode chưa
2. Kiểm tra OAuth Redirect URI đúng chưa
3. Kiểm tra App Domains đã thêm chưa
4. Xem logs trong Facebook App Dashboard

### Google Login không hoạt động

1. Kiểm tra Authorized redirect URIs trong Google Console
2. Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
3. Xem logs trong browser console

### Profile không tạo trong Supabase

1. Kiểm tra `ensureProfile()` function
2. Kiểm tra Supabase service role key
3. Xem logs trong Supabase Dashboard

## Next Steps

- [ ] Thêm rate limiting cho OAuth endpoints
- [ ] Thêm analytics tracking cho social login
- [ ] Thêm Apple Sign In (nếu cần)
- [ ] Thêm Twitter/X OAuth (nếu cần)
- [ ] Cải thiện error handling cho OAuth failures
