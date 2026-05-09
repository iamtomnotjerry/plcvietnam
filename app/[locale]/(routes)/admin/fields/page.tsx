import type { Metadata } from 'next';
import { AdminFieldsClient } from './AdminFieldsClient';

export const metadata: Metadata = {
  title: 'Quản lý Lĩnh vực | Admin',
};

export default function AdminFieldsPage() {
  return <AdminFieldsClient />;
}
