'use client';
import StudentSidebar from '../components/StudentSidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentSidebar />
      <main className="flex-1 px-0 md:px-8 py-0 md:py-8 relative">
        {children}
      </main>
    </div>
  );
} 