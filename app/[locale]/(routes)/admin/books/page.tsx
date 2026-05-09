import type { Metadata } from 'next';
import { AdminBooksClient } from './AdminBooksClient';

export const metadata: Metadata = { title: 'Quản lý Sách | Admin' };
export const dynamic = 'force-dynamic';

export default function AdminBooksPage() {
  return <AdminBooksClient />;
}
