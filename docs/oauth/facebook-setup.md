# Hướng dẫn cấu hình Facebook OAuth

## Bước 1: Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Đăng nhập bằng tài khoản Facebook của bạn
3. Click **"My Apps"** → **"Create App"**
4. Chọn **"Consumer"** hoặc **"None"** (tùy mục đích)
5. Điền thông tin:
   - **App Display Name**: Tên ứng dụng của bạn (ví dụ: "PLC Việt Nam")
   - **App Contact Email**: Email liên hệ
6. Click **"Create App"**

## Bước 2: Thêm Facebook Login

1. Trong dashboard của app, tìm **"Add a Product"**
2. Tìm **"Facebook Login"** và click **"Set Up"**
3. Chọn **"Web"** platform
4. Nhập **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
5. Click **"Save"** và **"Continue"**

## Bước 3: Cấu hình OAuth Redirect URIs

1. Trong sidebar, click **"Facebook Login"** → **"Settings"**
2. Trong **"Valid OAuth Redirect URIs"**, thêm:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://your-domain.com/api/auth/callback/facebook
   ```
3. Click **"Save Changes"**

## Bước 4: Lấy App ID và App Secret

1. Trong sidebar, click **"Settings"** → **"Basic"**
2. Copy **"App ID"** → Đây là `FACEBOOK_CLIENT_ID`
3. Click **"Show"** ở **"App Secret"** → Đây là `FACEBOOK_CLIENT_SECRET`
4. Thêm vào file `.env.local`:
   ```env
   FACEBOOK_CLIENT_ID=your-app-id-here
   FACEBOOK_CLIENT_SECRET=your-app-secret-here
   ```

## Bước 5: Cấu hình App Domain

1. Trong **"Settings"** → **"Basic"**
2. Thêm **"App Domains"**:
   - Development: `localhost`
   - Production: `your-domain.com` (không có https://)
3. Thêm **"Privacy Policy URL"**: `https://your-domain.com/privacy`
4. Thêm **"Terms of Service URL"**: `https://your-domain.com/terms`
5. Click **"Save Changes"**

## Bước 6: Chuyển App sang Live Mode

⚠️ **Quan trọng**: App mặc định ở chế độ Development, chỉ admin/developer/tester có thể đăng nhập.

Để cho phép tất cả người dùng đăng nhập:

1. Trong sidebar, click **"Settings"** → **"Basic"**
2. Scroll xuống dưới cùng
3. Chuyển toggle từ **"Development"** sang **"Live"**
4. Facebook sẽ yêu cầu bạn:
   - Thêm Privacy Policy URL
   - Thêm App Icon (1024x1024px)
   - Chọn Category cho app
5. Hoàn thành các yêu cầu và submit để review (nếu cần)

## Bước 7: Yêu cầu Permissions (Optional)

Mặc định, Facebook Login chỉ cung cấp:

- `public_profile` (tên, ảnh đại diện)
- `email`

Nếu cần thêm permissions (như `user_birthday`, `user_location`), bạn phải:

1. Submit app để Facebook review
2. Giải thích lý do cần permission đó
3. Đợi Facebook approve (có thể mất vài ngày)

## Bước 8: Test

1. Restart Next.js development server:
   ```bash
   npm run dev
   ```
2. Truy cập trang có comment section
3. Click **"Đăng nhập với Facebook"**
4. Cho phép app truy cập thông tin
5. Kiểm tra xem đăng nhập thành công và có thể comment

## Troubleshooting

### Lỗi: "URL Blocked: This redirect failed because the redirect URI is not whitelisted"

**Giải pháp**: Kiểm tra lại **Valid OAuth Redirect URIs** trong Facebook Login Settings. Đảm bảo URL chính xác:

```
http://localhost:3000/api/auth/callback/facebook
```

### Lỗi: "App Not Setup: This app is still in development mode"

**Giải pháp**:

- Thêm tài khoản test vào **Roles** → **Test Users**
- Hoặc chuyển app sang **Live Mode** (xem Bước 6)

### Lỗi: "Can't Load URL: The domain of this URL isn't included in the app's domains"

**Giải pháp**: Thêm domain vào **App Domains** trong Settings → Basic

### Email không được trả về

**Giải pháp**:

- Kiểm tra user có email trong Facebook account không
- Một số user Facebook không có email public
- Xử lý trường hợp `email` có thể là `null` trong code

## Tài liệu tham khảo

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [NextAuth.js Facebook Provider](https://next-auth.js.org/providers/facebook)
