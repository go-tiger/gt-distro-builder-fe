import type { Metadata } from 'next';
import './globals.css';

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
    <html lang='ko' className='h-full'>
      <body className='min-h-full flex flex-col bg-[#080c14] text-[#e2e8f0]'>{children}</body>
    </html>
  );
}
