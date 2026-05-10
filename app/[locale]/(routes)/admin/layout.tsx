import type { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/35 via-background to-muted/25">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <AdminSidebar />
        <div className="min-h-[calc(100vh-3.5rem)] min-w-0 flex-1 border-border/0 md:min-h-screen md:border-l md:border-border/50">
          <div className="w-full px-4 py-6 md:px-8 md:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
