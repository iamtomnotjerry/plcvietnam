import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const posts = JSON.parse(
  fs.readFileSync(path.join(root, 'public/mock-data/posts-reader-guide.json'), 'utf8')
);

function escSqlString(s) {
  return String(s).replace(/'/g, "''");
}

function dollarQuote(s) {
  const body = String(s);
  let tag = 'body';
  while (body.includes(`$${tag}$`)) {
    tag += 'x';
  }
  return `$${tag}$${body}$${tag}$`;
}

const fieldId = '10000000-0000-4000-8000-000000000001';
const cats = [
  {
    id: '10000000-0000-4000-8000-000000000011',
    slug: 'reader-lam-quen',
    name: 'Làm quen với blog',
    desc: 'Tổng quan PLC Việt Nam, cấu trúc nội dung và cách tìm bài.',
    ord: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000012',
    slug: 'reader-tai-khoan',
    name: 'Tài khoản & đăng nhập',
    desc: 'Đăng ký, đăng nhập email/Google, đăng xuất và phiên làm việc.',
    ord: 1,
  },
  {
    id: '10000000-0000-4000-8000-000000000013',
    slug: 'reader-mat-khau',
    name: 'Mật khẩu & xác nhận email',
    desc: 'Quên mật khẩu, đặt lại mật khẩu, xác nhận và gửi lại email.',
    ord: 2,
  },
];
const catMap = {
  'cat-reader-1': cats[0].id,
  'cat-reader-2': cats[1].id,
  'cat-reader-3': cats[2].id,
};
const tagId = '10000000-0000-4000-8000-000000000099';

const lines = [];
lines.push('-- Reader guide: field, categories, tag, posts, post_tags (idempotent on slug)');
lines.push('BEGIN;');
lines.push(
  `INSERT INTO public.fields (id, slug, name, description, icon, post_count, "order") VALUES ('${fieldId}'::uuid, 'reader-guide', 'Hướng dẫn cho người mới', 'Bộ bài viết dành cho độc giả: làm quen blog, đăng ký, đăng nhập, khôi phục mật khẩu và các thói quen an toàn.', 'book-open', 0, -1) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon, "order" = EXCLUDED."order";`
);
for (const c of cats) {
  lines.push(
    `INSERT INTO public.categories (id, slug, name, description, field_id, post_count, "order") VALUES ('${c.id}'::uuid, '${c.slug}', '${escSqlString(c.name)}', '${escSqlString(c.desc)}', '${fieldId}'::uuid, 0, ${c.ord}) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, field_id = EXCLUDED.field_id, "order" = EXCLUDED."order";`
  );
}
lines.push(
  `INSERT INTO public.tags (id, slug, name, post_count) VALUES ('${tagId}'::uuid, 'huong-dan-doc-gia', 'Hướng dẫn độc giả', 0) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;`
);

let pid = 1000;
for (const p of posts) {
  pid += 1;
  const uuid = `10000000-0000-4000-8000-00000000${String(pid).padStart(4, '0')}`;
  const cid = catMap[p.categoryId];
  const plain = p.content.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  const rt = Math.max(1, Math.round(words / 200));
  const kw =
    'ARRAY[' +
    (p.seo.keywords || []).map((k) => `'${escSqlString(k)}'`).join(',') +
    ']::text[]';
  const contentLit = dollarQuote(p.content);
  lines.push(
    `INSERT INTO public.posts (id, slug, title, excerpt, content, category_id, field_id, status, published_at, updated_at, reading_time, seo_title, seo_description, seo_keywords, view_count) VALUES ('${uuid}'::uuid, '${escSqlString(p.slug)}', '${escSqlString(p.title)}', '${escSqlString(p.excerpt)}', ${contentLit}::text, '${cid}'::uuid, '${fieldId}'::uuid, 'published', '${p.publishedAt}'::timestamptz, '${p.updatedAt}'::timestamptz, ${rt}, '${escSqlString(p.seo.title)}', '${escSqlString(p.seo.description)}', ${kw}, 0) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content, category_id = EXCLUDED.category_id, field_id = EXCLUDED.field_id, status = EXCLUDED.status, published_at = EXCLUDED.published_at, updated_at = EXCLUDED.updated_at, reading_time = EXCLUDED.reading_time, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description, seo_keywords = EXCLUDED.seo_keywords;`
  );
  lines.push(
    `INSERT INTO public.post_tags (post_id, tag_id) SELECT id, '${tagId}'::uuid FROM public.posts WHERE slug = '${escSqlString(p.slug)}' ON CONFLICT DO NOTHING;`
  );
}

lines.push('COMMIT;');

const out = path.join(root, 'supabase/migrations/20260510190000_reader_guide_content.sql');
fs.writeFileSync(out, lines.join('\n'));
console.log('Wrote', out, 'lines', lines.length);
