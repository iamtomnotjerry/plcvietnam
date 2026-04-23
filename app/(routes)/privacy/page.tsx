import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật - Automation Blog',
  description: 'Chính sách bảo mật và xử lý dữ liệu cá nhân của Automation Blog',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
              Trang chủ
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <span className="text-foreground font-medium">Chính sách bảo mật</span>
          </li>
        </ol>
      </nav>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Chính sách bảo mật</h1>

        <p className="lead">
          Automation Blog cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. Chính
          sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
        </p>

        <h2>1. Thông tin chúng tôi thu thập</h2>
        <p>Khi bạn sử dụng Automation Blog, chúng tôi có thể thu thập các loại thông tin sau:</p>
        <ul>
          <li>
            <strong>Thông tin tài khoản:</strong> Tên, email, ảnh đại diện khi bạn đăng nhập qua
            Google OAuth
          </li>
          <li>
            <strong>Nội dung người dùng:</strong> Bình luận và phản hồi bạn đăng trên blog
          </li>
          <li>
            <strong>Dữ liệu sử dụng:</strong> Thông tin về cách bạn tương tác với website (lượt xem
            bài viết, thời gian truy cập)
          </li>
          <li>
            <strong>Cookies:</strong> Dữ liệu lưu trữ cục bộ để duy trì phiên đăng nhập và tùy chọn
            giao diện
          </li>
        </ul>

        <h2>2. Cách chúng tôi sử dụng thông tin</h2>
        <p>Thông tin thu thập được sử dụng để:</p>
        <ul>
          <li>Cung cấp và cải thiện dịch vụ của chúng tôi</li>
          <li>Xác thực danh tính người dùng</li>
          <li>Hiển thị bình luận và tương tác của bạn</li>
          <li>Phân tích xu hướng và hành vi người dùng để cải thiện nội dung</li>
          <li>Gửi thông báo về cập nhật quan trọng (nếu bạn đăng ký)</li>
        </ul>

        <h2>3. Chia sẻ thông tin</h2>
        <p>
          Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba. Thông tin
          chỉ được chia sẻ trong các trường hợp sau:
        </p>
        <ul>
          <li>Khi có yêu cầu pháp lý từ cơ quan có thẩm quyền</li>
          <li>Với các nhà cung cấp dịch vụ hỗ trợ vận hành website (Google OAuth, hosting)</li>
          <li>Khi bạn đồng ý chia sẻ thông tin</li>
        </ul>

        <h2>4. Bảo mật thông tin</h2>
        <p>
          Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn
          khỏi truy cập trái phép, mất mát hoặc tiết lộ. Tuy nhiên, không có phương thức truyền tải
          qua Internet nào là 100% an toàn.
        </p>

        <h2>5. Quyền của bạn</h2>
        <p>Bạn có quyền:</p>
        <ul>
          <li>Truy cập và xem thông tin cá nhân của mình</li>
          <li>Yêu cầu chỉnh sửa hoặc xóa thông tin</li>
          <li>Rút lại sự đồng ý xử lý dữ liệu</li>
          <li>Xuất dữ liệu cá nhân của bạn</li>
        </ul>
        <p>
          Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email:
          <a href="mailto:privacy@automationblog.vn">privacy@automationblog.vn</a>
        </p>

        <h2>6. Cookies và công nghệ theo dõi</h2>
        <p>Chúng tôi sử dụng cookies và localStorage để:</p>
        <ul>
          <li>Duy trì phiên đăng nhập của bạn</li>
          <li>Lưu tùy chọn giao diện (chế độ sáng/tối)</li>
          <li>Phân tích lưu lượng truy cập website</li>
        </ul>
        <p>
          Bạn có thể tắt cookies trong trình duyệt, nhưng điều này có thể ảnh hưởng đến trải nghiệm
          sử dụng.
        </p>

        <h2>7. Liên kết đến website bên thứ ba</h2>
        <p>
          Automation Blog có thể chứa liên kết đến các website khác. Chúng tôi không chịu trách
          nhiệm về chính sách bảo mật của các website này. Vui lòng đọc chính sách bảo mật của họ
          trước khi cung cấp thông tin.
        </p>

        <h2>8. Thay đổi chính sách</h2>
        <p>
          Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được đăng
          trên trang này với ngày cập nhật mới. Chúng tôi khuyến khích bạn xem lại chính sách định
          kỳ.
        </p>

        <h2>9. Liên hệ</h2>
        <p>Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:</p>
        <ul>
          <li>
            Email: <a href="mailto:privacy@automationblog.vn">privacy@automationblog.vn</a>
          </li>
          <li>
            Trang liên hệ: <Link href="/about">Giới thiệu</Link>
          </li>
        </ul>

        <p className="text-sm text-muted-foreground mt-8">
          <em>
            Cập nhật lần cuối:{' '}
            {new Date().toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </em>
        </p>
      </article>
    </div>
  );
}
