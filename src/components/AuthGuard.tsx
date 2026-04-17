'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isLoggedIn = auth.isLoggedIn();

    if (!isLoggedIn && !isPublicPath) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">로드 중...</div>
      </div>
    );
  }

  return <>{children}</>;
}
