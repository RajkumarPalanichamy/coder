'use client';
import StudentSidebar from '../components/StudentSidebar';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentSidebar onLogout={handleLogout} />
      <main className="flex-1 px-0 md:px-8 py-0 md:py-8 relative">
        {children}
      </main>
    </div>
  );
} 