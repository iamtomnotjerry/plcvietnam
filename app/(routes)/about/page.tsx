/**
 * About Page Route
 * Display author information and credentials
 */

import { contentRepository } from '@/lib/data/factory';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { Route } from 'next';
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/utils/structuredData';

export async function generateMetadata(): Promise<Metadata> {
  const author = await contentRepository.getAuthor();
  return {
    title: `Giới thiệu - ${author.name}`,
    description:
      'Trần Văn Hiếu - Automation Consultant & SITRAIN Manager tại Siemens Việt Nam. 15+ năm kinh nghiệm tự động hóa công nghiệp, tác giả bộ sách TIA Portal, Admin cộng đồng PLC Việt Nam.',
  };
}

export default async function AboutPage() {
  const author = await contentRepository.getAuthor();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://plcvietnam.com';
  const personSchema = generatePersonSchema(author, baseUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Trang chủ', url: baseUrl },
    { name: 'Giới thiệu' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li>
              <span className="text-foreground font-medium">Giới thiệu</span>
            </li>
          </ol>
        </nav>

        {/* Edit Button for Admin */}
        <div className="mb-6 flex justify-end">
          <Link
            href={'/admin/about/edit' as Route}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Chỉnh sửa
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-12 text-center">
          {author.avatarUrl && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-primary/20">
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="200px"
                />
              </div>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{author.name}</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
              Automation Consultant
            </span>
            <span className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
              SITRAIN Manager
            </span>
            <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-md text-sm font-semibold">
              15+ năm kinh nghiệm
            </span>
          </div>
          <p className="mt-4 text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Chuyên gia tư vấn tự động hóa công nghiệp và quản lý đào tạo chuyên nghiệp tại Siemens
            Việt Nam. Kết nối triển khai thực tế, đào tạo chuyển giao và phát triển cộng đồng kỹ sư
            tự động hóa tại Việt Nam.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            {
              value: '15+',
              label: 'Năm kinh nghiệm',
              icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            },
            {
              value: '50+',
              label: 'Dự án triển khai',
              icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
            },
            {
              value: '500+',
              label: 'Học viên đào tạo',
              icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <svg
                className="w-8 h-8 text-primary mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={stat.icon}
                />
              </svg>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chuyên môn */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Hồ sơ chuyên môn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                title: '15+ năm kinh nghiệm',
                desc: 'Kinh nghiệm triển khai giải pháp tự động hóa công nghiệp cho nhiều dự án lớn tại Việt Nam',
              },
              {
                icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
                title: 'Nền tảng Siemens',
                desc: 'Thành thạo TIA Portal, SIMATIC PLC, WinCC, PCS 7 và các hệ thống truyền thông công nghiệp',
              },
              {
                icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
                title: 'Tư duy hệ thống',
                desc: 'Chuẩn kỹ thuật cao, phối hợp đa bên hiệu quả trong triển khai dự án tự động hóa',
              },
              {
                icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                title: 'Năng lực đào tạo',
                desc: 'Truyền đạt chuyên môn, phát triển đội ngũ kỹ thuật và chuyển giao công nghệ hiệu quả',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 bg-card border border-border rounded-xl border-l-4 border-l-primary"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={item.icon}
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Kinh nghiệm triển khai */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Kinh nghiệm triển khai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quy trình */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Quy trình triển khai dự án
              </h3>
              <ol className="space-y-3">
                {[
                  {
                    title: 'Khảo sát hiện trạng',
                    desc: 'Đánh giá tình hình thực tế, thu thập yêu cầu từ khách hàng',
                  },
                  {
                    title: 'Phân tích kỹ thuật',
                    desc: 'Phân tích yêu cầu kỹ thuật, đánh giá khả thi giải pháp',
                  },
                  {
                    title: 'Thiết kế giải pháp',
                    desc: 'Thiết kế hệ thống, lập kế hoạch triển khai',
                  },
                  {
                    title: 'Lập trình & tích hợp',
                    desc: 'Lập trình PLC, SCADA, tích hợp hệ thống',
                  },
                  { title: 'Kiểm thử', desc: 'Kiểm tra, hiệu chỉnh, tối ưu hóa hệ thống' },
                  {
                    title: 'Nghiệm thu & bàn giao',
                    desc: 'Đánh giá chất lượng, bàn giao cho khách hàng',
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2 border-l-4 border-primary">
                      <div className="text-sm font-semibold text-foreground">{step.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {/* Ngành ứng dụng */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Ngành ứng dụng
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
                    name: 'Thực phẩm',
                    desc: 'Dây chuyền sản xuất',
                  },
                  {
                    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                    name: 'Xi măng',
                    desc: 'Nhà máy xi măng',
                  },
                  {
                    icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
                    name: 'Cảng biển',
                    desc: 'Hệ thống cảng',
                  },
                  {
                    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
                    name: 'Sản xuất',
                    desc: 'Dây chuyền tự động',
                  },
                  {
                    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                    name: 'Thủy điện',
                    desc: 'Nhà máy thủy điện',
                  },
                  {
                    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
                    name: 'Năng lượng',
                    desc: 'Hệ thống điện',
                  },
                ].map((ind) => (
                  <div
                    key={ind.name}
                    className="flex flex-col items-center p-3 bg-muted/50 rounded-xl border border-border text-center"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d={ind.icon}
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{ind.name}</div>
                    <div className="text-xs text-muted-foreground">{ind.desc}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-foreground">50+</div>
                  <div className="text-xs text-muted-foreground">Dự án</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-foreground">100%</div>
                  <div className="text-xs text-muted-foreground">Thành công</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SITRAIN Manager */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Quản lý Trung tâm Đào tạo SITRAIN
          </h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Xây dựng chiến lược đào tạo và nâng cao năng lực kỹ thuật cho kỹ sư tự động hóa tại
              Việt Nam theo chuẩn toàn cầu Siemens.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
                  title: 'Chiến lược đào tạo',
                  desc: 'Xây dựng định hướng đào tạo bài bản, lộ trình năng lực và chương trình học kỹ thuật chuẩn xác cho nhiều đối tượng.',
                },
                {
                  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                  title: 'Cá nhân hóa chương trình',
                  desc: 'Nội dung đào tạo được cá nhân hóa phù hợp với ngành nghề và nhu cầu thực tế của học viên.',
                },
                {
                  icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  title: 'Chuẩn toàn cầu Siemens',
                  desc: 'Các khóa học đáp ứng tiêu chuẩn toàn cầu về nội dung, phương pháp và đánh giá chất lượng.',
                },
                {
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                  title: 'Phát triển năng lực kỹ sư',
                  desc: 'Trung tâm trở thành nơi kết nối tri thức, chia sẻ kinh nghiệm và nâng cao năng lực kỹ thuật.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 p-4 bg-muted/40 rounded-xl border border-border"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tác giả sách */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Tác giả bộ sách</h2>
          <p className="text-muted-foreground mb-6">
            "Thiết kế hệ thống tự động hóa với TIA Portal" — Hệ thống hóa kiến thức PLC/HMI/SCADA
            cho kỹ sư tự động hóa
          </p>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { title: 'Automation PLC S7-300 with TIA Portal', sub: '2014 · Ed. 2016, 2019' },
                { title: 'Automation PLC S7-1200 with TIA Portal', sub: '2015 · Ed. 2019, 2021' },
                { title: 'Designing HMI/SCADA System with TIA Portal', sub: '2017 · Ed. 2019' },
                { title: 'Designing Industrial Network System with TIA Portal', sub: '2018' },
                { title: 'Automation PLC S7-1500 with TIA Portal', sub: '2021' },
              ].map((book) => (
                <div key={book.title} className="flex flex-col items-center">
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary to-blue-700 rounded-lg flex flex-col items-center justify-center p-3 shadow-md mb-2">
                    <svg
                      className="w-8 h-8 text-white mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                      />
                    </svg>
                    <div className="text-white text-xs font-bold text-center leading-tight">
                      {book.title}
                    </div>
                    <div className="text-white/70 text-xs text-center mt-1">{book.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Hệ thống hóa kiến thức', desc: 'Nội dung chuyên sâu về PLC, HMI, SCADA' },
                {
                  title: 'Lý thuyết + Thực tiễn',
                  desc: 'Kết hợp nền tảng lý thuyết với kinh nghiệm thực tế',
                },
                { title: 'Ứng dụng rộng rãi', desc: 'Sử dụng trong đào tạo và triển khai dự án' },
              ].map((v) => (
                <div
                  key={v.title}
                  className="flex gap-3 items-start p-4 bg-muted/40 rounded-xl border border-border"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{v.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Đóng góp cộng đồng */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Đóng góp cho cộng đồng PLC Việt Nam
          </h2>
          <p className="text-muted-foreground mb-6">
            Admin diễn đàn, chia sẻ kiến thức và kết nối kỹ sư tự động hóa
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vai trò cộng đồng */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">Vai trò cộng đồng</div>
                  <div className="text-xs text-muted-foreground">Admin diễn đàn PLC Việt Nam</div>
                </div>
              </div>
              <ul className="space-y-3 mb-4">
                {[
                  {
                    title: 'Admin diễn đàn',
                    desc: 'Quản trị và định hướng nội dung cho cộng đồng PLC Việt Nam',
                  },
                  {
                    title: 'Kết nối kỹ sư',
                    desc: 'Kết nối kỹ sư tự động hóa trong cộng đồng chuyên môn',
                  },
                  {
                    title: 'Hỗ trợ chuyên môn',
                    desc: 'Tư vấn kỹ thuật và giải đáp thắc mắc cho thành viên',
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-2 p-2.5 bg-muted/40 rounded-lg border-l-2 border-primary"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-3 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">5K+</div>
                  <div className="text-xs text-muted-foreground">Thành viên</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">100+</div>
                  <div className="text-xs text-muted-foreground">Bài viết</div>
                </div>
              </div>
            </div>
            {/* Nội dung chia sẻ */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">Nội dung chia sẻ</div>
                  <div className="text-xs text-muted-foreground">
                    Kiến thức chuyên sâu về tự động hóa
                  </div>
                </div>
              </div>
              <ul className="space-y-3 mb-4">
                {[
                  { title: 'PLC & SCADA', desc: 'Kiến thức về lập trình PLC và hệ thống SCADA' },
                  { title: 'Mạng công nghiệp', desc: 'DCS và mạng truyền thông công nghiệp' },
                  { title: 'Giải pháp kỹ thuật', desc: 'Hướng dẫn triển khai và xử lý sự cố' },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-2 p-2.5 bg-muted/40 rounded-lg border-l-2 border-primary"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-3 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">200+</div>
                  <div className="text-xs text-muted-foreground">Bài hướng dẫn</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">50+</div>
                  <div className="text-xs text-muted-foreground">Video tutorial</div>
                </div>
              </div>
            </div>
            {/* Tác động */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">Tác động tạo ra</div>
                  <div className="text-xs text-muted-foreground">Phát triển năng lực kỹ sư</div>
                </div>
              </div>
              <ul className="space-y-3 mb-4">
                {[
                  { title: 'Hỗ trợ kỹ sư trẻ', desc: 'Đào tạo và hướng dẫn kỹ sư mới vào nghề' },
                  { title: 'Văn hóa học tập', desc: 'Thúc đẩy tinh thần học tập liên tục' },
                  { title: 'Kết nối doanh nghiệp', desc: 'Liên kết đào tạo với nhu cầu thực tế' },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-2 p-2.5 bg-muted/40 rounded-lg border-l-2 border-primary"
                  >
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-3 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">500+</div>
                  <div className="text-xs text-muted-foreground">Người học</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-foreground">90%</div>
                  <div className="text-xs text-muted-foreground">Hài lòng</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Học vấn & Kinh nghiệm làm việc */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Học vấn & Kinh nghiệm</h2>
          <div className="space-y-4">
            {[
              {
                period: '06/2015 – Nay',
                role: 'Junior Technical Consultant / SITRAIN Manager',
                org: 'Siemens Vietnam – RC-VN DI FA',
                desc: 'Chuẩn bị hồ sơ thầu và đề xuất kỹ thuật. Phát triển phần mềm cho hệ thống tiện ích (làm lạnh, xử lý nước thải). Triển khai chương trình đào tạo chuyên nghiệp cho khách hàng và đối tác. Tư vấn kỹ thuật chuyên sâu về tự động hóa thủy điện, giải pháp DCS/SCADA.',
                type: 'work',
              },
              {
                period: '09/2011 – 06/2015',
                role: 'Automation Teacher / Trainer & Programmer',
                org: 'Giảng dạy & Lập trình tự động hóa',
                desc: 'Giảng dạy tự động hóa, đào tạo kỹ sư và lập trình PLC cho các dự án thực tế.',
                type: 'work',
              },
              {
                period: '09/2005 – 06/2010',
                role: 'Kỹ sư Điện – Điện tử (Tự động hóa)',
                org: 'Đại học Bách Khoa TP.HCM',
                desc: 'Chuyên ngành Tự động hóa, Khoa Điện – Điện tử.',
                type: 'edu',
              },
            ].map((item) => (
              <div
                key={item.period}
                className="flex gap-4 p-5 bg-card border border-border rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mt-0.5">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.type === 'edu' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    )}
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {item.period}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.org}</span>
                  </div>
                  <div className="font-semibold text-foreground mb-1">{item.role}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Kinh nghiệm dự án */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Kinh nghiệm dự án tiêu biểu</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    Dự án
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    Năm
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    Công nghệ
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Vai trò</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: 'Sai Gon – Mien Trung Beer JSC',
                    year: '2012',
                    tech: 'Modicon Schneider',
                    role: 'Design Software & Site Commissioning (Water Supply)',
                  },
                  {
                    name: 'San Miguel Hormel (VN)',
                    year: '2012',
                    tech: 'WinCC V7',
                    role: 'Design SCADA & Site Commissioning',
                  },
                  {
                    name: 'Coca-Cola Da Nang',
                    year: '2012',
                    tech: 'STEP 7, S7-300',
                    role: 'Design Software & Site Commissioning (Utilities)',
                  },
                  {
                    name: 'Pepsico Amatar',
                    year: '2013',
                    tech: 'STEP 7, S7-300/400, SIMATIC Net',
                    role: 'Site Service & Commissioning',
                  },
                  {
                    name: 'Cong Thanh Cement',
                    year: '2013',
                    tech: 'STEP 7, S7-300, ABB Inverter',
                    role: 'Design Software & Commissioning (Profibus)',
                  },
                  {
                    name: 'Henkel Vietnam',
                    year: '2013',
                    tech: 'STEP 7, S7-300/400, SIMATIC HMI',
                    role: 'Chief of Software Division',
                  },
                  {
                    name: 'Sai Gon New Port',
                    year: '2014',
                    tech: 'STEP 7, S5→S7-300',
                    role: 'Chief of Software Division – Migrate S5 to S7-300',
                  },
                  {
                    name: 'GODACO Tien Giang',
                    year: '2014',
                    tech: 'TIA Portal, S7-1500, SIMATIC HMI',
                    role: 'Chief of Software Division',
                  },
                  {
                    name: 'Hydropower Sêrêpôk 4',
                    year: '2015',
                    tech: 'PCS 7, S7-400H',
                    role: 'Site Service & Commissioning',
                  },
                  {
                    name: 'GODACO Long An',
                    year: '2016',
                    tech: 'TIA Portal, S7-1500, SIMATIC HMI',
                    role: 'Chief of Software Division',
                  },
                  {
                    name: 'Tetrapak Binh Duong',
                    year: '2018',
                    tech: 'TIA Portal, S7-1500, SINAMICS Drives',
                    role: 'Bidding, Programming, Training & Commissioning',
                  },
                  {
                    name: 'Coca-Cola Thu Duc',
                    year: '2018',
                    tech: 'STEP 7, S7-300, SIMATIC HMI',
                    role: 'Site Service & Commissioning',
                  },
                ].map((p, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.tech}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Dự án thủy điện */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Kinh nghiệm dự án Thủy điện</h2>
          <p className="text-muted-foreground mb-6">
            Tư vấn kỹ thuật tự động hóa và giải pháp DCS/SCADA cho nhà máy thủy điện dựa trên công
            nghệ Siemens
          </p>
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <ul className="space-y-3">
              {[
                'Tham gia toàn bộ vòng đời dự án — từ khảo sát hiện trạng, thiết kế giải pháp kỹ thuật đến triển khai thực địa.',
                'Thực hiện thành công Factory Acceptance Test (FAT) và Site Acceptance Test (SAT) đảm bảo chất lượng hệ thống trước khi đưa vào vận hành.',
                'Đào tạo chuyên sâu cho kỹ sư và vận hành viên: TIA Portal, S7-1500H (high-availability), SCADA WinCC, truyền thông công nghiệp (Modbus RTU/TCP, PROFINET, IEC 61850, IEC 104).',
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Da Dang 2 Hydropower', org: 'SHP', capacity: '34 MW' },
              { name: 'A Luoi Hydropower', org: 'CHP', capacity: '170 MW' },
              { name: "Da M'bri Hydropower", org: 'SHP', capacity: '75 MW' },
            ].map((p) => (
              <div
                key={p.name}
                className="bg-card border border-border rounded-xl p-5 flex gap-3 items-start"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {p.org} · {p.capacity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Kinh nghiệm đào tạo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Kinh nghiệm đào tạo tiêu biểu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                year: '2012',
                client: 'Southern Steel Company',
                content: 'SIMATIC S7-300 & Profibus Network',
              },
              { year: '2012', client: 'SABECO', content: 'SIMATIC S7-300 & SCADA WinCC V7' },
              { year: '2012', client: 'VietSov Petro', content: 'SIMATIC S7-300 & SCADA' },
              { year: '2013', client: 'Pepsi Suntory', content: 'SIMATIC S7-300 & SIMATIC Net' },
              { year: '2014', client: 'Unilever', content: 'SIMATIC S7-300 Basic & Advanced' },
              {
                year: '2017',
                client: 'Tetrapak',
                content: 'TIA Portal, S7-1500, WinCC V7, HMI & SIMATIC Net',
              },
              { year: '2018', client: 'Vinfast', content: 'TIA Portal, S7-1500 & HMI' },
              {
                year: '2019/2021',
                client: 'Coca-Cola',
                content: 'SIMATIC S7-300 Advanced & SIMATIC Net',
              },
              {
                year: '2019/2021',
                client: 'Heineken',
                content: 'TIA Portal, S7-1500 & SIMATIC Net',
              },
              { year: '2019/2022', client: 'SABECO', content: 'SIMATIC S7-300/400 & SIMATIC Net' },
              { year: '2021', client: 'Nike', content: 'TIA Portal & S7-1500' },
              { year: '2021', client: 'Saint Gobain', content: 'TIA Portal, S7-1500 & WinCC V7' },
              {
                year: '2022',
                client: 'SHP Da Dang Hydro Power',
                content: 'TIA Portal SIMATIC Programming',
              },
              {
                year: '2022',
                client: 'EDH JSC',
                content: 'Industrial Communication SIMATIC NET in TIA Portal',
              },
              { year: '2023', client: 'Friesland Campina Vietnam', content: 'PROFIBUS System' },
              { year: '2023', client: 'SMS Group', content: 'TIA Portal SIMATIC Programming 1' },
              { year: '2024', client: 'Heineken', content: 'TIA Portal Tailor Service 01' },
              {
                year: '2024',
                client: 'A Luoi Hydro Power Plant',
                content: 'TIA Portal Programming 1 Customized',
              },
              {
                year: '2025',
                client: 'Heineken',
                content: 'PROFINET with Industrial Ethernet in TIA Portal',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="flex gap-3 items-start p-3 bg-card border border-border rounded-lg"
              >
                <span className="flex-shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap">
                  {t.year}
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.client}</div>
                  <div className="text-xs text-muted-foreground">{t.content}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Kỹ năng kỹ thuật */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Kỹ năng kỹ thuật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
                Mạng công nghiệp
              </h3>
              <ul className="space-y-1.5">
                {[
                  'Modbus RTU / Modbus TCP/IP',
                  'AS-i, PROFIBUS / PROFINET',
                  'CANopen',
                  'IEC 61850, IEC 104',
                ].map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
                  />
                </svg>
                Điều khiển PLC
              </h3>
              <ul className="space-y-1.5">
                {[
                  'TIA Portal, SIMATIC Manager, SIMATIC Net',
                  'S7-200/300/400, S7-1200/1500',
                  'Remote I/Os, Distributed I/Os',
                  'Twido Suite, RSLogix (Basic)',
                  'Mitsubishi PLC (FX)',
                ].map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                  />
                </svg>
                SCADA / HMI
              </h3>
              <ul className="space-y-1.5">
                {[
                  'SIMATIC WinCC V7',
                  'WinCC Professional (TIA Portal)',
                  'SIMATIC WinCC Unified',
                ].map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Chuyên môn tags */}
        {author.expertise && author.expertise.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Chuyên môn</h2>
            <div className="flex flex-wrap gap-3">
              {author.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Chứng chỉ */}
        {author.certifications && author.certifications.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Chứng chỉ</h2>
            <ul className="space-y-3">
              {author.certifications.map((cert, index) => (
                <li key={index} className="flex items-start gap-3 text-foreground/90">
                  <svg
                    className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-lg">{cert}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Liên hệ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Liên hệ</h2>
          <div className="flex flex-wrap gap-4">
            {author.socialLinks.email && (
              <a
                href={`mailto:${author.socialLinks.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-foreground font-medium">Email</span>
              </a>
            )}
            {author.socialLinks.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-foreground font-medium">LinkedIn</span>
              </a>
            )}
            {author.socialLinks.github && (
              <a
                href={author.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-foreground font-medium">GitHub</span>
              </a>
            )}
            {author.socialLinks.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent hover:border-primary/50 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-foreground font-medium">Twitter</span>
              </a>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
