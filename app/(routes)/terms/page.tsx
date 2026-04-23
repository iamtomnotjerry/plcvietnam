import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng - Automation Blog',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ của Automation Blog',
};

export default function TermsPage() {
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
            <span className="text-foreground font-medium">Điều khoản sử dụng</span>
          </li>
        </ol>
      </nav>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Điều khoản sử dụng</h1>

        <p className="lead">
          Chào mừng bạn đến với Automation Blog. Bằng việc truy cập và sử dụng website này, bạn đồng
          ý tuân thủ các điều khoản và điều kiện sau đây.
        </p>

        <h2>1. Chấp nhận điều khoản</h2>
        <p>
          Khi truy cập và sử dụng Automation Blog, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị
          ràng buộc bởi các điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản,
          vui lòng không sử dụng dịch vụ của chúng tôi.
        </p>

        <h2>2. Sử dụng dịch vụ</h2>
        <h3>2.1. Quyền truy cập</h3>
        <p>
          Chúng tôi cấp cho bạn quyền truy cập và sử dụng Automation Blog cho mục đích cá nhân, phi
          thương mại. Bạn không được:
        </p>
        <ul>
          <li>Sao chép, phân phối hoặc sửa đổi nội dung mà không có sự cho phép</li>
          <li>Sử dụng nội dung cho mục đích thương mại mà không có thỏa thuận bằng văn bản</li>
          <li>Cố gắng truy cập trái phép vào hệ thống hoặc mạng của chúng tôi</li>
          <li>Gây cản trở hoặc làm gián đoạn hoạt động của website</li>
        </ul>

        <h3>2.2. Tài khoản người dùng</h3>
        <p>
          Để sử dụng một số tính năng (như bình luận), bạn cần đăng nhập qua Google OAuth. Bạn chịu
          trách nhiệm:
        </p>
        <ul>
          <li>Duy trì tính bảo mật của tài khoản</li>
          <li>Tất cả hoạt động diễn ra dưới tài khoản của bạn</li>
          <li>Thông báo ngay cho chúng tôi nếu phát hiện sử dụng trái phép</li>
        </ul>

        <h2>3. Nội dung người dùng</h2>
        <h3>3.1. Trách nhiệm của bạn</h3>
        <p>Khi đăng bình luận hoặc nội dung khác trên Automation Blog, bạn đảm bảo rằng:</p>
        <ul>
          <li>Nội dung không vi phạm pháp luật hoặc quyền của bên thứ ba</li>
          <li>Nội dung không chứa thông tin sai lệch, xúc phạm, hoặc có hại</li>
          <li>Bạn sở hữu hoặc có quyền sử dụng nội dung đó</li>
          <li>Nội dung không chứa virus, malware hoặc mã độc hại</li>
        </ul>

        <h3>3.2. Quyền sử dụng nội dung</h3>
        <p>
          Bằng việc đăng nội dung, bạn cấp cho Automation Blog quyền không độc quyền, miễn phí, toàn
          cầu để sử dụng, hiển thị và phân phối nội dung đó trên website.
        </p>

        <h3>3.3. Kiểm duyệt nội dung</h3>
        <p>
          Chúng tôi có quyền (nhưng không có nghĩa vụ) xem xét, chỉnh sửa hoặc xóa bất kỳ nội dung
          nào vi phạm điều khoản này hoặc được coi là không phù hợp.
        </p>

        <h2>4. Quyền sở hữu trí tuệ</h2>
        <h3>4.1. Nội dung của chúng tôi</h3>
        <p>
          Tất cả nội dung trên Automation Blog (bài viết, hình ảnh, logo, thiết kế) thuộc quyền sở
          hữu của chúng tôi hoặc được cấp phép sử dụng hợp pháp. Nội dung được bảo vệ bởi luật bản
          quyền và sở hữu trí tuệ.
        </p>

        <h3>4.2. Sử dụng hợp lý</h3>
        <p>Bạn có thể:</p>
        <ul>
          <li>Xem và đọc nội dung cho mục đích cá nhân</li>
          <li>Chia sẻ liên kết đến bài viết trên mạng xã hội</li>
          <li>Trích dẫn ngắn với ghi rõ nguồn</li>
        </ul>
        <p>
          Bạn không được sao chép toàn bộ bài viết hoặc sử dụng nội dung cho mục đích thương mại mà
          không có sự cho phép bằng văn bản.
        </p>

        <h2>5. Liên kết bên ngoài</h2>
        <p>
          Automation Blog có thể chứa liên kết đến các website bên thứ ba. Chúng tôi không kiểm soát
          và không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc thực tiễn của các website
          này.
        </p>

        <h2>6. Từ chối bảo đảm</h2>
        <p>
          Automation Blog được cung cấp "nguyên trạng" mà không có bất kỳ bảo đảm nào, rõ ràng hay
          ngụ ý. Chúng tôi không đảm bảo rằng:
        </p>
        <ul>
          <li>Dịch vụ sẽ không bị gián đoạn hoặc không có lỗi</li>
          <li>Thông tin trên website luôn chính xác và cập nhật</li>
          <li>Các lỗi sẽ được sửa chữa kịp thời</li>
        </ul>

        <h2>7. Giới hạn trách nhiệm</h2>
        <p>
          Trong phạm vi tối đa được pháp luật cho phép, Automation Blog không chịu trách nhiệm cho
          bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ:
        </p>
        <ul>
          <li>Việc sử dụng hoặc không thể sử dụng dịch vụ</li>
          <li>Truy cập trái phép vào dữ liệu của bạn</li>
          <li>Lỗi hoặc thiếu sót trong nội dung</li>
          <li>Hành vi của người dùng khác</li>
        </ul>

        <h2>8. Bồi thường</h2>
        <p>
          Bạn đồng ý bồi thường và giữ cho Automation Blog, các giám đốc, nhân viên và đối tác không
          bị thiệt hại từ bất kỳ khiếu nại, tổn thất, trách nhiệm pháp lý nào phát sinh từ:
        </p>
        <ul>
          <li>Vi phạm điều khoản sử dụng này</li>
          <li>Vi phạm quyền của bên thứ ba</li>
          <li>Nội dung bạn đăng tải</li>
        </ul>

        <h2>9. Chấm dứt</h2>
        <p>
          Chúng tôi có quyền tạm ngưng hoặc chấm dứt quyền truy cập của bạn vào Automation Blog bất
          cứ lúc nào, với hoặc không có lý do, với hoặc không có thông báo trước.
        </p>

        <h2>10. Thay đổi điều khoản</h2>
        <p>
          Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi có hiệu lực
          ngay khi được đăng trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi đồng
          nghĩa với việc bạn chấp nhận các điều khoản mới.
        </p>

        <h2>11. Luật áp dụng</h2>
        <p>
          Các điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam. Mọi tranh chấp
          phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
        </p>

        <h2>12. Liên hệ</h2>
        <p>Nếu bạn có câu hỏi về điều khoản sử dụng này, vui lòng liên hệ:</p>
        <ul>
          <li>
            Email: <a href="mailto:legal@automationblog.vn">legal@automationblog.vn</a>
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
