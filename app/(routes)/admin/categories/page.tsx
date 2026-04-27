import type { Metadata } from 'next';
import { AdminCategoriesClient } from './AdminCategoriesClient';

export const metadata: Metadata = {
  title: 'Quản lý Danh mục | Admin',
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesClient />;
}
