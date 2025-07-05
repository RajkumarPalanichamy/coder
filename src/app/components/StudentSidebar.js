'use client';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Trophy, LogOut, Code2, ListChecks, UserCircle, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Problems', href: '/dashboard/problems', icon: FileText },
  { label: 'Tests', href: '/dashboard/tests', icon: Trophy },
  { label: 'My Submissions', href: '/dashboard/submissions', icon: BookOpen },
];

export default function StudentSidebar({ onLogout }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        }
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };
  const pathname = usePathname();
  // Get initials for profile section
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '';
  return (
    <aside className="sticky top-0 h-screen w-20 md:w-64 bg-white shadow-lg flex flex-col z-30 transition-all duration-200">
      {/* Logo / App Name */}
      <div className="flex items-center justify-center md:justify-start h-16 px-4 border-b border-indigo-100">
        <Code2 className="h-8 w-8 text-indigo-600" />
        <span className="hidden md:inline ml-2 text-xl font-bold text-indigo-700 tracking-tight">Zenith Mentor</span>
      </div>
      {/* Profile Section */}
      <div className="hidden md:flex items-center gap-3 px-4 py-5 border-b border-indigo-50">
        {user ? (
          <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-700">
            {initials}
          </div>
        ) : (
          <UserCircle className="w-10 h-10 text-indigo-400" />
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-indigo-700 text-base leading-tight">{user ? `${user.firstName} ${user.lastName}` : 'Student'}</span>
          <span className="text-xs text-gray-500">Student</span>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 py-6 px-2 md:px-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-base transition-colors
                ${isActive ? 'bg-indigo-50 text-indigo-700 font-semibold shadow border-l-4 border-indigo-600' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 border-l-4 border-transparent'}
              `}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className="hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Logout */}
      <div className="mt-auto mb-4 px-2 md:px-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-white bg-red-500 hover:bg-red-600 font-medium text-base transition-colors shadow"
        >
          <LogOut className="h-6 w-6" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
} 