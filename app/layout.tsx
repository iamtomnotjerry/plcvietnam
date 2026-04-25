import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import { WebVitals } from './web-vitals';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Lora({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Automation Blog - PLC, SCADA, Siemens',
  description: 'Blog chuyên về tự động hóa công nghiệp, PLC, SCADA, và Siemens Automation',
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body className={`${sans.className} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthSessionProvider>
              <NavigationProgress />
              <AppLayout>{children}</AppLayout>
              <WebVitals />
            </AuthSessionProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
