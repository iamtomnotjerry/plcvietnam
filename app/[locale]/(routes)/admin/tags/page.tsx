import type { Metadata } from 'next';
import { AdminTagsClient } from './AdminTagsClient';

export const metadata: Metadata = {
  title: 'Quản lý Thẻ | Admin',
};

export default function AdminTagsPage() {
  return <AdminTagsClient />;
}
