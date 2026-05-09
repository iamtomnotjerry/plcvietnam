import { Metadata } from 'next';
import { ReorderClient } from './ReorderClient';

export const metadata: Metadata = {
  title: 'Sắp xếp thứ tự | Admin',
  description: 'Sắp xếp thứ tự lĩnh vực, danh mục và bài viết',
};

export default function ReorderPage() {
  return <ReorderClient />;
}
