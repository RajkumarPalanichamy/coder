'use client';
import StudentSidebar from '../components/StudentSidebar';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Initialize state on mount
    handleFullscreenChange();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const isTestTakingRoute = pathname?.startsWith('/dashboard/tests/') && pathname !== '/dashboard/tests';
  const isProblemSolvingRoute = pathname?.startsWith('/dashboard/problems/level/');
  const shouldHideSidebar = (isTestTakingRoute || isProblemSolvingRoute) && isFullscreen;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!shouldHideSidebar && <StudentSidebar onLogout={handleLogout} />}
      <main className="flex-1 px-0 md:px-8 py-0 md:py-8 relative ml-20 md:ml-72 transition-all duration-300">
        {children}
      </main>
    </div>
  );
} 