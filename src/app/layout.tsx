import type { Metadata } from 'next';
import './globals.css';
import { AuthGuard } from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'Distro Builder',
  description: 'Distribution.json 자동 생성 도구',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' className='h-full' data-scroll-behavior="smooth">
      <body className='min-h-full flex flex-col bg-[#080c14] text-[#e2e8f0]'>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
